import React from "react";
import { notFound } from "next/navigation";
import { getRoomAuditDetails } from "@/actions/audit-actions";
import { getAuditTemplateByCategory } from "@/lib/constants/audit-templates";
import { ChecklistContainer } from "@/components/audit/ChecklistContainer";

interface RoomAuditPageProps {
  params: Promise<{
    auditId: string;
    roomId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function RoomAuditPage({ params }: RoomAuditPageProps) {
  const resolvedParams = await params;
  const auditIdNum = parseInt(resolvedParams.auditId, 10);
  const roomIdNum = parseInt(resolvedParams.roomId, 10);

  if (isNaN(auditIdNum) || isNaN(roomIdNum)) {
    notFound();
  }

  const details = await getRoomAuditDetails(auditIdNum, roomIdNum);

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
