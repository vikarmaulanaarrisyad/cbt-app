"use client";

import React, { useEffect, useState } from "react";
import { Alert } from "@/lib/sweetalert";
import { getRoleLabel, getRoleBadgeStyle, Permission } from "@/lib/rbac";

interface StaffUser {
  id: string;
  nip: string;
  name: string;
  email?: string | null;
  role: "ADMIN" | "PROCTOR" | "TEACHER";
  labAllocation?: string | null;
  customPermissions?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserMetrics {
  totalStaff: number;
  adminCount: number;
  proctorCount: number;
  teacherCount: number;
  activeCount: number;
}

const ALL_PERMISSIONS: { id: Permission; label: string; description: string; group: string }[] = [
  { id: "semesters:manage", label: "Kelola Semester", description: "Menambah, mengedit, dan mengaktifkan semester akademik", group: "Manajemen Sistem" },
  { id: "users:manage", label: "Kelola User & Hak Akses", description: "Mengatur peran pengguna dan memberikan centang izin kustom", group: "Manajemen Sistem" },
  { id: "proctor:view", label: "Live Monitoring Lab", description: "Melihat dashboard pengawasan ruangan dan status kiosk peserta", group: "Pengawasan Lab" },
  { id: "proctor:control", label: "Control Room & Token", description: "Mengakses rotasi token, jeda ujian darurat, dan kunci PC kiosk", group: "Pengawasan Lab" },
  { id: "questions:view", label: "Bank Soal (Read-Only)", description: "Melihat daftar wacana dan butir soal ujian", group: "Pengelolaan Soal" },
  { id: "questions:manage", label: "Buat & Edit Soal", description: "Menambah, mengedit, dan menghapus soal pada bank soal", group: "Pengelolaan Soal" },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [metrics, setMetrics] = useState<UserMetrics>({
    totalStaff: 0,
    adminCount: 0,
    proctorCount: 0,
    teacherCount: 0,
    activeCount: 0,
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [formData, setFormData] = useState({
    nip: "",
    name: "",
    email: "",
    password: "",
    role: "PROCTOR" as "ADMIN" | "PROCTOR" | "TEACHER",
    labAllocation: "Lab CBT-08",
    isActive: true,
    customPermissions: [] as Permission[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = "/api/users";
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (roleFilter !== "ALL") params.append("role", roleFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data || []);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.error("Gagal mengambil data user:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormData({
      nip: "",
      name: "",
      email: "",
      password: "password123",
      role: "PROCTOR",
      labAllocation: "Lab CBT-08",
      isActive: true,
      customPermissions: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: StaffUser) => {
    setEditingUser(user);
    let parsedPerms: Permission[] = [];
    if (user.customPermissions) {
      try {
        parsedPerms = JSON.parse(user.customPermissions);
      } catch {
        parsedPerms = user.customPermissions.split(",").map((p) => p.trim()) as Permission[];
      }
    }
    setFormData({
      nip: user.nip,
      name: user.name,
      email: user.email || "",
      password: "",
      role: user.role,
      labAllocation: user.labAllocation || "Lab CBT-08",
      isActive: user.isActive,
      customPermissions: parsedPerms,
    });
    setIsModalOpen(true);
  };

  const togglePermission = (permId: Permission) => {
    setFormData((prev) => {
      const exists = prev.customPermissions.includes(permId);
      const updated = exists
        ? prev.customPermissions.filter((p) => p !== permId)
        : [...prev.customPermissions, permId];
      return { ...prev, customPermissions: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nip || !formData.name) {
      Alert.warning("Data Tidak Lengkap", "NIP dan Nama Pengguna wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        nip: formData.nip,
        name: formData.name,
        email: formData.email || undefined,
        password: formData.password || undefined,
        role: formData.role,
        labAllocation: formData.labAllocation,
        isActive: formData.isActive,
        customPermissions: formData.customPermissions,
      };

      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";
      const method = editingUser ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        Alert.success("Berhasil Disimpan", data.message || "Data hak akses pengguna berhasil diperbarui.");
        setIsModalOpen(false);
        fetchUsers();
      } else {
        Alert.error("Gagal Menyimpan", data.message || "Terjadi kesalahan saat menyimpan data.");
      }
    } catch (err: any) {
      Alert.error("Kesalahan Koneksi", err?.message || "Gagal menghubungkan ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: StaffUser) => {
    const confirmed = await Alert.confirm(
      "Hapus Akun Pengguna",
      `Apakah Anda yakin ingin menghapus akun ${user.name} (${user.nip})? Akses masuk user akan dicabut.`
    );

    if (confirmed.isConfirmed) {
      try {
        const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
          Alert.success("Terhapus!", data.message);
          fetchUsers();
        } else {
          Alert.error("Gagal Hapus", data.message);
        }
      } catch {
        Alert.error("Gagal Hapus", "Terjadi kesalahan saat menghapus user.");
      }
    }
  };

  return (
    <main className="flex-1 flex flex-col font-sans relative w-full">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            <span>Pusat Data CBT</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-blue-600">Manajemen Sistem</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span>Kelola User & Hak Akses Dinamis</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
              KONTROL ADMIN
            </span>
          </h1>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white transition-all font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-700/20 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Tambah User Staf
        </button>
      </header>

      {/* Content Wrapper */}
      <div className="p-8 flex-1 max-w-[1600px] mx-auto w-full flex flex-col gap-6">
        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow">
            <span className="text-slate-500 font-bold text-[11px] uppercase tracking-widest">Total User Staf</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">{metrics.totalStaff}</span>
              <span className="text-emerald-600 text-xs font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                {metrics.activeCount} Aktif
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow">
            <span className="text-slate-500 font-bold text-[11px] uppercase tracking-widest">Administrator</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-purple-600 tracking-tight">{metrics.adminCount}</span>
              <span className="text-slate-400 text-xs font-medium">Akses Penuh</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow">
            <span className="text-slate-500 font-bold text-[11px] uppercase tracking-widest">Pengawas Ruangan</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-blue-600 tracking-tight">{metrics.proctorCount}</span>
              <span className="text-slate-400 text-xs font-medium">Monitoring Lab</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow">
            <span className="text-slate-500 font-bold text-[11px] uppercase tracking-widest">Guru Pengampu</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-500 tracking-tight">{metrics.teacherCount}</span>
              <span className="text-slate-400 text-xs font-medium">Pengelola Bank Soal</span>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col flex-1 overflow-hidden">
          {/* Filter Bar */}
          <div className="p-5 border-b border-slate-200 flex flex-wrap gap-4 items-center justify-between bg-slate-50/50">
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-80 group">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] group-focus-within:text-blue-500 transition-colors">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Cari NIP, nama, atau alokasi lab..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-400 font-medium"
                />
              </div>

              {/* Role Pills */}
              <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                {["ALL", "ADMIN", "PROCTOR", "TEACHER"].map((role) => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      roleFilter === role
                        ? "bg-white text-blue-700 shadow font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {role === "ALL" ? "Semua Peran" : getRoleLabel(role)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Profil Pengguna</th>
                  <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest w-44">Peran (Role)</th>
                  <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Alokasi Lab / Posisi</th>
                  <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Hak Akses Kustom</th>
                  <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest w-32">Status Akun</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest w-28 text-center">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400 font-medium">
                      Memuat data pengguna dari database...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400 font-medium">
                      Tidak ada data pengguna yang sesuai.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const badgeStyle = getRoleBadgeStyle(u.role);
                    let customPerms: string[] = [];
                    if (u.customPermissions) {
                      try {
                        customPerms = JSON.parse(u.customPermissions);
                      } catch {
                        customPerms = u.customPermissions.split(",").map((p) => p.trim());
                      }
                    }

                    return (
                      <tr key={u.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-slate-700 to-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-sm">
                              {u.name
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-bold text-slate-900 truncate">{u.name}</span>
                              <span className="text-xs font-mono text-slate-500">NIP {u.nip}</span>
                              {u.email && <span className="text-[11px] text-blue-600 truncate">{u.email}</span>}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {getRoleLabel(u.role)}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 inline-flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-slate-500">meeting_room</span>
                            {u.labAllocation || "Lab CBT-08"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          {u.role === "ADMIN" ? (
                            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                              Full Control (`*`)
                            </span>
                          ) : customPerms.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {customPerms.map((p, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                                >
                                  {p}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium italic">Standard Matriks Role</span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1.5 w-fit ${
                              u.isActive
                                ? "border-emerald-200 text-emerald-700 bg-emerald-50"
                                : "border-rose-200 text-rose-700 bg-rose-50"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                u.isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                              }`}
                            ></span>
                            {u.isActive ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEditModal(u)}
                              className="w-8 h-8 rounded-lg text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
                              title="Edit Peran & Hak Akses"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit_square</span>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"
                              title="Hapus User"
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

      {/* Modal Dialog: Editor Peran & Hak Akses Pengguna */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl border border-slate-200 p-6 flex flex-col gap-6 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
                  <span className="material-symbols-outlined text-[24px]">manage_accounts</span>
                </div>
                <div className="flex flex-col">
                  <h3 className="font-bold text-slate-900 text-lg">
                    {editingUser ? `Kelola Hak Akses: ${editingUser.name}` : "Tambah User Staf Baru"}
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    {editingUser ? `NIP: ${editingUser.nip}` : "Atur peran dan centang izin kustom pengguna"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* NIP */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700" htmlFor="user-nip">
                    NIP / Identitas Staf <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="user-nip"
                    type="text"
                    required
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    placeholder="Contoh: 199005152015031002"
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Nama */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700" htmlFor="user-name">
                    Nama Lengkap & Gelar <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="user-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Siti Aminah, S.Kom"
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700" htmlFor="user-email">
                    Alamat Email Resmi
                  </label>
                  <input
                    id="user-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="siti@cbt-app.sch.id"
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700" htmlFor="user-pass">
                    Kata Sandi {editingUser ? "(Biarkan kosong jika tidak diubah)" : "*"}
                  </label>
                  <input
                    id="user-pass"
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Role */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700" htmlFor="user-role">
                    Peran Utama (Primary Role)
                  </label>
                  <select
                    id="user-role"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as "ADMIN" | "PROCTOR" | "TEACHER" })
                    }
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="PROCTOR">PROCTOR — Pengawas Ruangan</option>
                    <option value="TEACHER">TEACHER — Guru Pengampu</option>
                    <option value="ADMIN">ADMIN — Administrator Utama (Akses Penuh)</option>
                  </select>
                </div>

                {/* Lab Allocation */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700" htmlFor="user-lab">
                    Alokasi Laboratorium / Posisi
                  </label>
                  <input
                    id="user-lab"
                    type="text"
                    value={formData.labAllocation}
                    onChange={(e) => setFormData({ ...formData, labAllocation: e.target.value })}
                    placeholder="Contoh: Lab CBT-08"
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Status Switch */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">Status Akses Masuk Akun</span>
                  <span className="text-[11px] text-slate-500">Nonaktifkan untuk membekukan akun sementara</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Permission Checkbox Matrix Section */}
              <div className="border-t border-slate-200 pt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">Matriks Centang Hak Akses Menu (Custom Overrides)</span>
                    <span className="text-xs text-slate-500">
                      Centang untuk memberikan izin tambahan di luar batas bawaan peran
                    </span>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-100">
                    {formData.customPermissions.length} Izin Dicentang
                  </span>
                </div>

                {formData.role === "ADMIN" ? (
                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    Peran Administrator memiliki hak akses penuh secara otomatis ke seluruh menu (`*`).
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                    {ALL_PERMISSIONS.map((perm) => {
                      const isChecked = formData.customPermissions.includes(perm.id);
                      return (
                        <label
                          key={perm.id}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                            isChecked
                              ? "bg-blue-50/60 border-blue-500 ring-2 ring-blue-500/10"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(perm.id)}
                            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-slate-900 leading-snug">{perm.label}</span>
                            <span className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{perm.description}</span>
                            <span className="text-[9px] font-mono text-slate-400 mt-1 uppercase tracking-wider">{perm.id}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setIsModalOpen(false)}
                  type="button"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition-colors shadow-sm flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">save</span>
                      <span>Simpan Hak Akses</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
