const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

export async function redirectToCheckout(quantity = 1) {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/create-checkout-session`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    }
  )

  if (!response.ok) {
    throw new Error('Failed to create checkout session')
  }

  const { url } = await response.json()
  window.location.href = url
}
