"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/lib/sweetalert";

export default function LoginPage() {
  const router = useRouter();
  
  // States
  const [currentTime, setCurrentTime] = useState("");
  const [activeRole, setActiveRole] = useState<"student" | "proctor">("student");
  const [countdown, setCountdown] = useState(38 * 60 + 45); // 38 mins 45 secs
  const [isHelpdeskOpen, setIsHelpdeskOpen] = useState(false);
  
  // Form States
  const [nisn, setNisn] = useState("25-3101-0982-014");
  const [dob, setDob] = useState("2007-04-18");
  const [token, setToken] = useState("XK9PW2");
  const [studentEducationLevel, setStudentEducationLevel] = useState<string>("MA");
  const [proctorNip, setProctorNip] = useState("mulyono@cbt-app.sch.id");
  const [proctorPass, setProctorPass] = useState("password123");
  const [proctorLab, setProctorLab] = useState("lab-08");
  const [proctorEducationLevel, setProctorEducationLevel] = useState<string>("SEMUA");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  // Live Clock
  useEffect(() => {
    const updateWibClock = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${h}:${m}:${s} WIB`);
    };
    
    updateWibClock();
    const intervalId = setInterval(updateWibClock, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Countdown Timer
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  const formatCountdown = () => {
    const hours = Math.floor(countdown / 3600);
    const mins = Math.floor((countdown % 3600) / 60);
    const secs = countdown % 60;
    return {
      h: String(hours).padStart(2, '0'),
      m: String(mins).padStart(2, '0'),
      s: String(secs).padStart(2, '0')
    };
  };

  const { h: cH, m: cM, s: cS } = formatCountdown();
  const progressPercent = ((countdown) / (45 * 60)) * 100; // Assuming total 45 mins

  // Handlers
  const fillQuickToken = () => {
    setToken("XK9PW2");
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nisn || !dob || !token) {
      Alert.warning("Data Tidak Lengkap", "Mohon isi Nomor Peserta, Tanggal Lahir, dan Token Sesi Ujian.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "student",
          nisn,
          dob,
          token,
          educationLevel: studentEducationLevel,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitStatus("success");
        if (typeof window !== "undefined") {
          localStorage.setItem("cbt_education_level", data.data?.educationLevel || studentEducationLevel || "MA");
        }
        setTimeout(() => {
          Alert.success("Autentikasi Berhasil", `Selamat datang ${data.data.user.name}. Membuka ruang ujian...`).then(() => {
            router.push(data.data.redirectUrl || "/student/dashboard");
          });
        }, 500);
      } else {
        setSubmitStatus("error");
        Alert.error("Autentikasi Gagal", data.message || "Data login tidak sesuai");
      }
    } catch (err: any) {
      setSubmitStatus("error");
      Alert.error("Kesalahan Koneksi", err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!proctorNip || !proctorPass) {
      Alert.warning("Data Tidak Lengkap", "Mohon isi Username, Email, atau NIP dan Kata Sandi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "proctor",
          nip: proctorNip,
          password: proctorPass,
          labAllocation: proctorLab,
          educationLevel: proctorEducationLevel,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const effLevel = data.data?.educationLevel || data.data?.user?.educationLevel || proctorEducationLevel || "SEMUA";
        if (typeof window !== "undefined") {
          localStorage.setItem("cbt_education_level", effLevel);
          if (data.data?.user?.schoolName) {
            localStorage.setItem("cbt_school_name", data.data.user.schoolName);
          }
          if (data.data?.user?.schoolId) {
            localStorage.setItem("cbt_school_id", data.data.user.schoolId);
          }
        }
        Alert.success(
          "Login Berhasil",
          `Selamat datang ${data.data.user.name} • ${data.data.user.schoolName || "Madrasah Digital"}. Membuka Konsol...`
        ).then(() => {
          router.push(data.data.redirectUrl || "/proctor/dashboard");
        });
      } else {
        Alert.error("Autentikasi Gagal", data.message || "Username, Email, NIP, atau Kata Sandi salah");
      }
    } catch (err: any) {
      Alert.error("Kesalahan Koneksi", err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 font-body-default text-slate-800 antialiased selection:bg-blue-200 selection:text-blue-900 min-h-screen flex flex-col">
      {/* 1. Top Bar / App Header (Institutional Kemendikbudristek & BKN Standard) */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        {/* Main Institutional Row */}
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          {/* Institutional Identity */}
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Official Garuda / Government Crest Vector Emblem */}
            <div className="w-11 h-11 rounded-lg bg-primary-custom flex items-center justify-center text-white shadow-sm shrink-0 border border-blue-900/20">
              <svg className="w-7 h-7 fill-amber-300" viewBox="0 0 24 24">
                <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z"></path>
              </svg>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-primary-custom text-[15px] tracking-tight uppercase leading-none">
                  PORTAL RESMI CBT NASIONAL
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  STANDAR UTBK-SNBT / CAT BKN
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium truncate mt-1">
                Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi • Balai Pengelolaan Pengujian Pendidikan (BP3)
              </span>
            </div>
          </div>
          
          {/* Live Server Node, WIB Clock & Helpdesk Quick Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Live Node Indicator */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-slate-700 font-semibold text-[11px]">Node Server: SRV-JKT-04</span>
              <span className="text-slate-300">|</span>
              <span className="text-emerald-600 font-semibold text-[11px]">Online (Latensi 8ms)</span>
            </div>
            
            {/* Official WIB Active Clock */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-primary-custom">
              <span className="material-symbols-outlined text-[16px] text-blue-600">schedule</span>
              <span>{currentTime || "Memuat Waktu..."}</span>
            </div>
            
            {/* Panduan / Helpdesk Button */}
            <button
              onClick={() => setIsHelpdeskOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors border border-blue-200"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">help</span>
              <span className="hidden sm:inline">Panduan & Helpdesk</span>
              <span className="sm:hidden">Helpdesk</span>
            </button>
          </div>
        </div>

        {/* Security Compliance & Integrity Sub-bar */}
        <div className="w-full bg-[#0a0f1c] text-slate-300 py-1.5 px-4 sm:px-6 lg:px-8 text-[11px]">
          <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px] text-emerald-400">security</span>
              <span className="font-medium tracking-wide">Enkripsi Kriptografis AES-256 GCM</span>
              <span className="text-slate-600">•</span>
              <span className="hidden md:inline text-slate-400">Tersertifikasi ISO/IEC 27001 & Standar Keamanan Siber BSSN RI</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
              <span>SEC-HASH: <span className="text-white font-semibold">9A2F-CBT-2025</span></span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline text-emerald-400 font-semibold">KIOSK AGENT COMPLIANT</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 w-full bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-7xl w-full mx-auto">
          {/* Split-Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* LEFT COLUMN: Authentication Box & Kiosk Diagnostics (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Core Authentication Container */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex-1">
                
                {/* Segmented Role Selector */}
                <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 mb-8 border border-slate-200/50">
                  <button
                    onClick={() => setActiveRole("student")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm transition-all duration-200 ${
                      activeRole === "student"
                        ? "bg-white text-blue-700 shadow font-bold"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 font-semibold"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">badge</span>
                    <span>Peserta Ujian</span>
                    {activeRole === "student" && (
                      <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 tracking-wide">
                        KTPU Resmi
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveRole("proctor")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm transition-all duration-200 ${
                      activeRole === "proctor"
                        ? "bg-white text-blue-700 shadow font-bold"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 font-semibold"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                    <span>Proktor & Pengawas</span>
                  </button>
                </div>

                {/* Card Header Text */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <span className="material-symbols-outlined text-[24px]">verified_user</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                      Autentikasi {activeRole === "student" ? "Peserta Ujian" : "Konsol Proktor"}
                    </h1>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed pl-12">
                    {activeRole === "student" 
                      ? "Silakan masukkan nomor peserta ujian pada KTPU dan token sesi resmi dari pengawas ruangan."
                      : "Masukkan kredensial keamanan pengawas untuk mengakses dashboard kontrol laboratorium."
                    }
                  </p>
                </div>

                {/* TAB 1: Peserta Form */}
                {activeRole === "student" && (
                  <form className="flex flex-col gap-5 pl-0 sm:pl-12" onSubmit={handleStudentSubmit}>
                    {/* 1) Nomor Peserta / NISN */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5" htmlFor="input-nisn">
                          <span>Nomor Peserta Ujian / NISN</span>
                          <span className="text-red-500 font-bold">*</span>
                        </label>
                        <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono font-medium">
                          12 atau 14 digit
                        </span>
                      </div>
                      <div className="relative flex items-center rounded-xl border border-[#cbd5e1] bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all shadow-sm overflow-hidden">
                        <div className="w-12 h-full flex items-center justify-center bg-slate-50 border-r border-slate-200 shrink-0">
                          <span className="material-symbols-outlined text-slate-400 text-[20px]">id_card</span>
                        </div>
                        <input
                          className="w-full bg-transparent px-4 py-3 text-sm font-mono font-bold text-slate-900 outline-none placeholder:text-[#94a3b8] placeholder:font-[400]"
                          id="input-nisn"
                          placeholder="Contoh: 25-3101-0982-014"
                          required
                          type="text"
                          value={nisn}
                          onChange={(e) => setNisn(e.target.value)}
                        />
                        {nisn && (
                          <button
                            className="mr-3 text-slate-400 hover:text-slate-600 transition-colors"
                            onClick={() => setNisn("")}
                            title="Hapus input"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[18px]">cancel</span>
                          </button>
                        )}
                      </div>

                      {/* Quick Student Login Shortcuts */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="text-[11px] text-slate-400 font-medium">Contoh Login Siswa:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setNisn("25-3101-0982-101");
                            setDob("2012-05-14");
                            setToken("XK9PW2");
                            setStudentEducationLevel("MI");
                          }}
                          className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded transition-colors cursor-pointer"
                        >
                          Siswa MI (Kelas 6)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNisn("25-3101-0982-201");
                            setDob("2009-11-20");
                            setToken("XK9PW2");
                            setStudentEducationLevel("MTS");
                          }}
                          className="text-[10px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2 py-0.5 rounded transition-colors cursor-pointer"
                        >
                          Siswa MTs (Kelas IX)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNisn("25-3101-0982-014");
                            setDob("2007-04-18");
                            setToken("XK9PW2");
                            setStudentEducationLevel("MA");
                          }}
                          className="text-[10px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2 py-0.5 rounded transition-colors cursor-pointer"
                        >
                          Siswa MA (Kelas XII)
                        </button>
                      </div>
                    </div>

                    {/* 2) Tanggal Lahir */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5" htmlFor="input-dob">
                          <span>Tanggal Lahir Peserta</span>
                          <span className="text-red-500 font-bold">*</span>
                        </label>
                      </div>
                      <div className="relative flex items-center rounded-xl border border-[#cbd5e1] bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all shadow-sm overflow-hidden">
                        <div className="w-12 h-full flex items-center justify-center bg-slate-50 border-r border-slate-200 shrink-0">
                          <span className="material-symbols-outlined text-slate-400 text-[20px]">calendar_month</span>
                        </div>
                        <input
                          className="w-full bg-transparent px-4 py-3 text-sm font-medium text-slate-900 outline-none"
                          id="input-dob"
                          required
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* 3) Token Sesi Ujian */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5" htmlFor="input-token">
                          <span>Token Sesi Ujian (6 Karakter)</span>
                          <span className="text-red-500 font-bold">*</span>
                        </label>
                        <button
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition-colors"
                          onClick={fillQuickToken}
                          type="button"
                        >
                          Isi Token Demo: <code className="font-mono bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 ml-1">XK9PW2</code>
                        </button>
                      </div>
                      <div className="relative flex items-center rounded-xl border-2 border-blue-500 bg-[#eff6ff]/30 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/20 transition-all shadow-sm overflow-hidden group">
                        <div className="w-12 h-full flex items-center justify-center bg-[#eff6ff] border-r border-blue-200 shrink-0 group-focus-within:bg-blue-100 transition-colors">
                          <span className="material-symbols-outlined text-blue-600 text-[22px]">vpn_key</span>
                        </div>
                        <input
                          className="w-full bg-transparent px-4 py-3 text-xl sm:text-2xl font-mono font-black tracking-[0.25em] text-slate-900 uppercase outline-none placeholder:text-[#cbd5e1] placeholder:font-[400] placeholder:tracking-[0em]"
                          id="input-token"
                          maxLength={6}
                          placeholder="CONTOH: XK9PW2"
                          required
                          type="text"
                          value={token}
                          onChange={(e) => setToken(e.target.value.toUpperCase())}
                        />
                        {token.length === 6 && (
                          <div className="mr-3 shrink-0 animate-in fade-in zoom-in duration-300">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-bold tracking-wide shadow-sm">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>
                              <span className="hidden sm:inline">VALIDASI SUKSES</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <button
                        className="w-full bg-[#1d4ed8] hover:bg-blue-800 active:bg-blue-900 disabled:opacity-70 text-white font-bold text-base py-4 px-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group overflow-hidden relative"
                        disabled={isSubmitting || submitStatus === "success"}
                        type="submit"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                            <span>Memvalidasi Integritas Kiosk...</span>
                          </>
                        ) : submitStatus === "success" ? (
                          <>
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                            <span>Kredensial Sah. Membuka Ruang Ujian...</span>
                          </>
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <span className="relative z-10">Verifikasi & Masuk Ruang Ujian</span>
                            <span className="material-symbols-outlined text-[20px] relative z-10 transition-transform group-hover:translate-x-1">arrow_forward</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* TAB 2: Proctor Form */}
                {activeRole === "proctor" && (
                  <form className="flex flex-col gap-5 pl-0 sm:pl-12" onSubmit={handleProctorSubmit}>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-slate-800" htmlFor="proctor-nip">
                          Username / Email / NIP Staf
                        </label>
                        <span className="text-[11px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
                          NIP / Email / Nama
                        </span>
                      </div>
                      <div className="relative flex items-center rounded-xl border border-[#cbd5e1] bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all shadow-sm overflow-hidden">
                        <div className="w-12 h-full flex items-center justify-center bg-slate-50 border-r border-slate-200 shrink-0">
                          <span className="material-symbols-outlined text-slate-400 text-[20px]">account_circle</span>
                        </div>
                        <input
                          className="w-full bg-transparent px-4 py-3 text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal"
                          id="proctor-nip"
                          required
                          type="text"
                          value={proctorNip}
                          onChange={(e) => setProctorNip(e.target.value)}
                          placeholder="Email (mulyono@cbt-app.sch.id) atau NIP (19840212...)"
                        />
                      </div>

                      {/* Quick Shortcut Pills */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="text-[11px] text-slate-400 font-medium">Pilih Akun Madrasah:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setProctorNip("proktor.mi01@bustanulhuda.sch.id");
                            setProctorPass("password123");
                            setProctorEducationLevel("MI");
                            setProctorLab("Lab CBT MI 01");
                          }}
                          className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded transition-colors cursor-pointer"
                        >
                          MI Bustanul Huda 01 (MI)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setProctorNip("proktor.mi02@bustanulhuda.sch.id");
                            setProctorPass("password123");
                            setProctorEducationLevel("MI");
                            setProctorLab("Lab Komputer MI 02");
                          }}
                          className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded transition-colors cursor-pointer"
                        >
                          MI Bustanul Huda 02 (MI)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setProctorNip("proktor.mts@bustanulhuda.sch.id");
                            setProctorPass("password123");
                            setProctorEducationLevel("MTS");
                            setProctorLab("Lab CAT MTs Lt. 2");
                          }}
                          className="text-[10px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-300 px-2 py-0.5 rounded transition-colors cursor-pointer"
                        >
                          MTS Bustanul Huda (MTs)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setProctorNip("proktor.ma@bustanulhuda.sch.id");
                            setProctorPass("password123");
                            setProctorEducationLevel("MA");
                            setProctorLab("Lab CAT MA-01");
                          }}
                          className="text-[10px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-300 px-2 py-0.5 rounded transition-colors cursor-pointer"
                        >
                          MA Bustanul Huda (MA)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setProctorNip("admin@cbt-app.sch.id");
                            setProctorPass("adminpassword");
                            setProctorEducationLevel("SEMUA");
                            setProctorLab("Pusat Kontrol Utama");
                          }}
                          className="text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-2 py-0.5 rounded transition-colors cursor-pointer"
                        >
                          Admin Pusat (Semua)
                        </button>
                      </div>
                    </div>

                    {/* Lingkup Jenjang Pendidikan Switcher on Login */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                          <span>Lingkup Jenjang Pendidikan</span>
                          <span className="text-red-500 font-bold">*</span>
                        </label>
                        <span className="text-[10px] text-blue-600 font-bold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                          Multi-Jenjang
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { key: "SEMUA", label: "Semua", sub: "MI, MTs, MA", icon: "domain", cls: "border-blue-400 bg-blue-50/80 text-blue-700 ring-2 ring-blue-500/20" },
                          { key: "MI", label: "MI", sub: "Kelas 1 - 6", icon: "child_care", cls: "border-emerald-400 bg-emerald-50/80 text-emerald-700 ring-2 ring-emerald-500/20" },
                          { key: "MTS", label: "MTs", sub: "Kelas VII - IX", icon: "school", cls: "border-sky-400 bg-sky-50/80 text-sky-700 ring-2 ring-sky-500/20" },
                          { key: "MA", label: "MA / SMA", sub: "Kelas X - XII", icon: "account_balance", cls: "border-purple-400 bg-purple-50/80 text-purple-700 ring-2 ring-purple-500/20" },
                        ].map((j) => {
                          const isSelected = proctorEducationLevel === j.key;
                          return (
                            <button
                              key={j.key}
                              type="button"
                              onClick={() => setProctorEducationLevel(j.key)}
                              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center relative overflow-hidden ${
                                isSelected
                                  ? `${j.cls} shadow-xs font-bold`
                                  : "border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-600 font-medium"
                              }`}
                            >
                              <span className="material-symbols-outlined text-[18px] mb-0.5">{j.icon}</span>
                              <span className="text-xs font-bold leading-tight">{j.label}</span>
                              <span className="text-[10px] text-slate-400 font-medium mt-0.5">{j.sub}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-800" htmlFor="proctor-pass">Kata Sandi / Private Key</label>
                      <div className="relative flex items-center rounded-xl border border-[#cbd5e1] bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all shadow-sm overflow-hidden">
                        <div className="w-12 h-full flex items-center justify-center bg-slate-50 border-r border-slate-200 shrink-0">
                          <span className="material-symbols-outlined text-slate-400 text-[20px]">key</span>
                        </div>
                        <input
                          className="w-full bg-transparent px-4 py-3 text-sm font-bold text-slate-900 outline-none"
                          id="proctor-pass"
                          required
                          type="password"
                          value={proctorPass}
                          onChange={(e) => setProctorPass(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-800" htmlFor="proctor-lab-select">Alokasi Laboratorium CBT</label>
                      <div className="relative flex items-center rounded-xl border border-[#cbd5e1] bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all shadow-sm overflow-hidden">
                        <div className="w-12 h-full flex items-center justify-center bg-slate-50 border-r border-slate-200 shrink-0">
                          <span className="material-symbols-outlined text-slate-400 text-[20px]">meeting_room</span>
                        </div>
                        <select
                          className="w-full bg-transparent px-4 py-3 text-sm font-medium text-slate-900 outline-none cursor-pointer"
                          id="proctor-lab-select"
                          value={proctorLab}
                          onChange={(e) => setProctorLab(e.target.value)}
                        >
                          <option value="lab-08">Lab CBT-08 (Gedung B Lt. 3) - 40 Klien Peserta</option>
                          <option value="lab-01">Lab CAT-01 (Gedung Rektorat Lt. 1) - 60 Klien</option>
                          <option value="lab-02">Lab Cadangan Kritis (Server Mandiri 03)</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                      <button
                        className="w-full bg-[#0a0f1c] hover:bg-slate-800 text-white font-bold text-base py-4 px-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                        type="submit"
                      >
                        <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                        <span>Masuk Konsol Pengawas Ruang</span>
                      </button>

                      {/* Register School Link Banner */}
                      <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/90 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-blue-600 text-[24px]">domain_add</span>
                          <div className="flex flex-col">
                            <span className="font-extrabold text-xs text-blue-950">
                              Lembaga / Madrasah Baru?
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Daftarkan madrasah & akun proktor untuk ruangan mandiri.
                            </span>
                          </div>
                        </div>
                        <a
                          href="/register"
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 flex items-center gap-1"
                        >
                          <span>Daftar Sekarang</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </a>
                      </div>
                    </div>
                  </form>
                )}

              </div>

              {/* Hardware Diagnostic */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                    <span className="material-symbols-outlined text-emerald-500 text-[16px]">monitor_heart</span>
                    Diagnostik Kesiapan Kiosk & Hardware
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    3 / 3 Lolos Uji
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Cam / Face */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-start gap-2">
                    <span className="material-symbols-outlined text-emerald-500 text-[18px] shrink-0">check_circle</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-800 truncate">Kamera Pengawas</span>
                      <span className="text-[10px] text-emerald-600 font-medium">Terdeteksi & Siap (HD)</span>
                    </div>
                  </div>
                  {/* Safe Exam */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-start gap-2">
                    <span className="material-symbols-outlined text-emerald-500 text-[18px] shrink-0">security</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-800 truncate">Browser Lock</span>
                      <span className="text-[10px] text-emerald-600 font-medium">Mode Kiosk Aktif</span>
                    </div>
                  </div>
                  {/* Latency */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-start gap-2">
                    <span className="material-symbols-outlined text-emerald-500 text-[18px] shrink-0">wifi_tethering</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-800 truncate">Latensi Jaringan</span>
                      <span className="text-[10px] text-emerald-600 font-medium">8ms (Sangat Stabil)</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Session Information & Official Integrity Protocol (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* 1) Session Schedule Card (Dark Slate/Navy Container) */}
              <div className="bg-linear-to-br from-primary-custom via-[#001f5c] to-[#0a0f1c] text-white rounded-2xl shadow-xl shadow-blue-900/10 border border-blue-900 p-6 sm:p-8 relative overflow-hidden flex-1 flex flex-col">
                
                {/* Subtle background accent glow */}
                <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-blue-500 opacity-20 blur-3xl pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-75 h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
                
                {/* Header Badge & Date */}
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-xs font-bold tracking-wide text-white backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                    </span>
                    <span>SESI UJIAN AKTIF SAAT INI</span>
                  </div>
                  <span className="text-xs font-mono text-blue-200 font-medium">14 MEI 2025</span>
                </div>
                
                {/* Title & Subtitle */}
                <div className="relative z-10 mb-8">
                  <h2 className="text-2xl font-bold text-white tracking-tight leading-snug mb-2">
                    Sesi 1: Tes Potensi Skolastik (TPS) & Literasi
                  </h2>
                  <p className="text-sm text-blue-200 leading-relaxed opacity-90">
                    Gelombang 1 • Subtes: Penalaran Umum, Pengetahuan Kuantitatif, PBM, Literasi Bahasa Indonesia & Inggris.
                  </p>
                </div>

                {/* Countdown Timer Block */}
                <div className="mt-auto p-5 rounded-xl bg-black/20 border border-white/10 backdrop-blur-md flex flex-col gap-3 relative z-10">
                  <div className="flex items-center justify-between text-xs text-blue-200">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="material-symbols-outlined text-[16px] text-amber-400">alarm</span>
                      Pintu Ujian Ditutup Dalam:
                    </span>
                    <span className="text-[11px] font-bold text-amber-400 tracking-wide uppercase bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">TOLERANSI 15 MENIT</span>
                  </div>
                  
                  <div className="flex items-baseline justify-center gap-3 py-2 font-mono text-white">
                    <div className="flex flex-col items-center">
                      <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">{cH}</span>
                      <span className="text-[10px] uppercase tracking-widest text-blue-300 mt-1">JAM</span>
                    </div>
                    <span className="text-4xl sm:text-5xl font-extrabold text-blue-400 opacity-50 pb-4">:</span>
                    <div className="flex flex-col items-center">
                      <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">{cM}</span>
                      <span className="text-[10px] uppercase tracking-widest text-blue-300 mt-1">MENIT</span>
                    </div>
                    <span className="text-4xl sm:text-5xl font-extrabold text-blue-400 opacity-50 pb-4">:</span>
                    <div className="flex flex-col items-center">
                      <span className="text-4xl sm:text-5xl font-extrabold text-amber-400 tracking-tight">{cS}</span>
                      <span className="text-[10px] uppercase tracking-widest text-blue-300 mt-1">DETIK</span>
                    </div>
                  </div>
                  
                  {/* Mini Progress Meter */}
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-2">
                    <div className="bg-amber-400 h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                </div>
                
                {/* Room & Seat Allocation Info Pill */}
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs relative z-10">
                  <div className="flex items-center gap-1.5 text-white font-semibold">
                    <span className="material-symbols-outlined text-[16px] text-blue-300">meeting_room</span>
                    <span>Ruang: Lab CBT-08</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono px-3 py-1 rounded-lg bg-white/10 text-amber-400 font-bold border border-white/10">
                    <span className="material-symbols-outlined text-[16px]">desktop_windows</span>
                    <span>Meja: WS-014</span>
                  </div>
                </div>
              </div>
              
              {/* 2) Tata Tertib & Protokol Integritas Resmi Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="material-symbols-outlined text-blue-600 text-[22px]">policy</span>
                  <h3 className="text-base font-bold text-slate-800">Protokol Integritas & Tata Tertib</h3>
                </div>
                
                {/* Protocol Items */}
                <div className="flex flex-col gap-4">
                  {/* Item 1 */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5 border border-red-200">
                      <span className="material-symbols-outlined text-[16px]">lock_clock</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h4 className="text-sm font-bold text-slate-800">Pencegahan Kecurangan (Kiosk AI)</h4>
                      <p className="text-[13px] text-slate-500 leading-relaxed mt-0.5">
                        Dilarang menekan Alt+Tab atau membuka aplikasi lain. Sistem akan otomatis mematikan lembar ujian jika kursor keluar area.
                      </p>
                    </div>
                  </div>
                  
                  {/* Item 2 */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                      <span className="material-symbols-outlined text-[16px]">face</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h4 className="text-sm font-bold text-slate-800">Verifikasi Biometrik Wajah</h4>
                      <p className="text-[13px] text-slate-500 leading-relaxed mt-0.5">
                        Wajah wajib berada di area pandang kamera secara berkesinambungan tanpa penghalang masker/topi.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Help & Technical Support Bar */}
                <div className="mt-2 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-medium">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-blue-600">support_agent</span>
                      Hotline: <strong className="text-slate-800">Ext. 204</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">dns</span>
                      Teknisi: <strong className="text-slate-800">Standby</strong>
                    </span>
                  </div>
                  <button 
                    onClick={() => setIsHelpdeskOpen(true)}
                    className="text-blue-600 font-bold hover:underline flex items-center gap-1 self-start sm:self-auto"
                  >
                    Bantuan <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* 3. Institutional Footer */}
      <footer className="w-full bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3 text-center md:text-left">
            <span className="font-medium">
              Hak Cipta © {new Date().getFullYear()} <strong>Balai Pengelolaan Pengujian Pendidikan (BP3)</strong> • Kemendikbudristek RI
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-[10px]">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700 font-semibold">
              <span className="material-symbols-outlined text-[14px] text-blue-600">verified</span>
              ISO/IEC 27001
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700 font-semibold">
              <span className="material-symbols-outlined text-[14px] text-emerald-600">shield</span>
              BSSN Standard
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700 font-semibold">
              <span className="material-symbols-outlined text-[14px] text-slate-600">terminal</span>
              SEB v4.8
            </span>
          </div>
        </div>
      </footer>

      {/* Helpdesk Support Modal Dialog */}
      {isHelpdeskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl border border-slate-200 p-6 flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <span className="material-symbols-outlined text-[24px]">contact_support</span>
                </div>
                <div className="flex flex-col">
                  <h3 className="font-bold text-slate-900 text-lg">Pusat Bantuan & Panduan</h3>
                  <span className="text-xs text-slate-500 font-medium">Layanan Tanggap Cepat Ujian Nasional</span>
                </div>
              </div>
              <button 
                onClick={() => setIsHelpdeskOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors" 
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="flex flex-col gap-3 text-[13px] leading-relaxed text-slate-700">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1 text-sm">1. Kapan Token Sesi Ujian Dirilis?</span>
                <p className="text-slate-600">Token ujian terdiri dari 6 karakter kapital dan hanya akan diumumkan oleh Pengawas Ruang (Proktor) pada layar LCD/papan tulis tepat 10 menit sebelum subtes dimulai.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1 text-sm">2. Nomor Peserta Tidak Ditemukan?</span>
                <p className="text-slate-600">Pastikan format penulisan nomor sesuai dengan lembar cetak KTPU (contoh: 25-3101-0982-014). Jika gagal, hubungi Helpdesk Ruangan.</p>
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setIsHelpdeskOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm transition-colors shadow-sm" 
                type="button"
              >
                Saya Mengerti, Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
