"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Building2,
  DoorOpen,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PlusCircle,
  ShieldAlert,
  Clock,
  Sparkles,
} from "lucide-react";
import { ChecklistItemCard } from "./ChecklistItemCard";
import { QuickHazardDrawer } from "./QuickHazardDrawer";
import { AuditCriterion } from "@/lib/constants/audit-templates";

interface ChecklistContainerProps {
  audit: {
    id: number;
    buildingId: number;
    auditorName: string;
    status: string;
  };
  building: {
    id: number;
    name: string;
  };
  room: {
    id: number;
    buildingId: number;
    name: string;
    floor: number;
    category: string;
  };
  criteria: AuditCriterion[];
  savedItems: {
    id: number;
    auditId: number;
    roomId: number;
    criteriaLabel: string;
    isCompliant: boolean;
    notes: string | null;
  }[];
  findings: {
    id: number;
    auditId: number;
    roomId: number;
    title: string;
    description: string;
    riskLevel: string;
    photoUrl: string | null;
    status: string;
  }[];
}

export function ChecklistContainer({
  audit,
  building,
  room,
  criteria,
  savedItems,
  findings: initialFindings,
}: ChecklistContainerProps) {
  const router = useRouter();
  const [isHazardDrawerOpen, setIsHazardDrawerOpen] = useState(false);
  const [findings, setFindings] = useState(initialFindings);

  // Map saved statuses
  const savedMap = new Map(savedItems.map((item) => [item.criteriaLabel, item]));

  const totalCriteria = criteria.length;
  const compliantCount = savedItems.filter((i) => i.isCompliant).length;
  const nonCompliantCount = savedItems.filter((i) => !i.isCompliant).length;
  const checkedCount = savedItems.length;
  const progressPercent = Math.round((checkedCount / totalCriteria) * 100);

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/audit"
          className="flex items-center gap-1 text-xs font-semibold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200 hover:bg-sky-100 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ganti Ruangan</span>
        </Link>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          Sesi #{audit.id}
        </span>
      </div>

      {/* Location Breadcrumb Card */}
      <div className="bg-gradient-to-br from-slate-900 to-sky-950 text-white p-4 rounded-2xl shadow-md space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-sky-300 font-medium">
          <Building2 className="w-4 h-4" />
          <span>{building.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-emerald-400" />
            {room.name}
          </h2>
          <span className="text-xs bg-sky-500/30 text-sky-200 px-2.5 py-0.5 rounded-full font-medium border border-sky-400/30">
            Lt. {room.floor} • {room.category.toUpperCase()}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span>Progress Pengecekan</span>
            <span className="font-bold text-emerald-400">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span className="flex items-center gap-1 text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {compliantCount} Sesuai
            </span>
            <span className="flex items-center gap-1 text-rose-300">
              <XCircle className="w-3.5 h-3.5" />
              {nonCompliantCount} Tidak Sesuai
            </span>
            <span>
              {checkedCount}/{totalCriteria} Dicek
            </span>
          </div>
        </div>
      </div>

      {/* Quick Hazard FAB Trigger */}
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-rose-950">Ada Bahaya / Hazard K3?</h4>
            <p className="text-[11px] text-rose-700">Catat temuan langsung beserta foto bukti</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsHazardDrawerOpen(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow transition active:scale-95 flex items-center gap-1"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Lapor</span>
        </button>
      </div>

      {/* Reported Findings in this Room */}
      {findings.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Temuan Bahaya di Ruangan Ini ({findings.length})
          </h3>
          <div className="space-y-2">
            {findings.map((f) => (
              <div
                key={f.id}
                className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-start gap-3"
              >
                {f.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={f.photoUrl}
                    alt={f.title}
                    className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h5 className="text-xs font-bold text-slate-900 truncate">{f.title}</h5>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        f.riskLevel === "high"
                          ? "bg-rose-100 text-rose-700"
                          : f.riskLevel === "medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {f.riskLevel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checklist K3 Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            Checklist Kepatuhan K3 ({criteria.length} Butir)
          </h3>
        </div>

        <div className="space-y-3">
          {criteria.map((criterion) => {
            const saved = savedMap.get(criterion.label);
            return (
              <ChecklistItemCard
                key={criterion.id}
                auditId={audit.id}
                roomId={room.id}
                criterionId={criterion.id}
                label={criterion.label}
                description={criterion.description}
                initialStatus={saved ? saved.isCompliant : null}
                initialNotes={saved ? saved.notes : ""}
                onStatusChange={() => {
                  // status updated
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Quick Hazard Drawer Modal */}
      <QuickHazardDrawer
        isOpen={isHazardDrawerOpen}
        onClose={() => setIsHazardDrawerOpen(false)}
        auditId={audit.id}
        roomId={room.id}
        onFindingAdded={handleRefresh}
      />
    </div>
  );
}
