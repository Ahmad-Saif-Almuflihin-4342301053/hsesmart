import React from "react";
import { getBuildingsWithRooms } from "@/actions/audit-actions";
import { LocationSelector } from "@/components/audit/LocationSelector";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const buildings = await getBuildingsWithRooms();

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Mulai Audit K3</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Pilih lokasi inspeksi lapangan untuk memuat lembar checklist K3
        </p>
      </div>

      <LocationSelector buildings={buildings} />
    </div>
  );
}
