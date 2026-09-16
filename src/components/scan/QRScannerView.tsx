"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  RefreshCw,
  AlertCircle,
  Upload,
  Keyboard,
} from "lucide-react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

interface QRScannerViewProps {
  onScan: (decodedText: string) => void;
  isPaused: boolean;
}

export function QRScannerView({ onScan, isPaused }: QRScannerViewProps) {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [isScanning, setIsScanning] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [availableCameras, setAvailableCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const elementId = "qr-reader";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastScannedCodeRef = useRef<string | null>(null);

  // Initialize and start scanner
  const startScanning = useCallback(
    async (cameraFacing: "environment" | "user", deviceId?: string | null) => {
      try {
        setErrorMessage(null);

        // If instance exists and is running, stop it first
        if (scannerRef.current) {
          try {
            if (scannerRef.current.isScanning) {
              await scannerRef.current.stop();
            }
            await scannerRef.current.clear();
          } catch {
            // ignore cleanup errors
          }
          scannerRef.current = null;
        }

        // Check cameras
        try {
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length > 0) {
            setAvailableCameras(devices);
          }
        } catch {
          // Camera listing might fail in some sandboxes/browsers
        }

        const scanner = new Html5Qrcode(elementId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
        scannerRef.current = scanner;

        const config = {
          fps: 10,
          qrbox: { width: 230, height: 230 },
          aspectRatio: 1.0,
        };

        const cameraChoice = deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: cameraFacing };

        await scanner.start(
          cameraChoice,
          config,
          (decodedText) => {
            if (isPaused) return;
            // Prevent duplicate immediate reads
            if (decodedText !== lastScannedCodeRef.current) {
              lastScannedCodeRef.current = decodedText;
              onScan(decodedText);
              // reset last code after timeout
              setTimeout(() => {
                lastScannedCodeRef.current = null;
              }, 2000);
            }
          },
          () => {
            // Normal scan frame miss, do not trigger error
          }
        );

        setHasCameraPermission(true);
        setIsScanning(true);
      } catch (err: unknown) {
        console.warn("Camera start error:", err);
        setHasCameraPermission(false);
        setIsScanning(false);
        const errStr = String(err);
        if (errStr.includes("NotAllowedError") || errStr.includes("Permission")) {
          setErrorMessage("Izin akses kamera ditolak. Berikan izin di browser atau gunakan input manual.");
        } else if (errStr.includes("NotFoundError") || errStr.includes("DevicesNotFoundError")) {
          setErrorMessage("Kamera tidak terdeteksi pada perangkat ini.");
        } else {
          setErrorMessage("Tidak dapat membuka kamera. Anda dapat menggunakan input manual atau upload gambar QR.");
        }
      }
    },
    [isPaused, onScan]
  );

  // Mount scanner
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) {
        startScanning(facingMode, selectedCameraId);
      }
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(() => {});
        }
      }
    };
  }, [facingMode, selectedCameraId, startScanning]);

  // Handle camera switch (Front/Back)
  const handleToggleFacingMode = () => {
    const nextFacing = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextFacing);
    setSelectedCameraId(null);
  };

  // Handle file scan upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(elementId);
      }
      const decodedText = await scannerRef.current.scanFile(file, true);
      if (decodedText) {
        onScan(decodedText);
      }
    } catch {
      alert("Gagal membaca kode QR dari gambar yang diunggah.");
    } finally {
      if (e.target) e.target.value = "";
    }
  };

  // Handle manual code submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    onScan(manualCode.trim());
    setManualCode("");
    setShowManualInput(false);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Viewfinder Frame Container */}
      <div className="relative w-full max-w-sm aspect-square bg-slate-950 rounded-2xl overflow-hidden shadow-xl border border-slate-800 flex items-center justify-center">
        {/* Html5Qrcode Video Target */}
        <div id={elementId} className="w-full h-full object-cover" />

        {/* Viewfinder Target Framing Overlay */}
        {hasCameraPermission && isScanning && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            {/* Viewfinder Focus Box (Reticle) */}
            <div className="relative w-64 h-64 border-2 border-emerald-400/40 rounded-2xl">
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

              {/* Animated Laser Scanning Line */}
              {!isPaused && (
                <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_rgba(52,211,153,0.9)] animate-scan-laser" />
              )}
            </div>

            {/* Instruction Tag */}
            <div className="absolute bottom-4 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-xs border border-slate-700/60 text-white text-[11px] font-medium flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Arahkan ke QR Code Aset K3</span>
            </div>
          </div>
        )}

        {/* Permission Denied or Camera Error View */}
        {hasCameraPermission === false && (
          <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center bg-slate-900 text-white space-y-3 z-20">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Kamera Belum Aktif</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                {errorMessage || "Perangkat tidak memiliki kamera atau izin akses belum diberikan."}
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full pt-1 max-w-xs">
              <button
                type="button"
                onClick={() => startScanning(facingMode)}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Coba Akses Kamera Lagi</span>
              </button>
              <button
                type="button"
                onClick={() => setShowManualInput(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition flex items-center justify-center gap-1.5"
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>Ketik Kode Aset Manual</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Camera Controls Bar */}
      <div className="w-full max-w-sm flex items-center justify-between mt-3 px-1 gap-2">
        {/* Toggle Facing Mode (Front / Back Camera) */}
        <button
          type="button"
          onClick={handleToggleFacingMode}
          className="flex-1 py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95"
          title="Beralih Kamera Depan / Belakang"
        >
          <RefreshCw className="w-3.5 h-3.5 text-sky-600" />
          <span>Kamera {facingMode === "environment" ? "Belakang" : "Depan"}</span>
        </button>

        {/* Upload QR Image File */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-xs transition active:scale-95"
          title="Unggah Foto QR Code"
        >
          <Upload className="w-4 h-4" />
        </button>

        {/* Manual Code Input Toggle */}
        <button
          type="button"
          onClick={() => setShowManualInput((prev) => !prev)}
          className={`py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 border shadow-xs transition active:scale-95 ${
            showManualInput
              ? "bg-sky-50 border-sky-300 text-sky-700"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
          title="Input Kode Manual"
        >
          <Keyboard className="w-3.5 h-3.5 text-sky-600" />
          <span>Input Kode</span>
        </button>
      </div>

      {/* Multiple Camera Device Dropdown */}
      {availableCameras.length > 1 && (
        <div className="w-full max-w-sm mt-2 px-1">
          <select
            value={selectedCameraId || ""}
            onChange={(e) => setSelectedCameraId(e.target.value || null)}
            className="w-full px-2.5 py-1.5 text-[11px] rounded-lg border border-slate-200 bg-white text-slate-700 outline-none"
          >
            <option value="">Ganti Sumber Kamera ({availableCameras.length} terdeteksi)</option>
            {availableCameras.map((cam) => (
              <option key={cam.id} value={cam.id}>
                {cam.label || `Kamera ${cam.id.slice(0, 8)}...`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Manual Input Dropdown */}
      {showManualInput && (
        <form
          onSubmit={handleManualSubmit}
          className="w-full max-w-sm mt-3 p-3 bg-white rounded-xl border border-sky-200 shadow-sm space-y-2 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">Masukkan Kode Stiker Aset K3:</label>
            <span className="text-[10px] text-slate-400">Contoh: HSE-APAR-001</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Contoh: HSE-APAR-001"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1 px-3 py-2 text-xs uppercase font-mono tracking-wider rounded-lg border border-slate-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3 py-2 rounded-lg transition shrink-0"
            >
              Cek
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
