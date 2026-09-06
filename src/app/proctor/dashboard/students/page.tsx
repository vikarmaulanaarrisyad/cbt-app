"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Alert } from "@/lib/sweetalert";
import {
  getActiveEducationLevel,
  setActiveEducationLevel,
  EVENT_JENJANG_CHANGE,
  EducationLevel,
} from "@/lib/education-level";
import StudentFormModal from "@/components/students/StudentFormModal";
import StudentImportModal from "@/components/students/StudentImportModal";

interface Student {
  id: string;
  nisn: string;
  name: string;
  placeOfBirth?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  classGroup?: string | null;
  gradeLevel?: string | null;
  educationLevel?: string;
  username?: string | null;
  isActive: boolean;
  createdAt: string;
}

interface StudentMetrics {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  totalMI: number;
  totalMTS: number;
  totalMA: number;
  totalByClass: Record<string, number>;
}

const JENJANG_COLOR: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  MI: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  MTS: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", dot: "bg-sky-500" },
  MA: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500" },
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [metrics, setMetrics] = useState<StudentMetrics>({
    totalStudents: 0, activeStudents: 0, inactiveStudents: 0,
    totalMI: 0, totalMTS: 0, totalMA: 0, totalByClass: {},
  });
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  // Filters
  const [search, setSearch] = useState("");
  const [educationLevelFilter, setEducationLevelFilter] = useState("ALL");
  const [userEducationLevel, setUserEducationLevel] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [classFilter, setClassFilter] = useState("");

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Sync global jenjang
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data?.user) {
          const u = data.data.user;
          if (u.educationLevel && u.educationLevel !== "SEMUA") {
            setUserEducationLevel(u.educationLevel);
            setEducationLevelFilter(u.educationLevel);
            setActiveEducationLevel(u.educationLevel);
          } else {
            setUserEducationLevel("SEMUA");
          }
        }
      })
      .catch(() => {});

    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ educationLevel: EducationLevel }>;
      if (ce.detail?.educationLevel) {
        setEducationLevelFilter(ce.detail.educationLevel);
      }
    };
    window.addEventListener(EVENT_JENJANG_CHANGE, handler);
    return () => window.removeEventListener(EVENT_JENJANG_CHANGE, handler);
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (search) params.set("search", search);
      if (educationLevelFilter && educationLevelFilter !== "ALL") params.set("educationLevel", educationLevelFilter);
      if (genderFilter !== "ALL") params.set("gender", genderFilter);
      if (statusFilter !== "ALL") params.set("isActive", statusFilter === "ACTIVE" ? "true" : "false");
      if (classFilter) params.set("classGroup", classFilter);

      const res = await fetch(`/api/students?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setStudents(data.data || []);
        setTotal(data.meta?.total || 0);
        setTotalPages(data.meta?.totalPages || 1);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  }, [search, educationLevelFilter, genderFilter, statusFilter, classFilter, page]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleDelete = async (student: Student) => {
    const confirmed = await Alert.confirm(
      "Hapus Data Siswa",
      `Apakah Anda yakin ingin menghapus data siswa "${student.name}" (NISN: ${student.nisn})? Tindakan ini tidak dapat dibatalkan.`,
      "Ya, Hapus"
    );
    if (!confirmed.isConfirmed) return;
    Alert.loading("Menghapus data siswa...");
    const res = await fetch(`/api/students/${student.id}`, { method: "DELETE" });
    const data = await res.json();
    Alert.close();
    if (data.success) {
      Alert.success("Siswa berhasil dihapus");
      fetchStudents();
    } else {
      Alert.error("Gagal Menghapus", data.message);
    }
  };

  const handleToggleStatus = async (student: Student) => {
    Alert.loading("Mengubah status...");
    const res = await fetch(`/api/students/${student.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !student.isActive }),
    });
    const data = await res.json();
    Alert.close();
    if (data.success) {
      Alert.toast(`Status siswa berhasil diubah ke ${!student.isActive ? "Aktif" : "Nonaktif"}`, "success");
      fetchStudents();
    }
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (educationLevelFilter && educationLevelFilter !== "ALL") params.set("educationLevel", educationLevelFilter);
    if (classFilter) params.set("classGroup", classFilter);
    window.open(`/api/students/export?${params.toString()}`, "_blank");
  };

  const formatDOB = (iso: string | null | undefined) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  const jenjangStats = [
    { key: "MI", label: "Madrasah Ibtidaiyah", count: metrics.totalMI, icon: "school", color: "emerald" },
    { key: "MTS", label: "Madrasah Tsanawiyah", count: metrics.totalMTS, icon: "menu_book", color: "sky" },
    { key: "MA", label: "Madrasah Aliyah", count: metrics.totalMA, icon: "auto_stories", color: "purple" },
  ];

  const isSingleJenjang = userEducationLevel && userEducationLevel !== "SEMUA";

  return (
    <main className="flex-1 flex flex-col relative w-full bg-[#F8FAFC] min-h-screen">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200/80 px-6 lg:px-8 py-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">school</span>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Data Siswa {isSingleJenjang ? `— ${userEducationLevel}` : ""}
            </h1>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            {isSingleJenjang
              ? `Manajemen data siswa ${userEducationLevel === "MI" ? "Madrasah Ibtidaiyah" : userEducationLevel === "MTS" ? "Madrasah Tsanawiyah" : "Madrasah Aliyah"}`
              : "Manajemen data peserta didik seluruh jenjang"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExport}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-600">download</span>
            Export Excel
          </button>
          <button
            onClick={() => setIsImportOpen(true)}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            Import Excel
          </button>
          <button
            onClick={() => { setEditingStudent(null); setIsFormOpen(true); }}
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black shadow-md shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            Tambah Siswa
          </button>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Siswa", value: metrics.totalStudents, icon: "groups", color: "bg-gradient-to-br from-blue-600 to-indigo-600", textColor: "text-blue-700", bgColor: "bg-blue-50" },
            { label: "Siswa Aktif", value: metrics.activeStudents, icon: "check_circle", color: "bg-gradient-to-br from-emerald-500 to-teal-600", textColor: "text-emerald-700", bgColor: "bg-emerald-50" },
            { label: "Nonaktif", value: metrics.inactiveStudents, icon: "person_off", color: "bg-gradient-to-br from-slate-400 to-slate-500", textColor: "text-slate-600", bgColor: "bg-slate-100" },
            { label: "Kelas Terdaftar", value: Object.keys(metrics.totalByClass).length, icon: "meeting_room", color: "bg-gradient-to-br from-amber-500 to-orange-500", textColor: "text-amber-700", bgColor: "bg-amber-50" },
          ].map((m) => (
            <div key={m.label} className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center gap-3 shadow-xs">
              <div className={`w-11 h-11 rounded-xl ${m.color} flex items-center justify-center shrink-0 shadow-sm`}>
                <span className="material-symbols-outlined text-white text-[22px]">{m.icon}</span>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 leading-none">{m.value.toLocaleString("id-ID")}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">{m.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Jenjang breakdown — only for multi-jenjang */}
        {!isSingleJenjang && (
          <div className="grid grid-cols-3 gap-4">
            {jenjangStats.map((j) => {
              const c = JENJANG_COLOR[j.key];
              return (
                <div key={j.key} className={`${c.bg} border ${c.border} rounded-2xl p-4 flex items-center gap-3`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${c.dot} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xl font-black ${c.text}`}>{j.count}</p>
                    <p className={`text-[10px] font-bold ${c.text} opacity-80 uppercase tracking-wider`}>{j.label}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEducationLevelFilter(j.key)}
                    className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${c.border} ${c.text} hover:opacity-80 transition-opacity`}
                  >
                    Filter
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-slate-400">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Cari nama, NISN, atau username..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Jenjang filter — only for SEMUA */}
          {!isSingleJenjang && (
            <select
              value={educationLevelFilter}
              onChange={(e) => { setEducationLevelFilter(e.target.value); setPage(1); }}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="ALL">Semua Jenjang</option>
              <option value="MI">MI</option>
              <option value="MTS">MTs</option>
              <option value="MA">MA</option>
            </select>
          )}

          <select
            value={genderFilter}
            onChange={(e) => { setGenderFilter(e.target.value); setPage(1); }}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="ALL">Semua Gender</option>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="INACTIVE">Nonaktif</option>
          </select>

          {(search || educationLevelFilter !== "ALL" || genderFilter !== "ALL" || statusFilter !== "ALL" || classFilter) && (
            <button
              type="button"
              onClick={() => { setSearch(""); setEducationLevelFilter(userEducationLevel && userEducationLevel !== "SEMUA" ? userEducationLevel : "ALL"); setGenderFilter("ALL"); setStatusFilter("ALL"); setClassFilter(""); setPage(1); }}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 text-xs font-bold hover:bg-slate-50 flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">filter_alt_off</span>
              Reset
            </button>
          )}

          <div className="ml-auto text-xs text-slate-400 font-semibold whitespace-nowrap">
            {total.toLocaleString("id-ID")} siswa ditemukan
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-slate-500">Memuat data siswa...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-400 text-[32px]">person_search</span>
              </div>
              <div className="text-center">
                <p className="text-base font-black text-slate-700">Belum Ada Data Siswa</p>
                <p className="text-sm text-slate-500 mt-1">Tambah siswa baru atau import via Excel untuk memulai</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsImportOpen(true)} type="button" className="px-4 py-2 text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors">Import Excel</button>
                <button onClick={() => setIsFormOpen(true)} type="button" className="px-4 py-2 text-sm font-black text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors">+ Tambah Siswa</button>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-500 w-10">No.</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">Siswa</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">NISN</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">Tanggal Lahir</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">Kelas</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">Jenjang</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">Username</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">Status</th>
                      <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-wider text-slate-500">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((student, idx) => {
                      const jc = JENJANG_COLOR[student.educationLevel?.toUpperCase() || "MI"];
                      const initials = getInitials(student.name);
                      const avatarColors = student.gender === "P"
                        ? "from-pink-500 to-rose-500"
                        : "from-blue-500 to-indigo-600";
                      return (
                        <tr key={student.id} className="hover:bg-slate-50/60 transition-colors group">
                          <td className="px-4 py-3 text-xs text-slate-400 font-mono">{(page - 1) * limit + idx + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColors} flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm`}>
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{student.name}</p>
                                <p className="text-[10px] text-slate-400 font-medium">{student.placeOfBirth || "—"} • {student.gender === "L" ? "♂ Laki-laki" : student.gender === "P" ? "♀ Perempuan" : "—"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm font-mono font-semibold text-slate-700">{student.nisn}</td>
                          <td className="px-4 py-3 text-xs text-slate-600 font-medium whitespace-nowrap">{formatDOB(student.dateOfBirth)}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-slate-700">{student.classGroup || "—"}</td>
                          <td className="px-4 py-3">
                            {student.educationLevel ? (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${jc?.bg || "bg-slate-50"} ${jc?.text || "text-slate-600"} ${jc?.border || "border-slate-200"}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${jc?.dot || "bg-slate-400"}`} />
                                {student.educationLevel}
                              </span>
                            ) : "—"}
                          </td>
                          <td className="px-4 py-3 text-xs font-mono text-slate-500">{student.username || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${student.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${student.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                              {student.isActive ? "Aktif" : "Nonaktif"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => { setEditingStudent(student); setIsFormOpen(true); }}
                                type="button"
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                              <button
                                onClick={() => handleToggleStatus(student)}
                                type="button"
                                className={`p-1.5 rounded-lg transition-colors ${student.isActive ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"}`}
                                title={student.isActive ? "Nonaktifkan" : "Aktifkan"}
                              >
                                <span className="material-symbols-outlined text-[18px]">{student.isActive ? "person_off" : "person_check"}</span>
                              </button>
                              <button
                                onClick={() => handleDelete(student)}
                                type="button"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Hapus"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-4 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-xs text-slate-500 font-medium">
                    Halaman {page} dari {totalPages} • {total.toLocaleString("id-ID")} siswa
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">first_page</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                      return start + i;
                    }).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${page === p ? "bg-emerald-600 text-white shadow-sm" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">last_page</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <StudentFormModal
        isOpen={isFormOpen}
        editingStudent={editingStudent}
        userEducationLevel={userEducationLevel}
        onClose={() => setIsFormOpen(false)}
        onSaved={fetchStudents}
      />
      <StudentImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImported={fetchStudents}
      />
    </main>
  );
}
