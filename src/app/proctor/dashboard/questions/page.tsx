"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
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

interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

interface Question {
  id: string;
  text: string;
  category: string;
  educationLevel?: string;
  difficulty: "MUDAH" | "SEDANG" | "SULIT";
  status: "AKTIF" | "DRAFT";
  options?: QuestionOption[] | string | null;
}

interface QuestionMetrics {
  totalQuestions: number;
  activeQuestions: number;
  draftQuestions: number;
  popularCategory: string;
  popularCategoryCount: number;
  totalMI: number;
  totalMTS: number;
  totalMA: number;
  totalSemua: number;
}

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [educationLevelFilter, setEducationLevelFilter] = useState("ALL");
  const [userEducationLevel, setUserEducationLevel] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [metrics, setMetrics] = useState<QuestionMetrics>({
    totalQuestions: 0,
    activeQuestions: 0,
    draftQuestions: 0,
    popularCategory: "Penalaran Umum",
    popularCategoryCount: 0,
    totalMI: 0,
    totalMTS: 0,
    totalMA: 0,
    totalSemua: 0,
  });

  // Synchronize with global education level (from login or sidebar switcher)
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.user) {
          const u = data.data.user;
          if (u.educationLevel && u.educationLevel !== "SEMUA") {
            setUserEducationLevel(u.educationLevel);
            setEducationLevelFilter(u.educationLevel);
            setActiveEducationLevel(u.educationLevel);
          } else if (u.educationLevel === "SEMUA") {
            setUserEducationLevel("SEMUA");
          }
        }
      })
      .catch(() => {});

    const activeLevel = getActiveEducationLevel();
    if (activeLevel && activeLevel !== "SEMUA") {
      setEducationLevelFilter(activeLevel);
    }

    const handleJenjangChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ educationLevel: EducationLevel }>;
      if (customEvent.detail && customEvent.detail.educationLevel) {
        const lvl = customEvent.detail.educationLevel;
        setEducationLevelFilter(lvl === "SEMUA" ? "ALL" : lvl);
      }
    };

    window.addEventListener(EVENT_JENJANG_CHANGE, handleJenjangChange);
    return () => window.removeEventListener(EVENT_JENJANG_CHANGE, handleJenjangChange);
  }, []);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      const effectiveFilter = (userEducationLevel && userEducationLevel !== "SEMUA") ? userEducationLevel : educationLevelFilter;
      if (effectiveFilter && effectiveFilter !== "ALL") {
        params.append("educationLevel", effectiveFilter);
      }
      if (difficultyFilter && difficultyFilter !== "ALL") {
        params.append("difficulty", difficultyFilter);
      }
      if (statusFilter && statusFilter !== "ALL") {
        params.append("status", statusFilter);
      }

      const res = await fetch(`/api/questions?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setQuestions(data.data || []);
        setTotal(data.total || 0);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.error("Gagal mengambil data soal:", err);
    } finally {
      setLoading(false);
    }
  }, [search, educationLevelFilter, userEducationLevel, difficultyFilter, statusFilter]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleImport = () => {
    Alert.info(
      "Impor Bank Soal Multi-Jenjang",
      "Upload file template Excel/Word (MI, MTs, MA) untuk mengimpor butir soal dan pilihan ganda secara serentak."
    );
  };

  const handleExportCSV = () => {
    if (questions.length === 0) {
      Alert.info("Tidak Ada Data", "Tidak ada butir soal untuk diekspor.");
      return;
    }

    const headers = ["ID Soal", "Jenjang", "Kategori", "Tingkat Kesulitan", "Status", "Teks Soal"];
    const rows = questions.map((q) => [
      `"${q.id}"`,
      `"${q.educationLevel || "SEMUA"}"`,
      `"${q.category}"`,
      `"${q.difficulty}"`,
      `"${q.status}"`,
      `"${q.text.replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bank-soal-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Alert.toast("Bank soal berhasil diekspor ke CSV", "success");
  };

  const handleViewDetails = (q: Question) => {
    const opts = Array.isArray(q.options)
      ? q.options
      : typeof q.options === "string"
      ? JSON.parse(q.options)
      : [];

    MySwal.fire({
      customClass: {
        popup: "rounded-3xl shadow-2xl border border-slate-200 bg-white p-6 max-w-xl font-sans text-left",
        title: "text-lg font-black text-slate-900 font-sans tracking-tight mb-2 text-left",
        htmlContainer: "text-xs sm:text-sm text-slate-600 font-sans leading-relaxed text-left font-normal mt-2",
        confirmButton:
          "bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md shadow-blue-500/20 text-xs uppercase tracking-wider font-sans outline-none cursor-pointer border-0",
      },
      buttonsStyling: false,
      title: `Detail Soal [${q.id}]`,
      html: `
        <div class="space-y-4 text-left">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
              Jenjang: ${q.educationLevel || "SEMUA"}
            </span>
            <span class="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 font-bold text-xs border border-purple-200">
              Kategori: ${q.category}
            </span>
            <span class="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200">
              ${q.difficulty}
            </span>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-medium text-slate-800 text-sm leading-relaxed">
            ${q.text}
          </div>

          ${
            opts.length > 0
              ? `
            <div>
              <span class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pilihan Ganda</span>
              <div class="space-y-2">
                ${opts
                  .map(
                    (opt: any) => `
                  <div class="flex items-center gap-2.5 p-2.5 rounded-xl border ${
                    opt.isCorrect
                      ? "bg-emerald-50/80 border-emerald-300 text-emerald-900 font-bold ring-1 ring-emerald-500/20"
                      : "bg-white border-slate-200 text-slate-700"
                  }">
                    <span class="w-6 h-6 rounded-lg ${
                      opt.isCorrect ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                    } flex items-center justify-center font-bold text-xs">
                      ${opt.id}
                    </span>
                    <span class="text-xs sm:text-sm">${opt.text}</span>
                    ${opt.isCorrect ? `<span class="ml-auto text-xs text-emerald-600 font-extrabold flex items-center gap-1">KUNCI</span>` : ""}
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          `
              : ""
          }
        </div>
      `,
      confirmButtonText: "TUTUP",
    });
  };

  const handleDelete = async (id: string) => {
    const confirmed = await Alert.confirm(
      "Hapus Soal",
      `Apakah Anda yakin ingin menghapus butir soal ${id}? Tindakan ini tidak dapat dibatalkan.`
    );

    if (confirmed.isConfirmed) {
      try {
        const res = await fetch(`/api/questions/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
          Alert.success("Terhapus!", data.message);
          fetchQuestions();
        } else {
          Alert.error("Gagal Hapus", data.message);
        }
      } catch (err) {
        Alert.error("Gagal Hapus", "Terjadi kesalahan saat menghapus soal.");
      }
    }
  };

  return (
    <main className="flex-1 flex flex-col font-sans relative w-full">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            <span>Pusat Data CBT</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span>Manajemen Ujian</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-blue-600">
              {userEducationLevel && userEducationLevel !== "SEMUA" ? `Bank Soal (${userEducationLevel})` : "Bank Soal Multi-Jenjang"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Bank Soal & Asesmen
          </h1>
          <p className="text-xs text-slate-500">
            {userEducationLevel && userEducationLevel !== "SEMUA"
              ? `Daftar butir soal asesmen khusus jenjang ${userEducationLevel}`
              : "Daftar butir soal untuk seluruh jenjang madrasah: MI, MTs, dan MA"}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export CSV
          </button>
          <button
            onClick={handleImport}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
            Import Data
          </button>
          <Link
            href="/proctor/dashboard/questions/create"
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Buat Soal Baru
          </Link>
        </div>
      </header>

      {/* Content Wrapper */}
      <div className="p-4 sm:p-6 lg:p-8 flex-1 max-w-[1920px] mx-auto w-full flex flex-col gap-6">
        
        {/* Jenjang Education Level Distribution Pills */}
        {userEducationLevel && userEducationLevel !== "SEMUA" ? (
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-xs ${
                userEducationLevel === "MI"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                  : userEducationLevel === "MTS"
                  ? "bg-sky-50 border border-sky-200 text-sky-700"
                  : "bg-purple-50 border border-purple-200 text-purple-700"
              }`}>
                <span className="material-symbols-outlined text-[26px]">
                  {userEducationLevel === "MI" ? "child_care" : userEducationLevel === "MTS" ? "school" : "auto_stories"}
                </span>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  Bank Soal Jenjang {userEducationLevel === "MI" ? "Madrasah Ibtidaiyah (MI)" : userEducationLevel === "MTS" ? "Madrasah Tsanawiyah (MTs)" : "Madrasah Aliyah (MA)"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Seluruh butir soal, pilihan ganda, dan rubrik asesmen terfilter otomatis untuk jenjang {userEducationLevel}.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80">
                Total Soal {userEducationLevel}: {metrics.totalQuestions} Butir
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div 
              onClick={() => {
                setEducationLevelFilter("ALL");
                setActiveEducationLevel("SEMUA");
              }}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                educationLevelFilter === "ALL" ? "bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20 shadow-xs" : "bg-slate-50 border-slate-200/60 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Semua Jenjang</span>
                <span className="material-symbols-outlined text-[18px] text-blue-600">domain</span>
              </div>
              <div className="text-xl font-black text-slate-900 mt-1">{metrics.totalQuestions} Soal</div>
              <span className="text-[10px] text-slate-400 font-medium">Bank soal terpadu</span>
            </div>

            <div 
              onClick={() => {
                setEducationLevelFilter("MI");
                setActiveEducationLevel("MI");
              }}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                educationLevelFilter === "MI" ? "bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs" : "bg-slate-50 border-slate-200/60 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">MI (Ibtidaiyah)</span>
                <span className="material-symbols-outlined text-[18px] text-emerald-600">child_care</span>
              </div>
              <div className="text-xl font-black text-emerald-700 mt-1">{metrics.totalMI || 0} Soal</div>
              <span className="text-[10px] text-emerald-600 font-semibold">Tingkat MI Kelas 1-6</span>
            </div>

            <div 
              onClick={() => {
                setEducationLevelFilter("MTS");
                setActiveEducationLevel("MTS");
              }}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                educationLevelFilter === "MTS" ? "bg-sky-50/70 border-sky-300 ring-2 ring-sky-500/20 shadow-xs" : "bg-slate-50 border-slate-200/60 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">MTs (Tsanawiyah)</span>
                <span className="material-symbols-outlined text-[18px] text-sky-600">school</span>
              </div>
              <div className="text-xl font-black text-sky-700 mt-1">{metrics.totalMTS || 0} Soal</div>
              <span className="text-[10px] text-sky-600 font-semibold">Tingkat MTs Kelas VII-IX</span>
            </div>

            <div 
              onClick={() => {
                setEducationLevelFilter("MA");
                setActiveEducationLevel("MA");
              }}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                educationLevelFilter === "MA" ? "bg-purple-50/70 border-purple-300 ring-2 ring-purple-500/20 shadow-xs" : "bg-slate-50 border-slate-200/60 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">MA (Aliyah/SMA)</span>
                <span className="material-symbols-outlined text-[18px] text-purple-600">auto_stories</span>
              </div>
              <div className="text-xl font-black text-purple-700 mt-1">{metrics.totalMA || 0} Soal</div>
              <span className="text-[10px] text-purple-600 font-semibold">Kelas X s/d XII</span>
            </div>
          </div>
        )}

        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <span className="text-slate-500 font-bold text-[11px] uppercase tracking-widest block mb-1">Total Soal</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{metrics.totalQuestions}</span>
                <span className="text-xs font-semibold text-slate-400">Butir</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">quiz</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow relative overflow-hidden">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-emerald-600 font-bold text-[11px] uppercase tracking-widest">Soal Aktif</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{metrics.activeQuestions}</span>
                <span className="text-xs font-semibold text-emerald-600">Siap Diujikan</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">task_alt</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <span className="text-slate-500 font-bold text-[11px] uppercase tracking-widest block mb-1">Draft / Review</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-amber-500 tracking-tight">{metrics.draftQuestions}</span>
                <span className="text-xs font-semibold text-slate-400">Perlu Review</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">edit_note</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <span className="text-slate-500 font-bold text-[11px] uppercase tracking-widest block mb-1">Kategori Populer</span>
              <div className="text-base sm:text-lg font-black text-slate-800 truncate max-w-[150px]">
                {metrics.popularCategory}
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">{metrics.popularCategoryCount} Soal Tersedia</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">category</span>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col flex-1 overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-80 group">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] group-focus-within:text-blue-500 transition-colors">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Cari ID soal, wacana..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs placeholder:text-slate-400 font-medium"
                />
              </div>

              {/* Difficulty Filter */}
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
              >
                <option value="ALL">Semua Kesulitan</option>
                <option value="MUDAH">Mudah</option>
                <option value="SEDANG">Sedang</option>
                <option value="SULIT">Sulit</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
              >
                <option value="ALL">Semua Status</option>
                <option value="AKTIF">Aktif</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>

            <div className="text-xs font-semibold text-slate-500 w-full md:w-auto text-left md:text-right">
              Menampilkan <strong className="text-slate-800">{questions.length}</strong> dari total {total} Butir Soal
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="px-6 py-4 w-28">ID Soal</th>
                  <th className="px-4 py-4">Wacana / Soal</th>
                  <th className="px-4 py-4">Jenjang</th>
                  <th className="px-4 py-4">Kategori Modul</th>
                  <th className="px-4 py-4 w-28">Tingkat</th>
                  <th className="px-4 py-4 w-28">Status</th>
                  <th className="px-6 py-4 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-400 font-medium">
                      Memuat data butir soal dari database...
                    </td>
                  </tr>
                ) : questions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-400 font-medium">
                      Tidak ada data soal yang sesuai dengan kriteria filter saat ini.
                    </td>
                  </tr>
                ) : (
                  questions.map((q) => {
                    const lvl = (q.educationLevel || "SEMUA").toUpperCase();
                    return (
                      <tr key={q.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                            {q.id}
                          </span>
                        </td>
                        <td className="px-4 py-4 max-w-md">
                          <p
                            onClick={() => handleViewDetails(q)}
                            className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-1 mb-0.5 hover:text-blue-600 cursor-pointer transition-colors"
                          >
                            {q.text}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide border ${
                              lvl === "MI"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                : lvl === "MTS"
                                ? "bg-sky-50 text-sky-700 border-sky-300"
                                : lvl === "MA"
                                ? "bg-purple-50 text-purple-700 border-purple-300"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            {lvl}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 inline-flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            {q.category}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md flex items-center justify-center w-fit ${
                              q.difficulty === "MUDAH"
                                ? "text-emerald-700 bg-emerald-100"
                                : q.difficulty === "SEDANG"
                                ? "text-amber-700 bg-amber-100"
                                : "text-rose-700 bg-rose-100"
                            }`}
                          >
                            {q.difficulty}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1.5 w-fit ${
                              String(q.status) === "AKTIF" || String(q.status) === "Aktif"
                                ? "border-emerald-200 text-emerald-700 bg-emerald-50"
                                : "border-slate-200 text-slate-500 bg-slate-50"
                            }`}
                          >
                            {(String(q.status) === "AKTIF" || String(q.status) === "Aktif") && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            )}
                            {q.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleViewDetails(q)}
                              className="w-8 h-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-colors cursor-pointer"
                              title="Lihat Soal"
                            >
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                            </button>
                            <button
                              onClick={() => handleDelete(q.id)}
                              className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                              title="Hapus Soal"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50">
            <span className="text-slate-500 font-medium text-xs">
              Menampilkan <strong>{questions.length}</strong> dari <strong>{total}</strong> soal
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
