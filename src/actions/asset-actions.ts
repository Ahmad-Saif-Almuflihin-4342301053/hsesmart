"use server";

import { db } from "@/db";
import { safetyAssets, rooms, buildings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  seedInitialLocationsIfEmpty,
  createOrGetAuditSession,
  recordHazardFinding,
} from "./audit-actions";

export interface ScannedAssetData {
  id: number;
  assetCode: string;
  type: "apar" | "p3k" | "fire_alarm" | "hydran" | "evacuation_sign";
  expiryDate: Date | null;
  status: "active" | "expired" | "damaged";
  createdAt: Date;
  roomId: number;
  roomName: string;
  roomFloor: number;
  roomCategory: string;
  buildingId: number;
  buildingName: string;
}

// Seed initial safety assets if empty
export async function seedInitialSafetyAssetsIfEmpty() {
  try {
    await seedInitialLocationsIfEmpty();
    const existing = await db.select().from(safetyAssets).limit(1);
    if (existing.length > 0) return;

    // Fetch rooms to link assets
    const allRooms = await db.select().from(rooms);
    if (allRooms.length === 0) return;

    const rLab = allRooms.find((r) => r.category === "lab") || allRooms[0];
    const rClass = allRooms.find((r) => r.category === "classroom") || allRooms[0];
    const rOffice = allRooms.find((r) => r.category === "office") || allRooms[0];
    const rCanteen = allRooms.find((r) => r.category === "canteen") || allRooms[0];
    const rWorkshop = allRooms.find((r) => r.category === "workshop") || allRooms[0];

    const now = new Date();
    const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
    const sixMonthsLater = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());

    await db.insert(safetyAssets).values([
      {
        assetCode: "HSE-APAR-001",
        type: "apar",
        roomId: rLab.id,
        status: "active",
        expiryDate: oneYearLater,
      },
      {
        assetCode: "HSE-APAR-002",
        type: "apar",
        roomId: rWorkshop.id,
        status: "damaged",
        expiryDate: sixMonthsLater,
      },
      {
        assetCode: "HSE-P3K-001",
        type: "p3k",
        roomId: rClass.id,
        status: "expired",
        expiryDate: twoMonthsAgo,
      },
      {
        assetCode: "HSE-ALARM-001",
        type: "fire_alarm",
        roomId: rOffice.id,
        status: "active",
        expiryDate: null,
      },
      {
        assetCode: "HSE-HYDRAN-001",
        type: "hydran",
        roomId: rCanteen.id,
        status: "active",
        expiryDate: oneYearLater,
      },
      {
        assetCode: "HSE-HYD-001",
        type: "hydran",
        roomId: rCanteen.id,
        status: "damaged",
        expiryDate: sixMonthsLater,
      },
      {
        assetCode: "HSE-SIGN-001",
        type: "evacuation_sign",
        roomId: rWorkshop.id,
        status: "active",
        expiryDate: null,
      },
    ]);
  } catch (err) {
    console.error("Error seeding initial safety assets:", err);
  }
}

// Query safety asset by assetCode joined with rooms and buildings
export async function getAssetByCode(code: string): Promise<{
  success: boolean;
  data?: ScannedAssetData;
  error?: string;
}> {
  if (!code || !code.trim()) {
    return { success: false, error: "Kode aset tidak boleh kosong" };
  }

  try {
    // Ensure sample data exists
    await seedInitialSafetyAssetsIfEmpty();

    const normalizedCode = code.trim().toUpperCase();

    const result = await db
      .select({
        id: safetyAssets.id,
        assetCode: safetyAssets.assetCode,
        type: safetyAssets.type,
        expiryDate: safetyAssets.expiryDate,
        status: safetyAssets.status,
        createdAt: safetyAssets.createdAt,
        roomId: rooms.id,
        roomName: rooms.name,
        roomFloor: rooms.floor,
        roomCategory: rooms.category,
        buildingId: buildings.id,
        buildingName: buildings.name,
      })
      .from(safetyAssets)
      .innerJoin(rooms, eq(safetyAssets.roomId, rooms.id))
      .innerJoin(buildings, eq(rooms.buildingId, buildings.id))
      .where(eq(safetyAssets.assetCode, normalizedCode))
      .limit(1);

    if (!result || result.length === 0) {
      return { success: false, error: "Aset K3 Tidak Dikenali" };
    }

    return {
      success: true,
      data: result[0],
    };
  } catch (error) {
    console.error("Error querying safety asset by code:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat mencari data aset K3",
    };
  }
}

// Fetch all registered safety assets for quick testing / reference
export async function getAllSafetyAssets(): Promise<ScannedAssetData[]> {
  try {
    await seedInitialSafetyAssetsIfEmpty();

    return await db
      .select({
        id: safetyAssets.id,
        assetCode: safetyAssets.assetCode,
        type: safetyAssets.type,
        expiryDate: safetyAssets.expiryDate,
        status: safetyAssets.status,
        createdAt: safetyAssets.createdAt,
        roomId: rooms.id,
        roomName: rooms.name,
        roomFloor: rooms.floor,
        roomCategory: rooms.category,
        buildingId: buildings.id,
        buildingName: buildings.name,
      })
      .from(safetyAssets)
      .innerJoin(rooms, eq(safetyAssets.roomId, rooms.id))
      .innerJoin(buildings, eq(rooms.buildingId, buildings.id));
  } catch (error) {
    console.error("Error fetching all safety assets:", error);
    return [];
  }
}

// Record verification completion
export async function verifySafetyAsset(assetId: number, status: string = "active") {
  try {
    await db
      .update(safetyAssets)
      .set({ status: status as "active" | "expired" | "damaged" })
      .where(eq(safetyAssets.id, assetId));

    revalidatePath("/scan");
    return {
      success: true,
      message: "Verifikasi aset K3 berhasil dicatat",
    };
  } catch (error) {
    console.error("Error verifying safety asset:", error);
    return {
      success: false,
      error: "Gagal mencatat verifikasi aset",
    };
  }
}

// Create hazard finding directly linked to an asset and room
export async function createHazardFromAsset(params: {
  assetCode: string;
  buildingId: number;
  roomId: number;
  title: string;
  description: string;
  riskLevel: "low" | "medium" | "high";
  photoUrl?: string;
}) {
  try {
    const session = await createOrGetAuditSession(params.buildingId);
    if (!session) {
      return { success: false, error: "Gagal menginisiasi sesi audit" };
    }

    const finding = await recordHazardFinding({
      auditId: session.id,
      roomId: params.roomId,
      title: params.title,
      description: `[Aset: ${params.assetCode}] ${params.description}`,
      riskLevel: params.riskLevel,
      photoUrl: params.photoUrl,
    });

    // Also mark the asset as damaged if reporting hazard
    await db
      .update(safetyAssets)
      .set({ status: "damaged" })
      .where(eq(safetyAssets.assetCode, params.assetCode));

    revalidatePath("/scan");
    revalidatePath(`/audit/${session.id}/rooms/${params.roomId}`);

    return {
      success: true,
      auditId: session.id,
      data: finding.data,
    };
  } catch (error) {
    console.error("Error creating hazard from asset:", error);
    return {
      success: false,
      error: "Gagal membuat tiket bahaya aset",
    };
  }
}
