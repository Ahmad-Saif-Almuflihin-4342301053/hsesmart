import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { rooms } from "./locations";

export const safetyAssetTypeEnum = pgEnum("safety_asset_type", [
  "apar",
  "p3k",
  "fire_alarm",
  "hydran",
  "evacuation_sign",
]);

export const safetyAssetStatusEnum = pgEnum("safety_asset_status", [
  "active",
  "expired",
  "damaged",
]);

export const safetyAssets = pgTable("safety_assets", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id")
    .references(() => rooms.id, { onDelete: "cascade" })
    .notNull(),
  assetCode: text("asset_code").notNull().unique(),
  type: safetyAssetTypeEnum("type").notNull(),
  expiryDate: timestamp("expiry_date"),
  status: safetyAssetStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const safetyAssetsRelations = relations(safetyAssets, ({ one }) => ({
  room: one(rooms, {
    fields: [safetyAssets.roomId],
    references: [rooms.id],
  }),
}));
