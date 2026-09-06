"use client";

import React, { useState, useEffect } from "react";
import { Alert } from "@/lib/sweetalert";

interface IntegrityLog {
  id: string;
  timestamp: string;
  nisn: string;
  studentName: string;
  classGroup: string;
  workstation: string;
  ipAddress: string;
  eventType: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  description: string;
  status: "UNRESOLVED" | "RESOLVED" | "WARNING_ISSUED" | "SESSION_RESET" | "FORCE_SUBMITTED";
  notes?: string;
}

interface Metrics {
  total: number;
  unresolved: number;
  critical: number;
  warning: number;
  resolved: number;
  integrityScore: number;
}

export default function IntegrityLogsPage() {
  const [logs, setLogs] = useState<IntegrityLog[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    total: 0,
    unresolved: 0,
    critical: 0,
    warning: 0,
    resolved: 0,
    integrityScore: 98.4,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("UNRESOLVED");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"table" | "timeline" | "cards">("table");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Selected Log for Action Modal
  const [activeLog, setActiveLog] = useState<IntegrityLog | null>(null);
  const [actionType, setActionType] = useState<"RESOLVE" | "RESET_SESSION" | "ISSUE_WARNING" | "FORCE_SUBMIT">("RESOLVE");
  const [actionNotes, setActionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (severityFilter) params.append("severity", severityFilter);
      if (searchQuery) params.append("q", searchQuery);

      const res = await fetch(`/api/proctor/integrity-logs?${params.toString()}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setLogs(json.data || []);
        if (json.metrics) {
          setMetrics(json.metrics);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil log integritas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [statusFilter, severityFilter]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLogs();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, statusFilter, severityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleExecuteAction = async () => {
    if (!activeLog) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/proctor/integrity-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logId: activeLog.id,
          action: actionType,
          notes: actionNotes,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        Alert.success("Tindakan Berhasil", json.message || "Status log integritas telah diperbarui.");
        setActiveLog(null);
        setActionNotes("");
        fetchLogs();
      } else {
        Alert.error("Gagal Memproses", json.message || "Gagal menerapkan tindakan.");
      }
    } catch (err: any) {
      Alert.error("Kesalahan Sistem", err?.message || "Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openActionModal = (log: IntegrityLog, action: "RESOLVE" | "RESET_SESSION" | "ISSUE_WARNING" | "FORCE_SUBMIT") => {
    setActiveLog(log);
    setActionType(action);
    setActionNotes("");
  };

  const handleResolveAll = async () => {
    Alert.confirm("Verifikasi Massal", "Apakah Anda yakin ingin menverifikasi seluruh alert yang tertunda?").then(async (confirmed) => {
      if (!confirmed.isConfirmed) return;
      for (const log of logs.filter((l) => l.status === "UNRESOLVED")) {
        await fetch("/api/proctor/integrity-logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ logId: log.id, action: "RESOLVE", notes: "Verifikasi massal oleh pengawas." }),
        });
      }
      Alert.success("Selesai", "Seluruh alert telah diverifikasi.");
      fetchLogs();
    });
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-100 flex flex-col font-body-default text-slate-800 selection:bg-red-500 selection:text-white w-full min-w-0">
      {/* Institutional Command Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs px-4 sm:px-6 py-3.5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-red-500/20 shrink-0">
            <span className="material-symbols-outlined text-[24px]">gpp_maybe</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Pusat Komando Integritas Ujian (Kiosk Integrity Control)</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                STREAM TELEMETRI REAL-TIME
              </span>
            </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi • Balai Pengelolaan Pengujian Pendidikan (BP3)
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Auto Refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                autoRefresh
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
              type="button"
            >
              <span className={`w-2 h-2 rounded-full ${autoRefresh ? "bg-emerald-500 animate-ping" : "bg-slate-400"}`}></span>
              <span>Auto-Sync {autoRefresh ? "ON (5s)" : "OFF"}</span>
            </button>

            {/* Batch Action */}
            {metrics.unresolved > 0 && (
              <button
                onClick={handleResolveAll}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">done_all</span>
                <span>Verifikasi Semua</span>
              </button>
            )}

            {/* Print BAP */}
            <button
              onClick={() => Alert.info("Cetak Berita Acara", "Fitur cetak BAP Pelanggaran siap diunduh format PDF.")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span className="hidden sm:inline">Cetak BAP</span>
            </button>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Alert Belum Ditangani */}
            <div className="bg-white rounded-2xl border border-red-200 p-5 shadow-sm relative overflow-hidden flex items-center justify-between group hover:shadow-md transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none"></div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Alert Perlu Tindakan</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-red-600 font-mono tracking-tight">{metrics.unresolved}</span>
                  <span className="text-xs font-bold text-red-800 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full">
                    Kritis
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Memerlukan penanganan segera</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[26px]">error</span>
              </div>
            </div>

            {/* Card 2: Pelanggaran Kritis */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pelanggaran Kritis</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">{metrics.critical}</span>
                  <span className="text-xs font-medium text-slate-500">Insiden</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Pindah tab & Alt+Tab</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[26px]">warning</span>
              </div>
            </div>

            {/* Card 3: Alert Diselesaikan */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sudah Ditangani</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-600 font-mono tracking-tight">{metrics.resolved}</span>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Selesai
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Diverifikasi pengawas</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[26px]">check_circle</span>
              </div>
            </div>

            {/* Card 4: Indeks Integritas */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Skor Sterilitas Ruangan</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-blue-700 font-mono tracking-tight">{metrics.integrityScore}%</span>
                </div>
                <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  Standar Steril BKN & BP3
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[26px]">verified</span>
              </div>
            </div>
          </div>

          {/* Controls & Filter Panel */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Status Segmented Tabs */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 w-full md:w-auto">
              <button
                onClick={() => setStatusFilter("UNRESOLVED")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === "UNRESOLVED"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
                type="button"
              >
                🚨 Perlu Tindakan ({metrics.unresolved})
              </button>
              <button
                onClick={() => setStatusFilter("RESOLVED")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === "RESOLVED"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
                type="button"
              >
                ✅ Sudah Ditangani ({metrics.resolved})
              </button>
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === "ALL"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
                type="button"
              >
                📋 Semua Log ({metrics.total})
              </button>
            </div>

            {/* Controls: Search, Severity Filter, & View Mode Switcher */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              {/* View Mode Toggle */}
              <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === "table" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                  title="Tampilan Tabel"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">table_rows</span>
                </button>
                <button
                  onClick={() => setViewMode("timeline")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === "timeline" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                  title="Tampilan Timeline"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">timeline</span>
                </button>
                <button
                  onClick={() => setViewMode("cards")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === "cards" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                  title="Tampilan Kartu Workstation"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">grid_view</span>
                </button>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-56">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Cari Nama, NISN, PC..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>

              {/* Severity Dropdown */}
              <select
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option value="ALL">Semua Keparahan</option>
                <option value="CRITICAL">🚨 KRITIS</option>
                <option value="WARNING">⚠️ PERINGATAN</option>
                <option value="INFO">ℹ️ INFO</option>
              </select>
            </div>
          </div>

          {/* VIEW MODE 1: Table View */}
          {viewMode === "table" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-slate-500 space-y-3">
                  <span className="material-symbols-outlined animate-spin text-3xl text-blue-600">progress_activity</span>
                  <p className="text-xs font-semibold">Memuat log integritas ujian real-time...</p>
                </div>
              ) : logs.length === 0 ? (
                <div className="p-12 text-center text-slate-500 space-y-3">
                  <span className="material-symbols-outlined text-4xl text-slate-300">verified_user</span>
                  <p className="text-sm font-bold text-slate-700">Tidak ada log integritas yang ditemukan</p>
                  <p className="text-xs text-slate-400">Seluruh sesi ujian berjalan steril tanpa anomali yang terdeteksi.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-4">Waktu (WIB)</th>
                        <th className="py-3.5 px-4">Peserta & Workstation</th>
                        <th className="py-3.5 px-4">Anomali Terdeteksi</th>
                        <th className="py-3.5 px-4">Keparahan</th>
                        <th className="py-3.5 px-4">Status & Catatan</th>
                        <th className="py-3.5 px-4 text-right">Tindakan Proktor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {logs.map((log) => {
                        const isUnresolved = log.status === "UNRESOLVED";

                        return (
                          <tr
                            key={log.id}
                            className={`hover:bg-slate-50/80 transition-colors ${
                              isUnresolved ? "bg-red-50/40" : ""
                            }`}
                          >
                            {/* Waktu */}
                            <td className="py-4 px-4 font-mono font-semibold text-slate-700 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
                                <span>{log.timestamp}</span>
                              </div>
                            </td>

                            {/* Peserta & Workstation */}
                            <td className="py-4 px-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900 text-sm">{log.studentName}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="font-mono text-[11px] text-slate-500">{log.nisn}</span>
                                  <span className="text-slate-300">•</span>
                                  <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                    {log.workstation}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Deskripsi Pelanggaran */}
                            <td className="py-4 px-4 max-w-xs">
                              <p className="font-bold text-slate-800 leading-snug">{log.description}</p>
                              <span className="text-[10px] text-slate-400 font-mono">IP: {log.ipAddress}</span>
                            </td>

                            {/* Keparahan */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              {log.severity === "CRITICAL" && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
                                  KRITIS
                                </span>
                              )}
                              {log.severity === "WARNING" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                  PERINGATAN
                                </span>
                              )}
                              {log.severity === "INFO" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                  INFO
                                </span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-4 px-4">
                              {log.status === "UNRESOLVED" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[11px] bg-red-600 text-white shadow-sm">
                                  🚨 Belum Ditangani
                                </span>
                              )}
                              {log.status === "RESOLVED" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-semibold text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  ✅ Diselesaikan
                                </span>
                              )}
                              {log.status === "SESSION_RESET" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-semibold text-[11px] bg-purple-100 text-purple-800 border border-purple-200">
                                  🔄 Sesi Di-reset
                                </span>
                              )}
                              {log.status === "WARNING_ISSUED" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-semibold text-[11px] bg-amber-100 text-amber-800 border border-amber-200">
                                  ⚠️ Teguran Terbit
                                </span>
                              )}
                              {log.status === "FORCE_SUBMITTED" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-semibold text-[11px] bg-slate-800 text-white">
                                  🛑 Dipaksa Selesai
                                </span>
                              )}
                              {log.notes && (
                                <p className="text-[10px] text-slate-500 italic mt-1 max-w-xs">{log.notes}</p>
                              )}
                            </td>

                            {/* Action Buttons */}
                            <td className="py-4 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {isUnresolved ? (
                                  <>
                                    <button
                                      onClick={() => openActionModal(log, "RESET_SESSION")}
                                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 transition-colors cursor-pointer"
                                      title="Reset Sesi & Izinkan Ujian Kembali"
                                      type="button"
                                    >
                                      Reset Sesi
                                    </button>
                                    <button
                                      onClick={() => openActionModal(log, "ISSUE_WARNING")}
                                      className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200 transition-colors cursor-pointer"
                                      title="Kirim Teguran ke Kiosk Peserta"
                                      type="button"
                                    >
                                      Tegur
                                    </button>
                                    <button
                                      onClick={() => openActionModal(log, "RESOLVE")}
                                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                                      title="Tandai Selesai"
                                      type="button"
                                    >
                                      Verifikasi
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => openActionModal(log, "RESET_SESSION")}
                                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
                                    type="button"
                                  >
                                    Ubah Aksi
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* VIEW MODE 2: Timeline View */}
          {viewMode === "timeline" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">timeline</span>
                <span>Kronologi Insiden Integritas Ruangan (Timeline Feed)</span>
              </h3>

              <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
                {logs.map((log) => (
                  <div key={log.id} className="relative pl-6 group">
                    <span
                      className={`absolute -left-2.5 top-1.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] ${
                        log.severity === "CRITICAL" ? "bg-red-600 animate-pulse" : log.severity === "WARNING" ? "bg-amber-500" : "bg-blue-500"
                      }`}
                    >
                      !
                    </span>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-700">{log.timestamp} • {log.workstation}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${log.status === "UNRESOLVED" ? "bg-red-600 text-white" : "bg-emerald-100 text-emerald-800"}`}>
                          {log.status}
                        </span>
                      </div>
                      <p className="font-bold text-slate-900 text-sm">{log.studentName} <span className="font-normal text-slate-500 text-xs">({log.nisn})</span></p>
                      <p className="text-xs text-slate-700 font-medium">{log.description}</p>
                      {log.notes && <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded border border-slate-200">{log.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW MODE 3: Cards View */}
          {viewMode === "cards" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 transition-all hover:shadow-md ${
                    log.status === "UNRESOLVED" ? "border-red-300 bg-red-50/20" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {log.workstation}
                    </span>
                    <span className="font-mono text-xs text-slate-500">{log.timestamp}</span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm">{log.studentName}</h4>
                    <p className="text-xs font-mono text-slate-500">{log.nisn} • {log.classGroup}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 leading-snug">
                    {log.description}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${log.status === "UNRESOLVED" ? "bg-red-600 text-white" : "bg-emerald-100 text-emerald-800"}`}>
                      {log.status}
                    </span>
                    <button
                      onClick={() => openActionModal(log, "RESET_SESSION")}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-colors"
                      type="button"
                    >
                      Tangani Insiden
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Action Dialog Modal */}
      {activeLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[22px]">gavel</span>
                <h3 className="font-bold text-slate-900 text-base">Tindakan Proktor Ruangan</h3>
              </div>
              <button
                onClick={() => setActiveLog(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900 text-sm">{activeLog.studentName}</p>
                <p className="font-mono text-slate-500">NISN: {activeLog.nisn} • {activeLog.workstation}</p>
                <p className="text-red-700 font-medium mt-1">{activeLog.description}</p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800">Pilih Jenis Tindakan:</label>
                <select
                  value={actionType}
                  onChange={(e: any) => setActionType(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
                >
                  <option value="RESOLVE">✅ Tandai Selesai (Diverifikasi Normal)</option>
                  <option value="RESET_SESSION">🔄 Reset Sesi Ujian (Izinkan Login Ulang)</option>
                  <option value="ISSUE_WARNING">⚠️ Terbitkan Peringatan Teguran Resmi</option>
                  <option value="FORCE_SUBMIT">🛑 Paksa Kumpul Jawaban (Hentikan Ujian)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800">Catatan Proktor (Opsional):</label>
                <textarea
                  rows={3}
                  placeholder="Masukkan alasan atau berita acara verifikasi..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                type="button"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteAction}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                type="button"
              >
                {isSubmitting ? "Memproses..." : "Terapkan Tindakan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
