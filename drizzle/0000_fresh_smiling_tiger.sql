CREATE TABLE `site_content` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`revision` integer NOT NULL,
	`updated_at` text NOT NULL,
	`updated_by` text NOT NULL
);
