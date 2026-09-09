import { businessDefaults, validBusiness, unitCosts } from '../shared/business';
import { defaults, mergeContent } from '../shared/content';
import { canEdit, json, readBytes } from './http';
export async function readBusiness(env:Env){const row=await env.DB.prepare('SELECT content,revision,updated_at,updated_by FROM business_workspace WHERE id = ?').bind('main').first<{content:string;revision:number;updated_at:string;updated_by:string}>();return {business:row?{...structuredClone(businessDefaults),...JSON.parse(row.content)} as typeof businessDefaults:structuredClone(businessDefaults),revision:row?.revision??0,updatedAt:row?.updated_at??null,updatedBy:row?.updated_by??null};}
export async function handleBusiness(request:Request,env:Env):Promise<Response|null>{
 const url=new URL(request.url);if(!url.pathname.startsWith('/api/business'))return null;
 if(!canEdit(request,env))return json({error:'Sign in with Reed or Carter’s approved account.'},403);
 if(url.pathname==='/api/business'&&request.method==='GET')return json({...await readBusiness(env),member:request.headers.get('oai-authenticated-user-email'),members:[env.EDITOR_EMAIL,...(env.ADMIN_EMAILS||'').split(',')].filter(Boolean)});
 if(url.pathname==='/api/business'&&request.method==='PUT'){
  if(request.headers.get('origin')!==url.origin)return json({error:'Save from the workspace.'},403);
  if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'Expected JSON.'},415);
  let body;try{body=JSON.parse(new TextDecoder().decode(await readBytes(request,750000)));}catch{return json({error:'The workspace data could not be read.'},400);}
  if(!validBusiness(body?.business)||!Number.isInteger(body.revision)||body.revision<0)return json({error:'Check the dates, amounts, names and assignments before saving.'},400);
  const content=JSON.stringify(body.business),now=new Date().toISOString(),user=request.headers.get('oai-authenticated-user-email')!;
  const saved=body.revision===0?await env.DB.prepare('INSERT INTO business_workspace (id,content,revision,updated_at,updated_by) VALUES (?,?,1,?,?) ON CONFLICT(id) DO NOTHING RETURNING revision').bind('main',content,now,user).first<{revision:number}>():await env.DB.prepare('UPDATE business_workspace SET content=?,revision=revision+1,updated_at=?,updated_by=? WHERE id=? AND revision=? RETURNING revision').bind(content,now,user,'main',body.revision).first<{revision:number}>();
  if(!saved)return json({error:'Someone saved changes since you opened this. Export your draft, then reload before merging your edits.'},409);
  return json({revision:saved.revision,updatedAt:now,updatedBy:user});
 }
 if(url.pathname==='/api/business/metrics'&&request.method==='GET'){
  const mode=url.searchParams.get('mode')==='test'?0:1,days=url.searchParams.get('days')||'30';
  if(!['7','30','90','all'].includes(days))return json({error:'Choose a valid date range.'},400);
  const now=new Date(),since=days==='all'?'1970-01-01':new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()-Number(days)+1)).toISOString().slice(0,10);
  const {business}=await readBusiness(env),content=await env.DB.prepare('SELECT content FROM site_content WHERE id=?').bind('storefront').first<{content:string}>(),price=(content?mergeContent(JSON.parse(content.content)):defaults).price;
  const costs=unitCosts(business,price);
  const totals=await env.DB.prepare(`SELECT COUNT(*) AS orders, COALESCE(SUM(quantity),0) AS units, COALESCE(SUM(amount_subtotal),0) AS product_sales, COALESCE(SUM(amount_shipping),0) AS shipping_collected, COALESCE(SUM(amount_tax),0) AS tax_collected, COALESCE(SUM(amount_refunded),0) AS refunds,
   COALESCE(SUM(MAX(0,amount_subtotal+amount_shipping-amount_refunded*1.0*(amount_subtotal+amount_shipping)/MAX(amount_total,1))),0) AS net_sales,
   COALESCE(SUM(amount_total>amount_refunded),0) AS eligible,
   COALESCE(SUM(amount_total>amount_refunded AND (fulfilled_at IS NOT NULL OR status='shipped')),0) AS fulfilled,
   COALESCE(SUM(amount_total>amount_refunded AND status='paid'),0) AS pending,
   AVG(CASE WHEN fulfilled_at IS NOT NULL THEN (julianday(fulfilled_at)-julianday(paid_at))*24 END) AS average_hours,
   COALESCE(SUM(fulfilled_at IS NOT NULL),0) AS timed_orders,
   MIN(CASE WHEN amount_total>amount_refunded AND status='paid' THEN paid_at END) AS oldest_pending,
   COALESCE(SUM(CASE WHEN amount_total>amount_refunded OR fulfilled_at IS NOT NULL THEN quantity*COALESCE(cost_unit_cents,?) ELSE 0 END),0) AS estimated_cogs,
   COALESCE(SUM(cost_unit_cents IS NULL),0) AS unsnapshotted_orders,
   COALESCE(SUM((amount_total*?/100)+?),0) AS estimated_fees,
   COALESCE(SUM(amount_total>amount_refunded OR fulfilled_at IS NOT NULL),0) AS cost_orders
   FROM orders WHERE livemode=? AND paid_at>=?`).bind(Math.round(costs.cogs*100),business.feePercent,Math.round(business.feeFixed*100),mode,since).first();
  const {results:trend}=await env.DB.prepare('SELECT substr(paid_at,1,10) AS day, COUNT(*) AS orders, SUM(amount_subtotal) AS sales FROM orders WHERE livemode=? AND paid_at>=? GROUP BY day ORDER BY day DESC LIMIT 90').bind(mode,since).all();
  const {results:orders}=await env.DB.prepare('SELECT * FROM orders WHERE livemode=? AND paid_at>=? ORDER BY paid_at DESC,session_id DESC LIMIT 200').bind(mode,since).all();
  const goalProgress=[];
  for(const goal of business.milestones||[]){
   const end=goal.due+'T23:59:59.999Z';
   const total=await env.DB.prepare(`SELECT COALESCE(SUM(MAX(0,amount_subtotal+amount_shipping-amount_refunded*1.0*(amount_subtotal+amount_shipping)/MAX(amount_total,1))),0) AS sales, COALESCE(SUM(CASE WHEN amount_total>amount_refunded THEN quantity ELSE 0 END),0) AS units, COALESCE(SUM(CASE WHEN amount_total>amount_refunded OR fulfilled_at IS NOT NULL THEN quantity*COALESCE(cost_unit_cents,?)+? ELSE 0 END),0) AS costs,COALESCE(SUM(amount_total*?/100+?),0) AS fees FROM orders WHERE livemode=1 AND paid_at>=? AND paid_at<=?`).bind(Math.round(costs.cogs*100),Math.round(business.postage*100),business.feePercent,Math.round(business.feeFixed*100),goal.start,end).first<{sales:number;units:number;costs:number;fees:number}>();
   const ads=business.ads.filter(a=>a.date>=goal.start&&a.date<=goal.due).reduce((sum,a)=>sum+a.spend,0),overhead=business.expenses.filter(e=>e.date>=goal.start&&e.date<=goal.due&&['tools','other'].includes(e.category)).reduce((sum,e)=>sum+e.amount,0);
   goalProgress.push({id:goal.id,sales:(total?.sales||0)/100,units:total?.units||0,profit:((total?.sales||0)-(total?.costs||0)-(total?.fees||0))/100-ads-overhead});
  }
  return json({goalProgress,mode:mode?'live':'test',since,price,costs,totals,trend,orders,ordersLimited:Number(totals?.orders)>200,asOf:now.toISOString()});
 }
 return json({error:'Not found.'},404);
}
