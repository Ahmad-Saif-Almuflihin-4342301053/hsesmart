"use client";

import React, { useRef, useState } from "react";
import { Camera, Image as ImageIcon, X, RefreshCw } from "lucide-react";

interface CameraCaptureInputProps {
  onPhotoSelected: (base64OrUrl: string | null) => void;
}

export function CameraCaptureInput({ onPhotoSelected }: CameraCaptureInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        onPhotoSelected(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearPhoto = () => {
    setPreviewUrl(null);
    onPhotoSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
        <Camera className="w-4 h-4 text-sky-600" />
        Foto Bukti Temuan (Kamera / Galeri)
      </label>

      {/* Hidden File Input with Camera Capture Support */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {previewUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Preview Temuan"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white/90 text-slate-800 text-xs font-semibold flex items-center gap-1.5 shadow"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Ganti
            </button>
            <button
              type="button"
              onClick={handleClearPhoto}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
            >
              <X className="w-3.5 h-3.5" />
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-32 border-2 border-dashed border-slate-300 hover:border-sky-500 hover:bg-sky-50/50 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500 transition active:scale-[0.99]"
        >
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <Camera className="w-5 h-5" />
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-slate-800">
              Ambil Foto Langsung atau Upload
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Klik untuk membuka kamera HP
            </p>
          </div>
        </button>
      )}
    </div>
  );
}
