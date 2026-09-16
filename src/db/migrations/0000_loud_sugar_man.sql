CREATE TYPE "public"."room_category" AS ENUM('classroom', 'lab', 'canteen', 'workshop', 'office');--> statement-breakpoint
CREATE TYPE "public"."safety_asset_status" AS ENUM('active', 'expired', 'damaged');--> statement-breakpoint
CREATE TYPE "public"."safety_asset_type" AS ENUM('apar', 'p3k', 'fire_alarm', 'hydran', 'evacuation_sign');--> statement-breakpoint
CREATE TYPE "public"."audit_status" AS ENUM('draft', 'completed');--> statement-breakpoint
CREATE TYPE "public"."finding_status" AS ENUM('open', 'in_progress', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."risk_level" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TABLE "buildings" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"total_floors" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"building_id" integer NOT NULL,
	"name" text NOT NULL,
	"floor" integer NOT NULL,
	"category" "room_category" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "safety_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer NOT NULL,
	"asset_code" text NOT NULL,
	"type" "safety_asset_type" NOT NULL,
	"expiry_date" timestamp,
	"status" "safety_asset_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "safety_assets_asset_code_unique" UNIQUE("asset_code")
);
--> statement-breakpoint
CREATE TABLE "audit_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"audit_id" integer NOT NULL,
	"room_id" integer NOT NULL,
	"criteria_label" text NOT NULL,
	"is_compliant" boolean NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audits" (
	"id" serial PRIMARY KEY NOT NULL,
	"building_id" integer NOT NULL,
	"auditor_name" text NOT NULL,
	"audit_date" timestamp DEFAULT now() NOT NULL,
	"status" "audit_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hazard_findings" (
	"id" serial PRIMARY KEY NOT NULL,
	"audit_id" integer NOT NULL,
	"room_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"photo_url" text,
	"risk_level" "risk_level" NOT NULL,
	"status" "finding_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "safety_assets" ADD CONSTRAINT "safety_assets_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_items" ADD CONSTRAINT "audit_items_audit_id_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."audits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_items" ADD CONSTRAINT "audit_items_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audits" ADD CONSTRAINT "audits_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hazard_findings" ADD CONSTRAINT "hazard_findings_audit_id_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."audits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hazard_findings" ADD CONSTRAINT "hazard_findings_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;