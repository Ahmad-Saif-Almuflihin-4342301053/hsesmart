import { pgTable, serial, text, integer, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { buildings, rooms } from "./locations";
import { hazardFindings } from "./hazard-findings";

export const auditStatusEnum = pgEnum("audit_status", [
  "draft",
  "completed",
]);

export const audits = pgTable("audits", {
  id: serial("id").primaryKey(),
  buildingId: integer("building_id")
    .references(() => buildings.id, { onDelete: "cascade" })
    .notNull(),
  auditorName: text("auditor_name").notNull(),
  auditDate: timestamp("audit_date").defaultNow().notNull(),
  status: auditStatusEnum("status").default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditItems = pgTable("audit_items", {
  id: serial("id").primaryKey(),
  auditId: integer("audit_id")
    .references(() => audits.id, { onDelete: "cascade" })
    .notNull(),
  roomId: integer("room_id")
    .references(() => rooms.id, { onDelete: "cascade" })
    .notNull(),
  criteriaLabel: text("criteria_label").notNull(),
  isCompliant: boolean("is_compliant").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditsRelations = relations(audits, ({ one, many }) => ({
  building: one(buildings, {
    fields: [audits.buildingId],
    references: [buildings.id],
  }),
  items: many(auditItems),
  hazardFindings: many(hazardFindings),
}));

export const auditItemsRelations = relations(auditItems, ({ one }) => ({
  audit: one(audits, {
    fields: [auditItems.auditId],
    references: [audits.id],
  }),
  room: one(rooms, {
    fields: [auditItems.roomId],
    references: [rooms.id],
  }),
}));
