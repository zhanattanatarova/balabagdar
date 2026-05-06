import { pgTable, text, uuid, timestamp, integer, real, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const clubsTable = pgTable("clubs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  nameRu: text("name_ru"),
  nameKz: text("name_kz"),
  nameEn: text("name_en"),
  descriptionRu: text("description_ru"),
  descriptionKz: text("description_kz"),
  descriptionEn: text("description_en"),
  category: text("category").notNull().default("other"),
  subcategory: text("subcategory"),
  city: text("city").notNull().default("Астана"),
  address: text("address"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  telegram: text("telegram"),
  instagram: text("instagram"),
  gisUrl: text("gis_url"),
  ageMin: integer("age_min").default(3),
  ageMax: integer("age_max").default(18),
  priceFrom: integer("price_from").default(0),
  priceCurrency: text("price_currency").default("₸"),
  avatarUrl: text("avatar_url"),
  gallery: json("gallery").$type<string[]>().default([]),
  instructor: text("instructor"),
  teachingLanguages: json("teaching_languages").$type<string[]>().default([]),
  rating: real("rating"),
  reviewsCount: integer("reviews_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const clubSchedulesTable = pgTable("club_schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  clubId: uuid("club_id").notNull().references(() => clubsTable.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  maxSlots: integer("max_slots").default(10),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClubSchema = createInsertSchema(clubsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertScheduleSchema = createInsertSchema(clubSchedulesTable).omit({ id: true, createdAt: true });
export type InsertClub = z.infer<typeof insertClubSchema>;
export type Club = typeof clubsTable.$inferSelect;
export type ClubSchedule = typeof clubSchedulesTable.$inferSelect;
