import React from "react";
import Link from "next/link";
import { ShieldCheck, ClipboardCheck, AlertTriangle, User, QrCode } from "lucide-react";

interface MobileShellProps {
  children: React.ReactNode;
}

export function MobileShell({ children }: MobileShellProps) {
  return (
    <div className="flex justify-center min-h-screen bg-slate-100 font-sans antialiased text-slate-900">
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col shadow-xl relative pb-16">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 bg-sky-700 text-white px-4 py-3 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-300" />
            <span className="font-bold text-lg tracking-tight">HSE Smart</span>
          </div>
          <span className="text-xs bg-sky-800 text-sky-100 px-2 py-0.5 rounded-full font-medium">
            Audit K3
          </span>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 overflow-y-auto">{children}</main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 max-w-md w-full bg-white border-t border-slate-200 grid grid-cols-5 py-2 px-1 z-30">
          <Link
            href="/"
            className="flex flex-col items-center justify-center text-sky-700 gap-1 hover:opacity-80 transition"
          >
            <ClipboardCheck className="w-5 h-5" />
            <span className="text-[10px] font-medium">Inspeksi</span>
          </Link>
          <Link
            href="/findings"
            className="flex flex-col items-center justify-center text-slate-500 gap-1 hover:text-sky-700 transition"
          >
            <AlertTriangle className="w-5 h-5" />
            <span className="text-[10px] font-medium">Temuan</span>
          </Link>
          <Link
            href="/scan"
            className="flex flex-col items-center justify-center text-emerald-600 gap-1 hover:text-emerald-700 transition relative -top-1"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 shadow-xs flex items-center justify-center">
              <QrCode className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-[10px] font-bold text-emerald-700">Scan QR</span>
          </Link>
          <Link
            href="/compliance"
            className="flex flex-col items-center justify-center text-slate-500 gap-1 hover:text-sky-700 transition"
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] font-medium">Kepatuhan</span>
          </Link>
          <Link
            href="/profile"
            className="flex flex-col items-center justify-center text-slate-500 gap-1 hover:text-sky-700 transition"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Profil</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}


