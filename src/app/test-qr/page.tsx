"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  QrCode,
  Copy,
  Check,
  Maximize2,
  X,
  ExternalLink,
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  Camera,
} from "lucide-react";

interface AssetQR {
  code: string;
  name: string;
  type: string;
  location: string;
  building: string;
  status: "active" | "expired" | "damaged";
  statusLabel: string;
  expiryDate: string;
  imageSrc: string;
}

const DUMMY_ASSETS: AssetQR[] = [
  {
    code: "HSE-APAR-001",
    name: "APAR Powder 6kg",
    type: "APAR (Alat Pemadam Api Ringan)",
    location: "Lab Kimia Dasar & Analitik",
    building: "Gedung Lab & Bengkel Terpadu",
    status: "active",
    statusLabel: "Aktif / Siap Pakai",
    expiryDate: "2027-12-31",
    imageSrc: "/dummy-qr/HSE-APAR-001.png",
  },
  {
    code: "HSE-APAR-002",
    name: "APAR CO2 5kg",
    type: "APAR (Alat Pemadam Api Ringan)",
    location: "Bengkel Mesin & Fabrikasi Logam",
    building: "Gedung Lab & Bengkel Terpadu",
    status: "expired",
    statusLabel: "Kedaluwarsa (Expired)",
    expiryDate: "2024-01-01",
    imageSrc: "/dummy-qr/HSE-APAR-002.png",
  },
  {
    code: "HSE-P3K-001",
    name: "Kotak P3K Dinding",
    type: "Kotak P3K (Pertolongan Pertama)",
    location: "Ruang Dosen Pengajar Lantai 4",
    building: "Gedung Perkuliahan A (Tower Barat)",
    status: "active",
    statusLabel: "Aktif / Siap Pakai",
    expiryDate: "2026-10-15",
    imageSrc: "/dummy-qr/HSE-P3K-001.png",
  },
  {
    code: "HSE-HYD-001",
    name: "Hydrant Box Lt.1",
    type: "Hydrant (Sistem Pemadam Kebakaran)",
    location: "Koridor Utama Lt.1",
    building: "Gedung Utama (Rektorat & Administrasi)",
    status: "damaged",
    statusLabel: "Rusak / Butuh Servis",
    expiryDate: "2028-05-20",
    imageSrc: "/dummy-qr/HSE-HYD-001.png",
  },
];

export default function TestQRPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<AssetQR | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const getStatusBadge = (status: AssetQR["status"], label: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3" />
            {label}
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-rose-100 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
            <AlertOctagon className="w-3 h-3" />
            {label}
          </span>
        );
      case "damaged":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            {label}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-sky-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </Link>
        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
          4 Kode Aset Dummy
        </span>
      </div>

      {/* Main Title & Instructions */}
      <div>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-sky-100 text-sky-700 rounded-lg">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              Uji Coba QR Scanner Aset K3
            </h1>
            <p className="text-[11px] text-slate-500">
              Payload & gambar QR Code untuk pengujian kamera pemindai
            </p>
          </div>
        </div>

        <div className="mt-3 p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 leading-relaxed">
          <p className="font-semibold flex items-center gap-1 text-sky-800 mb-1">
            💡 Petunjuk Pengujian Scanner:
          </p>
          <p className="text-[11px] text-sky-800/90">
            Buka halaman ini di laptop/monitor, lalu gunakan fitur pemindai kamera (misal di <code className="bg-sky-100 px-1 py-0.5 rounded font-mono font-bold">/scan</code>) dari HP atau perangkat lain untuk memindai kode di bawah.
          </p>
        </div>
      </div>

      {/* Grid of QR Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {DUMMY_ASSETS.map((asset) => (
          <div
            key={asset.code}
            className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            {/* Header info */}
            <div>
              <div className="flex items-start justify-between gap-1 mb-1.5">
                <div className="font-mono font-bold text-xs bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded">
                  {asset.code}
                </div>
                {getStatusBadge(asset.status, asset.status === "active" ? "Aktif" : asset.status === "expired" ? "Expired" : "Rusak")}
              </div>

              <h2 className="font-bold text-xs text-slate-900 line-clamp-1">
                {asset.name}
              </h2>
              <p className="text-[11px] text-slate-500 line-clamp-1">
                {asset.location}
              </p>
            </div>

            {/* QR Code Image Display */}
            <div className="my-2 flex flex-col items-center justify-center p-2 bg-slate-50 rounded-lg border border-slate-100 relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.imageSrc}
                alt={`QR Code ${asset.code}`}
                className="w-36 h-36 object-contain rounded bg-white p-1.5 shadow-xs transition group-hover:scale-105"
              />
              <button
                type="button"
                onClick={() => setSelectedAsset(asset)}
                className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-sky-700 transition"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Klik untuk perbesar</span>
              </button>
            </div>

            {/* Footer details */}
            <div className="space-y-1.5 text-[11px] border-t border-slate-100 pt-2 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Kadaluwarsa:</span>
                <span className="font-medium text-slate-800">
                  {asset.expiryDate}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleCopy(asset.code)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-[11px] transition"
                >
                  {copiedCode === asset.code ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Salin Kode</span>
                    </>
                  )}
                </button>
                <a
                  href={asset.imageSrc}
                  target="_blank"
                  rel="noreferrer"
                  download={`${asset.code}.png`}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                  title="Unduh file PNG"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick link to scanner */}
      <div className="pt-2">
        <Link
          href="/scan"
          className="w-full flex items-center justify-center gap-2 bg-sky-700 hover:bg-sky-800 text-white py-3 px-4 rounded-xl font-bold text-sm shadow-sm transition active:scale-[0.98]"
        >
          <Camera className="w-4 h-4" />
          <span>Buka Scanner Kamera (/scan)</span>
        </Link>
      </div>

      {/* Enlarged Modal */}
      {selectedAsset && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedAsset(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-xs w-full p-5 shadow-2xl space-y-3 relative text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedAsset(null)}
              className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pt-1">
              <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-1 rounded-md">
                {selectedAsset.code}
              </span>
              <h3 className="font-bold text-sm text-slate-900 mt-2">
                {selectedAsset.name}
              </h3>
              <p className="text-xs text-slate-500">{selectedAsset.location}</p>
            </div>

            <div className="flex justify-center p-3 bg-slate-50 rounded-xl border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedAsset.imageSrc}
                alt={selectedAsset.code}
                className="w-56 h-56 object-contain bg-white p-2 rounded-lg shadow-sm"
              />
            </div>

            <div className="flex items-center justify-center gap-2 text-xs">
              {getStatusBadge(selectedAsset.status, selectedAsset.statusLabel)}
            </div>

            <button
              type="button"
              onClick={() => setSelectedAsset(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
