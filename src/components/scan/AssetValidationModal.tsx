"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Flame,
  BriefcaseMedical,
  BellRing,
  Droplets,
  Milestone,
  Building2,
  Calendar,
  AlertOctagon,
  ShieldAlert,
  Send,
  ChevronRight,
} from "lucide-react";
import { ScannedAssetData, verifySafetyAsset, createHazardFromAsset } from "@/actions/asset-actions";
import { CameraCaptureInput } from "@/components/audit/CameraCaptureInput";
import Link from "next/link";

interface AssetValidationModalProps {
  isOpen: boolean;
  isLoading: boolean;
  asset: ScannedAssetData | null;
  error: string | null;
  scannedCode: string | null;
  onClose: () => void;
  onVerified: () => void;
}

const ASSET_TYPE_LABELS: Record<
  ScannedAssetData["type"],
  { label: string; icon: React.ReactNode; color: string }
> = {
  apar: {
    label: "APAR (Pemadam Api Ringan)",
    icon: <Flame className="w-5 h-5 text-orange-500" />,
    color: "bg-orange-50 text-orange-700 border-orange-200",
  },
  p3k: {
    label: "Kotak P3K",
    icon: <BriefcaseMedical className="w-5 h-5 text-emerald-600" />,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  fire_alarm: {
    label: "Fire Alarm / Detektor",
    icon: <BellRing className="w-5 h-5 text-rose-500" />,
    color: "bg-rose-50 text-rose-700 border-rose-200",
  },
  hydran: {
    label: "Hydran Gedung",
    icon: <Droplets className="w-5 h-5 text-sky-600" />,
    color: "bg-sky-50 text-sky-700 border-sky-200",
  },
  evacuation_sign: {
    label: "Rambu Jalur Evakuasi",
    icon: <Milestone className="w-5 h-5 text-teal-600" />,
    color: "bg-teal-50 text-teal-700 border-teal-200",
  },
};

export function AssetValidationModal({
  isOpen,
  isLoading,
  asset,
  error,
  scannedCode,
  onClose,
  onVerified,
}: AssetValidationModalProps) {
  const [showHazardForm, setShowHazardForm] = useState(false);
  const [hazardTitle, setHazardTitle] = useState("");
  const [hazardDescription, setHazardDescription] = useState("");
  const [hazardRiskLevel, setHazardRiskLevel] = useState<"low" | "medium" | "high">("high");
  const [hazardPhotoUrl, setHazardPhotoUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationSuccessMessage, setVerificationSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Format expiry date
  const formatExpiry = (dateVal: Date | null) => {
    if (!dateVal) return "Tidak Ada Batas Kedaluwarsa";
    const d = new Date(dateVal);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const isExpired = asset?.expiryDate ? new Date(asset.expiryDate) < new Date() : false;
  const isWarningStatus = asset?.status === "expired" || asset?.status === "damaged" || isExpired;

  // Action: Verifikasi Selesai
  const handleVerifySuccess = async () => {
    if (!asset) return;
    try {
      setIsSubmitting(true);
      const res = await verifySafetyAsset(asset.id, "active");
      if (res.success) {
        setVerificationSuccessMessage(`Aset ${asset.assetCode} berhasil diverifikasi!`);
        setTimeout(() => {
          setVerificationSuccessMessage(null);
          onVerified();
          onClose();
        }, 1200);
      } else {
        alert(res.error || "Gagal memverifikasi aset.");
      }
    } catch {
      alert("Terjadi kesalahan saat memproses verifikasi aset.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Switch to Hazard Form
  const handleOpenHazardForm = () => {
    if (!asset) return;
    const defaultTitle =
      asset.status === "expired" || isExpired
        ? `Aset Kedaluwarsa: ${ASSET_TYPE_LABELS[asset.type]?.label || asset.type} (${asset.assetCode})`
        : `Kerusakan Fisik Aset: ${ASSET_TYPE_LABELS[asset.type]?.label || asset.type} (${asset.assetCode})`;
    setHazardTitle(defaultTitle);
    setHazardDescription(
      `Ditemukan ketidaksesuaian pada aset ${asset.assetCode} di ${asset.roomName} (${asset.buildingName}). Status saat ini: ${asset.status}.`
    );
    setHazardRiskLevel(isWarningStatus ? "high" : "medium");
    setShowHazardForm(true);
  };

  // Submit Hazard Finding
  const handleSubmitHazard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;
    if (!hazardTitle.trim() || !hazardDescription.trim()) {
      alert("Judul dan deskripsi temuan bahaya wajib diisi.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createHazardFromAsset({
        assetCode: asset.assetCode,
        buildingId: asset.buildingId,
        roomId: asset.roomId,
        title: hazardTitle.trim(),
        description: hazardDescription.trim(),
        riskLevel: hazardRiskLevel,
        photoUrl: hazardPhotoUrl ?? undefined,
      });

      if (res.success) {
        alert(`Tiket Bahaya untuk aset ${asset.assetCode} berhasil dibuat!`);
        setShowHazardForm(false);
        onVerified();
        onClose();
      } else {
        alert(res.error || "Gagal menyimpan tiket bahaya.");
      }
    } catch {
      alert("Terjadi kesalahan sistem saat menyimpan tiket bahaya.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Modal Top Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900">
              {showHazardForm ? "Buat Tiket Bahaya Aset" : "Validasi Aset K3"}
            </span>
            {scannedCode && (
              <span className="font-mono text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                {scannedCode}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* State 1: Loading */}
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-10 h-10 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-600 font-medium">
                Mencari data aset di database...
              </p>
            </div>
          )}

          {/* State 2: Error / Asset Not Recognized */}
          {!isLoading && error && (
            <div className="py-6 space-y-4">
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                  <AlertOctagon className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-base text-rose-900">Aset K3 Tidak Dikenali</h4>
                <p className="text-xs text-rose-700 leading-relaxed max-w-xs">
                  Kode QR <strong className="font-mono font-bold underline">{scannedCode || "—"}</strong> tidak terdaftar dalam database aset keselamatan kerja.
                </p>
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <p className="font-semibold text-slate-700">Kemungkinan penyebab:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Format stiker QR tidak sesuai standar K3 HSE Smart.</li>
                  <li>Aset belum didaftarkan ke inventaris ruangan.</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow transition active:scale-[0.98]"
              >
                Tutup & Scan Kode Lain
              </button>
            </div>
          )}

          {/* State 3: Asset Found & Validated */}
          {!isLoading && asset && !showHazardForm && (
            <div className="space-y-4">
              {/* Verification Success Overlay Toast */}
              {verificationSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{verificationSuccessMessage}</span>
                </div>
              )}

              {/* Warning Alert Banner for Expired / Damaged */}
              {isWarningStatus && (
                <div className="bg-rose-50 border-2 border-rose-500 text-rose-900 p-3.5 rounded-xl flex items-start gap-3 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                      PERINGATAN: KONDISI TIDAK AMAN!
                    </h5>
                    <p className="text-[11px] text-rose-800 leading-snug">
                      {asset.status === "damaged"
                        ? "Aset terdeteksi dalam status RUSAK dan berisiko gagal fungsi saat darurat."
                        : "Masa berlaku aset telah HABIS / KEDALUWARSA. Wajib dilakukan penggantian atau pengisian ulang segera."}
                    </p>
                  </div>
                </div>
              )}

              {/* Summary Card (Tipe, Masa Berlaku, Status) */}
              <div
                className={`rounded-2xl border p-4 space-y-3.5 transition ${
                  isWarningStatus
                    ? "border-rose-300 bg-rose-50/40"
                    : "border-slate-200 bg-white"
                }`}
              >
                {/* Tipe Aset */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-100">
                      {ASSET_TYPE_LABELS[asset.type]?.icon}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Tipe Aset K3
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        {ASSET_TYPE_LABELS[asset.type]?.label || asset.type}
                      </h4>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                    {asset.assetCode}
                  </span>
                </div>

                {/* Grid: Masa Berlaku & Status */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Masa Berlaku */}
                  <div
                    className={`p-3 rounded-xl border ${
                      isExpired
                        ? "bg-rose-100/70 border-rose-300 text-rose-900"
                        : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Masa Berlaku</span>
                    </div>
                    <p className="text-xs font-bold leading-tight">
                      {formatExpiry(asset.expiryDate)}
                    </p>
                    {isExpired && (
                      <span className="inline-block mt-1 text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-rose-600 text-white rounded">
                        Expired
                      </span>
                    )}
                  </div>

                  {/* Status */}
                  <div
                    className={`p-3 rounded-xl border ${
                      isWarningStatus
                        ? "bg-rose-100/70 border-rose-300 text-rose-900"
                        : "bg-emerald-50 border-emerald-200 text-emerald-900"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">
                      {isWarningStatus ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                      <span>Status Aset</span>
                    </div>
                    <p className="text-xs font-bold capitalize">
                      {asset.status === "active"
                        ? "Aktif / Siap Pakai"
                        : asset.status === "expired"
                        ? "Kedaluwarsa"
                        : "Rusak / Cacat"}
                    </p>
                    <span
                      className={`inline-block mt-1 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        isWarningStatus
                          ? "bg-rose-600 text-white"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      {asset.status}
                    </span>
                  </div>
                </div>

                {/* Lokasi Terpasang */}
                <div className="pt-1 flex items-start gap-2 text-xs text-slate-600">
                  <Building2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-slate-900">{asset.buildingName}</span>
                    <span className="text-slate-400 mx-1">•</span>
                    <span className="text-slate-700">{asset.roomName} (Lt. {asset.roomFloor})</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {/* Button 1: Verifikasi Selesai */}
                <button
                  type="button"
                  onClick={handleVerifySuccess}
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verifikasi Selesai (Kondisi Sesuai)</span>
                </button>

                {/* Button 2: Buat Tiket Bahaya */}
                <button
                  type="button"
                  onClick={handleOpenHazardForm}
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition active:scale-[0.98] ${
                    isWarningStatus
                      ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30"
                      : "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Buat Tiket Bahaya</span>
                </button>

                {/* Direct Link to Room Audit if available */}
                <div className="pt-1 text-center">
                  <Link
                    href={`/audit`}
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-sky-700 font-medium"
                  >
                    <span>Buka lembar inspeksi seluruh ruangan</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* State 4: Form Pelaporan Bahaya Terintegrasi */}
          {!isLoading && asset && showHazardForm && (
            <form onSubmit={handleSubmitHazard} className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-rose-900">Pelaporan Tiket Bahaya Aset</h5>
                  <p className="text-[11px] text-rose-700 font-mono">{asset.assetCode} • {asset.roomName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHazardForm(false)}
                  className="text-xs text-rose-800 underline font-medium"
                >
                  Batal
                </button>
              </div>

              {/* Judul Temuan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Judul Temuan Bahaya *
                </label>
                <input
                  type="text"
                  required
                  value={hazardTitle}
                  onChange={(e) => setHazardTitle(e.target.value)}
                  placeholder="Contoh: APAR tekanan turun & segel rusak"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-sm outline-none transition"
                />
              </div>

              {/* Tingkat Risiko */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Tingkat Risiko *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["low", "medium", "high"] as const).map((level) => {
                    const isSelected = hazardRiskLevel === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setHazardRiskLevel(level)}
                        className={`py-2 px-2 rounded-xl border text-center font-bold text-xs capitalize transition ${
                          isSelected
                            ? level === "high"
                              ? "border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20"
                              : level === "medium"
                              ? "border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/20"
                              : "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {level === "low" ? "Rendah" : level === "medium" ? "Sedang" : "Tinggi"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Deskripsi */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Deskripsi Temuan Lapangan *
                </label>
                <textarea
                  required
                  rows={3}
                  value={hazardDescription}
                  onChange={(e) => setHazardDescription(e.target.value)}
                  placeholder="Jelaskan kondisi fisik aset dan potensi bahaya yang ditimbulkan..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-sm outline-none transition resize-none"
                />
              </div>

              {/* Ambil Foto Bukti */}
              <CameraCaptureInput onPhotoSelected={setHazardPhotoUrl} />

              {/* Tombol Submit Bahaya */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Menyimpan Laporan Bahaya...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Kirim Tiket Bahaya Aset</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
