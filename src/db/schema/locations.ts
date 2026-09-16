import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { safetyAssets } from "./safety-assets";
import { audits, auditItems } from "./audits";
import { hazardFindings } from "./hazard-findings";

export const roomCategoryEnum = pgEnum("room_category", [
  "classroom",
  "lab",
  "canteen",
  "workshop",
  "office",
]);

export const buildings = pgTable("buildings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  totalFloors: integer("total_floors").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  buildingId: integer("building_id")
    .references(() => buildings.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  floor: integer("floor").notNull(),
  category: roomCategoryEnum("category").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const buildingsRelations = relations(buildings, ({ many }) => ({
  rooms: many(rooms),
  audits: many(audits),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  building: one(buildings, {
    fields: [rooms.buildingId],
    references: [buildings.id],
  }),
  safetyAssets: many(safetyAssets),
  auditItems: many(auditItems),
  hazardFindings: many(hazardFindings),
}));
