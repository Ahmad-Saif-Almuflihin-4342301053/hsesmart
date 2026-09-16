"use client";

import React, { useState } from "react";
import { Check, X, AlertTriangle, MessageSquare, Loader2 } from "lucide-react";
import { saveAuditItemCheck } from "@/actions/audit-actions";

interface ChecklistItemCardProps {
  auditId: number;
  roomId: number;
  criterionId: string;
  label: string;
  description: string;
  initialStatus?: boolean | null; // true = Sesuai, false = Tidak Sesuai, null = Belum dicek
  initialNotes?: string | null;
  onStatusChange?: (isCompliant: boolean) => void;
}

export function ChecklistItemCard({
  auditId,
  roomId,
  criterionId,
  label,
  description,
  initialStatus = null,
  initialNotes = "",
  onStatusChange,
}: ChecklistItemCardProps) {
  const [status, setStatus] = useState<boolean | null>(initialStatus);
  const [notes, setNotes] = useState<string>(initialNotes || "");
  const [showNotes, setShowNotes] = useState<boolean>(initialStatus === false || Boolean(initialNotes));
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = async (compliant: boolean) => {
    // If clicking same active state, don't re-trigger unless updating
    setStatus(compliant);
    if (!compliant) {
      setShowNotes(true);
    }

    try {
      setIsSaving(true);
      await saveAuditItemCheck({
        auditId,
        roomId,
        criteriaLabel: label,
        isCompliant: compliant,
        notes: !compliant ? notes : undefined,
      });
      if (onStatusChange) onStatusChange(compliant);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotesBlur = async () => {
    if (status !== null) {
      try {
        setIsSaving(true);
        await saveAuditItemCheck({
          auditId,
          roomId,
          criteriaLabel: label,
          isCompliant: status,
          notes: notes.trim() || undefined,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div
      className={`p-4 rounded-2xl border transition-all duration-200 ${
        status === true
          ? "bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-500/20 shadow-xs"
          : status === false
          ? "bg-rose-50/40 border-rose-300 ring-1 ring-rose-500/20 shadow-xs"
          : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
      }`}
    >
      {/* Title & Description */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h4 className="text-sm font-bold text-slate-900 leading-snug">{label}</h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
        </div>
        {isSaving && (
          <div className="shrink-0 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        )}
      </div>

      {/* Thumb-friendly Big Action Buttons (min 44-50px height) */}
      <div className="grid grid-cols-2 gap-2.5 mt-4">
        {/* Tombol Sesuai (Hijau) */}
        <button
          type="button"
          onClick={() => handleToggle(true)}
          className={`h-12 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            status === true
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 ring-2 ring-emerald-600"
              : "bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 border border-slate-200"
          }`}
        >
          <Check className="w-5 h-5 stroke-[2.5]" />
          <span>Sesuai</span>
        </button>

        {/* Tombol Tidak Sesuai (Merah/Amber) */}
        <button
          type="button"
          onClick={() => handleToggle(false)}
          className={`h-12 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            status === false
              ? "bg-rose-600 text-white shadow-md shadow-rose-600/20 ring-2 ring-rose-600"
              : "bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-800 border border-slate-200"
          }`}
        >
          <X className="w-5 h-5 stroke-[2.5]" />
          <span>Tidak Sesuai</span>
        </button>
      </div>

      {/* Catatan Ketidaksesuaian */}
      {showNotes && (
        <div className="mt-3 pt-3 border-t border-slate-200/80 animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
            <span>Catatan Ketidaksesuaian (Wajib jika tidak sesuai)</span>
          </div>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Tuliskan temuan kekurangan atau detail ketidaksesuaian di sini..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition resize-none"
          />
        </div>
      )}
    </div>
  );
}
