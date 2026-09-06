"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Alert } from "@/lib/sweetalert";
import ClassFormModal, { ClassGroupItem } from "@/components/classes/ClassFormModal";
import {
  getActiveEducationLevel,
  setActiveEducationLevel,
  EVENT_JENJANG_CHANGE,
  EducationLevel,
} from "@/lib/education-level";

interface ClassGroup {
  id: string;
  code: string;
  name: string;
  educationLevel: string; // "MI", "MTS", "MA"
  gradeLevel: string;
  major: string;
  academicYear: string;
  capacity: number;
  homeTeacherName: string;
  isActive: boolean;
  schoolId?: string;
  schoolName?: string;
}

interface ClassMetrics {
  totalClasses: number;
  activeClasses: number;
  totalCapacity: number;
  totalStudents: number;
  totalMI: number;
  totalMTS: number;
  totalMA: number;
}

const GRADE_LEVELS: Record<string, string[]> = {
  MI: ["1", "2", "3", "4", "5", "6"],
  MTS: ["VII", "VIII", "IX"],
  MA: ["X", "XI", "XII"],
};

const MAJORS_BY_LEVEL: Record<string, string[]> = {
  MI: ["Tematik Umum", "PAI", "Umum"],
  MTS: ["Umum", "Tahfidz", "Unggulan"],
  MA: ["MIPA", "IPS", "Keagamaan", "Bahasa", "RPL", "TKJ", "Umum"],
};

