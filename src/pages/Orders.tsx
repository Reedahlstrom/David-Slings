import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '@/components/BrandLogo';
import { useSite } from '@/lib/storefront';
import { money } from '@/lib/stripe';
type Order = {session_id:string;reference:string;livemode:number;status:string;quantity:number;amount_total:number;amount_refunded:number;currency:string;email:string;shipping_name:string;shipping_address:string;paid_at:string;tracking_number:string|null};
type Address = {line1:string;line2?:string|null;city:string;state?:string|null;postal_code:string;country:string};
export default function Orders() {
  const {canEdit,loaded}=useSite();
  const [orders,setOrders]=useState<Order[]>([]),[next,setNext]=useState<string|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const load=useCallback(async(before?:string)=>{
    setBusy(true);setError('');
    try {const response=await fetch('/api/orders'+(before?'?before='+encodeURIComponent(before):''));const data=await response.json();if(!response.ok)throw Error(data.error);setOrders(old=>before?[...old,...data.orders]:data.orders);setNext(data.next);}
    catch(e){setError(e instanceof Error?e.message:'Couldn’t load orders.');}finally{setBusy(false);}
  },[]);
  useEffect(()=>{if(canEdit)void load();},[canEdit,load]);
  return <div className="orders-page"><header className="checkout-header shell"><Link to="/"><BrandLogo /></Link><Link className="text-link" to="/">Back to the site</Link></header><main className="shell orders-main"><div className="orders-heading"><div><p className="eyebrow">DAVID SLINGS</p><h1>Your orders.</h1></div>{canEdit&&<button className="button" disabled={busy} onClick={()=>void load()}>{busy?'Loading…':'Refresh orders'}</button>}</div>
    {!loaded?<p>Loading…</p>:!canEdit?<div className="checkout-info"><p>Sign in as the site owner to see orders and shipping addresses.</p><a className="button" href="/signin-with-chatgpt?return_to=/admin">Sign in to orders</a></div>:<>
    {error&&<p className="error-message" role="alert">{error}</p>}
    {!busy&&!orders.length&&!error&&<p>No orders yet. Completed checkouts will appear here.</p>}
    <div className="orders-list">{orders.map(order=><OrderCard key={order.session_id} order={order} onSaved={()=>load()}/>)}</div>
    {next&&<button className="button" disabled={busy} onClick={()=>void load(next)}>Load older orders</button>}
    </>}
  </main></div>;
}
function OrderCard({order,onSaved}:{order:Order;onSaved:()=>Promise<void>}) {
  const [tracking,setTracking]=useState(order.tracking_number||''),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const address=JSON.parse(order.shipping_address) as Address;
  async function fulfill(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');try{const r=await fetch('/api/orders/fulfill',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:order.session_id,trackingNumber:tracking})});const d=await r.json();if(!r.ok)throw Error(d.error);await onSaved();}catch(e){setError(e instanceof Error?e.message:'Couldn’t save shipment.');}finally{setBusy(false);}}
  return <article className="order-card"><div className="order-card-heading"><div><h2>{order.reference}</h2><p>{new Date(order.paid_at).toLocaleString()}</p></div><span className="order-status">{!order.livemode?'Test · ':''}{order.status}{order.amount_refunded>0&&order.amount_refunded<order.amount_total?' · Partially refunded':''}</span></div>
    <div className="order-card-details"><div><h3>Order</h3><p>{order.quantity} × The David Sling</p><p>{money(order.amount_total,order.currency)} paid</p>{order.amount_refunded>0&&<p>{money(order.amount_refunded,order.currency)} refunded</p>}<p>{order.email}</p></div><div><h3>Ship to</h3><address>{order.shipping_name}<br/>{address.line1}<br/>{address.line2&&<>{address.line2}<br/></>}{address.city}, {address.state} {address.postal_code}<br/>{address.country}</address></div></div>
    {order.status==='paid'&&<form className="order-fulfillment" onSubmit={e=>void fulfill(e)}><label htmlFor={'tracking-'+order.session_id}>Tracking number (optional)<input id={'tracking-'+order.session_id} value={tracking} maxLength={120} onChange={e=>setTracking(e.target.value)}/></label><button className="button" disabled={busy}>{busy?'Saving…':'Mark as shipped'}</button></form>}
    {order.status==='shipped'&&<p>Tracking: {order.tracking_number||'Not provided'}</p>}{error&&<p className="error-message" role="alert">{error}</p>}
  </article>;
}
