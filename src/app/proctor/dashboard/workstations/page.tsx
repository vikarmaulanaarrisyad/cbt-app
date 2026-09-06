"use client";

import React, { useState } from "react";
import { Alert } from "@/lib/sweetalert";

interface Station {
  id: string;
  name: string;
  ip: string;
  studentName?: string;
  nisn?: string;
  progress?: number;
  status: "ACTIVE" | "IDLE" | "ALERT" | "OFFLINE";
}

export default function WorkstationsPage() {
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  // 40 Computer Workstations Mock Layout for Lab CBT-08
  const stations: Station[] = Array.from({ length: 40 }, (_, i) => {
    const pcNum = String(i + 1).padStart(2, "0");
    if (i === 3) {
      return { id: `pc-${pcNum}`, name: `PC-CBT-${pcNum}`, ip: `192.168.1.1${pcNum}`, studentName: "Budi Santoso", nisn: "25-3101-0982-014", progress: 65, status: "ALERT" };
    }
    if (i === 11) {
      return { id: `pc-${pcNum}`, name: `PC-CBT-${pcNum}`, ip: `192.168.1.1${pcNum}`, studentName: "Siti Rahmawati", nisn: "25-3101-0982-015", progress: 40, status: "ALERT" };
    }
    if (i >= 38) {
      return { id: `pc-${pcNum}`, name: `PC-CBT-${pcNum}`, ip: `192.168.1.1${pcNum}`, status: "OFFLINE" };
    }
    if (i % 7 === 0) {
      return { id: `pc-${pcNum}`, name: `PC-CBT-${pcNum}`, ip: `192.168.1.1${pcNum}`, studentName: `Peserta CBT-${pcNum}`, nisn: `25-3101-0982-0${pcNum}`, progress: 30, status: "IDLE" };
    }
    return { id: `pc-${pcNum}`, name: `PC-CBT-${pcNum}`, ip: `192.168.1.1${pcNum}`, studentName: `Peserta CBT-${pcNum}`, nisn: `25-3101-0982-0${pcNum}`, progress: 75 + (i % 20), status: "ACTIVE" };
  });

  const activeCount = stations.filter((s) => s.status === "ACTIVE").length;
  const alertCount = stations.filter((s) => s.status === "ALERT").length;
  const idleCount = stations.filter((s) => s.status === "IDLE").length;
  const offlineCount = stations.filter((s) => s.status === "OFFLINE").length;

  return (
    <div className="flex-1 min-h-screen bg-slate-100 flex flex-col font-body-default text-slate-800 w-full min-w-0">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs shrink-0">
            <span className="material-symbols-outlined text-[22px]">grid_view</span>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Denah Laboratorium & Kontrol Workstation</h1>
            <p className="text-xs text-slate-500">Lab CBT-08 (Gedung B Lt. 3) • Kapasitas 40 Klien Peserta Ujian</p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Switch Core: SW-LAB08-01</span>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
          {/* Status Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Aktif Mengerjakan</p>
                <p className="text-2xl font-bold text-emerald-600 font-mono">{activeCount}</p>
              </div>
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Anomali / Alert</p>
                <p className="text-2xl font-bold text-red-600 font-mono">{alertCount}</p>
              </div>
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Idle / Tanpa Aktivitas</p>
                <p className="text-2xl font-bold text-amber-600 font-mono">{idleCount}</p>
              </div>
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Kosong / Offline</p>
                <p className="text-2xl font-bold text-slate-400 font-mono">{offlineCount}</p>
              </div>
              <span className="w-3 h-3 rounded-full bg-slate-300"></span>
            </div>
          </div>

          {/* Visual Floor Plan Grid (5 Rows x 8 Columns) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400">desktop_windows</span>
                <h3 className="font-bold text-slate-800 text-sm">Denah Ruang Lab CBT-08 (Layar Meja Pengawas Muka)</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">Server Utama: SRV-JKT-04</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
              {stations.map((st) => {
                let borderClass = "border-slate-200 bg-slate-50 hover:border-slate-300";
                let badgeClass = "bg-slate-200 text-slate-600";
                if (st.status === "ACTIVE") {
                  borderClass = "border-emerald-200 bg-emerald-50/40 hover:border-emerald-400";
                  badgeClass = "bg-emerald-100 text-emerald-800";
                } else if (st.status === "ALERT") {
                  borderClass = "border-red-300 bg-red-50 hover:border-red-500 shadow-md animate-pulse";
                  badgeClass = "bg-red-600 text-white font-bold";
                } else if (st.status === "IDLE") {
                  borderClass = "border-amber-200 bg-amber-50/40 hover:border-amber-400";
                  badgeClass = "bg-amber-100 text-amber-800";
                }

                return (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStation(st)}
                    className={`p-3 rounded-xl border flex flex-col justify-between h-28 transition-all text-left group cursor-pointer ${borderClass}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-slate-900">{st.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${badgeClass}`}>
                        {st.status}
                      </span>
                    </div>

                    {st.studentName ? (
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-slate-800 truncate">{st.studentName}</p>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full" style={{ width: `${st.progress}%` }}></div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Workstation Kosong</p>
                    )}

                    <span className="text-[9px] font-mono text-slate-400 truncate">{st.ip}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </main>

        {/* Selected Station Control Modal */}
      {selectedStation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">monitor</span>
                <h3 className="font-bold text-slate-900 text-base">Kontrol Remote {selectedStation.name}</h3>
              </div>
              <button onClick={() => setSelectedStation(null)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono">
              <p>Workstation: <span className="font-bold text-slate-900">{selectedStation.name}</span></p>
              <p>IP Address: <span className="font-bold text-slate-900">{selectedStation.ip}</span></p>
              <p>Peserta: <span className="font-bold text-blue-700">{selectedStation.studentName || "Tidak Ada"}</span></p>
              <p>Status Kiosk: <span className="font-bold text-emerald-600">{selectedStation.status}</span></p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  Alert.success("Remote Reset", `Sesi ${selectedStation.name} di-reset.`);
                  setSelectedStation(null);
                }}
                className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 cursor-pointer"
              >
                🔄 Reset Sesi Ujian
              </button>
              <button
                onClick={() => {
                  Alert.warning("Kunci Workstation", `${selectedStation.name} dikunci sementara.`);
                  setSelectedStation(null);
                }}
                className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200 cursor-pointer"
              >
                🔒 Kunci Komputer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
