"use client";

import React, { useState } from "react";
import { X, AlertTriangle, ShieldAlert, Send, Check } from "lucide-react";
import { CameraCaptureInput } from "./CameraCaptureInput";
import { recordHazardFinding } from "@/actions/audit-actions";

interface QuickHazardDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  auditId: number;
  roomId: number;
  onFindingAdded?: () => void;
}

type RiskLevel = "low" | "medium" | "high";

const RISK_LEVELS: { id: RiskLevel; label: string; desc: string; color: string; activeColor: string }[] = [
  {
    id: "low",
    label: "Rendah (Low)",
    desc: "Minor, tidak mendesak",
    color: "border-slate-200 bg-white text-slate-700",
    activeColor: "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20",
  },
  {
    id: "medium",
    label: "Sedang (Medium)",
    desc: "Perlu perbaikan segera",
    color: "border-slate-200 bg-white text-slate-700",
    activeColor: "border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/20",
  },
  {
    id: "high",
    label: "Tinggi (High)",
    desc: "Bahaya kritis langsung",
    color: "border-slate-200 bg-white text-slate-700",
    activeColor: "border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20",
  },
];

export function QuickHazardDrawer({
  isOpen,
  onClose,
  auditId,
  roomId,
  onFindingAdded,
}: QuickHazardDrawerProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("medium");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Harap isi judul dan deskripsi temuan bahaya.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await recordHazardFinding({
        auditId,
        roomId,
        title: title.trim(),
        description: description.trim(),
        riskLevel,
        photoUrl: photoUrl ?? undefined,
      });

      if (res.success) {
        // Reset form
        setTitle("");
        setDescription("");
        setRiskLevel("medium");
        setPhotoUrl(null);
        if (onFindingAdded) onFindingAdded();
        onClose();
      } else {
        alert(res.error || "Gagal menyimpan temuan.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem saat menyimpan temuan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-2 text-rose-600">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Laporkan Temuan Bahaya</h3>
              <p className="text-[11px] text-slate-500">Catat hazard / ketidaksesuaian K3 segera</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Judul Temuan */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Judul Temuan Bahaya *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Stopkontak pecah & kabel terbuka"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-sm outline-none transition"
            />
          </div>

          {/* Level Risiko */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tingkat Risiko (Risk Level) *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {RISK_LEVELS.map((level) => {
                const isSelected = riskLevel === level.id;
                return (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => setRiskLevel(level.id)}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                      isSelected ? level.activeColor : level.color
                    }`}
                  >
                    <span className="text-xs font-bold">{level.label.split(" ")[0]}</span>
                    <span className="text-[10px] opacity-80 mt-0.5">{level.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Deskripsi */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Deskripsi & Dampak Potensial *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Jelaskan kondisi bahaya di lapangan dan potensi dampak kecelakaan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-sm outline-none transition resize-none"
            />
          </div>

          {/* Input Foto Kamera */}
          <CameraCaptureInput onPhotoSelected={setPhotoUrl} />

          {/* Submit Action */}
          <div className="pt-2 sticky bottom-0 bg-white">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Menyimpan Laporan...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Simpan & Laporkan Temuan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
