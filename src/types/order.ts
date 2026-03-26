export interface Customer {
  id: string
  email: string
  name: string | null
  stripe_customer_id: string | null
  created_at: string
}

export interface Order {
  id: string
  customer_id: string | null
  stripe_checkout_session_id: string
  stripe_payment_intent_id: string | null
  status: OrderStatus
  amount_cents: number
  currency: string
  quantity: number
  shipping_name: string | null
  shipping_address: ShippingAddress | null
  tracking_number: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // Joined
  customer?: Customer
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'

export interface ShippingAddress {
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  paid: 'bg-blue-500/20 text-blue-400',
  shipped: 'bg-purple-500/20 text-purple-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
  refunded: 'bg-stone-mid text-stone-light',
}
