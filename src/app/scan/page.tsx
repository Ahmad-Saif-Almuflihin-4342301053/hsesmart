"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  QrCode,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { QRScannerView } from "@/components/scan/QRScannerView";
import { AssetValidationModal } from "@/components/scan/AssetValidationModal";
import { getAssetByCode, ScannedAssetData } from "@/actions/asset-actions";

const DEMO_ASSET_CODES = [
  { code: "HSE-APAR-001", label: "APAR Aktif", status: "active", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { code: "HSE-APAR-002", label: "APAR Rusak", status: "damaged", color: "text-rose-700 bg-rose-50 border-rose-200" },
  { code: "HSE-P3K-001", label: "P3K Expired", status: "expired", color: "text-rose-700 bg-rose-50 border-rose-200" },
  { code: "HSE-ALARM-001", label: "Fire Alarm", status: "active", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
];

export default function ScanPage() {
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [assetData, setAssetData] = useState<ScannedAssetData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "error") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Handle scanned code
  const handleScanCode = async (code: string) => {
    if (!code || isModalOpen) return;

    setScannedCode(code);
    setIsLoading(true);
    setErrorMessage(null);
    setAssetData(null);
    setIsModalOpen(true);

    try {
      const res = await getAssetByCode(code);
      if (res.success && res.data) {
        setAssetData(res.data);
        setErrorMessage(null);
      } else {
        const errorText = res.error || "Aset K3 Tidak Dikenali";
        setErrorMessage(errorText);
        setAssetData(null);
        showToast(errorText, "error");
      }
    } catch {
      const fallbackErr = "Terjadi kesalahan saat memeriksa kode aset.";
      setErrorMessage(fallbackErr);
      showToast(fallbackErr, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setScannedCode(null);
    setAssetData(null);
    setErrorMessage(null);
  };

  const handleVerified = () => {
    showToast("Aset berhasil diverifikasi dan tersimpan!", "success");
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-200 ${
            toastMessage.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-rose-600 text-white"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </Link>
        <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full flex items-center gap-1">
          <QrCode className="w-3.5 h-3.5" />
          <span>Scanner K3</span>
        </span>
      </div>

      {/* Title & Description Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white rounded-2xl p-4 shadow-sm space-y-1">
        <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
          <span>Pemindai QR Aset K3</span>
        </h1>
        <p className="text-xs text-slate-300 leading-relaxed">
          Pindai stiker QR Code pada APAR, P3K, Alarm, atau Hydran untuk memvalidasi kelayakan fisik & masa berlaku di lapangan.
        </p>
      </div>

      {/* Main Responsive Camera Viewfinder */}
      <div className="pt-1">
        <QRScannerView onScan={handleScanCode} isPaused={isModalOpen} />
      </div>

      {/* Quick Testing Helper */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Pintasan Uji Cepat Aset (Demo)</span>
          </div>
          <span className="text-[10px] text-slate-400">Klik untuk tes</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ASSET_CODES.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => handleScanCode(item.code)}
              className={`p-2 rounded-xl border text-left flex flex-col justify-between transition hover:shadow-xs active:scale-95 ${item.color}`}
            >
              <span className="font-mono text-xs font-bold">{item.code}</span>
              <span className="text-[10px] font-medium opacity-80 mt-0.5">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Instructions Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs text-slate-600">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Info className="w-4 h-4 text-sky-600" />
          <span>Petunjuk Pemindaian</span>
        </div>
        <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-500">
          <li>Pastikan stiker QR Code aset K3 berada di tengah bingkai bidik kamera.</li>
          <li>Gunakan tombol toggle kamera untuk beralih antara kamera depan atau belakang smartphone.</li>
          <li>Jika QR terdeteksi rusak atau kedaluwarsa, modal akan langsung memberi peringatan merah dan opsi buat tiket bahaya.</li>
        </ul>
      </div>

      {/* Asset Validation Modal */}
      <AssetValidationModal
        isOpen={isModalOpen}
        isLoading={isLoading}
        asset={assetData}
        error={errorMessage}
        scannedCode={scannedCode}
        onClose={handleCloseModal}
        onVerified={handleVerified}
      />
    </div>
  );
}
