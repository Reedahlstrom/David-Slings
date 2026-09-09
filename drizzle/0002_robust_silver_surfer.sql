CREATE TABLE `business_workspace` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`revision` integer NOT NULL,
	`updated_at` text NOT NULL,
	`updated_by` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `orders` ADD `fulfilled_at` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `cost_unit_cents` integer;