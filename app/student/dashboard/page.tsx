"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/lib/sweetalert";
import Link from "next/link";
import Image from "next/image";

export default function StudentDashboardPage() {
  const router = useRouter();

  // State Management
  const [time, setTime] = useState<string>("00:00:00");
  const [rules, setRules] = useState([true, true, true, true]); // Defaults to checked based on HTML reference
  const [token, setToken] = useState("XK9PW2");

  // Device Status States
  const [camStatus, setCamStatus] = useState<"untested" | "testing" | "active" | "error">("untested");
  const [netStatus, setNetStatus] = useState<"untested" | "testing" | "active" | "error">("untested");
  const [netLatency, setNetLatency] = useState<number>(0);

  // Clock Synchronization Simulation
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      setTime(`${h}:${m}:${s}`);
    };
    
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleRule = (index: number) => {
    const newRules = [...rules];
    newRules[index] = !newRules[index];
    setRules(newRules);
  };

  const handleAudioTest = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 chime
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
      Alert.success("Audio Berfungsi", "Sinyal Audio Berfungsi Normal. Pastikan earphone/speaker Anda terdengar jelas.");
    } catch (e) {
      Alert.success("Audio Siap", "Perangkat audio aktif. Siap digunakan.");
    }
  };

  const handleCameraTest = async () => {
    setCamStatus("testing");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop tracks immediately after getting permission to turn off the camera light
      stream.getTracks().forEach(track => track.stop());
      setCamStatus("active");
      Alert.success("Kamera Terdeteksi", "Akses kamera pengawas (webcam) berhasil diberikan.");
    } catch (err) {
      setCamStatus("error");
      Alert.error("Kamera Gagal", "Pastikan browser memiliki izin mengakses kamera Anda.");
    }
  };

  const handleNetworkTest = () => {
    setNetStatus("testing");
    const startTime = performance.now();
    
    // Simulate a ping by fetching a tiny resource (or just a timeout simulation)
    fetch("/favicon.ico", { cache: "no-store", method: "HEAD" })
      .then(() => {
        const latency = Math.round(performance.now() - startTime);
        setNetLatency(latency);
        setNetStatus("active");
      })
      .catch(() => {
        // Fallback simulation if fetch fails due to routing
        setTimeout(() => {
          setNetLatency(Math.floor(Math.random() * 20) + 12); // random 12-32ms
          setNetStatus("active");
        }, 500);
      });
  };

  const handleStartExam = () => {
    const allAgreed = rules.every((r) => r);
    if (!allAgreed) {
      Alert.error("Peringatan", "Anda wajib menyetujui seluruh Tata Tertib Ujian CAT sebelum memulai.");
      return;
    }

    if (token !== "XK9PW2") {
      Alert.error("Akses Ditolak", "Token ujian tidak valid atau belum dirilis oleh pengawas ruangan.");
      return;
    }

    Alert.success("Verifikasi Berhasil", "Menginisialisasi modul ujian (Kiosk Mode)...").then(() => {
      // Attempt fullscreen in real app, then navigate
      try {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } catch (e) {}
      
      router.push("/exam");
    });
  };

  return (
    <div className="bg-slate-50 font-sans text-slate-800 antialiased min-h-screen selection:bg-blue-200 selection:text-blue-900 flex flex-col">
      {/* 1. HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-slate-200">
        <div className="h-16 w-full px-4 md:px-8 flex items-center justify-between gap-4">
          
          {/* Logo & Identity */}
          <div className="flex items-center gap-4 min-w-0 shrink-0">
            <div className="w-10 h-10 rounded bg-blue-700 flex items-center justify-center shadow-inner text-white">
              <span className="material-symbols-outlined text-[24px]">school</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-blue-800 uppercase tracking-tight text-base leading-tight">CBT Mandiri Portal</span>
              <span className="text-xs text-slate-500 font-medium">Balai Pengelolaan Pengujian Pendidikan</span>
            </div>
            <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold ml-2">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>UTBK - SNBT 2025 / CAT Resmi</span>
            </div>
          </div>

          {/* Center Navigation */}
          <div className="flex-1 max-w-xl text-center px-3 hidden lg:block">
            <div className="text-sm text-slate-800 font-bold truncate tracking-wide">SIMULASI TES POTENSI SKOLASTIK (TPS) - GELOMBANG 1</div>
            <nav className="flex items-center justify-center gap-6 mt-1 text-xs">
              <Link href="#" className="font-bold text-blue-700 border-b-2 border-blue-700 pb-1">Dashboard</Link>
              <Link href="#" className="text-slate-500 hover:text-slate-800 transition-colors pb-1">Lembar Ujian</Link>
              <Link href="#" className="text-slate-500 hover:text-slate-800 transition-colors pb-1">Status & Konfirmasi</Link>
              <Link href="#" className="text-slate-500 hover:text-slate-800 transition-colors pb-1">Hasil & Skor</Link>
            </nav>
          </div>

          {/* Connection & Profile */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-800">TERHUBUNG (SERVER-JKT-04)</span>
            </div>
            <div className="flex items-center gap-1 text-slate-600">
              <button onClick={handleAudioTest} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" title="Audio Setting">
                <span className="material-symbols-outlined text-[20px]">volume_up</span>
              </button>
              <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" title="Fullscreen">
                <span className="material-symbols-outlined text-[20px]">fullscreen</span>
              </button>
            </div>
            <div className="h-7 w-[1px] bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-3 pl-1">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm text-slate-800 font-bold leading-tight">Ahmad Fauzi Pratama</span>
                <span className="text-xs text-slate-500 font-mono tracking-wide">No: 24-3101-0982-014</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-blue-200 flex items-center justify-center overflow-hidden">
                <span className="material-symbols-outlined text-slate-500 text-[24px]">person</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT */}
      <main className="w-full pt-20 pb-8 flex-1">
        <div className="w-full px-4 md:px-8 max-w-7xl mx-auto space-y-6">
          
          {/* Top Banner (Welcome & Clock) */}
          <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-blue-600/5 blur-2xl pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100">
                    <span className="material-symbols-outlined text-[14px]">terminal</span>
                    RUANG VERIFIKASI RESMI
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-800 font-bold text-xs bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    SINKRONISASI SERVER SELESAI
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl text-slate-900 tracking-tight font-black">
                  Selamat Datang di Portal Ujian Berbasis Komputer Resmi
                </h1>
                <p className="text-sm md:text-base text-slate-500 font-medium">
                  Pusat Asesmen Pendidikan Mandiri • Standar CAT Nasional BKN / SNPMB BPPP 2025
                </p>
              </div>
              <div className="flex items-center gap-4 self-start md:self-center shrink-0 bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-inner">
                <div className="flex flex-col text-right px-2">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Waktu Server (WIB)</span>
                  <span className="font-mono text-2xl leading-none text-blue-700 font-black tracking-tight">{time}</span>
                </div>
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">schedule</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: Verification & Devices */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Participant Data */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-300"></div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-[22px]">badge</span>
                    <h2 className="text-base text-slate-800 font-bold">Data Peserta Ujian</h2>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-1 rounded uppercase tracking-wider">
                    Terverifikasi
                  </span>
                </div>

                <div className="flex flex-col items-center text-center pb-6">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-100 shadow-md border border-slate-200 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[64px] text-slate-300">face</span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-sm">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 font-semibold mt-4 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">Biometrik Wajah Cocok (98.4%)</span>
                </div>

                <div className="space-y-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap Siswa</span>
                    <span className="text-base text-blue-900 font-bold">Ahmad Fauzi Pratama</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nomor Peserta</span>
                      <span className="text-xs font-mono font-bold text-slate-700">24-3101-0982-014</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">NISN / NIK</span>
                      <span className="text-xs font-mono font-bold text-slate-700">0054819201</span>
                    </div>
                  </div>
                  <div className="flex flex-col pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Asal Sekolah</span>
                    <span className="text-sm font-semibold text-slate-700">SMAN 1 Jakarta</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ruang Ujian</span>
                      <span className="text-xs font-bold text-blue-700">Lab Komputer CBT-B</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alokasi Sesi</span>
                      <span className="text-xs font-bold text-slate-700">Sesi 2 (Siang)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between text-slate-500 bg-slate-50 px-3 py-2 rounded-lg text-xs font-mono border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">dns</span>
                    <span>WS-CAT-042</span>
                  </div>
                  <span className="font-semibold text-blue-700">IP: 192.168.10.42</span>
                </div>
              </div>

              {/* Device Readiness */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-[20px]">devices</span>
                    <span className="text-base text-slate-800 font-bold">Status Perangkat</span>
                  </div>
                  <button onClick={handleAudioTest} className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">volume_up</span>
                    Cek Audio
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-slate-400">videocam</span>
                      <span className="text-xs font-semibold text-slate-700">Kamera Pengawas</span>
                    </div>
                    {camStatus === "untested" && (
                      <button onClick={handleCameraTest} className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold uppercase transition-colors">
                        Minta Izin
                      </button>
                    )}
                    {camStatus === "testing" && <span className="text-xs font-bold text-amber-500 animate-pulse">MEMERIKSA...</span>}
                    {camStatus === "active" && <span className="text-xs font-bold text-emerald-600">AKTIF</span>}
                    {camStatus === "error" && <span className="text-xs font-bold text-red-500">DITOLAK</span>}
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-slate-400">speed</span>
                      <span className="text-xs font-semibold text-slate-700">Latensi Jaringan</span>
                    </div>
                    {netStatus === "untested" && (
                      <button onClick={handleNetworkTest} className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold uppercase transition-colors">
                        Cek Sinyal
                      </button>
                    )}
                    {netStatus === "testing" && <span className="text-xs font-bold text-amber-500 animate-pulse">PING...</span>}
                    {netStatus === "active" && (
                      <span className={`text-xs font-bold ${netLatency < 50 ? 'text-emerald-600' : netLatency < 100 ? 'text-amber-500' : 'text-red-500'}`}>
                        {netLatency} ms ({netLatency < 50 ? 'Baik' : 'Cukup'})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-slate-400">lock</span>
                      <span className="text-xs font-semibold text-slate-700">Keamanan Kiosk</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600">TERKUNCI</span>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Exam Package, Rules & Token */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Active Exam Overview */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paket Soal Aktif</span>
                    <h2 className="text-xl md:text-2xl text-slate-900 font-black mt-1">Simulasi Tes Potensi Skolastik (TPS) 2025</h2>
                  </div>
                  <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl shrink-0">
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Beban Pengerjaan</span>
                      <span className="text-sm text-blue-800 font-black">95 Soal • 105 Menit</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-6 font-medium">
                  Ujian ini terdiri atas 4 sub-tes terintegrasi dengan timer otomatis per bagian. Sistem akan berpindah secara sekuensial setelah waktu sub-tes berakhir.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { title: "Penalaran Umum", desc: "30 Soal Pilihan Ganda", time: "30 Menit" },
                    { title: "Pengetahuan Kuantitatif", desc: "15 Soal Numerik", time: "20 Menit" },
                    { title: "Pemahaman Bacaan & Menulis", desc: "20 Soal Wacana", time: "25 Menit" },
                    { title: "Literasi B. Indonesia & Inggris", desc: "30 Soal Literasi Terpadu", time: "30 Menit" }
                  ].map((test, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm text-slate-800 font-bold truncate">{test.title}</span>
                          <span className="text-[11px] text-slate-500 font-medium">{test.desc}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-white text-slate-600 border border-slate-200 px-2 py-1 rounded-md shrink-0">
                        {test.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules Checklist */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-red-500 text-[22px]">fact_check</span>
                  <h3 className="text-lg text-slate-800 font-bold">Tata Tertib & Pakta Integritas Ujian CAT</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { title: "Wajib Berada di Depan Kamera Pengawas", desc: "Wajah peserta harus selalu terlihat jelas di kamera webcam sepanjang 105 menit ujian berlangsung." },
                    { title: "Dilarang Membuka Tab Baru atau Aplikasi Lain", desc: "Kombinasi Alt+Tab, tombol Windows, dan shortcut keluar aplikasi dinonaktifkan oleh modul kiosk browser." },
                    { title: "Sistem Auto-Lock Bila Fokus Layar Hilang", desc: "Kehilangan fokus kursor sebanyak 3 kali akan mengunci lembar soal dan memerlukan otorisasi token proktor." },
                    { title: "Autosave Lembar Jawaban Berkala", desc: "Setiap opsi yang dipilih tersimpan secara otomatis ke kluster database pusat tiap 5 detik tanpa jeda manual." }
                  ].map((rule, idx) => (
                    <label key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all group">
                      <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                        <input 
                          type="checkbox" 
                          className="peer sr-only"
                          checked={rules[idx]}
                          onChange={() => handleToggleRule(idx)}
                        />
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          rules[idx] ? "bg-blue-600 border-blue-600" : "bg-white border-slate-300 peer-hover:border-blue-400"
                        }`}>
                          <span className={`material-symbols-outlined text-white text-[16px] font-bold scale-0 transition-transform ${rules[idx] ? "scale-100" : ""}`}>check</span>
                        </div>
                      </div>
                      <div className="flex flex-col text-left pt-0.5">
                        <span className={`text-sm font-bold transition-colors ${rules[idx] ? "text-blue-900" : "text-slate-700 group-hover:text-slate-900"}`}>{rule.title}</span>
                        <span className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5">{rule.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Token & Start Action */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-lg text-slate-800 font-black flex items-center gap-2">
                      <span className="material-symbols-outlined text-[24px] text-amber-500">key</span>
                      Otorisasi Masuk Ujian
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Ketik token 6 digit yang telah diumumkan oleh pengawas ruang Anda</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-[11px]">
                    Pengawas Ruang: <span className="font-bold text-slate-800">P-04/RUANG-08</span>
                  </div>
                </div>

                {/* Simulated Token Reveal */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-blue-600 text-white shadow-inner gap-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[24px] text-blue-200">campaign</span>
                    <span className="text-sm font-bold">Token dirilis oleh Pengawas Ruang:</span>
                  </div>
                  <div className="font-mono text-2xl tracking-[0.25em] font-black bg-white/10 border border-white/20 text-white px-4 py-1.5 rounded-lg text-center">
                    XK9PW2
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block text-center" htmlFor="token-input">
                    Masukkan Token Ujian
                  </label>
                  <div className="max-w-xs mx-auto">
                    <input 
                      id="token-input"
                      type="text" 
                      maxLength={6}
                      value={token}
                      onChange={(e) => setToken(e.target.value.toUpperCase())}
                      placeholder="CONTOH: XK9PW2"
                      className="w-full text-center tracking-[0.35em] uppercase text-2xl font-black py-4 px-4 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-blue-500 focus:bg-white shadow-inner transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-100">
                  <button 
                    onClick={handleStartExam}
                    className="flex-1 w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-4 px-6 rounded-xl text-lg font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    <span className="material-symbols-outlined text-[28px]">play_circle</span>
                    <span>MULAI KERJAKAN UJIAN</span>
                  </button>
                  <button 
                    onClick={handleAudioTest}
                    className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 px-6 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-slate-200"
                  >
                    <span className="material-symbols-outlined text-[20px]">volume_up</span>
                    <span>Cek Perangkat</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* 3. FOOTER */}
      <footer className="w-full bg-white py-4 border-t border-slate-200 mt-auto">
        <div className="w-full px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-bold text-slate-400">
          <div className="flex items-center gap-2">
            <span>Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi RI</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="hidden sm:inline">Proktor: P-04/RUANG-08</span>
          </div>
          <div className="flex items-center gap-3">
            <span>CBT Security Engine v4.8.2</span>
            <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">Mode Kiosk Disiapkan</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
