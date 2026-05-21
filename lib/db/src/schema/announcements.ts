import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";

export const announcementsTable = pgTable("announcements", {
  id: uuid("id").primaryKey().defaultRandom(),
  category: text("category").notNull().default("other"),
  title: text("title").notNull(),
  body: text("body").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  city: text("city").notNull().default("Актау"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});
