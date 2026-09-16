import { PlusCircle, CheckCircle2, AlertOctagon, Clock, QrCode } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-4">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-600 to-sky-800 text-white rounded-xl p-4 shadow-sm">
        <h2 className="text-lg font-bold">Ringkasan Audit K3</h2>
        <p className="text-xs text-sky-100 mt-1">
          Pantau status inspeksi keselamatan kerja dan temuan lapangan hari ini.
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col items-start">
          <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-semibold">Terselesaikan</span>
          </div>
          <span className="text-2xl font-bold text-slate-800">12</span>
          <span className="text-[10px] text-slate-500">Inspeksi Bulan Ini</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col items-start">
          <div className="flex items-center gap-1.5 text-amber-600 mb-1">
            <AlertOctagon className="w-4 h-4" />
            <span className="text-xs font-semibold">Temuan Aktif</span>
          </div>
          <span className="text-2xl font-bold text-slate-800">5</span>
          <span className="text-[10px] text-slate-500">Butuh Tindak Lanjut</span>
        </div>
      </div>

      {/* Action CTAs */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <Link
          href="/audit"
          className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white py-3 px-3 rounded-xl font-bold text-xs shadow-md transition active:scale-[0.98] text-center"
        >
          <PlusCircle className="w-4 h-4 shrink-0" />
          <span>Mulai Inspeksi</span>
        </Link>
        <Link
          href="/scan"
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-3 rounded-xl font-bold text-xs shadow-md transition active:scale-[0.98] text-center"
        >
          <QrCode className="w-4 h-4 shrink-0" />
          <span>Scan QR Aset</span>
        </Link>
      </div>

      {/* Recent Inspections Section */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Inspeksi Terakhir</h3>
          <span className="text-xs text-sky-600 font-medium">Lihat Semua</span>
        </div>

        <div className="space-y-2">
          <div className="border border-slate-200 rounded-lg p-3 bg-white shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Area Workshop Fabrikasi</p>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                <Clock className="w-3.5 h-3.5" />
                <span>16 Sep 2026</span>
                <span>•</span>
                <span className="text-emerald-600 font-medium">Skor 92%</span>
              </div>
            </div>
            <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
              Selesai
            </span>
          </div>

          <div className="border border-slate-200 rounded-lg p-3 bg-white shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Gudang Penyimpanan Bahan Kimia</p>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                <Clock className="w-3.5 h-3.5" />
                <span>15 Sep 2026</span>
                <span>•</span>
                <span className="text-amber-600 font-medium">2 Temuan</span>
              </div>
            </div>
            <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
              Review
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
