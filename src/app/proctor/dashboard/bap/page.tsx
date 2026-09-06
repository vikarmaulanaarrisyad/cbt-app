"use client";

import React, { useState, useEffect } from "react";
import { Alert } from "@/lib/sweetalert";
import {
  getActiveEducationLevel,
  setActiveEducationLevel,
  EVENT_JENJANG_CHANGE,
  EducationLevel,
} from "@/lib/education-level";

export default function BAPPage() {
  const [educationLevel, setEducationLevel] = useState<EducationLevel>("SEMUA");
  const [proctorUser, setProctorUser] = useState<any>(null);
  const [notes, setNotes] = useState(
    "Pelaksanaan ujian berjalan tertib, kondusif, dan steril. Seluruh peserta hadir sesuai jadwal dengan protokol CBT yang ketat."
  );

  useEffect(() => {
    const activeLevel = getActiveEducationLevel();
    setEducationLevel(activeLevel);

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.user) {
          setProctorUser(data.data.user);
          if (data.data.user.educationLevel) {
            const lvl = data.data.user.educationLevel as EducationLevel;
            setEducationLevel(lvl);
          }
        }
      })
      .catch(() => {});

    const handleJenjangChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ educationLevel: EducationLevel }>;
      if (customEvent.detail && customEvent.detail.educationLevel) {
        setEducationLevel(customEvent.detail.educationLevel);
      }
    };

    window.addEventListener(EVENT_JENJANG_CHANGE, handleJenjangChange);
    return () => window.removeEventListener(EVENT_JENJANG_CHANGE, handleJenjangChange);
  }, []);

  const getInstitutionHeader = () => {
    if (proctorUser?.schoolName) {
      return `KEMENTERIAN AGAMA REPUBLIK INDONESIA • ${proctorUser.schoolName.toUpperCase()}`;
    }
    switch (educationLevel) {
      case "MI":
        return "KEMENTERIAN AGAMA REPUBLIK INDONESIA • MADRASAH IBTIDAIYAH (MI)";
      case "MTS":
        return "KEMENTERIAN AGAMA REPUBLIK INDONESIA • MADRASAH TSANAWIYAH (MTS)";
      case "MA":
        return "KEMENTERIAN AGAMA REPUBLIK INDONESIA • MADRASAH ALIYAH (MA)";
      default:
        return "KEMENTERIAN AGAMA & KEMENDIKBUDRISTEK RI • CBT ASESMEN MULTI-JENJANG";
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 w-full min-w-0">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-20 shadow-xs px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs shrink-0">
            <span className="material-symbols-outlined text-[22px]">description</span>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              <span>Pusat Data CBT</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-amber-600">Dokumen Berita Acara</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
              Berita Acara Pelaksanaan Ujian (BAP)
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Level Selector */}
          {proctorUser?.educationLevel && proctorUser.educationLevel !== "SEMUA" ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">school</span>
              <span>Jenjang {proctorUser.educationLevel}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              {(["SEMUA", "MI", "MTS", "MA"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    setEducationLevel(lvl);
                    setActiveEducationLevel(lvl);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    educationLevel === lvl
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => Alert.success("Unduh BAP", `Dokumen BAP resmi untuk jenjang ${educationLevel} berhasil diekspor ke PDF.`)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Cetak / Unduh PDF BAP</span>
          </button>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-5xl mx-auto w-full">
        {/* Printable Document Preview Paper */}
        <div className="bg-white rounded-3xl border border-slate-300 p-8 sm:p-12 shadow-xl space-y-8 text-slate-900 relative">
          {/* Header Document */}
          <div className="text-center border-b-2 border-slate-900 pb-6 space-y-1.5">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-800 mb-2">
              <span className="material-symbols-outlined text-[28px]">account_balance</span>
            </div>
            <h2 className="font-serif text-lg sm:text-xl font-black uppercase tracking-wide">
              BERITA ACARA PELAKSANAAN UJIAN CBT
            </h2>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {getInstitutionHeader()}
            </p>
            <p className="text-[11px] font-mono text-slate-500">
              NOMOR DOKUMEN: BAP/CBT-{educationLevel}/20260906/001
            </p>
          </div>

          {/* General Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div className="space-y-2">
              <p><span className="font-bold text-slate-500">Madrasah / Sekolah:</span> <span className="font-bold text-blue-900">{proctorUser?.schoolName || "MI Bustanul Huda 01 Dawuhan"}</span></p>
              <p><span className="font-bold text-slate-500">Jenjang Ujian:</span> <span className="font-bold text-blue-700">{educationLevel === "SEMUA" ? "Semua Jenjang Terpadu" : `Madrasah ${educationLevel}`}</span></p>
              <p><span className="font-bold text-slate-500">Hari / Tanggal:</span> Minggu, 06 September 2026</p>
              <p><span className="font-bold text-slate-500">Ruang Laboratorium:</span> {proctorUser?.labAllocation || "Lab CBT Utama"}</p>
              <p><span className="font-bold text-slate-500">Sesi Ujian:</span> Sesi 1 - Pagi</p>
            </div>
            <div className="space-y-2">
              <p><span className="font-bold text-slate-500">Jumlah Peserta Terdaftar:</span> 40 Peserta</p>
              <p><span className="font-bold text-slate-500">Peserta Hadir:</span> 38 Peserta</p>
              <p><span className="font-bold text-slate-500">Peserta Tidak Hadir:</span> 2 Peserta</p>
              <p><span className="font-bold text-slate-500">Status Integritas:</span> <span className="text-emerald-700 font-bold">TERVALIDASI (100% AMAN)</span></p>
            </div>
          </div>

          {/* Proctor Identity */}
          <div className="space-y-3 text-xs">
            <h3 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider text-blue-700">
              I. Identitas Pengawas & Penanggung Jawab Ruangan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-slate-200 rounded-2xl p-5 bg-slate-50/50">
              <div>
                <p className="font-bold text-slate-900 text-sm">{proctorUser?.name || "Ustadz Ahmad Fauzi, S.Pd.I."}</p>
                <p className="font-mono text-slate-500 text-[11px]">NIP: {proctorUser?.nip || "198501012010011001"}</p>
                <p className="text-slate-600 mt-1">Jabatan: Proktor Utama • {proctorUser?.schoolName || "Madrasah"}</p>
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Drs. H. Mulyono, M.Pd</p>
                <p className="font-mono text-slate-500 text-[11px]">NIP: 198402122008011004</p>
                <p className="text-slate-600 mt-1">Jabatan: Pengawas Monitoring CBT</p>
              </div>
            </div>
          </div>

          {/* Notes / Incidents Record */}
          <div className="space-y-2 text-xs">
            <h3 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider text-blue-700">
              II. Catatan Kejadian Pelaksanaan & Catatan Integritas
            </h3>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 leading-relaxed font-medium"
            />
          </div>

          {/* Signature Area */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="space-y-14">
              <p className="font-semibold text-slate-700">Proktor / Penanggung Jawab,</p>
              <div>
                <p className="font-bold underline text-slate-900">{proctorUser?.name || "Ustadz Ahmad Fauzi, S.Pd.I."}</p>
                <p className="font-mono text-[10px] text-slate-500">NIP. {proctorUser?.nip || "198501012010011001"}</p>
              </div>
            </div>
            <div className="space-y-14">
              <p className="font-semibold text-slate-700">Pengawas Monitoring Ujian,</p>
              <div>
                <p className="font-bold underline text-slate-900">Drs. H. Mulyono, M.Pd</p>
                <p className="font-mono text-[10px] text-slate-500">NIP. 198402122008011004</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
