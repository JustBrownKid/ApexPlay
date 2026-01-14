import { pgTable, integer, text, timestamp } from 'drizzle-orm/pg-core';

export const otps = pgTable('otps', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    email: text('email').notNull(),
    code: text('code').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
});