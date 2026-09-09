import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const siteContent = sqliteTable('site_content', {
 id: text('id').primaryKey(), content: text('content').notNull(), revision: integer('revision').notNull(), updatedAt: text('updated_at').notNull(), updatedBy: text('updated_by').notNull(),
});

export const orders = sqliteTable('orders', {
  sessionId: text('session_id').primaryKey(),
  reference: text('reference').notNull(),
  paymentIntentId: text('payment_intent_id'),
  livemode: integer('livemode').notNull(),
  status: text('status').notNull(),
  quantity: integer('quantity').notNull(),
  unitAmount: integer('unit_amount').notNull(),
  amountSubtotal: integer('amount_subtotal').notNull(),
  amountShipping: integer('amount_shipping').notNull(),
  amountTax: integer('amount_tax').notNull(),
  amountTotal: integer('amount_total').notNull(),
  amountRefunded: integer('amount_refunded').notNull().default(0),
  currency: text('currency').notNull(),
  email: text('email').notNull(),
  shippingName: text('shipping_name').notNull(),
  shippingAddress: text('shipping_address').notNull(),
  trackingNumber: text('tracking_number'),
  paidAt: text('paid_at').notNull(),
  fulfilledAt: text('fulfilled_at'),
  costUnitCents: integer('cost_unit_cents'),
  updatedAt: text('updated_at').notNull(),
});
export const stripeEvents = sqliteTable('stripe_events', {
  id: text('id').primaryKey(), type: text('type').notNull(), processedAt: text('processed_at').notNull(),
});

export const businessWorkspace = sqliteTable('business_workspace', {
 id:text('id').primaryKey(),content:text('content').notNull(),revision:integer('revision').notNull(),updatedAt:text('updated_at').notNull(),updatedBy:text('updated_by').notNull(),
});
export const adminSessions = sqliteTable('admin_sessions', {id:text('id').primaryKey(),email:text('email').notNull(),expiresAt:integer('expires_at').notNull()});
export const loginAttempts = sqliteTable('login_attempts', {id:text('id').primaryKey(),attempts:integer('attempts').notNull(),expiresAt:integer('expires_at').notNull()});
