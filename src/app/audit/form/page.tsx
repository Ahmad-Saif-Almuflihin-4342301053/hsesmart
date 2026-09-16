import React from "react";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { rooms, audits } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getRoomAuditDetails, createOrGetAuditSession } from "@/actions/audit-actions";
import { getAuditTemplateByCategory } from "@/lib/constants/audit-templates";
import { ChecklistContainer } from "@/components/audit/ChecklistContainer";

export const dynamic = "force-dynamic";

interface AuditFormPageProps {
  searchParams: Promise<{
    roomId?: string;
  }>;
}

export default async function AuditFormPage({ searchParams }: AuditFormPageProps) {
  const resolvedParams = await searchParams;
  const roomIdStr = resolvedParams?.roomId;

  if (!roomIdStr) {
    redirect("/audit");
  }

  const roomIdNum = parseInt(roomIdStr, 10);
  if (isNaN(roomIdNum)) {
    notFound();
  }

  // Get room to find buildingId
  const [room] = await db.select().from(rooms).where(eq(rooms.id, roomIdNum)).limit(1);
  if (!room) {
    notFound();
  }

  // Create or get active audit for this building
  const audit = await createOrGetAuditSession(room.buildingId, "Auditor K3 Lapangan");
  const details = await getRoomAuditDetails(audit.id, room.id);

  if (!details || !details.room || !details.audit || !details.building) {
    notFound();
  }

  const criteria = getAuditTemplateByCategory(details.room.category);

  return (
    <ChecklistContainer
      audit={details.audit}
      building={details.building}
      room={details.room}
      criteria={criteria}
      savedItems={details.savedItems}
      findings={details.findings}
    />
  );
}
