import Stripe from 'stripe';
import { defaults, mergeContent } from '../shared/content';
import type { CheckoutConfig } from '../shared/commerce';
import { canEdit, json, readBytes } from './http';
import { readBusiness } from './business';
import { unitCosts } from '../shared/business';

const paymentIsLive = (env: Env) => /^[sr]k_live_/.test(env.STRIPE_SECRET_KEY);

export function stripeClient(env: Env) {
  return new Stripe(env.STRIPE_SECRET_KEY, {httpClient: Stripe.createFetchHttpClient(), maxNetworkRetries: 2, timeout: 15000});
}
export async function checkoutConfig(env: Env): Promise<CheckoutConfig> {
  const row = await env.DB.prepare('SELECT content FROM site_content WHERE id = ?').bind('storefront').first<{content:string}>();
  const content = row ? mergeContent(JSON.parse(row.content)) : defaults;
  const mode = env.PAYMENTS_MODE === 'live' ? 'live' : env.PAYMENTS_MODE === 'test' ? 'test' : 'off';
  const countries = (env.SHIPPING_COUNTRIES || '').split(',').map(s => s.trim()).filter(s => ['US','CA'].includes(s));
  const shippingAmount = Number(env.SHIPPING_AMOUNT_CENTS);
  const configured = !!env.STRIPE_PRODUCT_ID && /^whsec_/.test(env.STRIPE_WEBHOOK_SECRET) && new RegExp(`^[sr]k_${mode}_`).test(env.STRIPE_SECRET_KEY) && countries.length > 0 && env.SHIPPING_AMOUNT_CENTS !== '' && Number.isInteger(shippingAmount) && shippingAmount >= 0 && ['true','false'].includes(env.STRIPE_AUTOMATIC_TAX);
  return {enabled: mode !== 'off' && configured, mode, unitAmount: Math.round(content.price * 100), shippingAmount, countries, automaticTax: env.STRIPE_AUTOMATIC_TAX === 'true', dispatchNote: env.DISPATCH_NOTE || '', returnsPolicy: env.RETURNS_POLICY || ''};
}
export function validCheckoutInput(value: unknown): value is {quantity:number; unitAmount:number; requestId:string} {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string,unknown>;
  return Number.isInteger(v.quantity) && Number(v.quantity) >= 1 && Number(v.quantity) <= 10 && Number.isInteger(v.unitAmount) && typeof v.requestId === 'string' && /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(v.requestId);
}
export function validatePaidSession(session: Stripe.Checkout.Session, env: Env) {
  const line = session.line_items?.data[0];
  const quantity = Number(session.metadata?.quantity), unitAmount = Number(session.metadata?.unit_amount), shippingAmount = Number(session.metadata?.shipping_amount);
  const shipping = session.collected_information?.shipping_details;
  const product = typeof line?.price?.product === 'string' ? line.price.product : line?.price?.product?.id;
  if (session.metadata?.store !== 'david-slings' || session.mode !== 'payment' || session.status !== 'complete' || session.payment_status !== 'paid') throw new Error('Session is not a paid David Slings order');
  if (session.livemode !== paymentIsLive(env)) throw new Error('Payment mode mismatch');
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10 || !Number.isInteger(unitAmount) || unitAmount < 100 || unitAmount > 100000 || !Number.isInteger(shippingAmount) || shippingAmount < 0) throw new Error('Invalid order metadata');
  if (!line || session.line_items?.data.length !== 1 || session.line_items.has_more || line.quantity !== quantity || product !== env.STRIPE_PRODUCT_ID || line.price?.unit_amount !== unitAmount || session.currency !== 'usd' || session.amount_subtotal !== unitAmount * quantity || session.total_details?.amount_shipping !== shippingAmount || session.total_details?.amount_discount !== 0 || session.amount_total !== session.amount_subtotal + shippingAmount + (session.total_details?.amount_tax ?? 0)) throw new Error('Order amounts do not match');
  if (!session.customer_details?.email || !shipping?.name || !shipping.address?.line1 || !shipping.address.city || !shipping.address.country || !shipping.address.postal_code) throw new Error('Paid order is missing its shipping details');
  return {quantity,unitAmount,shippingAmount,shipping};
}
export async function recordPaidOrder(session: Stripe.Checkout.Session, env: Env, event?: Stripe.Event) {
  const {quantity,unitAmount,shippingAmount,shipping} = validatePaidSession(session,env);
  const now = new Date().toISOString();
  const paymentIntent = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null;
  const {business} = await readBusiness(env);
  const costUnitCents = Math.round(unitCosts(business,unitAmount/100).cogs*100);
  const insert = env.DB.prepare('INSERT INTO orders (session_id,reference,payment_intent_id,livemode,status,quantity,unit_amount,amount_subtotal,amount_shipping,amount_tax,amount_total,amount_refunded,currency,email,shipping_name,shipping_address,paid_at,updated_at,cost_unit_cents) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(session_id) DO NOTHING').bind(session.id,`DS-${session.id.slice(-10).toUpperCase()}`,paymentIntent,Number(session.livemode),'paid',quantity,unitAmount,session.amount_subtotal,shippingAmount,session.total_details?.amount_tax??0,session.amount_total,0,session.currency,session.customer_details!.email,shipping.name,JSON.stringify(shipping.address),now,now,costUnitCents);
  const statements = [insert];
  // A delayed webhook must use Stripe’s payment event time, not delivery time.
  if (event && Number.isFinite(event.created)) statements.push(env.DB.prepare('UPDATE orders SET paid_at = ? WHERE session_id = ?').bind(new Date(event.created*1000).toISOString(),session.id));
  if (event) statements.push(env.DB.prepare('INSERT INTO stripe_events (id,type,processed_at) VALUES (?,?,?) ON CONFLICT(id) DO NOTHING').bind(event.id,event.type,now));
  await env.DB.batch(statements);
}
async function handleWebhook(request: Request, env: Env, stripe: Stripe) {
  if (!env.STRIPE_WEBHOOK_SECRET || !env.STRIPE_SECRET_KEY) return json({error:'Payments are not configured.'},503);
  const signature = request.headers.get('stripe-signature');
  if (!signature) return json({error:'Missing signature.'},400);
  let event: Stripe.Event;
  try {const payload = new TextDecoder().decode(await readBytes(request,1_000_000)); event = await stripe.webhooks.constructEventAsync(payload,signature,env.STRIPE_WEBHOOK_SECRET,300,Stripe.createSubtleCryptoProvider());}
  catch {return json({error:'Invalid signature.'},400);}
  if (event.livemode !== paymentIsLive(env)) return json({error:'Payment mode mismatch.'},400);
  const seen = await env.DB.prepare('SELECT id FROM stripe_events WHERE id = ?').bind(event.id).first();
  if (seen) return json({received:true});
  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const data = event.data.object;
    if (data.metadata?.store !== 'david-slings') return json({received:true});
    const session = await stripe.checkout.sessions.retrieve(data.id,{expand:['line_items']});
    if (session.payment_status === 'paid') await recordPaidOrder(session,env,event);
    return json({received:true});
  }
  if (event.type === 'charge.refunded') {
    const charge = await stripe.charges.retrieve(event.data.object.id);
    const paymentIntent = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
    if (paymentIntent) {
      // A refund can arrive before a delayed checkout webhook; reconcile the paid order first.
      const sessions = await stripe.checkout.sessions.list({payment_intent:paymentIntent,limit:10});
      for (const session of sessions.data) if (session.metadata?.store === 'david-slings') {
        const full = await stripe.checkout.sessions.retrieve(session.id,{expand:['line_items']});
        await recordPaidOrder(full,env);
      }
      await env.DB.batch([
        env.DB.prepare("UPDATE orders SET amount_refunded = MAX(amount_refunded, ?), status = CASE WHEN ? >= amount_total THEN 'refunded' ELSE status END, updated_at = ? WHERE payment_intent_id = ? AND livemode = ?").bind(charge.amount_refunded,charge.amount_refunded,new Date().toISOString(),paymentIntent,Number(event.livemode)),
        env.DB.prepare('INSERT INTO stripe_events (id,type,processed_at) VALUES (?,?,?) ON CONFLICT(id) DO NOTHING').bind(event.id,event.type,new Date().toISOString()),
      ]);
    }
  }
  return json({received:true});
}

