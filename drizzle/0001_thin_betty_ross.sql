CREATE TABLE `orders` (
	`session_id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`payment_intent_id` text,
	`livemode` integer NOT NULL,
	`status` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_amount` integer NOT NULL,
	`amount_subtotal` integer NOT NULL,
	`amount_shipping` integer NOT NULL,
	`amount_tax` integer NOT NULL,
	`amount_total` integer NOT NULL,
	`amount_refunded` integer DEFAULT 0 NOT NULL,
	`currency` text NOT NULL,
	`email` text NOT NULL,
	`shipping_name` text NOT NULL,
	`shipping_address` text NOT NULL,
	`tracking_number` text,
	`paid_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stripe_events` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`processed_at` text NOT NULL
);
