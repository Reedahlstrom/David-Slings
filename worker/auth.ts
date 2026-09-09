import { json, readBytes } from './http';
const encoder=new TextEncoder();
const cookieName='__Host-david_admin';
const allowed=(env:Env)=>[env.EDITOR_EMAIL,...(env.ADMIN_EMAILS||'').split(',')].map(v=>v.trim().toLowerCase()).filter(Boolean);
const hex=(data:ArrayBuffer)=>Array.from(new Uint8Array(data),b=>b.toString(16).padStart(2,'0')).join('');
const digest=async(value:string)=>hex(await crypto.subtle.digest('SHA-256',encoder.encode(value)));
const sessionToken=(request:Request)=>request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName+'='))?.slice(cookieName.length+1);
const cookie=(token:string,age:number)=>`${cookieName}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;
export async function withSessionIdentity(request:Request,env:Env){
 if(!env.ADMIN_PASSWORD_HASH)return request;
 // Password sessions are the source of identity once enabled, not client-supplied headers.
 const headers=new Headers(request.headers);headers.delete('oai-authenticated-user-id');headers.delete('oai-authenticated-user-email');
 const token=sessionToken(request);
 if(token&&/^[a-f0-9]{64}$/.test(token)){
  const session=await env.DB.prepare('SELECT email FROM admin_sessions WHERE id=? AND expires_at>?').bind(await digest(token),Math.floor(Date.now()/1000)).first<{email:string}>();
  if(session&&allowed(env).includes(session.email)){headers.set('oai-authenticated-user-id','password:'+session.email);headers.set('oai-authenticated-user-email',session.email);}
 }
 return new Request(request,{headers});
}
export async function handleAuth(request:Request,env:Env):Promise<Response|null>{
 const url=new URL(request.url);if(!['/api/admin/login','/api/admin/logout'].includes(url.pathname))return null;
 if(request.method!=='POST')return json({error:'Method not allowed.'},405);
 if(request.headers.get('origin')!==url.origin)return json({error:'Sign in from this website.'},403);
 if(url.pathname==='/api/admin/logout'){
  const token=sessionToken(request);if(token&&/^[a-f0-9]{64}$/.test(token))await env.DB.prepare('DELETE FROM admin_sessions WHERE id=?').bind(await digest(token)).run();
  const response=json({ok:true});response.headers.set('Set-Cookie',cookie('',0));return response;
 }
 if(!env.ADMIN_PASSWORD_HASH)return json({error:'Password sign-in is not configured yet.'},503);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'Expected JSON.'},415);
 let input;try{input=JSON.parse(new TextDecoder().decode(await readBytes(request,4096)));}catch{return json({error:'Enter your email and password.'},400);}
 if(typeof input.email!=='string'||input.email.length>254||typeof input.password!=='string'||input.password.length>256)return json({error:'Enter your email and password.'},400);
 const now=Math.floor(Date.now()/1000),rateId=await digest((request.headers.get('cf-connecting-ip')||'unknown')+':'+Math.floor(now/900));
 const attempt=await env.DB.prepare('INSERT INTO login_attempts (id,attempts,expires_at) VALUES (?,1,?) ON CONFLICT(id) DO UPDATE SET attempts=attempts+1 RETURNING attempts').bind(rateId,now+900).first<{attempts:number}>();
 if(!attempt||attempt.attempts>10){const response=json({error:'Too many attempts. Try again in 15 minutes.'},429);response.headers.set('Retry-After','900');return response;}
 const [iterations,salt,expected]=env.ADMIN_PASSWORD_HASH.split(':');
 if(iterations!=='100000'||!/^[a-f0-9]{32}$/.test(salt)||!/^[a-f0-9]{64}$/.test(expected))return json({error:'Sign-in configuration needs attention.'},503);
 const key=await crypto.subtle.importKey('raw',encoder.encode(input.password),'PBKDF2',false,['deriveBits']);
 const actual=await crypto.subtle.deriveBits({name:'PBKDF2',salt:encoder.encode(salt),iterations:100000,hash:'SHA-256'},key,256);
 const expectedBytes=Uint8Array.from(expected.match(/../g)!,v=>parseInt(v,16));
 // HMAC verification compares the password-derived bytes without a timing-sensitive string comparison.
 const verifyKey=await crypto.subtle.importKey('raw',expectedBytes,{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const actualKey=await crypto.subtle.importKey('raw',actual,{name:'HMAC',hash:'SHA-256'},false,['verify']);
 const challenge=encoder.encode('david-admin-password-check');
 const valid=await crypto.subtle.verify('HMAC',actualKey,await crypto.subtle.sign('HMAC',verifyKey,challenge),challenge);
 const email=input.email.trim().toLowerCase();
 if(!valid||!allowed(env).includes(email))return json({error:'That email or password doesn’t match.'},401);
 const token=hex(crypto.getRandomValues(new Uint8Array(32)).buffer),age=7*24*60*60;
 await env.DB.batch([env.DB.prepare('INSERT INTO admin_sessions (id,email,expires_at) VALUES (?,?,?)').bind(await digest(token),email,now+age),env.DB.prepare('DELETE FROM admin_sessions WHERE expires_at<=?').bind(now),env.DB.prepare('DELETE FROM login_attempts WHERE expires_at<=? OR id=?').bind(now,rateId)]);
 const response=json({ok:true});response.headers.set('Set-Cookie',cookie(token,age));return response;
}
