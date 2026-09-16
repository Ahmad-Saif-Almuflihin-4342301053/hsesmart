import { NextResponse } from "next/server";
import { getBuildingsWithRooms } from "@/actions/audit-actions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getBuildingsWithRooms();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Failed to fetch locations:", err);
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
  }
}
