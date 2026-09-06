"use client";

import React, { useState, useEffect } from "react";
import { Alert } from "@/lib/sweetalert";

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
}

interface ClassGroupOption {
  id: string;
  code: string;
  name: string;
  gradeLevel: string;
  educationLevel: string;
  capacity: number;
  homeTeacherName?: string;
}

interface StudentFormModalProps {
  isOpen: boolean;
  editingStudent: Student | null;
  userEducationLevel?: string | null;
  onClose: () => void;
  onSaved: () => void;
}

const JENJANG_OPTIONS = ["MI", "MTS", "MA"];
const GRADE_LEVELS: Record<string, string[]> = {
  MI: ["1", "2", "3", "4", "5", "6"],
  MTS: ["VII", "VIII", "IX"],
  MA: ["X", "XI", "XII"],
};

export default function StudentFormModal({
  isOpen,
  editingStudent,
  userEducationLevel,
  onClose,
  onSaved,
}: StudentFormModalProps) {
  const [form, setForm] = useState({
    nisn: "",
    name: "",
    placeOfBirth: "",
    dateOfBirth: "",
    gender: "L",
    classGroup: "",
    classGroupId: "",
    gradeLevel: "",
    educationLevel: userEducationLevel || "MI",
    username: "",
    password: "",
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [classOptions, setClassOptions] = useState<ClassGroupOption[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Fetch class groups when jenjang changes
  useEffect(() => {
    if (!isOpen) return;
    const lvl = form.educationLevel;
    if (!lvl) return;

    setLoadingClasses(true);
    const params = new URLSearchParams();
    params.set("educationLevel", lvl);
    params.set("isActive", "true");

    fetch(`/api/classes?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setClassOptions(data.data);
        } else {
          setClassOptions([]);
        }
      })
      .catch(() => setClassOptions([]))
      .finally(() => setLoadingClasses(false));
  }, [isOpen, form.educationLevel]);

  useEffect(() => {
    if (isOpen) {
      if (editingStudent) {
        setForm({
          nisn: editingStudent.nisn || "",
          name: editingStudent.name || "",
          placeOfBirth: editingStudent.placeOfBirth || "",
          dateOfBirth: editingStudent.dateOfBirth
            ? new Date(editingStudent.dateOfBirth).toISOString().slice(0, 10)
            : "",
          gender: editingStudent.gender || "L",
          classGroup: editingStudent.classGroup || "",
          classGroupId: "",
          gradeLevel: editingStudent.gradeLevel || "",
          educationLevel: editingStudent.educationLevel || userEducationLevel || "MI",
          username: editingStudent.username || "",
          password: "",
          isActive: editingStudent.isActive,
        });
      } else {
        setForm({
          nisn: "",
          name: "",
          placeOfBirth: "",
          dateOfBirth: "",
          gender: "L",
          classGroup: "",
          classGroupId: "",
          gradeLevel: "",
          educationLevel: userEducationLevel || "MI",
          username: "",
          password: "password123",
          isActive: true,
        });
      }
      setErrors({});
    }
  }, [isOpen, editingStudent, userEducationLevel]);

  // When a class group is selected from dropdown, auto-set gradeLevel
  const handleClassGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      setForm((f) => ({ ...f, classGroup: "", classGroupId: "", gradeLevel: "" }));
      return;
    }
    const found = classOptions.find((c) => c.id === selectedId);
    if (found) {
      setForm((f) => ({
        ...f,
        classGroupId: found.id,
        classGroup: found.name,
        gradeLevel: found.gradeLevel,
      }));
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.nisn.trim() || !/^\d{10}$/.test(form.nisn.replace(/\s/g, "")))
      errs.nisn = "NISN harus 10 digit angka";
    if (!form.name.trim() || form.name.trim().length < 3)
      errs.name = "Nama minimal 3 karakter";
    if (!form.placeOfBirth.trim())
      errs.placeOfBirth = "Tempat lahir tidak boleh kosong";
    if (!form.dateOfBirth)
      errs.dateOfBirth = "Tanggal lahir tidak boleh kosong";
    if (!form.username.trim() || form.username.length < 4)
      errs.username = "Username minimal 4 karakter";
    if (/\s/.test(form.username))
      errs.username = "Username tidak boleh mengandung spasi";
    if (!editingStudent && !form.password.trim())
      errs.password = "Password wajib diisi untuk siswa baru";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    Alert.loading("Menyimpan data siswa...");

    try {
      const payload: any = {
        nisn: form.nisn.trim(),
        name: form.name.trim(),
        placeOfBirth: form.placeOfBirth.trim(),
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender,
        classGroup: form.classGroup.trim() || undefined,
        classGroupId: form.classGroupId || undefined,
        gradeLevel: form.gradeLevel || undefined,
        educationLevel: form.educationLevel,
        username: form.username.trim(),
        isActive: form.isActive,
      };
      if (form.password.trim()) payload.password = form.password.trim();

      const url = editingStudent ? `/api/students/${editingStudent.id}` : "/api/students";
      const method = editingStudent ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      Alert.close();

      if (data.success) {
        Alert.success(editingStudent ? "Data siswa berhasil diperbarui" : "Siswa baru berhasil ditambahkan");
        onSaved();
        onClose();
      } else {
        Alert.error("Gagal Menyimpan", data.message);
      }
    } catch {
      Alert.close();
      Alert.error("Terjadi Kesalahan", "Gagal menghubungi server. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const gradeLevels = GRADE_LEVELS[form.educationLevel] || [];

  // Find the currently selected class option ID (for edit mode, match by name)
  const selectedClassId = form.classGroupId
    ? form.classGroupId
    : classOptions.find((c) => c.name === form.classGroup)?.id || "";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200/80">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <span className="material-symbols-outlined text-white text-[20px]">school</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">
                {editingStudent ? "Edit Data Siswa" : "Tambah Siswa Baru"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {editingStudent ? `NISN: ${editingStudent.nisn}` : "Isi formulir data siswa dengan lengkap"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {/* Row: NISN + Jenjang */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                NISN <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.nisn}
                onChange={(e) => setForm((f) => ({ ...f, nisn: e.target.value }))}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors ${errors.nisn ? "border-rose-400 bg-rose-50" : "border-slate-200 bg-slate-50"}`}
                placeholder="10 digit angka"
                maxLength={10}
                disabled={!!editingStudent}
              />
              {errors.nisn && <p className="text-[10px] text-rose-600 mt-1 font-medium">{errors.nisn}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                Jenjang <span className="text-rose-500">*</span>
              </label>
              <select
                value={form.educationLevel}
                onChange={(e) => setForm((f) => ({ ...f, educationLevel: e.target.value, gradeLevel: "", classGroup: "", classGroupId: "" }))}
                disabled={!!userEducationLevel && userEducationLevel !== "SEMUA"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors disabled:opacity-60"
              >
                {JENJANG_OPTIONS.map((j) => (
                  <option key={j} value={j}>{j === "MI" ? "MI - Madrasah Ibtidaiyah" : j === "MTS" ? "MTs - Madrasah Tsanawiyah" : "MA - Madrasah Aliyah"}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors ${errors.name ? "border-rose-400 bg-rose-50" : "border-slate-200 bg-slate-50"}`}
              placeholder="Nama siswa tanpa gelar"
            />
            {errors.name && <p className="text-[10px] text-rose-600 mt-1 font-medium">{errors.name}</p>}
          </div>

          {/* Row: Tempat & Tanggal Lahir */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                Tempat Lahir <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.placeOfBirth}
                onChange={(e) => setForm((f) => ({ ...f, placeOfBirth: e.target.value }))}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors ${errors.placeOfBirth ? "border-rose-400 bg-rose-50" : "border-slate-200 bg-slate-50"}`}
                placeholder="Kota/Kabupaten"
              />
              {errors.placeOfBirth && <p className="text-[10px] text-rose-600 mt-1 font-medium">{errors.placeOfBirth}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                Tanggal Lahir <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors ${errors.dateOfBirth ? "border-rose-400 bg-rose-50" : "border-slate-200 bg-slate-50"}`}
                max={new Date().toISOString().slice(0, 10)}
              />
              {errors.dateOfBirth && <p className="text-[10px] text-rose-600 mt-1 font-medium">{errors.dateOfBirth}</p>}
            </div>
          </div>

          {/* Row: Gender */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
              Jenis Kelamin <span className="text-rose-500">*</span>
            </label>
            <div className="flex rounded-xl border border-slate-200 overflow-hidden">
              {[{ v: "L", label: "♂ Laki-laki" }, { v: "P", label: "♀ Perempuan" }].map((g) => (
                <button
                  key={g.v}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, gender: g.v }))}
                  className={`flex-1 py-2.5 text-[11px] font-bold transition-all ${form.gender === g.v ? "bg-emerald-600 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Rombel / Kelas ─────────────────────────────────────────────── */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200/60 rounded-2xl space-y-3">
            <p className="text-[11px] font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">meeting_room</span>
              Penempatan Rombel / Kelas
            </p>

            {/* Dropdown Rombel dari DB */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                Kelas / Rombongan Belajar
              </label>
              <div className="relative">
                <select
                  value={selectedClassId}
                  onChange={handleClassGroupChange}
                  disabled={loadingClasses}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors disabled:opacity-60 appearance-none"
                >
                  <option value="">— Tidak / Belum Ada Kelas —</option>
                  {loadingClasses ? (
                    <option disabled>Memuat data kelas...</option>
                  ) : classOptions.length === 0 ? (
                    <option disabled>Belum ada rombel untuk jenjang {form.educationLevel}</option>
                  ) : (
                    classOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — Tingkat {c.gradeLevel}{c.homeTeacherName ? ` (${c.homeTeacherName})` : ""}
                      </option>
                    ))
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  {loadingClasses ? (
                    <span className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">expand_more</span>
                  )}
                </div>
              </div>
              {selectedClassId && (
                <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[11px]">check_circle</span>
                  Tingkat otomatis diisi dari rombel yang dipilih
                </p>
              )}
            </div>

            {/* Tingkat — auto-filled, still editable */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Tingkat Kelas</label>
              <select
                value={form.gradeLevel}
                onChange={(e) => setForm((f) => ({ ...f, gradeLevel: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="">— Pilih Tingkat —</option>
                {gradeLevels.map((g) => <option key={g} value={g}>Tingkat {g}</option>)}
              </select>
            </div>
          </div>

          {/* Divider — Login */}
          <div className="border-t border-slate-100 pt-4">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-blue-600">lock</span>
              Akun Login Ujian
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Username <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.replace(/\s/g, "") }))}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${errors.username ? "border-rose-400 bg-rose-50" : "border-slate-200 bg-slate-50"}`}
                  placeholder="username.siswa"
                  autoComplete="off"
                />
                {errors.username && <p className="text-[10px] text-rose-600 mt-1 font-medium">{errors.username}</p>}
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Password {!editingStudent && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${errors.password ? "border-rose-400 bg-rose-50" : "border-slate-200 bg-slate-50"}`}
                  placeholder={editingStudent ? "Kosongkan jika tidak diubah" : "Min. 6 karakter"}
                  autoComplete="new-password"
                />
                {errors.password && <p className="text-[10px] text-rose-600 mt-1 font-medium">{errors.password}</p>}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${form.isActive ? "bg-emerald-500" : "bg-slate-300"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
            <span className="text-sm font-semibold text-slate-700">
              Siswa {form.isActive ? <span className="text-emerald-600">Aktif</span> : <span className="text-slate-500">Nonaktif</span>}
            </span>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0 bg-slate-50/80 rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            form=""
            onClick={handleSubmit as any}
            disabled={submitting}
            className="px-6 py-2.5 text-sm font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-md shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">{submitting ? "hourglass_empty" : (editingStudent ? "save" : "person_add")}</span>
            {submitting ? "Menyimpan..." : (editingStudent ? "Simpan Perubahan" : "Tambah Siswa")}
          </button>
        </div>
      </div>
    </div>
  );
}
