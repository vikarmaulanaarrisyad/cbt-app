"use client";

import React, { useState } from "react";
import { Alert } from "@/lib/sweetalert";

export default function KioskPage() {
  const [settings, setSettings] = useState({
    blockAltTab: true,
    blockClipboard: true,
    forceFullscreen: true,
    ipBinding: true,
    disableSecondMonitor: true,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      Alert.success("Pengaturan Kiosk Diperbarui", `Fitur ${key} berhasil diubah.`);
      return updated;
    });
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-100 flex flex-col font-body-default text-slate-800 w-full min-w-0">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 shadow-xs shrink-0">
            <span className="material-symbols-outlined text-[22px]">devices</span>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Manajemen Kiosk & Keamanan Agent Client</h1>
            <p className="text-xs text-slate-500">Konfigurasi Pengunci Layar & Proteksi Integritas Browser Kios Ujian</p>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-4xl">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">security</span>
              <span>Modul Pengunci Kiosk Steril (Kiosk Agent Compliance)</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="font-bold text-slate-900 text-sm">Blokir Alt + Tab & Pindah Aplikasi</p>
                  <p className="text-slate-500 mt-0.5">Mencegah peserta berpindah ke aplikasi desktop atau browser lain.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.blockAltTab}
                  onChange={() => toggle("blockAltTab")}
                  className="w-5 h-5 accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="font-bold text-slate-900 text-sm">Proteksi Clipboard (Copy & Paste)</p>
                  <p className="text-slate-500 mt-0.5">Menutup akses perintah Ctrl+C, Ctrl+V, dan Klik Kanan pada lembar ujian.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.blockClipboard}
                  onChange={() => toggle("blockClipboard")}
                  className="w-5 h-5 accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="font-bold text-slate-900 text-sm">Wajib Layar Penuh (Force Fullscreen Kiosk)</p>
                  <p className="text-slate-500 mt-0.5">Memaksa browser ujian berjalan pada mode layar penuh tanpa taskbar.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.forceFullscreen}
                  onChange={() => toggle("forceFullscreen")}
                  className="w-5 h-5 accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="font-bold text-slate-900 text-sm">IP Address & Workstation Binding</p>
                  <p className="text-slate-500 mt-0.5">Mengunci sesi peserta pada nomor IP komputer laboratorium.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.ipBinding}
                  onChange={() => toggle("ipBinding")}
                  className="w-5 h-5 accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="font-bold text-slate-900 text-sm">Blokir Layar / Monitor Ganda (Secondary Display)</p>
                  <p className="text-slate-500 mt-0.5">Menolak koneksi monitor eksternal atau proyektor tidak terdeteksi.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.disableSecondMonitor}
                  onChange={() => toggle("disableSecondMonitor")}
                  className="w-5 h-5 accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </main>
    </div>
  );
}
