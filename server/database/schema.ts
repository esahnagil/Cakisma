import { sql } from "drizzle-orm";
import { serial, text, timestamp, pgTable } from "drizzle-orm/pg-core";

export const devices = pgTable('devices', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  ipAddress: text('ipAddress').notNull(),
  type: text('type').notNull(),
  createdAt: timestamp('createdAt').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updatedAt').default(sql`CURRENT_TIMESTAMP`),
});

export type Device = typeof devices.$inferSelect;
export type NewDevice = typeof devices.$inferInsert;
