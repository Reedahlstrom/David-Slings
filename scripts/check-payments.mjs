import assert from 'node:assert/strict';
import { readFile, readdir, mkdir } from 'node:fs/promises';
import { build } from 'esbuild';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import Stripe from 'stripe';

await mkdir('node_modules/.cache', {recursive:true});
await build({entryPoints:['worker/payments.ts'],outfile:'node_modules/.cache/david-payments.mjs',bundle:true,platform:'node',format:'esm',packages:'external'});
const {handlePayments} = await import('../node_modules/.cache/david-payments.mjs');
const mf = new Miniflare(convertV4MiniflareOptions({workers:[{name:'payments-test',modules:true,script:'export default {fetch(){return new Response("test")}}',compatibilityDate:'2026-09-09',d1Databases:['DB']}]}));
const DB = await mf.getD1Database('DB');
const env = {DB,EDITOR_EMAIL:'owner@example.test',PAYMENTS_MODE:'test',STRIPE_SECRET_KEY:'sk_test_fixture',STRIPE_WEBHOOK_SECRET:'whsec_fixture',STRIPE_PRODUCT_ID:'prod_fixture',SHIPPING_COUNTRIES:'US',SHIPPING_AMOUNT_CENTS:'0',STRIPE_AUTOMATIC_TAX:'false',SITE_URL:'https://store.example.test',DISPATCH_NOTE:'',RETURNS_POLICY:''};
const id = 'cs_test_123456789012345678901234567890';
const paid = {id,livemode:false,mode:'payment',status:'complete',payment_status:'paid',metadata:{store:'david-slings',quantity:'2',unit_amount:'3000',shipping_amount:'0'},line_items:{data:[{quantity:2,price:{product:'prod_fixture',unit_amount:3000}}],has_more:false},currency:'usd',amount_subtotal:6000,amount_total:6000,total_details:{amount_shipping:0,amount_discount:0,amount_tax:0},customer_details:{email:'buyer@example.test'},collected_information:{shipping_details:{name:'Test Buyer',address:{line1:'123 Test Street',line2:null,city:'Salt Lake City',state:'UT',country:'US',postal_code:'84101'}}},payment_intent:'pi_fixture'};
let session=structuredClone(paid), created, createOptions, retrieved=0, refunded=6000;
const sdk=new Stripe('sk_test_fixture');
const stripe={webhooks:sdk.webhooks,checkout:{sessions:{create:async (params,opts)=>{created=params;createOptions=opts;return {url:'https://checkout.stripe.com/c/pay/cs_test_fixture',livemode:false};},retrieve:async()=>{retrieved++;return structuredClone(session);},list:async()=>({data:[session]})}},charges:{retrieve:async()=>({payment_intent:'pi_fixture',amount_refunded:refunded})}};
const request=(path,method='GET',body,headers={})=>new Request(env.SITE_URL+path,{method,headers:{...(body?{'content-type':'application/json'}:{}),...headers},...(body?{body:JSON.stringify(body)}:{})});
const run=(req,values=env)=>handlePayments(req,values,()=>stripe);
const input={quantity:2,unitAmount:3000,requestId:'a0000000-0000-4000-8000-000000000000'};
const owner={'oai-authenticated-user-id':'test-owner','oai-authenticated-user-email':env.EDITOR_EMAIL,origin:env.SITE_URL};
async function event(type,eventId,timestamp=Math.floor(Date.now()/1000),secret=env.STRIPE_WEBHOOK_SECRET){
  const payload=JSON.stringify({id:eventId,type,livemode:false,data:{object:type==='charge.refunded'?{id:'ch_fixture'}:session}});
  const signature=sdk.webhooks.generateTestHeaderString({payload,secret,timestamp});
  return run(new Request(env.SITE_URL+'/api/stripe/webhook',{method:'POST',headers:{'stripe-signature':signature},body:payload}));
}
let checks=0;
async function check(name,fn){await fn();checks++;console.log('PASS '+name);}
try {
  for(const file of (await readdir('drizzle')).filter(f=>f.endsWith('.sql')).sort())for(const sql of (await readFile('drizzle/'+file,'utf8')).split('--> statement-breakpoint'))if(sql.trim())await DB.prepare(sql).run();
  await check('checkout rejects cross-origin, bad quantity, and changed prices',async()=>{
    assert.equal((await run(request('/api/checkout','POST',input))).status,403);
    assert.equal((await run(request('/api/checkout','POST',{...input,quantity:0},{origin:env.SITE_URL}))).status,400);
    assert.equal((await run(request('/api/checkout','POST',{...input,unitAmount:1},{origin:env.SITE_URL}))).status,409);
    assert.equal((await run(request('/api/checkout','POST',input,{origin:env.SITE_URL}),{...env,PAYMENTS_MODE:'off'})).status,503);
    assert.equal(created,undefined);
  });
  await check('checkout uses canonical price, fixed return URLs, and retry key',async()=>{
    assert.equal((await run(request('/api/checkout','POST',input,{origin:env.SITE_URL}))).status,200);
    assert.equal(created.line_items[0].price_data.unit_amount,3000);
    assert.equal(created.line_items[0].quantity,2);
    assert.equal(created.success_url,env.SITE_URL+'/success?session_id={CHECKOUT_SESSION_ID}');
    assert.equal(createOptions.idempotencyKey,'david-slings:'+input.requestId);
    assert.deepEqual(created.shipping_address_collection.allowed_countries,['US']);
  });
  await check('unpaid and invented sessions never produce an order',async()=>{
    assert.equal((await run(request('/api/order-status?session_id=made-up'))).status,404);
    session.payment_status='unpaid';session.status='open';
    assert.deepEqual(await (await run(request('/api/order-status?session_id='+id))).json(),{status:'pending'});
    assert.equal(await DB.prepare('SELECT * FROM orders').first(),null);
    session=structuredClone(paid);
  });
  await check('webhook rejects invalid and expired signatures',async()=>{
    assert.equal((await event('checkout.session.completed','evt_invalid',undefined,'whsec_wrong')).status,400);
    assert.equal((await event('checkout.session.completed','evt_old',Math.floor(Date.now()/1000)-600)).status,400);
    assert.equal(await DB.prepare('SELECT * FROM orders').first(),null);
  });
  await check('verified payment saves address exactly once, even on retry',async()=>{
    assert.equal((await event('checkout.session.completed','evt_paid')).status,200);
    const before=retrieved;
    assert.equal((await event('checkout.session.completed','evt_paid')).status,200);
    assert.equal(retrieved,before);
    const order=await DB.prepare('SELECT * FROM orders').first();
    assert.equal(order.email,'buyer@example.test');
    assert.equal(JSON.parse(order.shipping_address).postal_code,'84101');
    assert.equal(order.amount_total,6000);
    assert.equal(order.cost_unit_cents,645);
    assert.equal((await DB.prepare('SELECT COUNT(*) AS n FROM orders').first()).n,1);
  });
  await check('public confirmation exposes no customer information; orders require owner',async()=>{
    const result=await (await run(request('/api/order-status?session_id='+id))).json();
    assert.equal(result.status,'paid');assert.equal(result.amountTotal,6000);
    assert.deepEqual(Object.keys(result).sort(),['amountTotal','currency','quantity','reference','status','test']);
    assert.equal((await run(request('/api/orders'))).status,403);
    assert.equal((await run(request('/api/orders','GET',undefined,owner))).status,200);
    const closed = await run(request('/api/order-status?session_id='+id),{...env,PAYMENTS_MODE:'off'});
    assert.equal((await closed.json()).status,'paid');
  });
  await check('fulfillment requires owner and same origin; replay preserves shipped state',async()=>{
    const body={sessionId:id,trackingNumber:'TRACK-TEST'};
    assert.equal((await run(request('/api/orders/fulfill','POST',body))).status,403);
    assert.equal((await run(request('/api/orders/fulfill','POST',body,owner))).status,200);
    assert.equal((await event('checkout.session.completed','evt_paid_again')).status,200);
    assert.equal((await DB.prepare('SELECT status FROM orders').first()).status,'shipped');
    assert.ok((await DB.prepare('SELECT fulfilled_at FROM orders').first()).fulfilled_at);
    assert.equal((await run(request('/api/orders/fulfill','POST',body,owner))).status,409);
  });
  await check('refund retries and late payment notifications preserve refunded status',async()=>{
    assert.equal((await event('charge.refunded','evt_refund')).status,200);
    assert.equal((await event('charge.refunded','evt_refund')).status,200);
    assert.equal((await event('checkout.session.completed','evt_late_paid')).status,200);
    assert.equal((await DB.prepare('SELECT status FROM orders').first()).status,'refunded');
    assert.equal((await (await run(request('/api/order-status?session_id='+id))).json()).status,'refunded');
  });
  await check('mismatched amount is rejected without acknowledging event',async()=>{
    session.amount_total=1;
    assert.equal((await event('checkout.session.completed','evt_tampered')).status,502);
    assert.equal(await DB.prepare('SELECT id FROM stripe_events WHERE id = ?').bind('evt_tampered').first(),null);
    session=structuredClone(paid);
  });
  await check('database failure is retryable and does not acknowledge lost orders',async()=>{
    await DB.prepare('ALTER TABLE orders RENAME TO orders_backup').run();
    assert.equal((await event('checkout.session.completed','evt_db_retry')).status,502);
    assert.equal(await DB.prepare('SELECT id FROM stripe_events WHERE id = ?').bind('evt_db_retry').first(),null);
    await DB.prepare('ALTER TABLE orders_backup RENAME TO orders').run();
    assert.equal((await event('checkout.session.completed','evt_db_retry')).status,200);
  });
  console.log(`${checks} payment checks passed.`);
} finally {await mf.dispose();}
