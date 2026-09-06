"use client";

import React from "react";
import { Semester, SemesterType } from "@/modules/semester/types";
import { Alert } from "@/lib/sweetalert";

interface SemesterDataTableProps {
  semesters: Semester[];
  loading: boolean;
  academicYears: string[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  search: string;
  selectedAcademicYear: string;
  selectedType: string;
  selectedStatus: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSearchChange: (value: string) => void;
  onAcademicYearChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSortChange: (field: string) => void;
  onEdit: (semester: Semester) => void;
  onRefresh: () => void;
}

export default function SemesterDataTable({
  semesters,
  loading,
  academicYears,
  total,
  page,
  limit,
  totalPages,
  search,
  selectedAcademicYear,
  selectedType,
  selectedStatus,
  sortBy,
  sortOrder,
  onSearchChange,
  onAcademicYearChange,
  onTypeChange,
  onStatusChange,
  onPageChange,
  onLimitChange,
  onSortChange,
  onEdit,
  onRefresh,
}: SemesterDataTableProps) {

  const handleActivate = async (semester: Semester) => {
    if (semester.isActive) return;

    const result = await Alert.confirm(
      "Aktifkan Semester?",
      `Mengaktifkan "${semester.name}" akan otomatis menonaktifkan semester lain yang sedang aktif.`
    );

    if (result.isConfirmed) {
      Alert.loading("Mengaktifkan Semester...");
      try {
        const res = await fetch(`/api/semesters/${semester.id}/activate`, {
          method: "PATCH",
        });
        const data = await res.json();
        Alert.close();

        if (res.ok && data.success) {
          Alert.success("Berhasil!", data.message);
          onRefresh();
        } else {
          Alert.error("Gagal", data.message || "Gagal mengaktifkan semester");
        }
      } catch (err: any) {
        Alert.close();
        Alert.error("Kesalahan Sistem", err.message || "Terjadi kesalahan koneksi");
      }
    }
  };

  const handleDelete = async (semester: Semester) => {
    if (semester.isActive) {
      Alert.warning(
        "Semester Sedang Aktif",
        "Semester yang sedang aktif tidak dapat dihapus. Silakan aktifkan semester lain terlebih dahulu."
      );
      return;
    }

    const result = await Alert.confirm(
      "Hapus Semester?",
      `Apakah Anda yakin ingin menghapus "${semester.name}" (${semester.code})? Data yang terhapus tidak dapat dikembalikan.`,
      "Ya, Hapus Data"
    );

    if (result.isConfirmed) {
      Alert.loading("Menghapus Semester...");
      try {
        const res = await fetch(`/api/semesters/${semester.id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        Alert.close();

        if (res.ok && data.success) {
          Alert.success("Terhapus!", data.message);
          onRefresh();
        } else {
          Alert.error("Gagal Hapus", data.message || "Gagal menghapus semester");
        }
      } catch (err: any) {
        Alert.close();
        Alert.error("Kesalahan Sistem", err.message || "Terjadi kesalahan koneksi");
      }
    }
  };

  const formatDate = (dateInput: string | Date) => {
    if (!dateInput) return "-";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return String(dateInput);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const renderTypeBadge = (type: SemesterType) => {
    switch (type) {
      case "GANJIL":
        return (
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            GANJIL
          </span>
        );
      case "GENAP":
        return (
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            GENAP
          </span>
        );
      case "ANTARA":
        return (
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            ANTARA / SUSULAN
          </span>
        );
      default:
        return <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700">{type}</span>;
    }
  };

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <span className="material-symbols-outlined text-[16px] text-slate-300 group-hover:text-slate-400 transition-colors">unfold_more</span>;
    }
    return sortOrder === "asc" ? (
      <span className="material-symbols-outlined text-[16px] text-blue-600 font-bold">arrow_upward</span>
    ) : (
      <span className="material-symbols-outlined text-[16px] text-blue-600 font-bold">arrow_downward</span>
    );
  };

  const startEntry = total === 0 ? 0 : (page - 1) * limit + 1;
  const endEntry = Math.min(page * limit, total);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col flex-1 overflow-hidden">
      
      {/* Toolbar Filters & Search */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/60 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        
        {/* Search Bar */}
        <div className="relative w-full lg:w-96 group">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] group-focus-within:text-blue-600 transition-colors">
            search
          </span>
          <input
            type="text"
            placeholder="Cari kode, nama semester, deskripsi..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-xs"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Filter Tahun Ajaran */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">THN:</span>
            <select
              value={selectedAcademicYear}
              onChange={(e) => onAcademicYearChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="ALL">Semua Tahun</option>
              {academicYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Tipe Semester */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">TIPE:</span>
            <select
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="ALL">Semua Tipe</option>
              <option value="GANJIL">Ganjil</option>
              <option value="GENAP">Genap</option>
              <option value="ANTARA">Antara</option>
            </select>
          </div>

          {/* Filter Status */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">STATUS:</span>
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Non-Aktif</option>
            </select>
          </div>

          <button
            onClick={onRefresh}
            title="Refresh Data"
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th
                onClick={() => onSortChange("code")}
                className="py-4 px-6 cursor-pointer select-none group hover:bg-slate-200/50 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Kode Semester</span>
                  {renderSortIcon("code")}
                </div>
              </th>
              <th
                onClick={() => onSortChange("name")}
                className="py-4 px-6 cursor-pointer select-none group hover:bg-slate-200/50 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Nama Semester</span>
                  {renderSortIcon("name")}
                </div>
              </th>
              <th
                onClick={() => onSortChange("academicYear")}
                className="py-4 px-6 cursor-pointer select-none group hover:bg-slate-200/50 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Tahun Ajaran</span>
                  {renderSortIcon("academicYear")}
                </div>
              </th>
              <th className="py-4 px-6">Tipe</th>
              <th
                onClick={() => onSortChange("startDate")}
                className="py-4 px-6 cursor-pointer select-none group hover:bg-slate-200/50 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Periode Pelaksanaan</span>
                  {renderSortIcon("startDate")}
                </div>
              </th>
              <th className="py-4 px-6 text-center">Status</th>
              <th className="py-4 px-6 text-center">Sesi Ujian</th>
              <th className="py-4 px-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm font-medium text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Memuat data semester...</span>
                  </div>
                </td>
              </tr>
            ) : semesters.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <span className="material-symbols-outlined text-[48px] text-slate-300">event_busy</span>
                    <p className="text-base font-bold text-slate-800">Semester Tidak Ditemukan</p>
                    <p className="text-xs text-slate-400">
                      Tidak ada data semester yang sesuai dengan kriteria pencarian atau filter yang dipilih.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              semesters.map((sem) => (
                <tr
                  key={sem.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    sem.isActive ? "bg-blue-50/20" : ""
                  }`}
                >
                  {/* Kode */}
                  <td className="py-4 px-6 font-mono font-bold text-slate-900">
                    <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200">
                      {sem.code}
                    </span>
                  </td>

                  {/* Nama Semester */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 leading-snug">{sem.name}</span>
                      {sem.description && (
                        <span className="text-xs text-slate-400 truncate max-w-xs">{sem.description}</span>
                      )}
                    </div>
                  </td>

                  {/* Tahun Ajaran */}
                  <td className="py-4 px-6 font-bold text-slate-800">
                    {sem.academicYear}
                  </td>

                  {/* Tipe */}
                  <td className="py-4 px-6">
                    {renderTypeBadge(sem.type)}
                  </td>

                  {/* Periode Tanggal */}
                  <td className="py-4 px-6 text-xs text-slate-600 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">date_range</span>
                      <span>{formatDate(sem.startDate)}</span>
                      <span className="text-slate-400">—</span>
                      <span>{formatDate(sem.endDate)}</span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-6 text-center">
                    {sem.isActive ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
                        <span className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-wider">
                          Aktif Utama
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Non-Aktif
                      </span>
                    )}
                  </td>

                  {/* Jumlah Sesi */}
                  <td className="py-4 px-6 text-center font-bold text-slate-700">
                    <span className="px-2.5 py-1 bg-slate-100 rounded-xl text-xs">
                      {sem.sessionCount ?? 0} Sesi
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      
                      {/* Activate Button */}
                      {!sem.isActive && (
                        <button
                          onClick={() => handleActivate(sem)}
                          title="Aktifkan Semester Ini"
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 transition-all font-bold text-xs flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          <span className="hidden sm:inline">Aktifkan</span>
                        </button>
                      )}

                      {/* Edit Button */}
                      <button
                        onClick={() => onEdit(sem)}
                        title="Edit Semester"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 transition-all border border-slate-200"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(sem)}
                        title="Hapus Semester"
                        disabled={sem.isActive}
                        className={`p-1.5 rounded-lg transition-all border ${
                          sem.isActive
                            ? "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed"
                            : "bg-slate-100 hover:bg-red-600 hover:text-white text-slate-600 border-slate-200"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Info */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
          <span>
            Menampilkan <strong className="text-slate-800">{startEntry}</strong> hingga <strong className="text-slate-800">{endEntry}</strong> dari <strong className="text-slate-800">{total}</strong> Semester
          </span>
          <div className="flex items-center gap-1.5">
            <span>Per Halaman:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Page Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            if (totalPages > 7 && Math.abs(p - page) > 2 && p !== 1 && p !== totalPages) {
              if (Math.abs(p - page) === 3) {
                return <span key={p} className="px-1 text-slate-400 text-xs">...</span>;
              }
              return null;
            }
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`min-w-8 h-8 px-2 rounded-xl text-xs font-bold transition-all ${
                  page === p
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {p}
              </button>
            );
          })}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