export async function handlePayments(request: Request, env: Env, getStripe = stripeClient): Promise<Response|null> {
  const url = new URL(request.url), path = url.pathname;
  if (!['/api/checkout/config','/api/checkout','/api/stripe/webhook','/api/order-status','/api/orders','/api/orders/fulfill'].includes(path)) return null;
  try {
    if (path === '/api/checkout/config' && request.method === 'GET') return json(await checkoutConfig(env));
    if (path === '/api/stripe/webhook' && request.method === 'POST') return await handleWebhook(request,env,getStripe(env));
    if (path === '/api/checkout' && request.method === 'POST') {
      if (request.headers.get('origin') !== url.origin) return json({error:'Open checkout from the storefront.'},403);
      if (!request.headers.get('content-type')?.startsWith('application/json')) return json({error:'Expected JSON.'},415);
      let input: unknown;
      try {input = JSON.parse(new TextDecoder().decode(await readBytes(request,4096)));} catch {return json({error:'Check your quantity and try again.'},400);}
      if (!validCheckoutInput(input)) return json({error:'Choose between 1 and 10 slings.'},400);
      const config = await checkoutConfig(env);
      if (!config.enabled) return json({error:'Checkout is not open yet. Please check back soon.'},503);
      if (input.unitAmount !== config.unitAmount) return json({error:'The price has changed. Refresh to see the current price before checking out.'},409);
      const origin = new URL(env.SITE_URL).origin;
      const metadata = {store:'david-slings',quantity:String(input.quantity),unit_amount:String(config.unitAmount),shipping_amount:String(config.shippingAmount)};
      const session = await getStripe(env).checkout.sessions.create({
        mode:'payment',payment_method_types:['card'],
        success_url:`${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:`${origin}/checkout?quantity=${input.quantity}&canceled=1`,
        line_items:[{price_data:{currency:'usd',unit_amount:config.unitAmount,product:env.STRIPE_PRODUCT_ID,tax_behavior:'exclusive'},quantity:input.quantity}],
        shipping_address_collection:{allowed_countries:config.countries as ('US'|'CA')[]},
        shipping_options:[{shipping_rate_data:{type:'fixed_amount',fixed_amount:{amount:config.shippingAmount,currency:'usd'},display_name:'Standard shipping',tax_behavior:'exclusive'}}],
        automatic_tax:{enabled:config.automaticTax},
        metadata,payment_intent_data:{metadata},
        branding_settings:{display_name:'David Slings',background_color:'#f8f6ef',button_color:'#2c4531',border_style:'rectangular',font_family:'source_sans_pro'},
        ...(config.dispatchNote ? {custom_text:{shipping_address:{message:config.dispatchNote}}} : {}),
      },{idempotencyKey:`david-slings:${input.requestId}`});
      if (!session.url || session.livemode !== (config.mode === 'live') || new URL(session.url).hostname !== 'checkout.stripe.com') throw new Error('Unexpected Stripe checkout response');
      return json({url:session.url});
    }
    if (path === '/api/order-status' && request.method === 'GET') {
      const id = url.searchParams.get('session_id');
      if (!id || !/^cs_(?:test|live)_[A-Za-z0-9]{20,200}$/.test(id)) return json({error:'Order not found.'},404);
      if (!env.STRIPE_SECRET_KEY) return json({error:'Order lookup is temporarily unavailable.'},503);
      const stripe = getStripe(env);
      const session = await stripe.checkout.sessions.retrieve(id,{expand:['line_items']});
      if (session.metadata?.store !== 'david-slings' || session.livemode !== paymentIsLive(env)) return json({error:'Order not found.'},404);
      if (session.payment_status !== 'paid' || session.status !== 'complete') return json({status:session.status === 'expired'?'expired':'pending'});
      await recordPaidOrder(session,env);
      const order = await env.DB.prepare('SELECT reference,status,quantity,amount_total,currency,livemode FROM orders WHERE session_id = ?').bind(id).first<{reference:string;status:string;quantity:number;amount_total:number;currency:string;livemode:number}>();
      // No address, email, or other customer details are exposed by a session URL.
      return json({status:order!.status==='refunded'?'refunded':'paid',reference:order!.reference,quantity:order!.quantity,amountTotal:order!.amount_total,currency:order!.currency,test:!order!.livemode});
    }
    if (path === '/api/orders' && request.method === 'GET') {
      if (!canEdit(request,env)) return json({error:'Sign in as the site owner.'},403);
      const limit = 50, before = url.searchParams.get('before') || '9999';
      const {results} = await env.DB.prepare('SELECT * FROM orders WHERE paid_at < ? AND livemode = ? ORDER BY paid_at DESC LIMIT ?').bind(before,Number(paymentIsLive(env)),limit).all();
      return json({orders:results,next:results.length===limit?results[results.length-1].paid_at:null});
    }
    if (path === '/api/orders/fulfill' && request.method === 'POST') {
      if (!canEdit(request,env) || request.headers.get('origin')!==url.origin) return json({error:'Sign in as the site owner.'},403);
      let input;
      try {input=JSON.parse(new TextDecoder().decode(await readBytes(request,4096)));} catch{return json({error:'Invalid request.'},400);}
      if (!input || typeof input.sessionId!=='string'||typeof input.trackingNumber!=='string'||input.trackingNumber.length>120) return json({error:'Enter a valid tracking number.'},400);
      const result = await env.DB.prepare("UPDATE orders SET status = 'shipped', tracking_number = ?, fulfilled_at = COALESCE(fulfilled_at, ?), updated_at = ? WHERE session_id = ? AND status = 'paid' AND livemode = ? RETURNING reference").bind(input.trackingNumber.trim(),new Date().toISOString(),new Date().toISOString(),input.sessionId,input.mode==='live'?1:input.mode==='test'?0:Number(paymentIsLive(env))).first();
      return result ? json({saved:true}) : json({error:'This order has already changed. Refresh the list.'},409);
    }
    return json({error:'Method not allowed.'},405);
  } catch (error) {
    if (error instanceof Stripe.errors.StripeInvalidRequestError && path === '/api/order-status') return json({error:'Order not found.'},404);
    console.error('payments_request_failed',{path,type:error instanceof Error?error.name:'unknown'});
    return json({error:path==='/api/checkout'?'Couldn’t open checkout. Please try again.':'Couldn’t verify this order yet. Please try again.'},502);
  }
}
