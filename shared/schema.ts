import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  description: text("description"),
  category: text("category").notNull(), // id, legal, medical, financial
  urgencyTags: text("urgency_tags").array().default([]), // expires-soon, need-for-taxes, renewal-due
  expirationDate: timestamp("expiration_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

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
