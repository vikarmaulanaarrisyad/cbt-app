"use client";

import React, { useState } from "react";
import { Subject } from "@/modules/subject/types";
import { Alert } from "@/lib/sweetalert";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

interface SubjectDataTableProps {
  subjects: Subject[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  // Filters
  search: string;
  onSearchChange: (search: string) => void;
  educationLevelFilter?: string;
  userEducationLevel?: string | null;
  onEducationLevelFilterChange?: (level: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (cat: string) => void;
  gradeFilter: string;
  onGradeFilterChange: (grade: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  // Options
  categories: string[];
  gradeLevels: string[];
  // Actions
  onEdit: (subject: Subject) => void;
  onRefresh: () => void;
  onCreateNew: () => void;
}

export default function SubjectDataTable({
  subjects,
  loading,
  total,
  page,
  limit,
  totalPages,
  onPageChange,
  onLimitChange,
  search,
  onSearchChange,
  educationLevelFilter = "ALL",
  userEducationLevel,
  onEducationLevelFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  gradeFilter,
  onGradeFilterChange,
  statusFilter,
  onStatusFilterChange,
  categories,
  gradeLevels,
  onEdit,
  onRefresh,
  onCreateNew,
}: SubjectDataTableProps) {
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Helper for educationLevel badge styling
  const getEducationLevelBadge = (level?: string) => {
    switch ((level || "SEMUA").toUpperCase()) {
      case "MI":
        return "bg-emerald-50 text-emerald-700 border-emerald-300";
      case "MTS":
        return "bg-sky-50 text-sky-700 border-sky-300";
      case "MA":
        return "bg-purple-50 text-purple-700 border-purple-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  // Helper for category badge styling
  const getCategoryBadge = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("wajib")) {
      return "bg-blue-50 text-blue-700 border-blue-200/80";
    }
    if (cat.includes("mipa") || cat.includes("ipa")) {
      return "bg-purple-50 text-purple-700 border-purple-200/80";
    }
    if (cat.includes("ips")) {
      return "bg-amber-50 text-amber-700 border-amber-200/80";
    }
    if (cat.includes("skolastik") || cat.includes("literasi")) {
      return "bg-indigo-50 text-indigo-700 border-indigo-200/80";
    }
    if (cat.includes("kejuruan") || cat.includes("vokasi")) {
      return "bg-cyan-50 text-cyan-700 border-cyan-200/80";
    }
    if (cat.includes("bahasa") || cat.includes("budaya")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
    }
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  // Helper for KKM badge styling
  const getPassingGradeBadge = (grade: number) => {
    if (grade >= 80) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (grade >= 75) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  // Status toggle handler
  const handleToggleStatus = async (subject: Subject) => {
    setTogglingId(subject.id);
    try {
      const res = await fetch(`/api/subjects/${subject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !subject.isActive }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        Alert.toast(
          `Status ${subject.name} diubah ke ${!subject.isActive ? "Aktif" : "Nonaktif"}`,
          "success"
        );
        onRefresh();
      } else {
        Alert.error("Gagal Mengubah Status", data.message || "Terjadi kesalahan");
      }
    } catch {
      Alert.error("Kesalahan Sistem", "Tidak dapat terhubung ke server");
    } finally {
      setTogglingId(null);
    }
  };

  // Delete confirmation handler
  const handleDelete = async (subject: Subject) => {
    const result = await MySwal.fire({
      title: "Hapus Mata Pelajaran?",
      html: `Apakah Anda yakin ingin menghapus <b>${subject.name}</b> (<code class="text-blue-600">${subject.code}</code>)? Tindakan ini tidak dapat dibatalkan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Hapus Data",
      cancelButtonText: "Batal",
      reverseButtons: true,
      customClass: {
        popup: "rounded-3xl",
        confirmButton: "rounded-xl font-bold px-4 py-2.5",
        cancelButton: "rounded-xl font-bold px-4 py-2.5",
      },
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/subjects/${subject.id}`, {
          method: "DELETE",
        });
        const data = await res.json();

        if (res.ok && data.success) {
          Alert.success("Terhapus", `Mata pelajaran ${subject.name} berhasil dihapus.`);
          onRefresh();
        } else {
          Alert.error("Gagal Menghapus", data.message || "Gagal menghapus data");
        }
      } catch {
        Alert.error("Kesalahan", "Terjadi kesalahan pada sistem.");
      }
    }
  };

  // Check if any filters are active
  const isFilterActive =
    search.trim() !== "" ||
    categoryFilter !== "ALL" ||
    gradeFilter !== "ALL" ||
    statusFilter !== "ALL";

  const handleResetFilter = () => {
    onSearchChange("");
    onCategoryFilterChange("ALL");
    onGradeFilterChange("ALL");
    onStatusFilterChange("ALL");
    onPageChange(1);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
      
      {/* Table Filter & Toolbar Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-4">
        {/* Education Level (Jenjang) Tabs - Only shown if cross-school / superadmin */}
        {(!userEducationLevel || userEducationLevel === "SEMUA") && (
          <div className="flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 overflow-x-auto">
            {[
              { id: "ALL", label: "Semua Jenjang", icon: "domain" },
              { id: "MI", label: "MI (Ibtidaiyah)", icon: "child_care" },
              { id: "MTS", label: "MTs (Tsanawiyah)", icon: "school" },
              { id: "MA", label: "MA (Aliyah)", icon: "account_balance" },
            ].map((tab) => {
              const isSelected = educationLevelFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    if (onEducationLevelFilterChange) {
                      onEducationLevelFilterChange(tab.id);
                      onPageChange(1);
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? "bg-white text-blue-600 shadow-xs ring-1 ring-slate-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Cari kode mapel, nama, atau deskripsi..."
              value={search}
              onChange={(e) => {
                onSearchChange(e.target.value);
                onPageChange(1);
              }}
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
              <span className="material-symbols-outlined text-[16px] text-slate-400">category</span>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  onCategoryFilterChange(e.target.value);
                  onPageChange(1);
                }}
                className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Grade Level Filter */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
              <span className="material-symbols-outlined text-[16px] text-slate-400">school</span>
              <select
                value={gradeFilter}
                onChange={(e) => {
                  onGradeFilterChange(e.target.value);
                  onPageChange(1);
                }}
                className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Tingkat</option>
                {gradeLevels.map((grd) => (
                  <option key={grd} value={grd}>
                    {grd === "Semua" ? "Umum / Semua" : `Kelas ${grd}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Segmented Control */}
            <div className="inline-flex bg-slate-200/70 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  onStatusFilterChange("ALL");
                  onPageChange(1);
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  statusFilter === "ALL"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => {
                  onStatusFilterChange("ACTIVE");
                  onPageChange(1);
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  statusFilter === "ACTIVE"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Aktif
              </button>
              <button
                type="button"
                onClick={() => {
                  onStatusFilterChange("INACTIVE");
                  onPageChange(1);
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  statusFilter === "INACTIVE"
                    ? "bg-slate-700 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Nonaktif
              </button>
            </div>

            {/* Reset Button */}
            {isFilterActive && (
              <button
                type="button"
                onClick={handleResetFilter}
                className="px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1 border border-slate-200 shadow-xs"
                title="Reset Semua Filter"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3.5">Kode Mapel</th>
              <th className="px-5 py-3.5">Mata Pelajaran & Silabus</th>
              <th className="px-5 py-3.5 text-center">Jenjang</th>
              <th className="px-5 py-3.5">Kategori / Kelompok</th>
              <th className="px-5 py-3.5">Tingkat</th>
              <th className="px-5 py-3.5 text-center">KKM Minimal</th>
              <th className="px-5 py-3.5 text-center">Status</th>
              <th className="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                    <span className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                    <span className="text-xs font-semibold">Memuat data mata pelajaran...</span>
                  </div>
                </td>
              </tr>
            ) : subjects.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-[28px]">menu_book</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">
                      {isFilterActive
                        ? "Tidak ada mata pelajaran yang cocok"
                        : "Belum ada mata pelajaran"}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 mb-4 text-center">
                      {isFilterActive
                        ? "Coba ubah kata kunci pencarian atau sesuaikan filter kategori Anda."
                        : "Daftarkan mata pelajaran pertama untuk mulai mengaitkan bank soal dan ujian."}
                    </p>
                    {isFilterActive ? (
                      <button
                        onClick={handleResetFilter}
                        className="px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-blue-200"
                      >
                        Reset Filter
                      </button>
                    ) : (
                      <button
                        onClick={onCreateNew}
                        className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        Tambah Mata Pelajaran
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              subjects.map((subject) => (
                <tr
                  key={subject.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Kode Mapel */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs shadow-xs border border-slate-800">
                      {subject.code}
                    </span>
                  </td>

                  {/* Nama Mata Pelajaran & Deskripsi */}
                  <td className="px-5 py-4">
                    <div className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                      {subject.name}
                    </div>
                    {subject.description ? (
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 max-w-md">
                        {subject.description}
                      </p>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">
                        Tidak ada deskripsi khusus
                      </span>
                    )}
                  </td>

                  {/* Jenjang */}
                  <td className="px-5 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black border ${getEducationLevelBadge(
                        subject.educationLevel
                      )}`}
                    >
                      {subject.educationLevel || "SEMUA"}
                    </span>
                  </td>

                  {/* Kategori */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getCategoryBadge(
                        subject.category
                      )}`}
                    >
                      {subject.category}
                    </span>
                  </td>

                  {/* Tingkat Kelas */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/80">
                      <span className="material-symbols-outlined text-[14px] text-slate-400">
                        school
                      </span>
                      {subject.gradeLevel === "Semua" ? "Semua Tingkat" : `Kelas ${subject.gradeLevel}`}
                    </span>
                  </td>

                  {/* KKM */}
                  <td className="px-5 py-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center justify-center font-extrabold text-xs px-2.5 py-0.5 rounded-lg border ${getPassingGradeBadge(
                        Number(subject.passingGrade)
                      )}`}
                    >
                      {Number(subject.passingGrade)}
                    </span>
                  </td>

                  {/* Status Toggle Switch */}
                  <td className="px-5 py-4 text-center whitespace-nowrap">
                    <button
                      type="button"
                      disabled={togglingId === subject.id}
                      onClick={() => handleToggleStatus(subject)}
                      className="inline-flex items-center gap-1.5 focus:outline-none cursor-pointer group/btn"
                      title={
                        subject.isActive
                          ? "Klik untuk menonaktifkan mata pelajaran ini"
                          : "Klik untuk mengaktifkan mata pelajaran ini"
                      }
                    >
                      <span
                        className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                          subject.isActive ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                            subject.isActive ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </span>
                      <span
                        className={`text-[11px] font-bold ${
                          subject.isActive ? "text-emerald-700" : "text-slate-400"
                        }`}
                      >
                        {subject.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </button>
                  </td>

                  {/* Aksi */}
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEdit(subject)}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                        title="Edit Mata Pelajaran"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(subject)}
                        className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                        title="Hapus Mata Pelajaran"
                        type="button"
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

      {/* Pagination Footer Bar */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span>Menampilkan</span>
          <select
            value={limit}
            onChange={(e) => {
              onLimitChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>dari total <b>{total}</b> mata pelajaran</span>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Halaman Sebelumnya"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && p - prev > 1;

                return (
                  <React.Fragment key={p}>
                    {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                    <button
                      onClick={() => onPageChange(p)}
                      className={`w-8 h-8 rounded-lg font-bold text-xs transition-colors ${
                        page === p
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Halaman Selanjutnya"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
