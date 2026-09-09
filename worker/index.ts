import { defaults, mergeContent, validContent } from '../shared/content';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const canEdit=(r:Request,e:Env)=>!!r.headers.get('oai-authenticated-user-id')&&!!e.EDITOR_EMAIL&&r.headers.get('oai-authenticated-user-email')?.toLowerCase()===e.EDITOR_EMAIL.toLowerCase();
async function bytes(request:Request,limit:number){
 if(Number(request.headers.get('content-length')||0)>limit)throw new RangeError('File too large');
 const reader=request.body?.getReader();if(!reader)throw new Error('Empty upload');
 const chunks:Uint8Array[]=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw new RangeError('File too large');}chunks.push(value);}
 const result=new Uint8Array(size);let offset=0;for(const chunk of chunks){result.set(chunk,offset);offset+=chunk.length;}return result;
}
export default {
 async fetch(request:Request,env:Env):Promise<Response>{
 const url=new URL(request.url),path=url.pathname;
 try{
 if(path==='/api/editor'&&request.method==='GET')return json({canEdit:canEdit(request,env)});
 if(path==='/api/content'&&request.method==='GET'){
 const row=await env.DB.prepare('SELECT content, revision FROM site_content WHERE id = ?').bind('storefront').first<{content:string;revision:number}>();
 return json({content:row?mergeContent(JSON.parse(row.content)):defaults,revision:row?.revision??0});
 }
 if(path.startsWith('/api/')&&request.method!=='GET'){
 if(!canEdit(request,env))return json({error:'Sign in with the site owner’s account to edit.'},403);
 if(request.headers.get('origin')!==url.origin)return json({error:'Please save from the site editor.'},403);
 if(path==='/api/content'&&request.method==='PUT'){
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'Expected JSON.'},415);
 let payload;try{payload=JSON.parse(new TextDecoder().decode(await bytes(request,256_000)));}catch{return json({error:'The content could not be read.'},400);}
 if(!validContent(payload.content)||!Number.isInteger(payload.revision)||payload.revision<0)return json({error:'Check the text, price, image, and video fields before saving.'},400);
 const {content,revision}=payload; const data=JSON.stringify(content),now=new Date().toISOString(),user=request.headers.get('oai-authenticated-user-id')!;
 const saved=revision===0?await env.DB.prepare('INSERT INTO site_content (id,content,revision,updated_at,updated_by) VALUES (?,?,1,?,?) ON CONFLICT(id) DO NOTHING RETURNING revision').bind('storefront',data,now,user).first<{revision:number}>():await env.DB.prepare('UPDATE site_content SET content = ?, revision = revision + 1, updated_at = ?, updated_by = ? WHERE id = ? AND revision = ? RETURNING revision').bind(data,now,user,'storefront',revision).first<{revision:number}>();
 if(!saved)return json({error:'This site was saved in another tab. Keep a copy of your edits, then reload to get the latest version.'},409);
 return json({revision:saved.revision,content});
 }
 if(path==='/api/media'&&request.method==='POST'){
 const data=await bytes(request,8*1024*1024);
 const type=data[0]===0xff&&data[1]===0xd8&&data[2]===0xff?'jpeg':data.length>8&&[137,80,78,71,13,10,26,10].every((v,i)=>data[i]===v)?'png':new TextDecoder().decode(data.slice(0,4))==='RIFF'&&new TextDecoder().decode(data.slice(8,12))==='WEBP'?'webp':null;
 if(!type)return json({error:'Choose a JPG, PNG, or WebP image.'},400);
 const key=`${crypto.randomUUID()}.${type==='jpeg'?'jpg':type}`;
 await env.FILES.put(key,data,{httpMetadata:{contentType:`image/${type}`}});
 return json({src:`/media/${key}`},201);
 }
 }
 if(path.startsWith('/media/')&&(request.method==='GET'||request.method==='HEAD')){
 const key=path.slice(7);if(!/^[\w-]+\.(jpg|png|webp)$/.test(key))return new Response('Not found',{status:404});
 const object=await env.FILES.get(key);if(!object)return new Response('Not found',{status:404});
 const headers=new Headers({'Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'});object.writeHttpMetadata(headers);headers.set('ETag',object.httpEtag);
 return new Response(request.method==='HEAD'?null:object.body,{headers});
 }
 if(path.startsWith('/api/'))return json({error:'Not found'},404);
 // Sites provisions assets independently of local Wrangler SPA settings.
 if((request.method==='GET'||request.method==='HEAD')&&['/checkout','/studio','/edit','/success','/admin','/admin/login'].includes(path))return env.ASSETS.fetch(new Request(new URL('/',url),request));
 return env.ASSETS.fetch(request);
 }catch(error){if(error instanceof RangeError)return json({error:'Choose an image smaller than 8 MB.'},413);console.error('Site request failed',path,error instanceof Error?error.message:'Unknown error');return json({error:'We couldn’t save right now. Your draft is still here. Try again.'},500);}
 }
} satisfies ExportedHandler<Env>;
