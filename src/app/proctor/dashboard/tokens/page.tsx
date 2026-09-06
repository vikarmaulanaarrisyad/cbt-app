"use client";

import React, { useState, useEffect } from "react";
import { Alert } from "@/lib/sweetalert";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  getActiveEducationLevel,
  setActiveEducationLevel,
  EVENT_JENJANG_CHANGE,
  EducationLevel,
} from "@/lib/education-level";

const MySwal = withReactContent(Swal);

interface TokenHistory {
  token: string;
  sessionName: string;
  educationLevel: "MI" | "MTS" | "MA" | "SEMUA";
  generatedAt: string;
  expiresAt: string;
  status: "ACTIVE" | "EXPIRED";
}

export default function TokensPage() {
  const [selectedLevelFilter, setSelectedLevelFilter] = useState("ALL");
  const [proctorUser, setProctorUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.user) {
          setProctorUser(data.data.user);
          if (data.data.user.educationLevel && data.data.user.educationLevel !== "SEMUA") {
            setSelectedLevelFilter(data.data.user.educationLevel);
            setCurrentLevel(data.data.user.educationLevel);
            setActiveEducationLevel(data.data.user.educationLevel);
          }
        }
      })
      .catch(() => {});

    const activeLevel = getActiveEducationLevel();
    if (activeLevel && activeLevel !== "SEMUA") {
      setSelectedLevelFilter(activeLevel);
    }

    const handleJenjangChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ educationLevel: EducationLevel }>;
      if (customEvent.detail && customEvent.detail.educationLevel) {
        const lvl = customEvent.detail.educationLevel;
        setSelectedLevelFilter(lvl === "SEMUA" ? "ALL" : lvl);
      }
    };

    window.addEventListener(EVENT_JENJANG_CHANGE, handleJenjangChange);
    return () => window.removeEventListener(EVENT_JENJANG_CHANGE, handleJenjangChange);
  }, []);
  const [currentToken, setCurrentToken] = useState("XK9PW2");
  const [currentLevel, setCurrentLevel] = useState<"MI" | "MTS" | "MA" | "SEMUA">("SEMUA");
  const [currentSessionName, setCurrentSessionName] = useState("Sesi 1: Asesmen Skolastik & Literasi Terpadu");

  const [tokensHistory, setTokensHistory] = useState<TokenHistory[]>([
    {
      token: "XK9PW2",
      sessionName: "Sesi 1: Asesmen Skolastik & Literasi Terpadu",
      educationLevel: "SEMUA",
      generatedAt: "08:00 WIB",
      expiresAt: "13:00 WIB",
      status: "ACTIVE",
    },
    {
      token: "MI25AK",
      sessionName: "Sesi Tematik & Akidah Akhlak MI Kelas 6",
      educationLevel: "MI",
      generatedAt: "07:30 WIB",
      expiresAt: "10:30 WIB",
      status: "EXPIRED",
    },
    {
      token: "MTS09M",
      sessionName: "Sesi Ujian Matematika MTs Kelas IX",
      educationLevel: "MTS",
      generatedAt: "10:30 WIB",
      expiresAt: "12:30 WIB",
      status: "EXPIRED",
    },
    {
      token: "MA12SC",
      sessionName: "Sesi Peminatan MIPA (Fisika-Kimia) MA Kelas XII",
      educationLevel: "MA",
      generatedAt: "13:00 WIB",
      expiresAt: "16:00 WIB",
      status: "EXPIRED",
    },
  ]);

  const handleOpenReleaseModal = async () => {
    const { value: formValues } = await MySwal.fire({
      title: "Rilis Token Sesi Ujian Baru",
      html: `
        <div class="space-y-4 text-left font-sans text-xs">
          <div>
            <label class="block font-bold text-slate-700 uppercase tracking-wider mb-1">Jenjang Sasaran</label>
            ${
              proctorUser?.educationLevel && proctorUser.educationLevel !== "SEMUA"
                ? `<div class="w-full p-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-800">Jenjang ${proctorUser.educationLevel} (Terkunci Sesuai Akun)</div><input type="hidden" id="swal-token-level" value="${proctorUser.educationLevel}" />`
                : `<select id="swal-token-level" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800">
                    <option value="SEMUA">SEMUA JENJANG (Umum / Skolastik)</option>
                    <option value="MI">MI (Madrasah Ibtidaiyah - Kelas 1-6)</option>
                    <option value="MTS">MTs (Madrasah Tsanawiyah - Kelas VII-IX)</option>
                    <option value="MA">MA (Madrasah Aliyah / SMA - Kelas X-XII)</option>
                  </select>`
            }
          </div>
          <div>
            <label class="block font-bold text-slate-700 uppercase tracking-wider mb-1">Nama / Deskripsi Sesi Ujian</label>
            <input id="swal-token-name" type="text" placeholder="Contoh: Sesi 2 Ujian Fikih & Matematika" value="Sesi Asesmen Terpadu" class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800" />
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Rilis & Aktifkan Token",
      cancelButtonText: "Batal",
      customClass: {
        popup: "rounded-3xl shadow-2xl border border-slate-200 bg-white p-6 max-w-md font-sans",
        confirmButton: "bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs uppercase cursor-pointer border-0",
        cancelButton: "bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-5 rounded-xl text-xs uppercase cursor-pointer border-0",
      },
      buttonsStyling: false,
      preConfirm: () => {
        const level = (document.getElementById("swal-token-level") as HTMLSelectElement)?.value || "SEMUA";
        const name = (document.getElementById("swal-token-name") as HTMLInputElement)?.value || "Sesi Ujian";
        return { level, name };
      },
    });

    if (formValues) {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let newToken = "";
      for (let i = 0; i < 6; i++) {
        newToken += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      setCurrentToken(newToken);
      setCurrentLevel(formValues.level as any);
      setCurrentSessionName(formValues.name);

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} WIB`;

      const newRecord: TokenHistory = {
        token: newToken,
        sessionName: formValues.name,
        educationLevel: formValues.level as any,
        generatedAt: timeStr,
        expiresAt: "18:00 WIB",
        status: "ACTIVE",
      };

      setTokensHistory((prev) => [newRecord, ...prev.map((t) => ({ ...t, status: "EXPIRED" as const }))]);
      Alert.success("Token Baru Terbit!", `Token resmi ${newToken} untuk jenjang ${formValues.level} telah aktif.`);
    }
  };

  const filteredHistory = tokensHistory.filter((t) => {
    if (selectedLevelFilter === "ALL") return true;
    return t.educationLevel === selectedLevelFilter;
  });

  return (
    <div className="flex-1 min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 w-full min-w-0">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-20 shadow-xs px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-xs shrink-0">
            <span className="material-symbols-outlined text-[22px]">key</span>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              <span>Pusat Data CBT</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-purple-600">Token Ruang Ujian</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
              Manajemen & Rotasi Token Multi-Jenjang
            </h1>
          </div>
        </div>

        <button
          onClick={handleOpenReleaseModal}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">autorenew</span>
          <span>Rilis Token Baru</span>
        </button>
      </header>

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-[1600px] mx-auto w-full">
        {/* Active Token Hero Card */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
          <div className="space-y-3 z-10 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                TOKEN SESI AKTIF RESMI
              </span>
              <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-extrabold tracking-wide border ${
                currentLevel === "MI"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : currentLevel === "MTS"
                  ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                  : currentLevel === "MA"
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                  : "bg-white/10 text-slate-200 border-white/20"
              }`}>
                Jenjang: {currentLevel}
              </span>
            </div>

            <p className="text-slate-200 text-sm font-semibold">{currentSessionName}</p>
            
            <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
              <span className="font-mono text-5xl sm:text-6xl font-black tracking-widest text-amber-300 drop-shadow-lg">
                {currentToken}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Batas Berlaku: Sesi Aktif Hari Ini • Berlaku untuk kiosk ujian terdaftar</p>
          </div>

          <div className="z-10 flex flex-col items-center gap-3">
            <button
              onClick={handleOpenReleaseModal}
              className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-lg hover:shadow-amber-400/20 hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined font-bold text-[20px]">autorenew</span>
              <span>Ganti / Rilis Token Baru</span>
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(currentToken);
                Alert.success("Tersalin", `Token ${currentToken} disalin ke clipboard.`);
              }}
              className="text-xs font-semibold text-slate-300 hover:text-white underline cursor-pointer"
            >
              Salin Kode Token
            </button>
          </div>
        </div>

        {/* Token History Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400">history</span>
              <span>Riwayat Rotasi Token Sesi Ruangan</span>
            </h3>

            {/* Level Filter Pills */}
            {proctorUser?.educationLevel && proctorUser.educationLevel !== "SEMUA" ? (
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                Jenjang: {proctorUser.educationLevel}
              </span>
            ) : (
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                {(["ALL", "MI", "MTS", "MA"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      setSelectedLevelFilter(lvl);
                      setActiveEducationLevel(lvl === "ALL" ? "SEMUA" : lvl);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      selectedLevelFilter === lvl
                        ? "bg-white text-blue-600 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {lvl === "ALL" ? "Semua" : lvl}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Token Sesi</th>
                  <th className="py-3 px-4">Jenjang</th>
                  <th className="py-3 px-4">Nama Sesi Ujian</th>
                  <th className="py-3 px-4">Waktu Terbit</th>
                  <th className="py-3 px-4">Kedaluwarsa</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((t, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-black text-blue-700 text-sm">{t.token}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${
                          t.educationLevel === "MI"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : t.educationLevel === "MTS"
                            ? "bg-sky-50 text-sky-700 border-sky-300"
                            : t.educationLevel === "MA"
                            ? "bg-purple-50 text-purple-700 border-purple-300"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {t.educationLevel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{t.sessionName}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">{t.generatedAt}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">{t.expiresAt}</td>
                    <td className="py-3.5 px-4">
                      {t.status === "ACTIVE" ? (
                        <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          AKTIF
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-500 border border-slate-200">
                          KADALUARSA
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
