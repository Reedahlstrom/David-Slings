import BrandLogo from "@/components/BrandLogo";
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Check, Package } from 'lucide-react';
import { Copy, useSite } from '@/lib/storefront';
import { getOrderStatus, money } from '@/lib/stripe';
import type { OrderConfirmation } from '@/lib/stripe';
export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const {media,content,editing} = useSite();
  const [order,setOrder] = useState<OrderConfirmation|null>(null),[error,setError] = useState(''),[retry,setRetry] = useState(0),[checking,setChecking] = useState(false);
  const session = params.get('session_id');
  useEffect(()=>{
    if(!session)return;
    const controller=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;let attempts=0;
    setChecking(true);setError('');
    async function poll(){
      try {const result=await getOrderStatus(session!,controller.signal);if(controller.signal.aborted)return;setOrder(result);setChecking(false);if(result.status==='pending'&&attempts++<5)timer=setTimeout(()=>void poll(),2000);}
      catch(e){if(!controller.signal.aborted){setError(e instanceof Error?e.message:'Couldn’t verify your order.');setChecking(false);}}
    }
    void poll();return()=>{controller.abort();clearTimeout(timer);};
  },[session,retry]);
  const preview=editing&&!session;
  const paid=order?.status==='paid';
  return <div className="confirmation-page"><header className="checkout-header shell"><Link className="wordmark" to="/"><BrandLogo /></Link></header><main className="confirmation-card">
    {preview&&<p className="preview-notice">Editor preview. No order has been placed.</p>}
    {order?.test&&<p className="preview-notice">Test order. No real payment was taken.</p>}
    <span className="confirmation-check">{paid||preview?<Check size={29}/>:<Package size={29}/>}</span>
    {paid||preview?<><p className="eyebrow"><Copy field="confirmation.paid-heading"/></p><h1><Copy field="confirmation.confirmed-heading"/></h1><p className="confirmation-description"><Copy field="confirmation.confirmed-description"/></p><div className="confirmation-product"><img src={media.product} alt={media.productAlt}/><div><h2>{order?.quantity??1} × <Copy field="home.the-david-sling"/></h2><p>{money(order?.amountTotal??Math.round(content.price*100),order?.currency??'usd')}</p><span>{order?.reference??'Sample order'}</span></div></div><Link className="button" to="/"><Copy field="confirmation.back-to-the-slings"/><ArrowUpRight size={18}/></Link></>:
    <><h1>{checking?'Checking your payment…':order?.status==='pending'?'Waiting for payment confirmation':order?.status==='expired'?'Checkout expired':order?.status==='refunded'?'Payment refunded':'Order confirmation'}</h1><p className="confirmation-description">{error||(order?.status==='pending'?'Your payment hasn’t been confirmed yet. Please wait a moment before trying again.':order?.status==='refunded'?'This payment has been refunded. Contact us if you need help.':order?.status==='expired'?'You can start a new checkout whenever you’re ready.':session?'We’re checking the payment with Stripe.':'Open the confirmation link from your completed checkout to see your order.')}</p>{session&&!checking&&order?.status!=='refunded'&&<button className="button" onClick={()=>setRetry(v=>v+1)}>Check again</button>}<Link className="restart-preview" to="/checkout">Back to checkout</Link></>}
    <p className="confirmation-help"><a href={`mailto:${content.contactEmail}`}><Copy field="confirmation.ask-about-your-order"/></a></p>
  </main></div>;
}
