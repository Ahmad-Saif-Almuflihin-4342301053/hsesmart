"use server";

import { db } from "@/db";
import {
  buildings,
  rooms,
  audits,
  auditItems,
  hazardFindings,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Seed initial buildings and rooms if database is empty
export async function seedInitialLocationsIfEmpty() {
  try {
    const existingBuildings = await db.select().from(buildings).limit(1);
    if (existingBuildings.length === 0) {
      // Create Gedung Utama
      const [b1] = await db
        .insert(buildings)
        .values({
          name: "Gedung Direktorat & Laboratorium Terpadu",
          totalFloors: 4,
        })
        .returning();

      // Create Gedung Workshop
      const [b2] = await db
        .insert(buildings)
        .values({
          name: "Gedung Bengkel & Fabrikasi Mesin",
          totalFloors: 2,
        })
        .returning();

      // Seed Rooms for B1
      await db.insert(rooms).values([
        {
          buildingId: b1.id,
          name: "Lab Kimia Dasar & Terapan",
          floor: 2,
          category: "lab",
        },
        {
          buildingId: b1.id,
          name: "Ruang Kuliah Teori 201",
          floor: 2,
          category: "classroom",
        },
        {
          buildingId: b1.id,
          name: "Kantor Jurusan Teknik Elektro",
          floor: 3,
          category: "office",
        },
        {
          buildingId: b1.id,
          name: "Kantin Pusat Gedung A",
          floor: 1,
          category: "canteen",
        },
      ]);

      // Seed Rooms for B2
      await db.insert(rooms).values([
        {
          buildingId: b2.id,
          name: "Workshop Pengelasan & Mesin Bubut",
          floor: 1,
          category: "workshop",
        },
        {
          buildingId: b2.id,
          name: "Lab Otomasi & PLC",
          floor: 2,
          category: "lab",
        },
      ]);
    }
  } catch (err) {
    console.error("Error seeding initial locations:", err);
  }
}

// Fetch all buildings with their rooms
export async function getBuildingsWithRooms() {
  await seedInitialLocationsIfEmpty();
  try {
    const allBuildings = await db.select().from(buildings);
    const allRooms = await db.select().from(rooms);

    return allBuildings.map((b) => ({
      id: b.id,
      name: b.name,
      totalFloors: b.totalFloors,
      createdAt: b.createdAt.toISOString(),
      rooms: allRooms
        .filter((r) => r.buildingId === b.id)
        .map((r) => ({
          id: r.id,
          buildingId: r.buildingId,
          name: r.name,
          floor: r.floor,
          category: r.category,
          createdAt: r.createdAt.toISOString(),
        })),
    }));
  } catch (error) {
    console.error("Error fetching buildings:", error);
    return [];
  }
}

// Get or create an active audit session for a building
export async function createOrGetAuditSession(buildingId: number, auditorName: string = "Auditor Lapangan") {
  try {
    // Check if there is an active draft audit for this building
    const [existing] = await db
      .select()
      .from(audits)
      .where(and(eq(audits.buildingId, buildingId), eq(audits.status, "draft")))
      .limit(1);

    if (existing) {
      return existing;
    }

    const [newAudit] = await db
      .insert(audits)
      .values({
        buildingId,
        auditorName,
        status: "draft",
      })
      .returning();

    return newAudit;
  } catch (error) {
    console.error("Error creating audit session:", error);
    throw new Error("Gagal memulai sesi audit");
  }
}

// Get room details & audit data for audit execution
export async function getRoomAuditDetails(auditId: number, roomId: number) {
  try {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId)).limit(1);
    const [audit] = await db.select().from(audits).where(eq(audits.id, auditId)).limit(1);
    
    if (!room || !audit) {
      return null;
    }

    const [building] = await db.select().from(buildings).where(eq(buildings.id, room.buildingId)).limit(1);

    // Fetch existing checked items
    const savedItems = await db
      .select()
      .from(auditItems)
      .where(and(eq(auditItems.auditId, auditId), eq(auditItems.roomId, roomId)));

    // Fetch existing hazard findings
    const findings = await db
      .select()
      .from(hazardFindings)
      .where(and(eq(hazardFindings.auditId, auditId), eq(hazardFindings.roomId, roomId)));

    return {
      room: {
        ...room,
        createdAt: room.createdAt.toISOString(),
      },
      audit: {
        ...audit,
        auditDate: audit.auditDate.toISOString(),
        createdAt: audit.createdAt.toISOString(),
      },
      building: {
        ...building,
        createdAt: building.createdAt.toISOString(),
      },
      savedItems: savedItems.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
      })),
      findings: findings.map((f) => ({
        ...f,
        createdAt: f.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching room audit details:", error);
    return null;
  }
}

// Save or update audit checklist item
export async function saveAuditItemCheck(params: {
  auditId: number;
  roomId: number;
  criteriaLabel: string;
  isCompliant: boolean;
  notes?: string;
}) {
  try {
    const existing = await db
      .select()
      .from(auditItems)
      .where(
        and(
          eq(auditItems.auditId, params.auditId),
          eq(auditItems.roomId, params.roomId),
          eq(auditItems.criteriaLabel, params.criteriaLabel)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(auditItems)
        .set({
          isCompliant: params.isCompliant,
          notes: params.notes ?? null,
        })
        .where(eq(auditItems.id, existing[0].id));
    } else {
      await db.insert(auditItems).values({
        auditId: params.auditId,
        roomId: params.roomId,
        criteriaLabel: params.criteriaLabel,
        isCompliant: params.isCompliant,
        notes: params.notes ?? null,
      });
    }

    revalidatePath(`/audit/${params.auditId}/rooms/${params.roomId}`);
    return { success: true };
  } catch (error) {
    console.error("Error saving checklist item:", error);
    return { success: false, error: "Gagal menyimpan checklist" };
  }
}

// Record new hazard finding
export async function recordHazardFinding(params: {
  auditId: number;
  roomId: number;
  title: string;
  description: string;
  riskLevel: "low" | "medium" | "high";
  photoUrl?: string;
}) {
  try {
    const [newFinding] = await db
      .insert(hazardFindings)
      .values({
        auditId: params.auditId,
        roomId: params.roomId,
        title: params.title,
        description: params.description,
        riskLevel: params.riskLevel,
        photoUrl: params.photoUrl ?? null,
        status: "open",
      })
      .returning();

    revalidatePath(`/audit/${params.auditId}/rooms/${params.roomId}`);
    return { success: true, data: newFinding };
  } catch (error) {
    console.error("Error recording hazard finding:", error);
    return { success: false, error: "Gagal menyimpan temuan bahaya" };
  }
}
