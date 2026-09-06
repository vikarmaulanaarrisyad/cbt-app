"use client";

import React, { useState, useEffect, useCallback } from "react";
import SubjectDataTable from "@/components/subjects/SubjectDataTable";
import SubjectFormModal from "@/components/subjects/SubjectFormModal";
import { Subject, SubjectMetrics } from "@/modules/subject/types";
import { Alert } from "@/lib/sweetalert";
import {
  getActiveEducationLevel,
  setActiveEducationLevel,
  EVENT_JENJANG_CHANGE,
  EducationLevel,
} from "@/lib/education-level";

export default function SubjectManagementPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [gradeLevels, setGradeLevels] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<SubjectMetrics>({
    totalSubjects: 0,
    activeSubjects: 0,
    inactiveSubjects: 0,
    averagePassingGrade: 75.0,
    totalCategories: 0,
    totalMI: 0,
    totalMTS: 0,
    totalMA: 0,
  });

  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Filters initialized from active global jenjang
  const [search, setSearch] = useState("");
  const [educationLevelFilter, setEducationLevelFilter] = useState("ALL");
  const [userEducationLevel, setUserEducationLevel] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

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
        setPage(1);
      }
    };

    window.addEventListener(EVENT_JENJANG_CHANGE, handleJenjangChange);
    return () => window.removeEventListener(EVENT_JENJANG_CHANGE, handleJenjangChange);
  }, []);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (search) params.append("search", search);
      const effectiveFilter = (userEducationLevel && userEducationLevel !== "SEMUA") ? userEducationLevel : educationLevelFilter;
      if (effectiveFilter && effectiveFilter !== "ALL") {
        params.append("educationLevel", effectiveFilter);
      }
      if (categoryFilter && categoryFilter !== "ALL") {
        params.append("category", categoryFilter);
      }
      if (gradeFilter && gradeFilter !== "ALL") {
        params.append("gradeLevel", gradeFilter);
      }
      if (statusFilter && statusFilter !== "ALL") {
        params.append("status", statusFilter);
      }

      const res = await fetch(`/api/subjects?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setSubjects(data.data || []);
        if (data.meta) {
          setTotal(data.meta.total);
          setTotalPages(data.meta.totalPages);
        }
        if (data.metrics) {
          setMetrics(data.metrics);
        }
        if (data.categories) {
          setCategories(data.categories);
        }
        if (data.gradeLevels) {
          setGradeLevels(data.gradeLevels);
        }
      } else {
        Alert.error("Gagal", data.message || "Gagal memuat data mata pelajaran");
      }
    } catch (err: any) {
      Alert.error("Kesalahan Sistem", err.message || "Tidak dapat terhubung ke server");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, educationLevelFilter, categoryFilter, gradeFilter, statusFilter]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleOpenCreateModal = () => {
    setSubjectToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (subject: Subject) => {
    setSubjectToEdit(subject);
    setIsModalOpen(true);
  };

  const handleExportCSV = () => {
    if (subjects.length === 0) {
      Alert.info("Tidak Ada Data", "Tidak ada data mata pelajaran untuk diekspor.");
      return;
    }

    const headers = ["Kode", "Nama Mata Pelajaran", "Jenjang", "Kategori", "Tingkat", "KKM", "Status", "Deskripsi"];
    const rows = subjects.map((s) => [
      `"${s.code}"`,
      `"${s.name}"`,
      `"${s.educationLevel || "SEMUA"}"`,
      `"${s.category}"`,
      `"${s.gradeLevel}"`,
      s.passingGrade,
      `"${s.isActive ? "Aktif" : "Nonaktif"}"`,
      `"${(s.description || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `master-mata-pelajaran-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Alert.toast("Data mata pelajaran berhasil diekspor ke CSV", "success");
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      
      {/* Top Header & Action Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Beranda</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span>Master Data</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-blue-600 font-bold">Mata Pelajaran Kurikulum</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-blue-600 text-[26px]">menu_book</span>
            Master Mata Pelajaran
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola kurikulum mata pelajaran untuk seluruh jenjang (MI, MTs, MA), nilai KKM, dan bank soal CBT
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchSubjects}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs"
            title="Muat Ulang Data"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-500">download</span>
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Tambah Mata Pelajaran</span>
          </button>
        </div>
      </div>

      {/* Jenjang Education Level Distribution Pills */}
      {userEducationLevel && userEducationLevel !== "SEMUA" ? (
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shadow-xs ${
              userEducationLevel === "MI"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : userEducationLevel === "MTS"
                ? "bg-sky-50 border border-sky-200 text-sky-700"
                : "bg-purple-50 border border-purple-200 text-purple-700"
            }`}>
              <span className="material-symbols-outlined text-[24px]">
                {userEducationLevel === "MI" ? "child_care" : userEducationLevel === "MTS" ? "school" : "auto_stories"}
              </span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                Mata Pelajaran Jenjang {userEducationLevel === "MI" ? "Madrasah Ibtidaiyah (MI)" : userEducationLevel === "MTS" ? "Madrasah Tsanawiyah (MTs)" : "Madrasah Aliyah (MA)"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Struktur kurikulum, passing grade, dan mata uji dikhususkan untuk tingkat {userEducationLevel}.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
            Total {metrics.totalSubjects} Mapel Terdaftar
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <div 
            onClick={() => {
              setEducationLevelFilter("ALL");
              setActiveEducationLevel("SEMUA");
            }}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              educationLevelFilter === "ALL" ? "bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20" : "bg-slate-50 border-slate-200/60 hover:bg-slate-100"
            }`}
          >
            <div className="text-[11px] font-bold text-slate-500">Semua Jenjang</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{metrics.totalSubjects} Mapel</div>
          </div>

          <div 
            onClick={() => {
              setEducationLevelFilter("MI");
              setActiveEducationLevel("MI");
            }}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              educationLevelFilter === "MI" ? "bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20" : "bg-slate-50 border-slate-200/60 hover:bg-slate-100"
            }`}
          >
            <div className="text-[11px] font-bold text-emerald-700">MI (Ibtidaiyah)</div>
            <div className="text-xl font-black text-emerald-700 mt-0.5">{metrics.totalMI || 0} Mapel</div>
          </div>

          <div 
            onClick={() => {
              setEducationLevelFilter("MTS");
              setActiveEducationLevel("MTS");
            }}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              educationLevelFilter === "MTS" ? "bg-sky-50/70 border-sky-300 ring-2 ring-sky-500/20" : "bg-slate-50 border-slate-200/60 hover:bg-slate-100"
            }`}
          >
            <div className="text-[11px] font-bold text-sky-700">MTs (Tsanawiyah)</div>
            <div className="text-xl font-black text-sky-700 mt-0.5">{metrics.totalMTS || 0} Mapel</div>
          </div>

          <div 
            onClick={() => {
              setEducationLevelFilter("MA");
              setActiveEducationLevel("MA");
            }}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              educationLevelFilter === "MA" ? "bg-purple-50/70 border-purple-300 ring-2 ring-purple-500/20" : "bg-slate-50 border-slate-200/60 hover:bg-slate-100"
            }`}
          >
            <div className="text-[11px] font-bold text-purple-700">MA (Aliyah/SMA)</div>
            <div className="text-xl font-black text-purple-700 mt-0.5">{metrics.totalMA || 0} Mapel</div>
          </div>
        </div>
      )}

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Mapel */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Mata Pelajaran
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {metrics.totalSubjects}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Terdaftar di kurikulum
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">menu_book</span>
          </div>
        </div>

        {/* Card 2: Mapel Aktif */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Mata Pelajaran Aktif
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {metrics.activeSubjects}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
              Siap diujikan pada sesi CBT
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">check_circle</span>
          </div>
        </div>

        {/* Card 3: Rata-Rata KKM */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Rata-rata Nilai KKM
            </span>
            <div className="text-2xl font-black text-indigo-600 mt-1">
              {metrics.averagePassingGrade}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Standar kelulusan minimum
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">trending_up</span>
          </div>
        </div>

        {/* Card 4: Total Kategori */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Bidang / Kategori
            </span>
            <div className="text-2xl font-black text-purple-600 mt-1">
              {metrics.totalCategories}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Kelompok rumpun studi
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">category</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Data Table */}
      <SubjectDataTable
        subjects={subjects}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        totalPages={totalPages}
        onPageChange={setPage}
        onLimitChange={setLimit}
        search={search}
        onSearchChange={setSearch}
        educationLevelFilter={educationLevelFilter}
        userEducationLevel={userEducationLevel}
        onEducationLevelFilterChange={setEducationLevelFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        gradeFilter={gradeFilter}
        onGradeFilterChange={setGradeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        categories={categories}
        gradeLevels={gradeLevels}
        onEdit={handleOpenEditModal}
        onRefresh={fetchSubjects}
        onCreateNew={handleOpenCreateModal}
      />

      {/* Create / Edit Subject Form Modal */}
      <SubjectFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchSubjects();
        }}
        subjectToEdit={subjectToEdit}
        existingCategories={categories}
        existingGradeLevels={gradeLevels}
      />
    </div>
  );
}
