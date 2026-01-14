import { pgEnum } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';
import { pgTable, integer, text, boolean } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', [
    'super_admin',
    'admin',
    'moderator',
    'contributor',
    'user',
]);

export const users = pgTable('users', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: text('name').notNull(),
    protalUser: boolean('protalUser').default(false).notNull(),
    role: roleEnum('role').default('user').notNull(),
    tgid: text('tgid').unique(),
    email: text('email').unique().notNull(),
    password: text('password').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});