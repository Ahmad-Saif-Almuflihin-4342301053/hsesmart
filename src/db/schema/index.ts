import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").default("auditor").notNull(), // auditor, lead_auditor, admin
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inspections = pgTable("inspections", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  auditorId: integer("auditor_id").references(() => users.id),
  status: text("status").default("draft").notNull(), // draft, in_progress, completed
  score: integer("score"),
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const findings = pgTable("findings", {
  id: serial("id").primaryKey(),
  inspectionId: integer("inspection_id").references(() => inspections.id).notNull(),
  category: text("category").notNull(), // safety, health, environment
  severity: text("severity").notNull(), // low, medium, high, critical
  description: text("description").notNull(),
  actionPlan: text("action_plan"),
  isResolved: boolean("is_resolved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
