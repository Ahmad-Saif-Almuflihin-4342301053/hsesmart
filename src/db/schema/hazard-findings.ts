import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { audits } from "./audits";
import { rooms } from "./locations";

export const riskLevelEnum = pgEnum("risk_level", [
  "low",
  "medium",
  "high",
]);

export const findingStatusEnum = pgEnum("finding_status", [
  "open",
  "in_progress",
  "resolved",
]);

export const hazardFindings = pgTable("hazard_findings", {
  id: serial("id").primaryKey(),
  auditId: integer("audit_id")
    .references(() => audits.id, { onDelete: "cascade" })
    .notNull(),
  roomId: integer("room_id")
    .references(() => rooms.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  photoUrl: text("photo_url"),
  riskLevel: riskLevelEnum("risk_level").notNull(),
  status: findingStatusEnum("status").default("open").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const hazardFindingsRelations = relations(hazardFindings, ({ one }) => ({
  audit: one(audits, {
    fields: [hazardFindings.auditId],
    references: [audits.id],
  }),
  room: one(rooms, {
    fields: [hazardFindings.roomId],
    references: [rooms.id],
  }),
}));
