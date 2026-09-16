"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, DoorOpen, ChevronRight, MapPin, Loader2 } from "lucide-react";

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

export default function AuditPage() {
  const router = useRouter();

  // State
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch data
  useEffect(() => {
    fetch("/api/locations")
      .then((res) => res.json())
      .then((data: Building[]) => {
        if (Array.isArray(data)) {
          setBuildings(data);
          if (data.length > 0) {
            setSelectedBuildingId(String(data[0].id));
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching locations:", err);
        setLoading(false);
      });
  }, []);

  // Filter ruangan sesuai gedung terpilih
  const selectedBuilding = buildings.find(
    (b) => String(b.id) === String(selectedBuildingId)
  );
  const availableRooms = selectedBuilding?.rooms || [];

  const handleStartAudit = () => {
    if (!selectedRoomId) return;
    router.push(`/audit/form?roomId=${selectedRoomId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
        <p className="text-sm font-medium">Memuat data lokasi kampus...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Mulai Audit K3</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Pilih lokasi inspeksi lapangan untuk memuat lembar checklist K3
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 flex items-start gap-2.5">
        <MapPin className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-xs font-bold text-sky-900">Tentukan Lokasi Inspeksi</h3>
          <p className="text-[11px] text-sky-700 mt-0.5">
            Pilih gedung kampus dan ruangan target di bawah ini.
          </p>
        </div>
      </div>

      <div className="space-y-5 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        {/* Dropdown 1: Pilih Gedung */}
        <div className="space-y-1.5">
          <label
            htmlFor="select-building"
            className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
          >
            <Building2 className="w-4 h-4 text-sky-600" />
            Pilih Gedung Kampus
          </label>
          <select
            id="select-building"
            value={selectedBuildingId}
            onChange={(e) => {
              setSelectedBuildingId(e.target.value);
              setSelectedRoomId(""); // reset selectedRoomId saat gedung berganti
            }}
            className="w-full bg-white border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-xl p-3 text-sm font-medium text-slate-800 outline-none transition cursor-pointer"
          >
            {buildings.length === 0 ? (
              <option value="">Tidak ada gedung terdaftar</option>
            ) : (
              buildings.map((b) => (
                <option key={b.id} value={String(b.id)}>
                  {b.name} ({b.totalFloors} Lantai)
                </option>
              ))
            )}
          </select>
        </div>

        {/* Dropdown 2: Pilih Ruangan */}
        <div className="space-y-1.5">
          <label
            htmlFor="select-room"
            className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
          >
            <DoorOpen className="w-4 h-4 text-sky-600" />
            Pilih Ruangan
          </label>
          <select
            id="select-room"
            value={selectedRoomId}
            onChange={(e) => {
              setSelectedRoomId(e.target.value);
            }}
            className="w-full bg-white border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-xl p-3 text-sm font-medium text-slate-800 outline-none transition cursor-pointer"
          >
            <option value="">-- Pilih Ruangan Target --</option>
            {availableRooms.map((room) => (
              <option key={room.id} value={String(room.id)}>
                {room.name} (Lantai {room.floor} - {room.category.toUpperCase()})
              </option>
            ))}
          </select>
          {availableRooms.length === 0 && selectedBuildingId && (
            <p className="text-[11px] text-amber-600 mt-1">
              Tidak ada ruangan terdaftar di gedung ini.
            </p>
          )}
        </div>

        {/* Tombol Aksi */}
        <div className="pt-2">
          <button
            type="button"
            disabled={!selectedRoomId}
            onClick={handleStartAudit}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-[0.98] ${
              selectedRoomId
                ? "bg-sky-600 hover:bg-sky-700 text-white cursor-pointer"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <span>Buka Formulir Checklist</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
