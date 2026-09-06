"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Alert } from "@/lib/sweetalert";
import {
  getActiveEducationLevel,
  setActiveEducationLevel,
  EVENT_JENJANG_CHANGE,
  EducationLevel,
  JENJANG_CONFIG,
} from "@/lib/education-level";

export default function ProctorDashboard() {
  const [timeLeft, setTimeLeft] = useState(765); // 12 mins 45 seconds
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeJenjang, setActiveJenjang] = useState<EducationLevel>("SEMUA");
  const [stats, setStats] = useState<any>({
    activeToken: "XK9PW2",
    sessionName: "Sesi 2 • Penalaran Umum & Kuantitatif",
    activeSemester: "Semester Ganjil 2024/2025",
    academicYear: "2024/2025",
    totalStudents: 40,
    activeStudents: 38,
    totalQuestions: 0,
    capacity: 40,
    workingCount: 38,
    anomalyCount: 1,
    offlineCount: 0,
    jenjangBreakdown: {
      MI: { questions: 2, classes: 3, subjects: 5 },
      MTS: { questions: 2, classes: 3, subjects: 6 },
      MA: { questions: 2, classes: 5, subjects: 6 },
    },
    studentsList: [],
  });

  const [activeRoleView, setActiveRoleView] = useState<"PROCTOR" | "ADMIN" | "TEACHER">("PROCTOR");
  const [user, setUser] = useState<any>(null);
  const [integrityLogs, setIntegrityLogs] = useState<any[]>([]);

  useEffect(() => {
    setActiveJenjang(getActiveEducationLevel());

    const handleJenjangChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ educationLevel: EducationLevel }>;
      if (customEvent.detail && customEvent.detail.educationLevel) {
        setActiveJenjang(customEvent.detail.educationLevel);
      }
    };

    window.addEventListener(EVENT_JENJANG_CHANGE, handleJenjangChange);
    return () => window.removeEventListener(EVENT_JENJANG_CHANGE, handleJenjangChange);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.user) {
          const u = data.data.user;
          const userRole = u.role;
          if (userRole === "ADMIN" || userRole === "TEACHER" || userRole === "PROCTOR") {
            setActiveRoleView(userRole);
          }
          if (u.educationLevel && u.educationLevel !== "SEMUA") {
            setActiveJenjang(u.educationLevel);
            setActiveEducationLevel(u.educationLevel);
          }
          setUser(u);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/proctor/dashboard-stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setStats(data.data);
          if (data.data.educationLevel && data.data.educationLevel !== "SEMUA") {
            setActiveJenjang(data.data.educationLevel);
            setActiveEducationLevel(data.data.educationLevel);
          }
        }
      })
      .catch((err) => console.error("Error fetching proctor stats:", err));

    fetch("/api/proctor/integrity-logs")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setIntegrityLogs(data.data);
        }
      })
      .catch(() => {});
  }, []);

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
    navigator.clipboard.writeText(stats.activeToken);
    Alert.success("Token Disalin!", `Token ${stats.activeToken} berhasil disalin ke clipboard.`);
  };

  const handleBroadcast = () => {
    Alert.success("Pesan Disiarkan", `Pengumuman berhasil dikirim ke ${stats.workingCount} kiosk aktif!`);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <main className="flex-1 flex flex-col relative w-full">
        
        {/* Role Mode Switcher & Jenjang Switcher Context Bar */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 shadow-inner">
          <div className="flex items-center gap-2 text-xs font-semibold flex-wrap">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {user?.name || "Drs. H. Mulyono"}
            </span>
            <span className="text-slate-300 font-bold">
              | {user?.schoolName || (stats as any).schoolName || "MI Bustanul Huda 01 Dawuhan"}
            </span>

            {/* Current Active Jenjang Pill Badge */}
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${
              activeJenjang === "MI"
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : activeJenjang === "MTS"
                ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                : activeJenjang === "MA"
                ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                : "bg-blue-500/20 text-blue-300 border-blue-500/40"
            }`}>
              <span className="material-symbols-outlined text-[13px]">school</span>
              Jenjang: {activeJenjang === "SEMUA" ? "Semua Jenjang" : activeJenjang}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            {/* Jenjang Switcher Pills */}
            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1.5">Jenjang:</span>
              {(["SEMUA", "MI", "MTS", "MA"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    setActiveJenjang(lvl);
                    setActiveEducationLevel(lvl);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-extrabold text-[11px] transition-all cursor-pointer ${
                    activeJenjang === lvl
                      ? lvl === "MI"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : lvl === "MTS"
                        ? "bg-sky-600 text-white shadow-xs"
                        : lvl === "MA"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-blue-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  {lvl === "SEMUA" ? "Semua" : lvl}
                </button>
              ))}
            </div>

            {/* Role View Switcher */}
            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 text-xs overflow-x-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 whitespace-nowrap">Mode:</span>
              <button
                onClick={() => {
                  setActiveRoleView("PROCTOR");
                  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("cbt-role-change", { detail: { role: "PROCTOR" } }));
                }}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeRoleView === "PROCTOR"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">shield</span>
                Pengawas
              </button>
              <button
                onClick={() => {
                  setActiveRoleView("ADMIN");
                  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("cbt-role-change", { detail: { role: "ADMIN" } }));
                }}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeRoleView === "ADMIN"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">admin_panel_settings</span>
                Admin
              </button>
              <button
                onClick={() => {
                  setActiveRoleView("TEACHER");
                  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("cbt-role-change", { detail: { role: "TEACHER" } }));
                }}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeRoleView === "TEACHER"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">menu_book</span>
                Guru
              </button>
            </div>
          </div>
        </div>

        {/* Top Header Banner */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 sm:gap-6 shadow-xs">
          
          {/* Context Title Info */}
          <div className="flex items-center gap-4 sm:gap-5 min-w-0">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs ${
              activeRoleView === "ADMIN"
                ? "bg-purple-50 border-purple-200 text-purple-700"
                : activeRoleView === "TEACHER"
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-blue-50 border-blue-200 text-blue-700"
            }`}>
              <span className="material-symbols-outlined text-[28px] sm:text-[32px]">
                {activeRoleView === "ADMIN" ? "terminal" : activeRoleView === "TEACHER" ? "auto_stories" : "cast_for_education"}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-md text-white text-[10px] font-bold uppercase tracking-wider shadow-xs ${
                  activeRoleView === "ADMIN" ? "bg-purple-600" : activeRoleView === "TEACHER" ? "bg-amber-600" : "bg-blue-600"
                }`}>
                  {activeRoleView === "ADMIN" ? "ADMINISTRATOR UTAMA" : activeRoleView === "TEACHER" ? "GURU PENGAMPU" : (user?.labAllocation || "PENGAWAS LAB CBT")}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-extrabold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">domain</span>
                  {user?.schoolName || (stats as any).schoolName || "Madrasah Digital"}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold">
                  Tahun Ajaran 2024/2025
                </span>
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl text-slate-900 font-bold tracking-tight truncate">
                {activeRoleView === "ADMIN"
                  ? "Pusat Kontrol Sistem & Pengawasan Pengguna"
                  : activeRoleView === "TEACHER"
                  ? "Pusat Pengelolaan Bank Soal & Kurikulum Ujian"
                  : `${user?.schoolName || (stats as any).schoolName || "Madrasah"} • ${stats.sessionName}`}
              </h1>
            </div>
          </div>

          {/* Action & Token Area (Mode-Dependent) */}
          {activeRoleView === "PROCTOR" ? (
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full xl:w-auto justify-start xl:justify-end">
              {/* Token Card (Glowing/Premium) */}
              <div className="flex items-center gap-3 sm:gap-4 bg-white border border-slate-200 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden group w-full sm:w-auto justify-between sm:justify-start">
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-blue-50/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                
                <div className="flex flex-col relative z-10">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">
                    Token Ruangan
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xl sm:text-2xl tracking-[0.2em] text-slate-900 font-black font-mono drop-shadow-xs" id="active-token-text">
                      {stats.activeToken}
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
                
                <div className="h-10 w-px bg-slate-200 mx-1 sm:mx-2 relative z-10"></div>
                
                <div className="flex flex-col items-end relative z-10">
                  <span className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 text-blue-600">
                    <span className="material-symbols-outlined text-[16px] animate-pulse">timer</span>
                    {formatTime(timeLeft)}
                  </span>
                  <button className="mt-1 text-[10px] font-bold text-slate-400 hover:text-blue-600 underline underline-offset-2 transition-colors">
                    Rilis Ulang
                  </button>
                </div>
              </div>

              {/* Quick Master Actions */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-xs" title="Tambah Waktu Sesi">
                  <span className="material-symbols-outlined text-[20px]">more_time</span>
                </button>
                <button className="flex-1 sm:flex-none flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all shadow-xs" title="Jeda Ujian Darurat">
                  <span className="material-symbols-outlined text-[20px]">pause_circle</span>
                </button>
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-11 sm:h-12 px-4 rounded-xl bg-red-50 border border-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-xs font-semibold text-xs sm:text-sm whitespace-nowrap">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                  Kunci PC
                </button>
              </div>
            </div>
          ) : activeRoleView === "ADMIN" ? (
            <div className="flex items-center gap-3">
              <Link
                href="/proctor/dashboard/semesters"
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-2 shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">date_range</span>
                Master Semester
              </Link>
              <Link
                href="/proctor/dashboard/users"
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                Kelola User & Hak Akses
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => Alert.info("Impor Soal", "Upload file Excel/Word untuk impor butir soal.")}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-2 shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                Import Excel
              </button>
              <Link
                href="/proctor/dashboard/questions/create"
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Buat Soal Baru
              </Link>
            </div>
          )}
        </header>

        {/* Content Wrapper */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-[1920px] mx-auto flex flex-col gap-6 sm:gap-8">
          
          {/* Multi-Jenjang Active Scope Banner */}
          {activeJenjang !== "SEMUA" && (
            <div className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4 shadow-xs transition-all ${
              activeJenjang === "MI"
                ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                : activeJenjang === "MTS"
                ? "bg-sky-50/70 border-sky-200 text-sky-950"
                : "bg-purple-50/70 border-purple-200 text-purple-950"
            }`}>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                  activeJenjang === "MI"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : activeJenjang === "MTS"
                    ? "bg-sky-600 text-white shadow-xs"
                    : "bg-purple-600 text-white shadow-xs"
                }`}>
                  {activeJenjang}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-sm sm:text-base tracking-tight truncate">
                      Lingkup Jenjang Aktif: {JENJANG_CONFIG[activeJenjang]?.label}
                    </h3>
                    <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-bold bg-white/80 border border-current/20 shrink-0">
                      Tingkat: {JENJANG_CONFIG[activeJenjang]?.grades?.join(", ") || JENJANG_CONFIG[activeJenjang]?.gradeLabel}
                    </span>
                  </div>
                  <p className="text-xs opacity-80 mt-0.5 line-clamp-1 sm:line-clamp-none">
                    {JENJANG_CONFIG[activeJenjang]?.fullName}. Menampilkan data rombel, bank soal, dan jadwal ujian tersaring.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full lg:w-auto justify-start lg:justify-end flex-wrap shrink-0">
                <Link
                  href="/proctor/dashboard/classes"
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[15px]">meeting_room</span>
                  <span>Rombel ({stats.jenjangBreakdown?.[activeJenjang]?.classes || 0})</span>
                </Link>
                <Link
                  href="/proctor/dashboard/questions"
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[15px]">library_books</span>
                  <span>Soal ({stats.jenjangBreakdown?.[activeJenjang]?.questions || 0})</span>
                </Link>
                <Link
                  href="/proctor/dashboard/subjects"
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[15px]">menu_book</span>
                  <span>Mapel ({stats.jenjangBreakdown?.[activeJenjang]?.subjects || 0})</span>
                </Link>
                <button
                  onClick={() => {
                    setActiveJenjang("SEMUA");
                    setActiveEducationLevel("SEMUA");
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  title="Tampilkan Semua Jenjang"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* ======================= METRICS GRID (ROLE DEPENDENT) ======================= */}
          {activeRoleView === "ADMIN" ? (
            <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 xl:gap-5">
              {/* Card 1: Total Staff & Users */}
              <div className="bg-white p-3.5 sm:p-4 xl:p-5 rounded-2xl border border-purple-200 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs font-bold text-purple-600 uppercase tracking-wider mb-1 truncate">Pengguna Staff</p>
                  <div className="flex items-baseline gap-1.5 sm:gap-2">
                    <p className="text-2xl sm:text-3xl font-black text-slate-900">12</p>
                    <p className="text-[10px] sm:text-xs font-semibold text-purple-500 truncate">Staff</p>
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 xl:w-12 xl:h-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0 ml-2">
                  <span className="material-symbols-outlined text-[20px] sm:text-[22px] xl:text-[24px]">manage_accounts</span>
                </div>
              </div>

              {/* Card 2: Database Latency */}
              <div className="bg-white p-3.5 sm:p-4 xl:p-5 rounded-2xl border border-emerald-200 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                    <p className="text-[11px] sm:text-xs font-bold text-emerald-600 uppercase tracking-wider truncate">DB Supabase</p>
                  </div>
                  <div className="flex items-baseline gap-1.5 sm:gap-2">
                    <p className="text-2xl sm:text-3xl font-black text-slate-900">8ms</p>
                    <p className="text-[10px] sm:text-xs font-semibold text-emerald-600 truncate">100%</p>
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 xl:w-12 xl:h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 ml-2">
                  <span className="material-symbols-outlined text-[20px] sm:text-[22px] xl:text-[24px]">database</span>
                </div>
              </div>

              {/* Card 3: Semester Aktif */}
              <div className="bg-white p-3.5 sm:p-4 xl:p-5 rounded-2xl border border-blue-200 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs font-bold text-blue-600 uppercase tracking-wider mb-1 truncate">Semester</p>
                  <div className="flex items-baseline gap-1.5 sm:gap-2">
                    <p className="text-xl sm:text-2xl xl:text-3xl font-black text-slate-900 truncate">24/25</p>
                  </div>
                  <p className="text-[10px] text-blue-600 font-medium mt-0.5 truncate">Ganjil</p>
                </div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 xl:w-12 xl:h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 ml-2">
                  <span className="material-symbols-outlined text-[20px] sm:text-[22px] xl:text-[24px]">date_range</span>
                </div>
              </div>

              {/* Card 4: Total Butir Soal */}
              <div className="bg-white p-3.5 sm:p-4 xl:p-5 rounded-2xl border border-amber-200 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs font-bold text-amber-600 uppercase tracking-wider mb-1 truncate">Bank Soal</p>
                  <div className="flex items-baseline gap-1.5 sm:gap-2">
                    <p className="text-2xl sm:text-3xl font-black text-slate-900">128</p>
                    <p className="text-[10px] sm:text-xs font-semibold text-amber-500 truncate">Butir</p>
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 xl:w-12 xl:h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 ml-2">
                  <span className="material-symbols-outlined text-[20px] sm:text-[22px] xl:text-[24px]">library_books</span>
                </div>
              </div>

              {/* Card 5: System Audit Events */}
              <div className="bg-white p-3.5 sm:p-4 xl:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 truncate">Audit Log</p>
                  <div className="flex items-baseline gap-1.5 sm:gap-2">
                    <p className="text-2xl sm:text-3xl font-black text-slate-900">34</p>
                    <p className="text-[10px] sm:text-xs font-semibold text-slate-400 truncate">Events</p>
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 xl:w-12 xl:h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0 ml-2">
                  <span className="material-symbols-outlined text-[20px] sm:text-[22px] xl:text-[24px]">security</span>
                </div>
              </div>
            </section>
          ) : activeRoleView === "TEACHER" ? (
            <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 xl:gap-5">
              {/* Card 1: Total Soal */}
              <div className="bg-white p-3.5 sm:p-4 xl:p-5 rounded-2xl border border-amber-200 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs font-bold text-amber-600 uppercase tracking-wider mb-1 truncate">Total Soal</p>
                  <div className="flex items-baseline gap-1.5 sm:gap-2">
                    <p className="text-2xl sm:text-3xl font-black text-slate-900">128</p>
                    <p className="text-[10px] sm:text-xs font-semibold text-amber-600 truncate">Butir</p>
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 xl:w-12 xl:h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 ml-2">
                  <span className="material-symbols-outlined text-[20px] sm:text-[22px] xl:text-[24px]">library_books</span>
                </div>
              </div>

              {/* Card 2: Soal Aktif */}
              <div className="bg-white p-3.5 sm:p-4 xl:p-5 rounded-2xl border border-emerald-200 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                    <p className="text-[11px] sm:text-xs font-bold text-emerald-600 uppercase tracking-wider truncate">Soal Aktif</p>
                  </div>
                  <div className="flex items-baseline gap-1.5 sm:gap-2">
                    <p className="text-2xl sm:text-3xl font-black text-slate-900">110</p>
                    <p className="text-[10px] sm:text-xs font-semibold text-emerald-600 truncate">Siap</p>
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 xl:w-12 xl:h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 ml-2">
                  <span className="material-symbols-outlined text-[20px] sm:text-[22px] xl:text-[24px]">task_alt</span>
                </div>
              </div>

              {/* Card 3: Draft Review */}
              <div className="bg-white p-3.5 sm:p-4 xl:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 truncate">Draft</p>
                  <div className="flex items-baseline gap-1.5 sm:gap-2">
                    <p className="text-2xl sm:text-3xl font-black text-slate-900">18</p>
                    <p className="text-[10px] sm:text-xs font-semibold text-slate-400 truncate">Butir</p>
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 xl:w-12 xl:h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center shrink-0 ml-2">
                  <span className="material-symbols-outlined text-[20px] sm:text-[22px] xl:text-[24px]">edit_note</span>
                </div>
              </div>

              {/* Card 4: Kategori Terpopuler */}
              <div className="bg-white p-3.5 sm:p-4 xl:p-5 rounded-2xl border border-blue-200 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs font-bold text-blue-600 uppercase tracking-wider mb-1 truncate">Kategori</p>
                  <p className="text-sm sm:text-base font-bold text-slate-900 truncate">Penalaran</p>
                  <p className="text-[10px] text-blue-600 font-medium truncate">45 Soal</p>
                </div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 xl:w-12 xl:h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 ml-2">
                  <span className="material-symbols-outlined text-[20px] sm:text-[22px] xl:text-[24px]">category</span>
                </div>
              </div>

              {/* Card 5: Kesiapan Kurikulum */}
              <div className="bg-white p-3.5 sm:p-4 xl:p-5 rounded-2xl border border-purple-200 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs font-bold text-purple-600 uppercase tracking-wider mb-1 truncate">Kesiapan</p>
                  <div className="flex items-baseline gap-1.5 sm:gap-2">
                    <p className="text-2xl sm:text-3xl font-black text-purple-700">95%</p>
                    <p className="text-[10px] sm:text-xs font-semibold text-purple-500 truncate">Steril</p>
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 xl:w-12 xl:h-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0 ml-2">
                  <span className="material-symbols-outlined text-[20px] sm:text-[22px] xl:text-[24px]">verified</span>
                </div>
              </div>
            </section>
          ) : (
            <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 xl:gap-5">
              {/* Card 1 - Kapasitas */}
              <div className="bg-white p-3.5 sm:p-4 xl:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 truncate">Kapasitas</p>
                  <div className="flex items-baseline gap-1.5 sm:gap-2">
                    <p className="text-2xl sm:text-3xl font-black text-slate-800">40</p>
                    <p className="text-xs sm:text-sm font-medium text-slate-400 truncate">Kursi</p>
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 xl:w-12 xl:h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0 ml-2">
                  <span className="material-symbols-outlined text-[20px] sm:text-[22px] xl:text-[24px]">desktop_windows</span>
                </div>
              </div>

              {/* Card 2 - Active */}
              <div className="bg-white p-3.5 sm:p-4 xl:p-5 rounded-2xl border border-blue-100 shadow-[0_4px_20px_-4px_rgba(37,99,235,0.1)] flex items-center justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="relative z-10 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0"></span>
                    <p className="text-[11px] sm:text-xs font-semibold text-blue-600 uppercase tracking-wider truncate">Mengerjakan</p>
                  </div>
                  <div className="flex items-baseline gap-1.5 sm:gap-2">
                    <p className="text-2xl sm:text-3xl font-black text-slate-800">38</p>
                    <p className="text-xs sm:text-sm font-medium text-slate-400 truncate">/ 40</p>
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 xl:w-12 xl:h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 relative z-10 shrink-0 ml-2">
                  <span className="material-symbols-outlined text-[20px] sm:text-[22px] xl:text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
              </div>

              {/* Card 3 - Anomaly (Highlight Alert on Mobile) */}
              <div className="bg-white p-3.5 sm:p-4 xl:p-5 rounded-2xl border border-red-200 shadow-[0_4px_20px_-4px_rgba(239,68,68,0.1)] flex items-center justify-between hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs font-bold text-red-500 uppercase tracking-wider mb-1 flex items-center gap-1 truncate">
                    <span className="material-symbols-outlined text-[14px]">warning</span> Anomali
                  </p>
                  <div className="flex items-baseline gap-1.5 sm:gap-2">
                    <p className="text-2xl sm:text-3xl font-black text-slate-800">1</p>
                    <p className="text-xs sm:text-sm font-medium text-red-400 truncate">Siswa</p>
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 xl:w-12 xl:h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shrink-0 ml-2">
                  <span className="material-symbols-outlined text-[20px] sm:text-[22px] xl:text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
                </div>
              </div>

              {/* Card 4 - Offline */}
              <div className="bg-white p-3.5 sm:p-4 xl:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 truncate">Terputus</p>
                  <div className="flex items-baseline gap-1.5 sm:gap-2">
                    <p className="text-2xl sm:text-3xl font-black text-slate-800">1</p>
                    <p className="text-xs sm:text-sm font-medium text-slate-400 truncate">PC</p>
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 xl:w-12 xl:h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0 ml-2">
                  <span className="material-symbols-outlined text-[20px] sm:text-[22px] xl:text-[24px]">wifi_off</span>
                </div>
              </div>

              {/* Card 5 - Empty */}
              <div className="bg-white p-3.5 sm:p-4 xl:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 truncate">Kosong</p>
                  <div className="flex items-baseline gap-1.5 sm:gap-2">
                    <p className="text-2xl sm:text-3xl font-black text-slate-800">1</p>
                    <p className="text-xs sm:text-sm font-medium text-slate-400 truncate">Meja</p>
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 xl:w-12 xl:h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 shrink-0 ml-2">
                  <span className="material-symbols-outlined text-[20px] sm:text-[22px] xl:text-[24px]">person_off</span>
                </div>
              </div>
            </section>
          )}

          {/* Multi-Jenjang Readiness & Quick Access Banner */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-sky-500 to-purple-600 text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5 sm:mt-0">
                <span className="material-symbols-outlined text-[22px]">school</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">Pusat CBT Multi-Jenjang Pendidikan</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">MI (Kelas 1-6)</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800 border border-sky-200 shrink-0">MTs (Kelas VII-IX)</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200 shrink-0">MA (Kelas X-XII)</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">Sistem terkonfigurasi untuk seluruh tingkat madrasah & sekolah umum dengan pemetaan kurikulum otomatis.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar shrink-0 flex-wrap sm:flex-nowrap">
              <Link
                href="/proctor/dashboard/classes"
                className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[16px]">meeting_room</span>
                Rombel Kelas
              </Link>
              <Link
                href="/proctor/dashboard/subjects"
                className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[16px]">menu_book</span>
                Mata Pelajaran
              </Link>
              <Link
                href="/proctor/dashboard/questions"
                className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[16px]">library_books</span>
                Bank Soal
              </Link>
            </div>
          </section>

          {/* ======================= MAIN CONTENT TWO COLS (ROLE DEPENDENT) ======================= */}
          {activeRoleView === "ADMIN" ? (
            <div className="flex flex-col xl:flex-row gap-8 items-start h-full pb-8">
              {/* LEFT: ADMIN SYSTEM CONTROL */}
              <div className="flex-1 w-full flex flex-col gap-6 min-w-0">
                {/* System Health Overview Card */}
                <div className="bg-white border border-purple-200 rounded-2xl p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-[22px]">dns</span>
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900">Pusat Layanan Infrastructure & Core DB</h2>
                        <p className="text-xs text-slate-500">Status koneksi PostgreSQL, Redis, dan Service Endpoint CBT</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Semua Layanan Normal
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">PostgreSQL DB</span>
                      <span className="text-sm font-black text-slate-800">Supabase Pooled</span>
                      <span className="text-[10px] font-bold text-emerald-600 mt-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Latensi 8ms
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Next.js App Server</span>
                      <span className="text-sm font-black text-slate-800">Vercel / Node v20</span>
                      <span className="text-[10px] font-bold text-emerald-600 mt-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Response 24ms
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Prisma ORM</span>
                      <span className="text-sm font-black text-slate-800">Connection Pool 10</span>
                      <span className="text-[10px] font-bold text-blue-600 mt-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Idle 8 / Active 2
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Session Storage</span>
                      <span className="text-sm font-black text-slate-800">JWT Token Auth</span>
                      <span className="text-[10px] font-bold text-purple-600 mt-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Strict Security
                      </span>
                    </div>
                  </div>
                </div>

                {/* User & Staff Accounts Overview */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Manajemen Hak Akses & Pengguna Staff</h3>
                      <p className="text-xs text-slate-500">Daftar akun administrator, guru, dan pengawas yang terdaftar</p>
                    </div>
                    <Link
                      href="/proctor/dashboard/users"
                      className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-xs"
                    >
                      Kelola Semua User
                    </Link>
                  </div>
                  <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/30 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-purple-700">Administrator Utama</span>
                        <p className="text-xl font-black text-slate-900 mt-1">2 Akun</p>
                      </div>
                      <span className="material-symbols-outlined text-[32px] text-purple-400">admin_panel_settings</span>
                    </div>
                    <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/30 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-amber-700">Guru Pengampu</span>
                        <p className="text-xl font-black text-slate-900 mt-1">6 Akun</p>
                      </div>
                      <span className="material-symbols-outlined text-[32px] text-amber-400">auto_stories</span>
                    </div>
                    <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-blue-700">Pengawas Ruangan</span>
                        <p className="text-xl font-black text-slate-900 mt-1">4 Akun</p>
                      </div>
                      <span className="material-symbols-outlined text-[32px] text-blue-400">shield</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: ADMIN QUICK ACTIONS */}
              <aside className="w-full xl:w-96 shrink-0 flex flex-col gap-6">
                <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                      <span className="material-symbols-outlined text-[22px]">tune</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">Pintasan Sistem Admin</h3>
                      <p className="text-xs text-slate-400">Konfigurasi Master Data</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/proctor/dashboard/semesters"
                      className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-between text-xs font-bold text-slate-200 border border-slate-700"
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-purple-400">calendar_month</span>
                        Master Tahun Ajaran & Semester
                      </span>
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </Link>
                    <Link
                      href="/proctor/dashboard/users"
                      className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-between text-xs font-bold text-slate-200 border border-slate-700"
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-purple-400">group_add</span>
                        Tambah Akun Staff Baru
                      </span>
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </Link>
                    <button
                      onClick={() => Alert.info("Backup Database", "Pencadangan file SQL Supabase berhasil dibuat.")}
                      className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-between text-xs font-bold text-slate-200 border border-slate-700 text-left"
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-emerald-400">cloud_download</span>
                        Backup Snapshot Database
                      </span>
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          ) : activeRoleView === "TEACHER" ? (
            <div className="flex flex-col xl:flex-row gap-8 items-start h-full pb-8">
              {/* LEFT: TEACHER QUESTION BANK OVERVIEW */}
              <div className="flex-1 w-full flex flex-col gap-6 min-w-0">
                <div className="bg-white border border-amber-200 rounded-2xl p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-[22px]">library_books</span>
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900">Distribusi Bank Soal per Mata Pelajaran</h2>
                        <p className="text-xs text-slate-500">Kelengkapan butir soal untuk ujian semester berjalan</p>
                      </div>
                    </div>
                    <Link
                      href="/proctor/dashboard/questions"
                      className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors shadow-xs"
                    >
                      Kelola Bank Soal
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-800">Penalaran Umum & Kuantitatif</span>
                        <span className="text-xs font-black text-amber-700">45 Soal</span>
                      </div>
                      <div className="w-full h-2 bg-amber-200/50 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-600 rounded-full" style={{ width: "90%" }}></div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-800">Literasi Bahasa Indonesia</span>
                        <span className="text-xs font-black text-blue-700">35 Soal</span>
                      </div>
                      <div className="w-full h-2 bg-blue-200/50 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: "85%" }}></div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-800">Literasi Bahasa Inggris</span>
                        <span className="text-xs font-black text-emerald-700">30 Soal</span>
                      </div>
                      <div className="w-full h-2 bg-emerald-200/50 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: "75%" }}></div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-800">Pengetahuan Matematika</span>
                        <span className="text-xs font-black text-purple-700">18 Soal</span>
                      </div>
                      <div className="w-full h-2 bg-purple-200/50 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600 rounded-full" style={{ width: "60%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: TEACHER ACTIONS */}
              <aside className="w-full xl:w-96 shrink-0 flex flex-col gap-6">
                <div className="bg-amber-700 text-white p-5 rounded-2xl shadow-xl flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[22px]">post_add</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">Pusat Aksi Guru</h3>
                      <p className="text-xs text-amber-100">Buat dan Impor Soal</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/proctor/dashboard/questions/create"
                      className="p-3 rounded-xl bg-amber-800 hover:bg-amber-900 transition-colors flex items-center justify-between text-xs font-bold text-white border border-amber-600"
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Buat Butir Soal Baru
                      </span>
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </Link>
                    <button
                      onClick={() => Alert.info("Format Excel", "Unduh templat Excel impor soal dari server.")}
                      className="p-3 rounded-xl bg-amber-800 hover:bg-amber-900 transition-colors flex items-center justify-between text-xs font-bold text-white border border-amber-600 text-left"
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        Download Format Template Excel
                      </span>
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          ) : (
            <div className="flex flex-col xl:flex-row gap-8 items-start h-full pb-8">
              
              {/* LEFT: WORKSTATION GRID */}
              <div className="flex-1 w-full flex flex-col gap-4 sm:gap-5 min-w-0">
                
                {/* Filter Toolbar */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-white p-1 sm:p-1.5 rounded-xl border border-slate-200 shadow-2xs w-full md:w-auto overflow-x-auto no-scrollbar">
                    <button className="px-3.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-semibold text-xs sm:text-sm whitespace-nowrap transition-colors">
                      Semua (40)
                    </button>
                    <button className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span> Atensi (2)
                    </button>
                    <button className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Lancar (38)
                    </button>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-between md:justify-end">
                    <div className="relative flex-1 sm:w-64 lg:w-72">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[19px] text-slate-400">search</span>
                      <input
                        type="text"
                        placeholder="Cari Peserta atau No PC..."
                        className="w-full pl-9.5 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs placeholder:text-slate-400"
                      />
                    </div>
                    <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-xs shrink-0">
                      <button className="p-1.5 sm:p-2 rounded-lg bg-slate-100 text-slate-800 shadow-xs" title="Tampilan Grid">
                        <span className="material-symbols-outlined text-[18px]">grid_view</span>
                      </button>
                      <button className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-slate-800 transition-colors" title="Tampilan List">
                        <span className="material-symbols-outlined text-[18px]">list</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Grid Legend & Board indicator */}
                <div className="flex items-center justify-between text-xs font-medium text-slate-500 px-1 flex-wrap gap-2">
                  <div className="flex items-center gap-2 bg-slate-200/50 px-3 py-1.5 rounded-lg border border-slate-200">
                    <span className="material-symbols-outlined text-[16px] text-slate-600">co_present</span>
                    <span className="uppercase tracking-wider font-bold text-[10px] sm:text-xs">Meja Pengawas (Depan)</span>
                  </div>
                <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Online</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Alert</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Offline</span>
                  </div>
                </div>                {/* The Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3.5 sm:gap-4">
                  
                  {/* Dynamic Database Students Loop */}
                  {((stats.studentsList && stats.studentsList.length > 0)
                    ? stats.studentsList
                    : [
                        { id: "std-mi01-001", name: "Fathir Muhammad", nisn: "25-3101-0982-101", classGroup: "Kelas 6-A Al-Farabi (MI 01)", isActive: true },
                        { id: "std-mi01-002", name: "Aisyah Nur Aini", nisn: "25-3101-0982-102", classGroup: "Kelas 6-A Al-Farabi (MI 01)", isActive: true },
                        { id: "std-mi01-003", name: "Bilal Al-Habasyi", nisn: "25-3101-0982-103", classGroup: "Kelas 3-B Al-Khawarizmi (MI 01)", isActive: true },
                      ]
                  ).map((st: any, idx: number) => {
                    const wsId = `WS-${String(idx + 1).padStart(3, "0")}`;
                    const unresolvedAlert = integrityLogs.find((l: any) => l.nisn === st.nisn && l.status === "UNRESOLVED");

                    if (unresolvedAlert) {
                      return (
                        <div key={st.id || idx} className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 shadow-md col-span-1 sm:col-span-2 flex flex-col relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-red-200/50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-red-300/50 transition-colors"></div>
                          
                          <div className="flex items-center justify-between mb-2 relative z-10">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold bg-red-600 text-white px-2 py-1 rounded-md border border-red-700 font-mono shadow-sm">
                                {unresolvedAlert.workstation || wsId}
                              </span>
                              <span className="text-[10px] font-bold bg-red-200 text-red-800 px-2 py-1 rounded-md uppercase tracking-wider animate-pulse flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">warning</span> Pelanggaran
                              </span>
                            </div>
                            <span className="text-[10px] font-medium text-red-500 bg-red-100 px-1.5 py-0.5 rounded border border-red-200">Terpantau</span>
                          </div>

                          <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-red-200/50 mt-1 relative z-10 flex-1 flex flex-col justify-center">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-[15px] font-bold text-slate-900">{st.name}</p>
                                <p className="text-[11px] font-semibold text-red-600 mt-1 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> {unresolvedAlert.description}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-[11px] font-bold text-slate-800 block">{st.classGroup}</span>
                                <span className="text-[10px] text-slate-500">NISN: {st.nisn}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-3 relative z-10">
                            <button
                              onClick={() => {
                                fetch("/api/proctor/integrity-logs", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ action: "ISSUE_WARNING", logId: unresolvedAlert.id }),
                                }).then(() => {
                                  Alert.success("Teguran Terkirim", `Peringatan diterbitkan ke layar ${st.name}`);
                                  setIntegrityLogs((prev) => prev.map((l) => l.id === unresolvedAlert.id ? { ...l, status: "RESOLVED" } : l));
                                });
                              }}
                              className="flex-1 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-[11px] font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all hover:bg-slate-50 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[14px]">notifications_active</span> Tegur
                            </button>
                            <button
                              onClick={() => {
                                fetch("/api/proctor/integrity-logs", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ action: "RESOLVE", logId: unresolvedAlert.id }),
                                }).then(() => {
                                  Alert.success("Diselesaikan", `Status anomali ${st.name} telah di-resolve.`);
                                  setIntegrityLogs((prev) => prev.map((l) => l.id === unresolvedAlert.id ? { ...l, status: "RESOLVED" } : l));
                                });
                              }}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[14px]">check_circle</span> Selesai
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={st.id || idx} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 flex flex-col group cursor-pointer">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded-md border border-slate-200 font-mono">
                              {wsId}
                            </span>
                            <span className={`w-2 h-2 rounded-full ${st.isActive ? "bg-emerald-500" : "bg-slate-300"}`}></span>
                          </div>
                          <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">8ms</span>
                        </div>
                        
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">{st.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 font-medium truncate">{st.classGroup || "MI"}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">NISN: {st.nisn}</p>
                        </div>

                        <div className="mt-4">
                          <div className="flex justify-between items-end mb-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Progress</span>
                            <span className="text-[11px] font-bold text-slate-700">80%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-1000 bg-emerald-500" style={{ width: "80%" }}></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* EMPTY SEATS TO SHOW CAPACITY */}
                  {[1, 2].map((n) => (
                    <div key={`empty-${n}`} className="bg-slate-50/50 border border-dashed border-slate-300 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-white hover:border-blue-300 transition-all cursor-pointer group">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">person_add</span>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 block mb-0.5">WS-00{n + 3}</span>
                        <span className="text-[10px] text-slate-400 font-medium">Meja Cadangan / Kiosk Bebas</span>
                      </div>
                    </div>
                  ))}

                </div>
              </div>

              {/* RIGHT: ACTIVITY & ACTIONS PANEL */}
              <aside className="w-full xl:w-84 2xl:w-96 shrink-0 flex flex-col gap-5 sm:gap-6">
                
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
                      <button onClick={handleBroadcast} className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer">
                        Siarkan <span className="material-symbols-outlined text-[14px]">send</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Activity Log from PostgreSQL */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-100">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-slate-400">history</span>
                      <h3 className="font-bold text-sm text-slate-800">Log Integritas ({stats.schoolName || "Madrasah"})</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> DB Live
                    </span>
                  </div>
                  
                  <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
                    {integrityLogs.length > 0 ? (
                      integrityLogs.map((log: any) => (
                        <div key={log.id} className="flex gap-3 relative">
                          <div className="w-px h-full bg-slate-200 absolute left-2.75 top-6"></div>
                          <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 z-10 mt-0.5 ${
                            log.severity === "CRITICAL"
                              ? "bg-red-100 border-red-200 text-red-600"
                              : log.severity === "WARNING"
                              ? "bg-amber-100 border-amber-200 text-amber-600"
                              : "bg-blue-100 border-blue-200 text-blue-600"
                          }`}>
                            <span className="material-symbols-outlined text-[12px]">
                              {log.severity === "CRITICAL" ? "warning" : log.severity === "WARNING" ? "info" : "shield"}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-2">
                              <p className="text-[13px] font-bold text-slate-800 truncate">{log.studentName}</p>
                              <span className="text-[10px] text-slate-400 font-medium shrink-0">{log.timestamp || "Baru saja"}</span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{log.description}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                log.status === "UNRESOLVED"
                                  ? "bg-red-50 text-red-700 border border-red-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}>
                                {log.status}
                              </span>
                              <span className="text-[10px] text-slate-400">{log.workstation || "PC-CBT"}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-400 text-xs flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-[32px] text-slate-300">verified_user</span>
                        <span>Seluruh workstation steril dan berjalan aman tanpa pelanggaran.</span>
                      </div>
                    )}
                  </div>
                </div>

              </aside>
            </div>
          )}  </div>
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
