import type { CheckoutConfig, OrderConfirmation } from '../../shared/commerce';
export type { CheckoutConfig, OrderConfirmation } from '../../shared/commerce';
export { money } from '../../shared/commerce';
async function read<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}
export async function getCheckoutConfig(signal?: AbortSignal) {
  return read<CheckoutConfig>(await fetch('/api/checkout/config',{signal}));
}
export async function redirectToCheckout(quantity: number, unitAmount: number, requestId: string) {
  const data = await read<{url:string}>(await fetch('/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({quantity,unitAmount,requestId})}));
  const url = new URL(data.url);
  if (url.protocol !== 'https:' || url.hostname !== 'checkout.stripe.com') throw new Error('Checkout could not be opened. Please try again.');
  window.location.assign(url.href);
}
export async function getOrderStatus(sessionId: string, signal?: AbortSignal) {
  return read<OrderConfirmation>(await fetch(`/api/order-status?session_id=${encodeURIComponent(sessionId)}`,{signal}));
}
