import { pgTable, text, varchar, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  location: text("location").notNull(),
  description: text("description"),
  category: text("category").notNull(), // id, legal, medical, financial
  urgencyTags: text("urgency_tags").array().default([]), // expires-soon, need-for-taxes, renewal-due
  expirationDate: timestamp("expiration_date"),
  hasImage: text("has_image").default("false"), // "true" or "false"
  imageEncrypted: text("image_encrypted"), // Base64 encoded encrypted image
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// Categories and urgency options
export const CATEGORIES = [
  { id: "id", label: "ID Documents", icon: "fas fa-id-card", color: "blue" },
  { id: "legal", label: "Legal", icon: "fas fa-gavel", color: "green" },
  { id: "medical", label: "Medical", icon: "fas fa-heartbeat", color: "purple" },
  { id: "financial", label: "Financial", icon: "fas fa-dollar-sign", color: "orange" },
] as const;

export const URGENCY_TAGS = [
  { id: "expires-soon", label: "Expires Soon", icon: "fas fa-clock", color: "red" },
  { id: "need-for-taxes", label: "Need for Taxes", icon: "fas fa-receipt", color: "yellow" },
  { id: "renewal-due", label: "Renewal Due", icon: "fas fa-sync", color: "blue" },
] as const;
