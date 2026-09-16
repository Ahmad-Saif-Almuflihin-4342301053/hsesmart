"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, DoorOpen, ChevronRight, MapPin, Layers, CheckCircle2, ShieldAlert } from "lucide-react";
import { createOrGetAuditSession } from "@/actions/audit-actions";

interface Room {
  id: number;
  buildingId: number;
  name: string;
  floor: number;
  category: string;
}

interface Building {
  id: number;
  name: string;
  totalFloors: number;
  rooms: Room[];
}

interface LocationSelectorProps {
  buildings: Building[];
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  lab: { label: "Laboratorium", color: "bg-purple-100 text-purple-700 border-purple-200" },
  workshop: { label: "Workshop / Bengkel", color: "bg-amber-100 text-amber-700 border-amber-200" },
  classroom: { label: "Ruang Kelas", color: "bg-blue-100 text-blue-700 border-blue-200" },
  office: { label: "Kantor", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  canteen: { label: "Kantin", color: "bg-orange-100 text-orange-700 border-orange-200" },
};

export function LocationSelector({ buildings }: LocationSelectorProps) {
  const router = useRouter();
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(
    buildings.length > 0 ? buildings[0].id : null
  );
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId);
  const availableRooms = selectedBuilding?.rooms || [];

  const handleStartAudit = async () => {
    if (!selectedBuildingId || !selectedRoomId) return;

    try {
      setIsSubmitting(true);
      const audit = await createOrGetAuditSession(selectedBuildingId, "Auditor K3 Lapangan");
      router.push(`/audit/${audit.id}/rooms/${selectedRoomId}`);
    } catch (error) {
      console.error("Gagal memulai audit:", error);
      alert("Terjadi kesalahan saat memulai sesi audit.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
        <div className="flex items-center gap-2 text-sky-800 font-semibold text-sm">
          <MapPin className="w-4 h-4 text-sky-600" />
          <span>Langkah 1: Tentukan Lokasi Inspeksi</span>
        </div>
        <p className="text-xs text-sky-600 mt-1">
          Pilih gedung kampus dan ruangan spesifik yang akan diaudit hari ini.
        </p>
      </div>

      {/* Step 1: Pilih Gedung */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-sky-600" />
          Pilih Gedung Kampus
        </label>
        <div className="grid grid-cols-1 gap-2.5">
          {buildings.map((b) => {
            const isSelected = selectedBuildingId === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setSelectedBuildingId(b.id);
                  setSelectedRoomId(null);
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between ${
                  isSelected
                    ? "bg-sky-50/80 border-sky-500 ring-2 ring-sky-500/20 shadow-sm"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isSelected ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{b.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        {b.totalFloors} Lantai
                      </span>
                      <span>•</span>
                      <span>{b.rooms.length} Ruangan terdaftar</span>
                    </p>
                  </div>
                </div>
                {isSelected && <CheckCircle2 className="w-5 h-5 text-sky-600" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Pilih Ruangan */}
      {selectedBuilding && (
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <DoorOpen className="w-4 h-4 text-sky-600" />
            Pilih Ruangan Target ({availableRooms.length})
          </label>
          <p className="text-[11px] text-slate-500 -mt-1.5">
            Pilih salah satu ruangan di bawah ini untuk memulai checklist K3.
          </p>

          {availableRooms.length === 0 ? (
            <div className="p-4 text-center bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
              Belum ada ruangan yang didaftarkan pada gedung ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {availableRooms.map((room) => {
                const isSelected = selectedRoomId === room.id;
                const catInfo = CATEGORY_LABELS[room.category] || {
                  label: room.category,
                  color: "bg-slate-100 text-slate-700 border-slate-200",
                };

                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => {
                      setSelectedRoomId(room.id);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-sky-50 border-sky-500 ring-2 ring-sky-500/30 shadow-sm"
                        : "bg-white border-slate-200 hover:border-sky-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <DoorOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">{room.name}</h4>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            Lantai {room.floor}
                          </span>
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded border ${catInfo.color}`}
                          >
                            {catInfo.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isSelected ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600 bg-sky-100/70 px-2.5 py-1 rounded-full shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Terpilih</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
                        <span>Pilih</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CTA Button */}
      <div className="pt-4 pb-6">
        <button
          type="button"
          disabled={!selectedBuildingId || !selectedRoomId || isSubmitting}
          onClick={handleStartAudit}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.98] ${
            selectedBuildingId && selectedRoomId && !isSubmitting
              ? "bg-sky-600 hover:bg-sky-700 text-white"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? (
            <span>Membuka Sesi Audit...</span>
          ) : !selectedRoomId ? (
            <span>Pilih Ruangan Terlebih Dahulu</span>
          ) : (
            <>
              <span>Buka Formulir Checklist</span>
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
