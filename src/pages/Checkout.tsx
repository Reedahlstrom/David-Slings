import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, Camera, LockKeyhole, Minus, Plus, Truck } from 'lucide-react';
import { Copy, useSite } from '@/lib/storefront';
import { getCheckoutConfig, redirectToCheckout, money } from '@/lib/stripe';
import type { CheckoutConfig } from '@/lib/stripe';

export default function Checkout() {
  const {media,content,editing,dirty} = useSite();
  const [params] = useSearchParams();
  const requested = Number(params.get('quantity') || 1);
  const [quantity,setQuantity] = useState(Number.isInteger(requested) ? Math.min(10,Math.max(1,requested)) : 1);
  const [config,setConfig] = useState<CheckoutConfig|null>(null);
  const [error,setError] = useState(''),[busy,setBusy] = useState(false);
  const requestId = useRef(crypto.randomUUID());
  useEffect(() => {const controller = new AbortController(); getCheckoutConfig(controller.signal).then(setConfig).catch(e=>{if(!controller.signal.aborted)setError(e.message);});return()=>controller.abort();},[]);
  function changeQuantity(value:number) {setQuantity(value);requestId.current=crypto.randomUUID();setError('');}
  async function pay() {
    if (!config?.enabled || busy) return;
    setBusy(true);setError('');
    try {await redirectToCheckout(quantity,config.unitAmount,requestId.current);} catch(e) {setError(e instanceof Error?e.message:'Couldn’t open checkout. Try again.');setBusy(false);}
  }
  const unitAmount = editing ? Math.round(content.price*100) : config?.unitAmount ?? Math.round(content.price*100);
  const shipping = config?.shippingAmount ?? 0;
  return <div className="checkout-page">
    <header className="checkout-header shell"><Link className="wordmark" to="/"><Copy field="header.david-slings"/><span className="brand-dot">✳</span></Link><span><LockKeyhole size={14}/> Secure checkout</span></header>
    <main className="checkout-grid shell">
      <section className="checkout-main checkout-start">
        <Link className="back-link" to="/#sling"><ArrowLeft size={15}/><Copy field="checkout.back-to-the-sling"/></Link>
        <p className="eyebrow"><Copy field="checkout.order-heading"/></p>
        <h1><Copy field="checkout.ready-heading"/></h1>
        <p className="checkout-subtitle"><Copy field="checkout.secure-description"/></p>
        {params.get('canceled')==='1'&&<p className="checkout-info" role="status">Checkout was canceled. You haven’t been charged. Your sling is still here.</p>}
        {config?.mode==='test'&&<p className="preview-notice">Test checkout. No real payment will be taken. Use Stripe’s test card details.</p>}
        {editing&&dirty&&<p className="preview-notice">Save your site changes before checking out. Payments use the saved price.</p>}
        <div className="checkout-details"><div><Truck size={21}/><div><h2><Copy field="checkout.shipping"/></h2><p>{config?.countries.length?`Shipping to ${config.countries.map(c=>c==='US'?'the United States':'Canada').join(' and ')}.`:'Shipping options appear at checkout.'}</p>{config?.dispatchNote&&<p>{config.dispatchNote}</p>}</div></div><div><LockKeyhole size={21}/><div><h2><Copy field="checkout.payment-heading"/></h2><p><Copy field="checkout.payment-description"/></p></div></div></div>
        {error&&<p className="error-message" role="alert">{error}</p>}
        {!config?.enabled&&config&&<p className="checkout-info">Checkout isn’t open yet. Please check back soon.</p>}
        <button className="button full-button" onClick={()=>void pay()} disabled={!config?.enabled||busy||(editing&&dirty)}>{busy?'Opening checkout…':<Copy field="checkout.continue-to-payment"/>}<ArrowRight size={18}/></button>
        <p className="field-note">Your total, including any applicable tax, is shown before you pay.</p>
        {config?.returnsPolicy&&<div className="checkout-policy"><h2><Copy field="checkout.returns-heading"/></h2><p>{config.returnsPolicy}</p></div>}
      </section>
      <aside className="order-summary" aria-label="Order summary">
        <p className="eyebrow"><Copy field="checkout.coming-along-for-the-ride"/></p>
        <div className="summary-product"><div className="summary-image"><img src={media.product} alt={media.productAlt}/><span className="summary-quantity-badge" aria-label={`${quantity} slings`}>{quantity}</span></div><div className="summary-product-details"><h2><Copy field="home.the-david-sling"/></h2><p><Copy field="checkout.leather-paracord"/></p><span>{money(unitAmount)} each</span></div></div>
        <div className="summary-quantity"><span><Copy field="checkout.quantity"/></span><div className="quantity-control"><button aria-label="Remove one sling" disabled={quantity===1||busy} onClick={()=>changeQuantity(quantity-1)}><Minus size={14}/></button><output aria-live="polite">{quantity}</output><button aria-label="Add one sling" disabled={quantity===10||busy} onClick={()=>changeQuantity(quantity+1)}><Plus size={14}/></button></div></div>
        <dl className="order-totals"><div><dt><Copy field="checkout.subtotal"/></dt><dd>{money(unitAmount*quantity)}</dd></div><div><dt><Copy field="checkout.shipping"/></dt><dd>{config?shipping===0?<Copy field="checkout.free"/>:money(shipping):'At checkout'}</dd></div><div><dt><Copy field="checkout.tax"/></dt><dd className="tax-note">Calculated at checkout</dd></div><div className="total"><dt><Copy field="checkout.total-heading"/></dt><dd><small>USD</small> {money(unitAmount*quantity+shipping)}</dd></div></dl>
        <p className="handwritten summary-note"><Copy field="checkout.good-afternoons-ahead"/></p>
        <a className="slinging-club-link" href={content.instagram} target="_blank" rel="noopener noreferrer"><Camera size={17}/><Copy field="checkout.join-the-slinging-club"/><ArrowUpRight size={15}/></a>
        <div className="checkout-help"><Copy field="checkout.need-a-hand"/> <a href={`mailto:${content.contactEmail}`}><Copy field="checkout.say-hello"/></a></div>
      </aside>
    </main>
    <footer className="checkout-footer shell"><span>© {new Date().getFullYear()} <Copy field="footer.david-slings"/></span><a href={`mailto:${content.contactEmail}`}><Copy field="checkout.questions-we-re-around"/></a></footer>
  </div>;
}
