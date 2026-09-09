import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {pbkdf2Sync} from 'node:crypto';
import {build} from 'esbuild';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
await build({entryPoints:['worker/auth.ts'],outfile:'node_modules/.cache/auth-test.mjs',bundle:true,platform:'node',format:'esm',packages:'external'});
const {handleAuth,withSessionIdentity}=await import('../node_modules/.cache/auth-test.mjs');
const mf=new Miniflare(convertV4MiniflareOptions({workers:[{name:'auth-test',modules:true,script:'export default {fetch(){return new Response("ok")}}',compatibilityDate:'2026-09-09',d1Databases:['DB']}]}));
const DB=await mf.getD1Database('DB'),salt='11223344556677889900aabbccddeeff',password='test-fixture-only';
const env={DB,EDITOR_EMAIL:'reed@example.test',ADMIN_EMAILS:'carter@example.test',ADMIN_PASSWORD_HASH:'100000:'+salt+':'+pbkdf2Sync(password,salt,100000,32,'sha256').toString('hex')},origin='https://store.example.test';
const login=(email,password,extra={})=>handleAuth(new Request(origin+'/api/admin/login',{method:'POST',headers:{origin,'Content-Type':'application/json','cf-connecting-ip':'192.0.2.1',...extra},body:JSON.stringify({email,password})}),env);
try{
 for(const file of (await readdir('drizzle')).filter(f=>f.endsWith('.sql')).sort())for(const sql of (await readFile('drizzle/'+file,'utf8')).split('--> statement-breakpoint'))if(sql.trim())await DB.prepare(sql).run();
 assert.equal((await login('reed@example.test','wrong')).status,401);assert.equal((await login('outsider@example.test',password)).status,401);console.log('PASS wrong password and unapproved emails rejected');
 assert.equal((await login('reed@example.test',password,{origin:'https://other.test'})).status,403);console.log('PASS cross-origin login rejected');
 for(const email of ['reed@example.test','carter@example.test']){const r=await login(email,password);assert.equal(r.status,200);const cookie=r.headers.get('set-cookie');assert.match(cookie,/HttpOnly; Secure; SameSite=Strict/);const identity=await withSessionIdentity(new Request(origin+'/api/business',{headers:{cookie}}),env);assert.equal(identity.headers.get('oai-authenticated-user-email'),email);const logout=await handleAuth(new Request(origin+'/api/admin/logout',{method:'POST',headers:{origin,cookie}}),env);assert.equal(logout.status,200);assert.equal((await withSessionIdentity(new Request(origin+'/api/business',{headers:{cookie}}),env)).headers.get('oai-authenticated-user-email'),null);}console.log('PASS both teammates can sign in and logout revokes their sessions');
 const fake=await withSessionIdentity(new Request(origin+'/api/business',{headers:{'oai-authenticated-user-id':'forged','oai-authenticated-user-email':'reed@example.test',cookie:'__Host-david_admin='+'a'.repeat(64)}}),env);assert.equal(fake.headers.get('oai-authenticated-user-email'),null);console.log('PASS forged identity headers and invented cookies rejected');
 for(let i=0;i<10;i++)assert.equal((await login('reed@example.test','wrong')).status,401);assert.equal((await login('reed@example.test',password)).status,429);console.log('PASS repeated attempts are rate limited');
 console.log('5 admin authentication checks passed.');
}finally{await mf.dispose();}
