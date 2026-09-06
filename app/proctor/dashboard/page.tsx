"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Alert } from "@/lib/sweetalert";

export default function ProctorDashboard() {
  const [timeLeft, setTimeLeft] = useState(765); // 12 mins 45 seconds
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timerInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  const handleCopyToken = () => {
    navigator.clipboard.writeText("XK9PW2");
    Alert.success("Token Disalin!", "Token XK9PW2 berhasil disalin ke clipboard.");
  };

  const handleBroadcast = () => {
    Alert.success("Pesan Disiarkan", "Pengumuman berhasil dikirim ke 38 kiosk aktif!");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <main className="flex-1 flex flex-col relative w-full">
        
        {/* Top Header Banner */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 py-5 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 shadow-sm">
          
          {/* Session Context Info */}
          <div className="flex items-center gap-5 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[32px]">cast_for_education</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  LAB UTBK-08
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold">
                  Lt. 3 Gedung Timur
                </span>
                <span className="flex items-center gap-1.5 text-slate-500 text-xs font-medium ml-2">
                  <span className="material-symbols-outlined text-[14px]">sync</span>
                  Terhubung ke Server Pusat
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl text-slate-900 font-bold tracking-tight truncate">
                Sesi 2 • Penalaran Umum & Kuantitatif
              </h1>
            </div>
          </div>

          {/* Action & Token Area */}
          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto justify-start xl:justify-end">
            
            {/* Token Card (Glowing/Premium) */}
            <div className="flex items-center gap-4 bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-blue-50/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              
              <div className="flex flex-col relative z-10">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">
                  Token Ruangan
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-2xl tracking-[0.2em] text-slate-900 font-black font-mono drop-shadow-sm" id="active-token-text">
                    XK9PW2
                  </span>
                  <button
                    onClick={handleCopyToken}
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    title="Salin Token"
                  >
                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                  </button>
                </div>
              </div>
              
              <div className="h-10 w-px bg-slate-200 mx-2 relative z-10"></div>
              
              <div className="flex flex-col items-end relative z-10">
                <span className="text-sm font-semibold flex items-center gap-1.5 text-blue-600">
                  <span className="material-symbols-outlined text-[16px] animate-pulse">timer</span>
                  {formatTime(timeLeft)}
                </span>
                <button className="mt-1 text-[10px] font-bold text-slate-400 hover:text-blue-600 underline underline-offset-2 transition-colors">
                  Rilis Ulang
                </button>
              </div>
            </div>

            {/* Quick Master Actions */}
            <div className="flex items-center gap-2">
              <button className="flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm" title="Tambah Waktu Sesi">
                <span className="material-symbols-outlined text-[20px]">more_time</span>
              </button>
              <button className="flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all shadow-sm" title="Jeda Ujian Darurat">
                <span className="material-symbols-outlined text-[20px]">pause_circle</span>
              </button>
              <button className="flex items-center gap-2 h-12 px-4 rounded-xl bg-red-50 border border-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm font-semibold text-sm">
                <span className="material-symbols-outlined text-[20px]">lock</span>
                Kunci PC
              </button>
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="p-8 flex-1 w-full max-w-[1920px] mx-auto flex flex-col gap-8">
          
          {/* ======================= METRICS GRID ======================= */}
          <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5">
            {/* Card 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Kapasitas</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-slate-800">40</p>
                  <p className="text-sm font-medium text-slate-400">Kursi</p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-[24px]">desktop_windows</span>
              </div>
            </div>

            {/* Card 2 - Active */}
            <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-[0_4px_20px_-4px_rgba(37,99,235,0.1)] flex items-center justify-between hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Mengerjakan</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-slate-800">38</p>
                  <p className="text-sm font-medium text-slate-400">/ 40</p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 relative z-10">
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
            </div>

            {/* Card 3 - Anomaly */}
            <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-[0_4px_20px_-4px_rgba(239,68,68,0.1)] flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">warning</span> Anomali
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-slate-800">1</p>
                  <p className="text-sm font-medium text-red-400">Siswa</p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
              </div>
            </div>

            {/* Card 4 - Offline */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Terputus</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-slate-800">1</p>
                  <p className="text-sm font-medium text-slate-400">PC</p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                <span className="material-symbols-outlined text-[24px]">wifi_off</span>
              </div>
            </div>

            {/* Card 5 - Empty */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow col-span-2 md:col-span-1 xl:col-span-1">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Kosong</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-slate-800">1</p>
                  <p className="text-sm font-medium text-slate-400">Meja</p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                <span className="material-symbols-outlined text-[24px]">person_off</span>
              </div>
            </div>
          </section>

          {/* ======================= MAIN CONTENT TWO COLS ======================= */}
          <div className="flex flex-col xl:flex-row gap-8 items-start h-full pb-8">
            
            {/* LEFT: WORKSTATION GRID */}
            <div className="flex-1 w-full flex flex-col gap-5 min-w-0">
              
              {/* Filter Toolbar */}
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm w-full lg:w-auto overflow-x-auto">
                  <button className="px-4 py-2 rounded-lg bg-blue-50 text-blue-700 font-semibold text-sm whitespace-nowrap transition-colors">
                    Semua (40)
                  </button>
                  <button className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span> Atensi (2)
                  </button>
                  <button className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Lancar (38)
                  </button>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                  <div className="relative w-full sm:w-72">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">search</span>
                    <input
                      type="text"
                      placeholder="Cari Peserta atau No PC..."
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-400"
                    />
                  </div>
                  <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                    <button className="p-2 rounded-lg bg-slate-100 text-slate-800 shadow-sm">
                      <span className="material-symbols-outlined text-[18px]">grid_view</span>
                    </button>
                    <button className="p-2 rounded-lg text-slate-400 hover:text-slate-800 transition-colors">
                      <span className="material-symbols-outlined text-[18px]">list</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid Legend & Board indicator */}
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 px-1">
                <div className="flex items-center gap-2 bg-slate-200/50 px-3 py-1.5 rounded-lg border border-slate-200">
                  <span className="material-symbols-outlined text-[16px] text-slate-600">co_present</span>
                  <span className="uppercase tracking-wider">Meja Pengawas (Depan)</span>
                </div>
                <div className="hidden sm:flex items-center gap-5">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Online</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-500"></span> Alert</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-300"></span> Offline</span>
                </div>
              </div>

              {/* The Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                
                {/* Normal Seat Component Loop */}
                {[
                  { id: "WS-001", name: "Aditya Pratama", ms: "9ms", p: 86, color: "emerald" },
                  { id: "WS-002", name: "Anisa Maharani P.", ms: "11ms", p: 73, color: "emerald" },
                  { id: "WS-003", name: "Bagus Tri P.", ms: "8ms", p: 93, color: "emerald" },
                  { id: "WS-004", name: "Cantika Dewi S.", ms: "14ms", p: 63, color: "blue" },
                  { id: "WS-005", name: "Danang Hendra W.", ms: "10ms", p: 83, color: "emerald" },
                  { id: "WS-006", name: "Eka Nur Azizah", ms: "12ms", p: 90, color: "emerald" },
                  { id: "WS-007", name: "Fajar Hidayatullah", ms: "10ms", p: 80, color: "emerald" },
                  { id: "WS-008", name: "Budi Santoso", ms: "15ms", p: 50, color: "blue" },
                ].map((ws) => (
                  <div key={ws.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 flex flex-col group cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded-md border border-slate-200 font-mono">
                          {ws.id}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${ws.color === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{ws.ms}</span>
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">{ws.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-medium">No: 24-3101-0982-xxx</p>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between items-end mb-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Progress</span>
                        <span className="text-[11px] font-bold text-slate-700">{ws.p}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${ws.color === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${ws.p}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* ALERT SEAT (CRITICAL) */}
                <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 shadow-md col-span-1 sm:col-span-2 flex flex-col relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-200/50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-red-300/50 transition-colors"></div>
                  
                  <div className="flex items-center justify-between mb-2 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold bg-red-600 text-white px-2 py-1 rounded-md border border-red-700 font-mono shadow-sm">
                        WS-014
                      </span>
                      <span className="text-[10px] font-bold bg-red-200 text-red-800 px-2 py-1 rounded-md uppercase tracking-wider animate-pulse flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">warning</span> Pelanggaran
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-red-500 bg-red-100 px-1.5 py-0.5 rounded border border-red-200">28ms</span>
                  </div>

                  <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-red-200/50 mt-1 relative z-10 flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[15px] font-bold text-slate-900">Ahmad Fauzi P.</p>
                        <p className="text-[11px] font-semibold text-red-600 mt-1 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Alt-Tab 2x Terdeteksi
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-slate-800 block">46% Selesai</span>
                        <span className="text-[10px] text-slate-500">14/30 Soal</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 relative z-10">
                    <button className="flex-1 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-[11px] font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all hover:bg-slate-50">
                      <span className="material-symbols-outlined text-[14px]">notifications_active</span> Tegur
                    </button>
                    <button className="flex-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all">
                      <span className="material-symbols-outlined text-[14px]">lock_clock</span> Kunci PC
                    </button>
                    <button className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-lg flex items-center justify-center transition-all border border-slate-200">
                      <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                    </button>
                  </div>
                </div>

                {/* OFFLINE SEAT */}
                <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col col-span-1 sm:col-span-2 relative overflow-hidden group grayscale opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-md border border-slate-300 font-mono">
                        WS-022
                      </span>
                      <span className="text-[10px] font-bold bg-red-100 text-red-600 border border-red-200 px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                        DC 45s
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-[18px] text-slate-400">wifi_off</span>
                  </div>
                  
                  <div className="flex-1 mb-2">
                    <p className="text-sm font-bold text-slate-700 line-through decoration-slate-400">Siti Rahmawati P.</p>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium italic">Jawaban lokal terakhir aman (15:56)</p>
                  </div>

                  <div className="flex items-center gap-2 mt-auto">
                    <button className="flex-1 bg-white border border-slate-300 text-slate-700 text-[11px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 hover:bg-slate-50 transition-colors shadow-sm">
                      <span className="material-symbols-outlined text-[14px]">cell_tower</span> Ping Ulang
                    </button>
                  </div>
                </div>

                {/* EMPTY SEAT */}
                <div className="bg-slate-50/50 border border-dashed border-slate-300 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-white hover:border-blue-300 transition-all cursor-pointer group">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-0.5">WS-040</span>
                    <span className="text-[10px] text-slate-400 font-medium">Meja Kosong / Assign</span>
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT: ACTIVITY & ACTIONS PANEL */}
            <aside className="w-full xl:w-96 shrink-0 flex flex-col gap-6">
              
              {/* Broadcast Card */}
              <div className="bg-linear-to-b from-blue-600 to-blue-800 rounded-2xl shadow-xl shadow-blue-900/10 p-5 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                    <span className="material-symbols-outlined text-[22px]">campaign</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight">Pesan Ruangan</h2>
                    <p className="text-xs text-blue-100 opacity-90">Kirim popup ke layar siswa</p>
                  </div>
                </div>
                <div className="space-y-3 relative z-10">
                  <textarea
                    className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-sm text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none custom-scrollbar"
                    rows={3}
                    defaultValue="Waktu tersisa 15 menit. Periksa kembali soal bertanda ragu-ragu."
                  ></textarea>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="sound" className="rounded bg-white/20 border-transparent focus:ring-0 text-blue-500 w-3.5 h-3.5" defaultChecked />
                      <label htmlFor="sound" className="text-[11px] font-medium text-blue-50 cursor-pointer">Dengan Suara</label>
                    </div>
                    <button onClick={handleBroadcast} className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5">
                      Siarkan <span className="material-symbols-outlined text-[14px]">send</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Activity Log */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-100">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-slate-400">history</span>
                    <h3 className="font-bold text-sm text-slate-800">Log Integritas</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live
                  </span>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
                  {/* Timeline Item 1 - Error */}
                  <div className="flex gap-3 relative">
                    <div className="w-px h-full bg-slate-200 absolute left-2.75 top-6"></div>
                    <div className="w-6 h-6 rounded-full bg-red-100 border border-red-200 flex items-center justify-center shrink-0 z-10 mt-0.5">
                      <span className="material-symbols-outlined text-[12px] text-red-600">warning</span>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <p className="text-[13px] font-bold text-slate-800">WS-014 (Ahmad Fauzi)</p>
                        <span className="text-[10px] text-slate-400 font-medium">Baru saja</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">Peringatan: Kiosk kehilangan fokus (Alt-Tab 2x).</p>
                    </div>
                  </div>

                  {/* Timeline Item 2 - Info */}
                  <div className="flex gap-3 relative">
                    <div className="w-px h-full bg-slate-200 absolute left-2.75 top-6"></div>
                    <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0 z-10 mt-0.5">
                      <span className="material-symbols-outlined text-[12px] text-blue-600">vpn_key</span>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <p className="text-[13px] font-bold text-slate-800">Proktor Ruang</p>
                        <span className="text-[10px] text-slate-400 font-medium">15:57</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">Merilis token sesi baru <span className="font-mono bg-slate-100 px-1 rounded">XK9PW2</span></p>
                    </div>
                  </div>

                  {/* Timeline Item 3 - Warning */}
                  <div className="flex gap-3 relative">
                    <div className="w-px h-full bg-slate-200 absolute left-2.75 top-6"></div>
                    <div className="w-6 h-6 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 z-10 mt-0.5">
                      <span className="material-symbols-outlined text-[12px] text-amber-600">wifi_off</span>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <p className="text-[13px] font-bold text-slate-800">WS-022 (Siti R.)</p>
                        <span className="text-[10px] text-slate-400 font-medium">15:56</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">Koneksi terputus. Buffer offline aktif.</p>
                    </div>
                  </div>

                  {/* Timeline Item 4 - Success */}
                  <div className="flex gap-3 relative">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 z-10 mt-0.5">
                      <span className="material-symbols-outlined text-[12px] text-emerald-600">cloud_done</span>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <p className="text-[13px] font-bold text-slate-800">System Sync</p>
                        <span className="text-[10px] text-slate-400 font-medium">15:54</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">Auto-save 38 arsip terenkripsi berhasil.</p>
                    </div>
                  </div>
                </div>
              </div>

            </aside>
          </div>
        </div>
      </main>

      {/* Global minimal styles for scrollbar in this layout */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.3); border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.5); }
      `}} />
    </>
  );
}