export default function ClassesPage() {
  const [classesList, setClassesList] = useState<ClassGroup[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters initialized from active global jenjang
  const [search, setSearch] = useState("");
  const [educationLevelFilter, setEducationLevelFilter] = useState("ALL");
  const [userEducationLevel, setUserEducationLevel] = useState<string | null>(null);
  const [gradeFilter, setGradeFilter] = useState("");
  const [majorFilter, setMajorFilter] = useState("");
  const [activeSchool, setActiveSchool] = useState<{ id: string | null; name: string | null; educationLevel?: string | null } | null>(null);

  const [metrics, setMetrics] = useState<ClassMetrics>({
    totalClasses: 0,
    activeClasses: 0,
    totalCapacity: 0,
    totalStudents: 0,
    totalMI: 0,
    totalMTS: 0,
    totalMA: 0,
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
          if (u.schoolId) {
            setActiveSchool({ id: u.schoolId, name: u.schoolName, educationLevel: u.educationLevel });
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
        setGradeFilter("");
        setMajorFilter("");
      }
    };

    window.addEventListener(EVENT_JENJANG_CHANGE, handleJenjangChange);
    return () => window.removeEventListener(EVENT_JENJANG_CHANGE, handleJenjangChange);
  }, []);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      const effectiveFilter = (userEducationLevel && userEducationLevel !== "SEMUA") ? userEducationLevel : educationLevelFilter;
      if (effectiveFilter && effectiveFilter !== "ALL") {
        params.append("educationLevel", effectiveFilter);
      }
      if (gradeFilter && gradeFilter !== "ALL") {
        params.append("gradeLevel", gradeFilter);
      }
      if (majorFilter && majorFilter !== "ALL") {
        params.append("major", majorFilter);
      }

      const res = await fetch(`/api/classes?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setClassesList(data.data || []);
        setTotal(data.total || 0);
        if (data.metrics) setMetrics(data.metrics);
        if (data.activeSchool) {
          setActiveSchool(data.activeSchool);
          if (data.activeSchool.educationLevel && data.activeSchool.educationLevel !== "SEMUA") {
            setUserEducationLevel(data.activeSchool.educationLevel);
          }
        }
      }
    } catch (err) {
      console.error("Gagal mengambil data kelas:", err);
    } finally {
      setLoading(false);
    }
  }, [search, educationLevelFilter, userEducationLevel, gradeFilter, majorFilter]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classToEdit, setClassToEdit] = useState<ClassGroupItem | null>(null);

  const handleOpenCreateModal = () => {
    setClassToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: ClassGroup) => {
    setClassToEdit(c);
    setIsModalOpen(true);
  };

  const handleModalSuccess = (msg?: string) => {
    Alert.success(
      "Berhasil!",
      msg || (classToEdit ? "Data rombel kelas berhasil diperbarui" : "Rombel kelas baru berhasil ditambahkan")
    );
    fetchClasses();
  };

  const handleDelete = async (id: string, code: string) => {
    const confirmed = await Alert.confirm(
      "Hapus Kelas/Rombel",
      `Apakah Anda yakin ingin menghapus data rombel ${code}? Data yang dihapus dari database tidak dapat dikembalikan.`
    );

    if (confirmed.isConfirmed) {
      try {
        const res = await fetch(`/api/classes/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
          Alert.success("Terhapus!", data.message);
          fetchClasses();
        } else {
          Alert.error("Gagal Hapus", data.message);
        }
      } catch {
        Alert.error("Gagal Hapus", "Terjadi kesalahan saat menghapus rombel.");
      }
    }
  };

  const handleExportCSV = () => {
    if (classesList.length === 0) {
      Alert.info("Tidak Ada Data", "Tidak ada data rombel kelas untuk diekspor.");
      return;
    }

    const headers = ["Kode Rombel", "Nama Kelas", "Jenjang", "Tingkat", "Jurusan", "Tahun Ajaran", "Kapasitas", "Wali Kelas", "Status"];
    const rows = classesList.map((c) => [
      `"${c.code}"`,
      `"${c.name}"`,
      `"${c.educationLevel || "MA"}"`,
      `"${c.gradeLevel}"`,
      `"${c.major || "UMUM"}"`,
      `"${c.academicYear}"`,
      c.capacity,
      `"${(c.homeTeacherName || "-").replace(/"/g, '""')}"`,
      `"${c.isActive ? "Aktif" : "Nonaktif"}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `data-rombel-kelas-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Alert.toast("Data rombel kelas berhasil diekspor ke CSV", "success");
  };

  // Helper for available grades in filter dropdown
  const effectiveJenjang = (userEducationLevel && userEducationLevel !== "SEMUA")
    ? userEducationLevel
    : educationLevelFilter;

  const availableFilterGrades =
    effectiveJenjang === "MI"
      ? GRADE_LEVELS.MI
      : effectiveJenjang === "MTS"
      ? GRADE_LEVELS.MTS
      : effectiveJenjang === "MA"
      ? GRADE_LEVELS.MA
      : [...GRADE_LEVELS.MI, ...GRADE_LEVELS.MTS, ...GRADE_LEVELS.MA];

  const availableFilterMajors =
    effectiveJenjang === "MI"
      ? MAJORS_BY_LEVEL.MI
      : effectiveJenjang === "MTS"
      ? MAJORS_BY_LEVEL.MTS
      : effectiveJenjang === "MA"
      ? MAJORS_BY_LEVEL.MA
      : Array.from(new Set([...MAJORS_BY_LEVEL.MI, ...MAJORS_BY_LEVEL.MTS, ...MAJORS_BY_LEVEL.MA]));

  return (
    <main className="flex-1 flex flex-col font-sans relative w-full">
      {/* Header Banner */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            <span>Pusat Data CBT</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span>Manajemen Sekolah</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-blue-600">Kelola Kelas & Rombel</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
            <span>Data Kelas & Rombongan Belajar</span>
            {activeSchool?.name && (
              <span className="text-xs sm:text-sm font-bold px-2.5 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200">
                {activeSchool.name}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500">
            {userEducationLevel && userEducationLevel !== "SEMUA"
              ? `Manajemen rombongan belajar dan kelas untuk tingkat ${
                  userEducationLevel === "MI"
                    ? "Madrasah Ibtidaiyah (MI - Kelas 1 s/d 6)"
                    : userEducationLevel === "MTS"
                    ? "Madrasah Tsanawiyah (MTs - Kelas VII s/d IX)"
                    : "Madrasah Aliyah (MA - Kelas X s/d XII)"
                }`
              : "Dukungan multi-jenjang pendidikan terintegrasi: Madrasah Ibtidaiyah (MI), Tsanawiyah (MTs), dan Aliyah (MA)"}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export CSV
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tambah Rombel Baru
          </button>
        </div>
      </header>

      {/* Main Content Area */}
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
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    Jenjang {userEducationLevel === "MI" ? "Madrasah Ibtidaiyah (MI)" : userEducationLevel === "MTS" ? "Madrasah Tsanawiyah (MTs)" : "Madrasah Aliyah (MA)"}
                  </h3>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase ${
                    userEducationLevel === "MI"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                      : userEducationLevel === "MTS"
                      ? "bg-sky-50 text-sky-800 border-sky-300"
                      : "bg-purple-50 text-purple-800 border-purple-300"
                  }`}>
                    {activeSchool?.name || "Lembaga Terdaftar"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Seluruh rombel, pembagian fase belajar, dan kurikulum otomatis dikhususkan untuk tingkat {userEducationLevel}.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80">
                Tingkat Kelas: {userEducationLevel === "MI" ? "Kelas 1 s/d 6" : userEducationLevel === "MTS" ? "Kelas VII s/d IX" : "Kelas X s/d XII"}
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div 
              onClick={() => {
                setEducationLevelFilter("ALL");
                setGradeFilter("");
                setMajorFilter("");
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
              <div className="text-xl font-black text-slate-900 mt-1">{metrics.totalClasses} Rombel</div>
              <span className="text-[10px] text-slate-400 font-medium">Seluruh tingkat madrasah</span>
            </div>

            <div 
              onClick={() => {
                setEducationLevelFilter("MI");
                setGradeFilter("");
                setMajorFilter("");
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
              <div className="text-xl font-black text-emerald-700 mt-1">{metrics.totalMI || 0} Rombel</div>
              <span className="text-[10px] text-emerald-600 font-semibold">Kelas 1 s/d 6</span>
            </div>

            <div 
              onClick={() => {
                setEducationLevelFilter("MTS");
                setGradeFilter("");
                setMajorFilter("");
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
              <div className="text-xl font-black text-sky-700 mt-1">{metrics.totalMTS || 0} Rombel</div>
              <span className="text-[10px] text-sky-600 font-semibold">Kelas VII s/d IX</span>
            </div>

            <div 
              onClick={() => {
                setEducationLevelFilter("MA");
                setGradeFilter("");
                setMajorFilter("");
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
              <div className="text-xl font-black text-purple-700 mt-1">{metrics.totalMA || 0} Rombel</div>
              <span className="text-[10px] text-purple-600 font-semibold">Kelas X s/d XII</span>
            </div>
          </div>
        )}

        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <span className="text-slate-500 font-bold text-[11px] uppercase tracking-widest block mb-1">Total Rombel Aktif</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{metrics.totalClasses}</span>
                <span className="text-xs font-semibold text-slate-400">Kelas Belajar</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">meeting_room</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow relative overflow-hidden">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-emerald-600 font-bold text-[11px] uppercase tracking-widest">Rombel Siap Ujian</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{metrics.activeClasses}</span>
                <span className="text-xs font-semibold text-emerald-600">Status Aktif</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">task_alt</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <span className="text-slate-500 font-bold text-[11px] uppercase tracking-widest block mb-1">Kapasitas Kursi CBT</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{metrics.totalCapacity}</span>
                <span className="text-xs font-semibold text-slate-400">Kursi Total</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">event_seat</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <span className="text-slate-500 font-bold text-[11px] uppercase tracking-widest block mb-1">Estimasi Peserta</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{metrics.totalStudents}</span>
                <span className="text-xs font-semibold text-slate-400">Siswa Terdaftar</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">groups</span>
            </div>
          </div>
        </div>

        {/* Table Wrapper */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col overflow-hidden">
          
          {/* Toolbar Search & Filter */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-80">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Cari Kode Rombel, Wali Kelas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs placeholder:text-slate-400 font-medium"
                />
              </div>

              {/* Filter Tingkat */}
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
              >
                <option value="">Semua Tingkat</option>
                {availableFilterGrades.map((g) => (
                  <option key={g} value={g}>
                    Tingkat {g}
                  </option>
                ))}
              </select>

              {/* Filter Jurusan */}
              <select
                value={majorFilter}
                onChange={(e) => setMajorFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
              >
                <option value="">Semua Jurusan</option>
                {availableFilterMajors.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs font-semibold text-slate-500 w-full md:w-auto text-left md:text-right">
              Menampilkan <strong className="text-slate-800">{classesList.length}</strong> dari total {total} Rombel Kelas
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="px-6 py-4">Kode Rombel</th>
                  <th className="px-4 py-4">Nama Kelas Lengkap</th>
                  <th className="px-4 py-4">Jenjang</th>
                  <th className="px-4 py-4">Tingkat</th>
                  <th className="px-4 py-4">Jurusan / Rumpun</th>
                  <th className="px-4 py-4">Wali Kelas</th>
                  <th className="px-4 py-4">Kapasitas</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-10 text-center text-slate-400 font-medium">
                      Memuat data kelas & rombel dari database...
                    </td>
                  </tr>
                ) : classesList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-10 text-center text-slate-400 font-medium">
                      Tidak ada data rombel kelas yang ditemukan untuk kriteria filter ini.
                    </td>
                  </tr>
                ) : (
                  classesList.map((c) => {
                    const lvl = (c.educationLevel || "MA").toUpperCase();
                    return (
                      <tr key={c.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                            {c.code}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-bold text-slate-900">
                          {c.name}
                          <span className="block text-[11px] font-normal text-slate-400 mt-0.5">
                            {c.schoolName ? <span className="font-semibold text-blue-700">{c.schoolName} • </span> : ""}
                            Tahun Ajaran {c.academicYear}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wide border ${
                              lvl === "MI"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                : lvl === "MTS"
                                ? "bg-sky-50 text-sky-700 border-sky-300"
                                : "bg-purple-50 text-purple-700 border-purple-300"
                            }`}
                          >
                            {lvl}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs">
                            {c.gradeLevel}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-bold text-xs">
                            {c.major || "UMUM"}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-semibold text-slate-700">
                          {c.homeTeacherName || "-"}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800">{c.capacity}</span>
                            <span className="text-slate-400 text-xs font-medium">Siswa</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 w-fit ${
                              c.isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-500 border-slate-200"
                            }`}
                          >
                            {c.isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                            {c.isActive ? "Aktif" : "Non-Aktif"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenEditModal(c)}
                              className="w-8 h-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-colors cursor-pointer"
                              title="Edit Rombel"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(c.id, c.code)}
                              className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                              title="Hapus Rombel"
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
        </div>

      </div>

      {/* Class Form Modal - Identical design to SemesterFormModal */}
      <ClassFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        classToEdit={classToEdit}
        initialEducationLevel={userEducationLevel && userEducationLevel !== "SEMUA" ? userEducationLevel : (educationLevelFilter !== "ALL" ? educationLevelFilter : "MI")}
      />
    </main>
  );
}
