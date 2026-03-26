// Supabase Edge Function: stripe-webhook
// Deploy with: supabase functions deploy stripe-webhook

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Simple HMAC verification for Stripe webhook signatures
async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const parts = signature.split(',')
  const timestamp = parts.find((p) => p.startsWith('t='))?.split('=')[1]
  const sig = parts.find((p) => p.startsWith('v1='))?.split('=')[1]

  if (!timestamp || !sig) return false

  const signedPayload = `${timestamp}.${payload}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const mac = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(signedPayload)
  )
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return expected === sig
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  const valid = await verifyStripeSignature(body, signature, STRIPE_WEBHOOK_SECRET)
  if (!valid) {
    return new Response('Invalid signature', { status: 400 })
  }

  const event = JSON.parse(body)

  if (event.type !== 'checkout.session.completed') {
    return new Response(JSON.stringify({ received: true }), { status: 200 })
  }

  try {
    const session = event.data.object

    // Retrieve full session with line items from Stripe
    const sessionResponse = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${session.id}?expand[]=line_items`,
      {
        headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` },
      }
    )
    const fullSession = await sessionResponse.json()

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Upsert customer
    const email = fullSession.customer_details?.email ?? ''
    const name = fullSession.customer_details?.name ?? null

    const { data: customer } = await supabase
      .from('customers')
      .upsert(
        {
          email,
          name,
          stripe_customer_id: fullSession.customer ?? null,
        },
        { onConflict: 'stripe_customer_id' }
      )
      .select('id')
      .single()

    // Extract shipping
    const shipping = fullSession.shipping_details?.address
    const shippingAddress = shipping
      ? {
          line1: shipping.line1,
          line2: shipping.line2 ?? undefined,
          city: shipping.city,
          state: shipping.state,
          postal_code: shipping.postal_code,
          country: shipping.country,
        }
      : null

    const quantity = fullSession.line_items?.data?.[0]?.quantity ?? 1

    // Insert order
    await supabase.from('orders').insert({
      customer_id: customer?.id ?? null,
      stripe_checkout_session_id: fullSession.id,
      stripe_payment_intent_id: fullSession.payment_intent ?? null,
      status: 'paid',
      amount_cents: fullSession.amount_total ?? 0,
      currency: fullSession.currency ?? 'usd',
      quantity,
      shipping_name: fullSession.shipping_details?.name ?? name,
      shipping_address: shippingAddress,
    })

    console.log(`Order created for session ${fullSession.id}`)

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: 'Webhook processing failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
