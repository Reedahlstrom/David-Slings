import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const siteContent = sqliteTable('site_content', {
 id: text('id').primaryKey(), content: text('content').notNull(), revision: integer('revision').notNull(), updatedAt: text('updated_at').notNull(), updatedBy: text('updated_by').notNull(),
});
