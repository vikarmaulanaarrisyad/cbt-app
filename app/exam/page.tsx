"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/lib/sweetalert";
import Link from "next/link";

const TOTAL_QUESTIONS = 30;

export default function ExamPage() {
  const router = useRouter();

  // State Management
  const [activeQuestion, setActiveQuestion] = useState(1); 
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [doubtful, setDoubtful] = useState<Record<number, boolean>>({});
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");
  const [timeLeft, setTimeLeft] = useState(42 * 60 + 15);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  
  // Anti-Cheat State
  const [isLocked, setIsLocked] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [unlockToken, setUnlockToken] = useState("");

  // Load from LocalStorage & Network Listeners
  useEffect(() => {
    // Prevent Hydration Mismatch by loading after mount
    const savedAnswers = localStorage.getItem("cbt-answers");
    const savedDoubtful = localStorage.getItem("cbt-doubtful");
    
    if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
    if (savedDoubtful) setDoubtful(JSON.parse(savedDoubtful));

    // Handle Network Connection Drops
    const handleOffline = () => {
      setIsOffline(true);
      Alert.error(
        "Koneksi Terputus", 
        "Jaringan Anda terputus! Tenang, jawaban Anda otomatis tersimpan di perangkat. Jangan tutup browser ini."
      );
    };

    const handleOnline = () => {
      setIsOffline(false);
      Alert.success(
        "Terhubung Kembali", 
        "Koneksi jaringan pulih. Sinkronisasi data ujian ke server dilanjutkan."
      );
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // Auto-Save Answers to LocalStorage
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem("cbt-answers", JSON.stringify(answers));
    }
  }, [answers]);

  useEffect(() => {
    if (Object.keys(doubtful).length > 0) {
      localStorage.setItem("cbt-doubtful", JSON.stringify(doubtful));
    }
  }, [doubtful]);

  // Anti-Cheat (Focus Loss Detection)
  useEffect(() => {
    const handleFocusLoss = () => {
      // Don't lock if already locked or if the finish modal is open
      if (document.hidden || !document.hasFocus()) {
        setIsLocked((prev) => {
          if (!prev) {
            setViolationCount((count) => count + 1);
            return true;
          }
          return prev;
        });
      }
    };

    window.addEventListener("blur", handleFocusLoss);
    document.addEventListener("visibilitychange", handleFocusLoss);

    // Prevent Right Click & Copy
    const preventAction = (e: Event) => e.preventDefault();
    document.addEventListener("contextmenu", preventAction);
    document.addEventListener("copy", preventAction);

    return () => {
      window.removeEventListener("blur", handleFocusLoss);
      document.removeEventListener("visibilitychange", handleFocusLoss);
      document.removeEventListener("contextmenu", preventAction);
      document.removeEventListener("copy", preventAction);
    };
  }, []);

  const handleUnlock = () => {
    if (unlockToken === "PROKTOR123") {
      setIsLocked(false);
      setUnlockToken("");
      Alert.success("Akses Dipulihkan", "Kunci telah dibuka oleh Proktor. Lanjutkan ujian Anda dengan tertib.");
      
      // Try to force fullscreen again
      try {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } catch (e) {}
    } else {
      Alert.error("Token Salah", "Token otorisasi Proktor tidak valid!");
    }
  };

  // Timer Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleTimeUp = () => {
    Alert.info("Waktu Habis", "Waktu ujian telah berakhir.").then(() => {
      router.push("/student/dashboard");
    });
  };

  const handleAnswer = (option: string) => {
    setAnswers({ ...answers, [activeQuestion]: option });
  };

  const toggleDoubtful = () => {
    setDoubtful({ ...doubtful, [activeQuestion]: !doubtful[activeQuestion] });
  };

  const handleFinishSubmit = () => {
    if (isOffline) {
      Alert.error("Gagal Mengumpulkan", "Koneksi terputus. Sistem tidak dapat mengirim jawaban ke server pusat. Tunggu hingga koneksi stabil.");
      return;
    }
    
    setShowFinishModal(false);
    Alert.success("Terkumpul", "Hasil subtes telah direkam ke server pusat.").then(() => {
      // Clear storage after successful submission
      localStorage.removeItem("cbt-answers");
      localStorage.removeItem("cbt-doubtful");
      router.push("/student/dashboard");
    });
  };

  const answeredCount = Object.keys(answers).length;
  const doubtfulCount = Object.keys(doubtful).filter(k => doubtful[parseInt(k)]).length;
  const emptyCount = TOTAL_QUESTIONS - answeredCount;

  // Font Size Classes
  const fontClasses = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
  };

  const options = [
    { id: "A", text: "Alih fungsi sawah sama sekali tidak mempengaruhi kestabilan harga beras lokal selama suplai antarprovinsi tetap beroperasi normal tanpa restriksi logistik." },
    { id: "B", text: "Kenaikan harga beras premium lokal terjadi secara eksklusif karena spekulasi tengkulak pasar, terlepas dari reduksi luas lahan sawah beririgasi teknis." },
    { id: "C", text: "Konversi lahan sawah beririgasi teknis menurunkan pasokan gabah lokal secara langsung dan memperbesar volatilitas harga eceran beras di pasar regional." },
    { id: "D", text: "Implementasi skema agrivoltaik terpadu justru menjadi pendorong utama merosotnya harga gabah hingga 18,4% di tiga kabupaten sentra produksi." },
    { id: "E", text: "Reduksi tutupan sawah sebesar 12% mendorong swasembada pangan mandiri di kabupaten yang menerapkan teknologi panel surya darat." },
  ];

  return (
    <div className="bg-[#F8FAFC] font-sans text-slate-800 antialiased min-h-screen flex flex-col selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. HEADER */}
      <header className="sticky top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
        <div className="h-16 w-full max-w-[1600px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 shrink-0">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[20px]">school</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-slate-900 text-sm tracking-tight leading-tight">CBT Mandiri Portal</span>
              <span className="text-[10px] text-slate-500 font-medium">Balai Pengelolaan Pengujian Pendidikan</span>
            </div>
          </div>
          
          <div className="flex-1 text-center hidden lg:block">
            <nav className="flex items-center justify-center gap-8 text-sm font-medium">
              <span className="text-slate-500 hover:text-slate-900 cursor-pointer transition-colors">Dashboard</span>
              <span className="text-blue-600 font-semibold border-b-2 border-blue-600 py-5">Lembar Ujian</span>
              <span className="text-slate-500 hover:text-slate-900 cursor-pointer transition-colors">Hasil & Skor</span>
            </nav>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden md:flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOffline ? "bg-red-400" : "bg-emerald-400"}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isOffline ? "bg-red-500" : "bg-emerald-500"}`}></span>
              </span>
              <span className={`text-xs font-medium ${isOffline ? "text-red-600" : "text-slate-600"}`}>
                {isOffline ? "KONEKSI TERPUTUS" : "SERVER-JKT-04"}
              </span>
            </div>
            <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-900 leading-tight">Ahmad Fauzi P.</span>
                <span className="text-[10px] text-slate-500 font-medium">24-3101-0982-014</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden text-slate-500">
                <span className="material-symbols-outlined text-[20px]">person</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. SUB HEADER */}
      <section className="sticky top-16 z-40 bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 font-semibold text-[10px] uppercase tracking-wide">
              SUBTES 01
            </span>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-slate-900">Kemampuan Penalaran Umum</span>
              <span className="text-xs text-slate-500 font-medium">Soal <strong className="text-slate-900">{activeQuestion}</strong> dari {TOTAL_QUESTIONS}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center bg-slate-100 rounded-md p-0.5 border border-slate-200">
              <button onClick={() => setFontSize("sm")} className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${fontSize === "sm" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>A-</button>
              <button onClick={() => setFontSize("base")} className={`px-2 py-1 rounded text-xs font-semibold transition-all ${fontSize === "base" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>A</button>
              <button onClick={() => setFontSize("lg")} className={`px-2 py-1 rounded text-sm font-semibold transition-all ${fontSize === "lg" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>A+</button>
            </div>

            <div className="flex items-center gap-2 text-slate-800">
              <span className="material-symbols-outlined text-[18px] text-slate-400">timer</span>
              <span className="font-mono text-lg font-bold tracking-tight">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN CONTENT */}
      <main className="w-full max-w-[1400px] mx-auto px-6 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Question */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="bg-slate-900 text-white font-semibold text-xs px-3 py-1 rounded-md tracking-wider">
                    SOAL NO. {activeQuestion}
                  </span>
                  <span className="text-xs text-slate-500 font-medium bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                    Penalaran Deduktif
                  </span>
                </div>
              </div>

              {/* Image & Caption */}
              <div className="mt-8 mb-8 space-y-3">
                <div className="w-full h-48 md:h-64 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden relative">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAMGimesOC9l9Y7yxuoEfuSpp1pNasws4W1dRHd7ppej90DIY12MlUNrhw6QSdJaPlYc68pta5sWOR20izpxCgWg_QmheU2VKbPM9dzOyep6lCVfTGfhjllkl6tfmJ4OtZz2dWUoe09CAbuuiQQSUmkoLPuobdSYRdUcfGQzrzjVdXeNNHueg8UQg29-8SWJ_7-ssGO2YKtJCC5m1mgQQfmTbwq2IZYKIqBupWgDgjgl23wjSpWkkI"
                    alt="Agrivoltaic Module"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-slate-500 italic">
                  Ilustrasi Modul Agrivoltaik: Konversi Lahan Produksi Berkelanjutan vs Kedaulatan Logistik Beras.
                </p>
              </div>

              {/* Text Passage */}
              <div className="mb-8">
                <h3 className="font-semibold text-lg text-slate-900 mb-4">Dampak Transisi Energi Terbarukan terhadap Ketahanan Pangan Nasional</h3>
                <div className={`space-y-4 text-slate-700 leading-relaxed font-medium ${fontClasses[fontSize]}`}>
                  <p>
                    <strong className="text-slate-900 font-semibold">[1]</strong> Upaya dekarbonisasi melalui akselerasi pembangunan Pembangkit Listrik Tenaga Surya (PLTS) skala utilitas di berbagai wilayah Indonesia mengalami benturan spasial dengan komitmen swasembada pangan pokok. Karakteristik instalasi fotovoltaik darat menuntut luasan tapak horizontal yang relatif masif, rata-rata berkisar antara 1 hingga 1,5 hektar untuk setiap kapasitas satu megawatt-peak (MWp).
                  </p>
                  <p>
                    <strong className="text-slate-900 font-semibold">[2]</strong> Berdasarkan telaah agraria terkini, alih fungsi lahan sawah beririgasi teknis menjadi bentangan panel surya secara langsung memicu kontraksi kurva penawaran gabah lokal pada radius pasar regional tingkat kabupaten. Di tiga sentra lumbung beras yang diteliti, reduksi 12% tutupan sawah produktif beririgasi berkorelasi linier dengan kenaikan volatilitas harga eceran beras premium hingga 18,4% dalam rentang enam bulan pascakonstruksi.
                  </p>
                  <p>
                    <strong className="text-slate-900 font-semibold">[3]</strong> Menghadapi disrupsi simultan tersebut, para pakar agroteknologi menyerukan mandat wajib zonasi hibrida melalui teknologi dual-use agrivoltaics, di mana elevasi panel ditinggikan minimal 2,8 meter guna memungkinkan traktor mini serta tanaman padi tahan naungan tetap berproduksi optimal.
                  </p>
                </div>
              </div>

              {/* Question Text */}
              <div className="mb-6">
                <p className="text-base font-semibold text-slate-900 leading-relaxed">
                  Berdasarkan paragraf ke-2, apa simpulan yang paling tepat mengenai korelasi antara alih fungsi lahan sawah untuk panel surya dengan stabilitas harga beras lokal?
                </p>
              </div>

              {/* Options */}
              <div className="flex flex-col gap-3">
                {options.map((opt) => {
                  const isSelected = answers[activeQuestion] === opt.id;
                  return (
                    <label key={opt.id} className="cursor-pointer group flex items-start">
                      <input 
                        type="radio" 
                        name="cbt-option" 
                        value={opt.id} 
                        checked={isSelected}
                        onChange={() => handleAnswer(opt.id)}
                        className="peer sr-only" 
                      />
                      <div className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all ${
                        isSelected 
                          ? "bg-blue-50/50 border-blue-600 ring-1 ring-blue-600" 
                          : "bg-white border-slate-200 hover:border-blue-400 hover:bg-slate-50/50"
                      }`}>
                        <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-sm font-semibold shrink-0 transition-colors ${
                          isSelected ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-300 text-slate-500 group-hover:border-blue-400"
                        }`}>
                          {opt.id}
                        </div>
                        <span className={`text-[15px] pt-0.5 leading-relaxed font-medium ${isSelected ? "text-blue-950" : "text-slate-700 group-hover:text-slate-900"}`}>
                          {opt.text}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Bottom Actions */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <button 
                  onClick={() => setActiveQuestion(Math.max(1, activeQuestion - 1))}
                  disabled={activeQuestion === 1}
                  className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:hover:bg-white flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Sebelumnya
                </button>
                
                <button 
                  onClick={toggleDoubtful}
                  className={`px-5 py-2.5 rounded-lg font-semibold text-sm border transition-colors flex items-center gap-2 ${
                    doubtful[activeQuestion] 
                      ? "bg-amber-50 border-amber-500 text-amber-700" 
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: doubtful[activeQuestion] ? "'FILL' 1" : "'FILL' 0" }}>flag</span>
                  {doubtful[activeQuestion] ? "Ragu-Ragu Aktif" : "Ragu-Ragu"}
                </button>

                <button 
                  onClick={() => setActiveQuestion(Math.min(TOTAL_QUESTIONS, activeQuestion + 1))}
                  disabled={activeQuestion === TOTAL_QUESTIONS}
                  className="px-5 py-2.5 rounded-lg bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  Selanjutnya
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: Navigation Grid */}
          <aside className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-28">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold text-slate-900">Navigasi Soal</h2>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">30 Soal</span>
              </div>

              {/* Minimalist Legend */}
              <div className="flex items-center justify-between mb-6 text-xs text-slate-600 font-medium px-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <span>{answeredCount - doubtfulCount} Dijawab</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>{doubtfulCount} Ragu</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full border border-slate-300"></span>
                  <span>{emptyCount} Kosong</span>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-5 gap-2.5">
                {Array.from({ length: TOTAL_QUESTIONS }, (_, i) => i + 1).map((qNum) => {
                  const isAnswered = !!answers[qNum];
                  const isDoubtful = doubtful[qNum];
                  const isActive = activeQuestion === qNum;
                  
                  let btnClass = "bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50";
                  
                  if (isAnswered && !isDoubtful) {
                    btnClass = "bg-blue-600 border-blue-600 text-white";
                  } else if (isDoubtful) {
                    btnClass = "bg-amber-500 border-amber-500 text-white";
                  }

                  const activeClass = isActive ? "ring-2 ring-offset-2 ring-blue-500" : "";

                  return (
                    <button
                      key={qNum}
                      onClick={() => setActiveQuestion(qNum)}
                      className={`aspect-square rounded-lg border font-medium text-sm flex items-center justify-center transition-all relative ${btnClass} ${activeClass}`}
                    >
                      {qNum}
                      {isDoubtful && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white border border-amber-500"></span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <button 
                  onClick={() => setShowFinishModal(true)}
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Selesaikan Ujian
                </button>
              </div>
            </div>
            
            {/* Minimalist Info Card */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-3 text-slate-700 mb-2">
                <span className="material-symbols-outlined text-[20px]">security</span>
                <span className="text-sm font-semibold">Kiosk Mode Aktif</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Sistem ujian terkunci. Perpindahan tab, kursor keluar layar, atau penggunaan shortcut keyboard akan terekam oleh sistem.
              </p>
              <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-slate-500">
                <span className="bg-white border border-slate-200 px-2 py-1 rounded">A-E : Pilih</span>
                <span className="bg-white border border-slate-200 px-2 py-1 rounded">Space : Ragu</span>
                <span className="bg-white border border-slate-200 px-2 py-1 rounded">← → : Navigasi</span>
              </div>
            </div>
          </aside>

        </div>
      </main>

      {/* FINISH MODAL */}
      {showFinishModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-1">
                <span className="material-symbols-outlined text-[24px]">warning</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Konfirmasi Selesai</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Apakah Anda yakin ingin menyelesaikan subtes ini? Waktu ujian masih tersisa <strong className="text-slate-900">{Math.floor(timeLeft/60)} menit</strong>.
                </p>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-2 border border-slate-100">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Terjawab</span>
                <span className="font-semibold text-slate-900">{answeredCount - doubtfulCount} Soal</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Ragu-ragu</span>
                <span className="font-semibold text-amber-600">{doubtfulCount} Soal</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Belum Dijawab</span>
                <span className="font-semibold text-red-600">{emptyCount} Soal</span>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setShowFinishModal(false)}
                className="px-4 py-2 rounded-lg font-semibold text-sm text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
              >
                Kembali Periksa
              </button>
              <button 
                onClick={handleFinishSubmit}
                className="px-4 py-2 rounded-lg font-semibold text-sm bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Tetap Selesaikan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ANTI-CHEAT LOCK OVERLAY */}
      {isLocked && (
        <div className="fixed inset-0 z-[200] bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center text-white mb-8 animate-pulse shadow-[0_0_60px_rgba(220,38,38,0.5)]">
            <span className="material-symbols-outlined text-[48px]">gpp_maybe</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">PELANGGARAN TERDETEKSI</h2>
          <p className="text-slate-300 text-sm md:text-base max-w-lg mb-10 leading-relaxed font-medium">
            Sistem mendeteksi aktivitas mencurigakan (Berpindah Tab, Minimize Layar, atau Hilang Fokus). Sesuai tata tertib, lembar ujian Anda <strong className="text-white">dikunci sementara</strong>. 
            <br/><br/>
            Telah terjadi <strong className="text-red-400 text-lg">{violationCount} kali</strong> percobaan pelanggaran.
          </p>
          
          <div className="bg-white/10 p-8 rounded-3xl border border-white/20 w-full max-w-sm backdrop-blur-md shadow-2xl">
            <p className="text-xs text-white/80 font-bold mb-4 uppercase tracking-widest">Otorisasi Proktor Diperlukan</p>
            <input 
              type="password" 
              value={unlockToken}
              onChange={(e) => setUnlockToken(e.target.value.toUpperCase())}
              placeholder="TOKEN UNLOCK"
              className="w-full text-center text-2xl tracking-[0.25em] font-black py-4 rounded-xl bg-slate-900/80 border-2 border-white/20 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition-colors mb-4 uppercase shadow-inner"
            />
            <button 
              onClick={handleUnlock}
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-sm transition-colors shadow-lg shadow-blue-600/30"
            >
              BUKA KUNCI UJIAN
            </button>
            <p className="text-white/40 text-[10px] mt-5 font-medium leading-relaxed">
              Hubungi Pengawas Ruangan / Proktor untuk mendapatkan token pembuka. <br/>
              <span className="text-white/60">(Simulasi Dev: ketik PROKTOR123)</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
