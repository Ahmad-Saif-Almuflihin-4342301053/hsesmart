"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  DoorOpen,
  ChevronRight,
  MapPin,
  Layers,
  CheckCircle2,
  Loader2,
  ChevronDown,
} from "lucide-react";
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
    buildings.length > 0 ? Number(buildings[0].id) : null
  );
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [loadingRoomId, setLoadingRoomId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedBuilding = buildings.find((b) => Number(b.id) === Number(selectedBuildingId));
  const availableRooms = selectedBuilding?.rooms || [];

  // Langsung buka audit ruangan saat ruangan di-klik
  const handleDirectOpenRoom = async (roomId: number) => {
    if (!selectedBuildingId) return;

    try {
      setSelectedRoomId(roomId);
      setLoadingRoomId(roomId);
      setIsSubmitting(true);
      const audit = await createOrGetAuditSession(Number(selectedBuildingId), "Auditor K3 Lapangan");
      router.push(`/audit/${audit.id}/rooms/${roomId}`);
    } catch (error) {
      console.error("Gagal memulai audit:", error);
      alert("Terjadi kesalahan saat memulai sesi audit. Silakan coba lagi.");
      setIsSubmitting(false);
      setLoadingRoomId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Info Banner */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 flex items-start gap-2.5">
        <MapPin className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-xs font-bold text-sky-900">Tentukan Lokasi Inspeksi K3</h3>
          <p className="text-[11px] text-sky-700 mt-0.5">
            Pilih gedung kampus di bawah, lalu klik ruangan yang akan diaudit untuk membuka lembar checklist.
          </p>
        </div>
      </div>

      {/* Step 1: Dropdown & Selector Gedung Kampus */}
      <div className="space-y-2">
        <label
          htmlFor="building-select"
          className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
        >
          <Building2 className="w-4 h-4 text-sky-600" />
          Pilih Gedung Kampus
        </label>

        {/* Native Select Dropdown yang responsif & ramah ponsel */}
        <div className="relative">
          <select
            id="building-select"
            value={selectedBuildingId ?? ""}
            onChange={(e) => {
              const val = Number(e.target.value);
              setSelectedBuildingId(val);
              setSelectedRoomId(null);
            }}
            className="w-full appearance-none bg-white border-2 border-slate-200 focus:border-sky-500 rounded-xl p-3.5 pr-10 text-sm font-semibold text-slate-800 outline-none transition cursor-pointer shadow-xs"
          >
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.totalFloors} Lantai)
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>

        {/* Quick Selection Cards (Alternatif Tab Visual) */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {buildings.map((b) => {
            const isSelected = Number(selectedBuildingId) === Number(b.id);
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setSelectedBuildingId(Number(b.id));
                  setSelectedRoomId(null);
                }}
                className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-sky-500 text-white border-sky-600 font-bold shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="line-clamp-2 leading-snug">{b.name}</span>
                <span className={`text-[10px] mt-1.5 ${isSelected ? "text-sky-100" : "text-slate-400"}`}>
                  {b.rooms.length} Ruangan
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Daftar Ruangan Target */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <DoorOpen className="w-4 h-4 text-sky-600" />
            Pilih Ruangan di {selectedBuilding?.name || "Gedung Terpilih"}
          </label>
          <span className="text-[11px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">
            {availableRooms.length} Ruangan
          </span>
        </div>

        <p className="text-[11px] text-slate-500 -mt-1">
          Klik langsung pada ruangan di bawah untuk mulai mengisi checklist audit:
        </p>

        {availableRooms.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
            Belum ada ruangan terdaftar pada gedung ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {availableRooms.map((room) => {
              const isSelected = Number(selectedRoomId) === Number(room.id);
              const isLoadingThis = loadingRoomId === Number(room.id);
              const catInfo = CATEGORY_LABELS[room.category] || {
                label: room.category,
                color: "bg-slate-100 text-slate-700 border-slate-200",
              };

              return (
                <button
                  key={room.id}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleDirectOpenRoom(Number(room.id))}
                  className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between cursor-pointer active:scale-[0.98] ${
                    isLoadingThis
                      ? "bg-sky-100 border-sky-500 ring-2 ring-sky-400"
                      : isSelected
                      ? "bg-sky-50 border-sky-500 ring-2 ring-sky-400 shadow-sm"
                      : "bg-white border-slate-200 hover:border-sky-400 hover:bg-sky-50/40 shadow-xs"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isLoadingThis || isSelected
                          ? "bg-sky-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {isLoadingThis ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <DoorOpen className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">{room.name}</h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          Lantai {room.floor}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${catInfo.color}`}
                        >
                          {catInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-sky-600 shrink-0">
                    {isLoadingThis ? (
                      <span className="text-sky-600 animate-pulse">Membuka...</span>
                    ) : (
                      <>
                        <span>Mulai Audit</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
