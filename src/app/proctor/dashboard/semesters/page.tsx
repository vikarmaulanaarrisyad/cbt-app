"use client";

import React, { useState, useEffect, useCallback } from "react";
import SemesterDataTable from "@/components/semesters/SemesterDataTable";
import SemesterFormModal from "@/components/semesters/SemesterFormModal";
import { Semester, SemesterMetrics } from "@/modules/semester/types";
import { Alert } from "@/lib/sweetalert";

export default function SemesterManagementPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<SemesterMetrics>({
    totalSemesters: 0,
    activeSemesters: 0,
    totalAcademicYears: 0,
    totalSessions: 0,
  });

  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Filters state
  const [search, setSearch] = useState("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("startDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [semesterToEdit, setSemesterToEdit] = useState<Semester | null>(null);

  const fetchSemesters = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sortBy,
        sortOrder,
      });

      if (search) params.append("search", search);
      if (selectedAcademicYear && selectedAcademicYear !== "ALL") {
        params.append("academicYear", selectedAcademicYear);
      }
      if (selectedType && selectedType !== "ALL") {
        params.append("type", selectedType);
      }
      if (selectedStatus && selectedStatus !== "ALL") {
        params.append("status", selectedStatus);
      }

      const res = await fetch(`/api/semesters?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setSemesters(data.data || []);
        if (data.meta) {
          setTotal(data.meta.total);
          setTotalPages(data.meta.totalPages);
        }
        if (data.metrics) {
          setMetrics(data.metrics);
        }
        if (data.academicYears) {
          setAcademicYears(data.academicYears);
        }
      } else {
        Alert.error("Gagal", data.message || "Gagal memuat data semester");
      }
    } catch (err: any) {
      Alert.error("Kesalahan Sistem", err.message || "Tidak dapat terhubung ke server");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, selectedAcademicYear, selectedType, selectedStatus, sortBy, sortOrder]);

  useEffect(() => {
    fetchSemesters();
  }, [fetchSemesters]);

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const handleOpenCreateModal = () => {
    setSemesterToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (semester: Semester) => {
    setSemesterToEdit(semester);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    Alert.success("Berhasil", semesterToEdit ? "Data semester berhasil diperbarui" : "Semester baru berhasil ditambahkan");
    fetchSemesters();
  };

  const activeSemesterObj = semesters.find((s) => s.isActive);

  return (
    <main className="flex-1 flex flex-col font-sans relative w-full bg-slate-50/50 min-h-screen">
      
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Pusat Data CBT</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span>Master Data</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-blue-600">Manajemen Semester</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Manajemen Semester</h1>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={fetchSemesters}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all font-bold text-sm flex items-center justify-center gap-2 shadow-xs"
            title="Refresh Data"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
          
          <button
            onClick={handleOpenCreateModal}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tambah Semester
          </button>
        </div>
      </header>

      {/* Content Body */}
      <div className="p-4 sm:p-6 lg:p-8 flex-1 max-w-[1600px] mx-auto w-full flex flex-col gap-6">
        
        {/* Top Summary Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Metric 1: Total Semester */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col gap-2 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">Total Semester</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900 tracking-tight">{metrics.totalSemesters}</span>
              <span className="text-slate-400 text-xs font-semibold">Semester terdaftar</span>
            </div>
          </div>

          {/* Metric 2: Semester Aktif */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col gap-2 hover:shadow-md transition-all relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none"></div>
            <div className="flex items-center justify-between relative z-10">
              <span className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">Semester Aktif Utama</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></span>
            </div>
            <div className="flex flex-col gap-0.5 mt-1 relative z-10">
              <span className="text-xl font-black text-emerald-600 truncate leading-tight">
                {activeSemesterObj ? activeSemesterObj.name : "Tidak ada aktif"}
              </span>
              <span className="text-slate-400 text-xs font-medium">
                {activeSemesterObj ? `Kode: ${activeSemesterObj.code}` : "Harap set semester aktif"}
              </span>
            </div>
          </div>

          {/* Metric 3: Total Tahun Ajaran */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col gap-2 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">Tahun Ajaran</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">history_edu</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-purple-700 tracking-tight">{metrics.totalAcademicYears}</span>
              <span className="text-slate-400 text-xs font-semibold">Tahun Akademik</span>
            </div>
          </div>

          {/* Metric 4: Total Sesi Ujian */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col gap-2 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">Total Sesi Ujian</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">fact_check</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-amber-600 tracking-tight">{metrics.totalSessions}</span>
              <span className="text-slate-400 text-xs font-semibold">Sesi Terhubung</span>
            </div>
          </div>
        </div>

        {/* Main Interactive Data Table */}
        <SemesterDataTable
          semesters={semesters}
          loading={loading}
          academicYears={academicYears}
          total={total}
          page={page}
          limit={limit}
          totalPages={totalPages}
          search={search}
          selectedAcademicYear={selectedAcademicYear}
          selectedType={selectedType}
          selectedStatus={selectedStatus}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          onAcademicYearChange={(val) => {
            setSelectedAcademicYear(val);
            setPage(1);
          }}
          onTypeChange={(val) => {
            setSelectedType(val);
            setPage(1);
          }}
          onStatusChange={(val) => {
            setSelectedStatus(val);
            setPage(1);
          }}
          onPageChange={(p) => setPage(p)}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
          onSortChange={handleSortChange}
          onEdit={handleOpenEditModal}
          onRefresh={fetchSemesters}
        />
      </div>

      {/* Form Modal */}
      <SemesterFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        semesterToEdit={semesterToEdit}
      />
    </main>
  );
}
