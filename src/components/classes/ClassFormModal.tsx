"use client";

import React, { useState, useEffect } from "react";

interface TeacherOption {
  id: string;
  name: string;
  nip?: string;
}


export interface ClassGroupItem {
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
}

export interface ClassFormInput {
  code: string;
  name: string;
  educationLevel: string;
  gradeLevel: string;
  major: string;
  academicYear: string;
  capacity: number;
  homeTeacherName: string;
  isActive: boolean;
}

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message?: string) => void;
  classToEdit?: ClassGroupItem | null;
  initialEducationLevel?: string;
}

const GRADE_LEVELS: Record<string, string[]> = {
  MI: ["1", "2", "3", "4", "5", "6"],
  MTS: ["VII", "VIII", "IX"],
  MA: ["X", "XI", "XII"],
};

const MAJORS_BY_LEVEL: Record<string, string[]> = {
  MI: ["Tematik Umum", "PAI & B. Arab", "Umum"],
  MTS: ["Umum", "Tahfidz", "Unggulan", "Kelas Riset"],
  MA: ["MIPA", "IPS", "Keagamaan", "Bahasa & Budaya", "RPL", "TKJ", "Umum"],
};

export default function ClassFormModal({
  isOpen,
  onClose,
  onSuccess,
  classToEdit,
  initialEducationLevel = "MA",
}: ClassFormModalProps) {
  const isEdit = Boolean(classToEdit);

  const currentYear = new Date().getFullYear();
  const defaultAcademicYear = `${currentYear}/${currentYear + 1}`;

  const [formData, setFormData] = useState<ClassFormInput>({
    code: "",
    name: "",
    educationLevel: initialEducationLevel || "MA",
    gradeLevel: "X",
    major: "MIPA",
    academicYear: defaultAcademicYear,
    capacity: 36,
    homeTeacherName: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // ── Teacher list from DB ──────────────────────────────────────────────
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setLoadingTeachers(true);
    fetch("/api/users?role=TEACHER")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setTeachers(data.data.map((u: any) => ({ id: u.id, name: u.name, nip: u.nip })));
        } else {
          setTeachers([]);
        }
      })
      .catch(() => setTeachers([]))
      .finally(() => setLoadingTeachers(false));
  }, [isOpen]);

  useEffect(() => {
    if (classToEdit) {
      const lvl = (classToEdit.educationLevel || "MA").toUpperCase();
      setFormData({
        code: classToEdit.code || "",
        name: classToEdit.name || "",
        educationLevel: lvl,
        gradeLevel: classToEdit.gradeLevel || (GRADE_LEVELS[lvl] ? GRADE_LEVELS[lvl][0] : "X"),
        major: classToEdit.major || (MAJORS_BY_LEVEL[lvl] ? MAJORS_BY_LEVEL[lvl][0] : "Umum"),
        academicYear: classToEdit.academicYear || defaultAcademicYear,
        capacity: classToEdit.capacity || 36,
        homeTeacherName: classToEdit.homeTeacherName || "",
        isActive: classToEdit.isActive !== undefined ? classToEdit.isActive : true,
      });
    } else {
      const lvl = initialEducationLevel && initialEducationLevel !== "ALL" ? initialEducationLevel : "MA";
      const grades = GRADE_LEVELS[lvl] || GRADE_LEVELS.MA;
      const majors = MAJORS_BY_LEVEL[lvl] || MAJORS_BY_LEVEL.MA;

      setFormData({
        code: "",
        name: "",
        educationLevel: lvl,
        gradeLevel: grades[0] || "X",
        major: majors[0] || "Umum",
        academicYear: defaultAcademicYear,
        capacity: 36,
        homeTeacherName: "",
        isActive: true,
      });
    }
    setErrors({});
    setGeneralError(null);
  }, [classToEdit, isOpen, initialEducationLevel, defaultAcademicYear]);

  if (!isOpen) return null;

  const handleEducationLevelChange = (newLevel: string) => {
    const grades = GRADE_LEVELS[newLevel] || GRADE_LEVELS.MA;
    const majors = MAJORS_BY_LEVEL[newLevel] || MAJORS_BY_LEVEL.MA;

    setFormData((prev) => {
      const nextGrade = grades.includes(prev.gradeLevel) ? prev.gradeLevel : grades[0];
      const nextMajor = majors.includes(prev.major) ? prev.major : majors[0];
      return {
        ...prev,
        educationLevel: newLevel,
        gradeLevel: nextGrade,
        major: nextMajor,
      };
    });

    if (errors.educationLevel) {
      setErrors((prev) => ({ ...prev, educationLevel: "" }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = "Kode rombel wajib diisi";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Nama kelas lengkap wajib diisi";
    }
    if (!formData.gradeLevel) {
      newErrors.gradeLevel = "Tingkat kelas wajib dipilih";
    }
    if (!formData.academicYear.trim()) {
      newErrors.academicYear = "Tahun ajaran wajib diisi";
    }
    if (!formData.capacity || formData.capacity <= 0) {
      newErrors.capacity = "Kapasitas minimal 1 siswa";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const url = isEdit ? `/api/classes/${classToEdit!.id}` : "/api/classes";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Terjadi kesalahan saat menyimpan data rombel");
      }

      onSuccess(data.message);
      onClose();
    } catch (err: any) {
      setGeneralError(err.message || "Gagal menyimpan rombel kelas");
    } finally {
      setSubmitting(false);
    }
  };

  const currentGrades = GRADE_LEVELS[formData.educationLevel] || GRADE_LEVELS.MA;
  const currentMajors = MAJORS_BY_LEVEL[formData.educationLevel] || MAJORS_BY_LEVEL.MA;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header - Dark Slate Theme identical to SemesterFormModal */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <span className="material-symbols-outlined text-[22px]">
                {isEdit ? "edit_square" : "domain_add"}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {isEdit ? "Edit Rombel Kelas" : "Tambah Rombel Kelas Baru"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Isi form di bawah ini untuk {isEdit ? "memperbarui" : "menambahkan"} data rombongan belajar kelas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-xl transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {generalError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px] text-red-500 shrink-0">error</span>
              <span>{generalError}</span>
            </div>
          )}

          {/* Jenjang Pendidikan Segmented Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Jenjang Pendidikan <span className="text-red-500">*</span>
            </label>
            {initialEducationLevel && initialEducationLevel !== "ALL" && initialEducationLevel !== "SEMUA" ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                    formData.educationLevel === "MI"
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                      : formData.educationLevel === "MTS"
                      ? "bg-sky-100 text-sky-700 border border-sky-300"
                      : "bg-purple-100 text-purple-700 border border-purple-300"
                  }`}>
                    {formData.educationLevel}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {formData.educationLevel === "MI" ? "Madrasah Ibtidaiyah (MI)" : formData.educationLevel === "MTS" ? "Madrasah Tsanawiyah (MTs)" : "Madrasah Aliyah (MA)"}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">Terkunci otomatis sesuai jenjang akun madrasah</span>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600">
                  {formData.educationLevel}
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { key: "MI", label: "MI", desc: "Madrasah Ibtidaiyah", badge: "emerald", icon: "child_care" },
                  { key: "MTS", label: "MTs", desc: "Madrasah Tsanawiyah", badge: "sky", icon: "school" },
                  { key: "MA", label: "MA / SMA", desc: "Madrasah Aliyah", badge: "purple", icon: "account_balance" },
                ].map((item) => {
                  const isSelected = formData.educationLevel === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleEducationLevelChange(item.key)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                        isSelected
                          ? item.badge === "emerald"
                            ? "bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs"
                            : item.badge === "sky"
                            ? "bg-sky-50/80 border-sky-400 ring-2 ring-sky-500/20 shadow-xs"
                            : "bg-purple-50/80 border-purple-400 ring-2 ring-purple-500/20 shadow-xs"
                          : "bg-slate-50/70 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-black uppercase tracking-wider ${
                          isSelected
                            ? item.badge === "emerald"
                              ? "text-emerald-700"
                              : item.badge === "sky"
                              ? "text-sky-700"
                              : "text-purple-700"
                            : "text-slate-700"
                        }`}>
                          {item.label}
                        </span>
                        {isSelected && (
                          <span className="material-symbols-outlined text-[16px] text-blue-600">
                            check_circle
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium leading-tight">
                        {item.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Kode Rombel & Tahun Ajaran */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kode Rombel (Unik) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                placeholder={
                  formData.educationLevel === "MI"
                    ? "Contoh: 1-A, 6-B"
                    : formData.educationLevel === "MTS"
                    ? "Contoh: VII-1, IX-A"
                    : "Contoh: X-MIPA-1, XII-IPS-2"
                }
                value={formData.code}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all uppercase ${
                  errors.code ? "border-red-500 bg-red-50/20" : "border-slate-300 focus:border-blue-500"
                }`}
              />
              {errors.code && (
                <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.code}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tahun Ajaran <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="academicYear"
                placeholder="Contoh: 2024/2025"
                value={formData.academicYear}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${
                  errors.academicYear ? "border-red-500 bg-red-50/20" : "border-slate-300 focus:border-blue-500"
                }`}
              />
              {errors.academicYear && (
                <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.academicYear}</p>
              )}
            </div>
          </div>

          {/* Nama Kelas Lengkap */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Kelas Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder={
                formData.educationLevel === "MI"
                  ? "Contoh: Kelas 1-A Ibnu Sina"
                  : formData.educationLevel === "MTS"
                  ? "Contoh: Kelas VII-1 Tsanawiyah Unggulan"
                  : "Contoh: Kelas X Rekayasa Perangkat Lunak 1"
              }
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${
                errors.name ? "border-red-500 bg-red-50/20" : "border-slate-300 focus:border-blue-500"
              }`}
            />
            {errors.name && (
              <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.name}</p>
            )}
          </div>

          {/* Tingkat Kelas & Jurusan / Rumpun */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tingkat Kelas <span className="text-red-500">*</span>
              </label>
              <select
                name="gradeLevel"
                value={formData.gradeLevel}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white"
              >
                {currentGrades.map((grade) => (
                  <option key={grade} value={grade}>
                    Tingkat {grade} ({formData.educationLevel})
                  </option>
                ))}
              </select>
              {errors.gradeLevel && (
                <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.gradeLevel}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Jurusan / Rumpun Peminatan
              </label>
              <select
                name="major"
                value={formData.major}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white"
              >
                {currentMajors.map((maj) => (
                  <option key={maj} value={maj}>
                    {maj}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Kapasitas Kursi & Wali Kelas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kapasitas Kursi / Siswa <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="capacity"
                  min="1"
                  max="100"
                  value={formData.capacity}
                  onChange={handleChange}
                  className={`w-full pl-3.5 pr-14 py-2.5 rounded-xl border text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${
                    errors.capacity ? "border-red-500 bg-red-50/20" : "border-slate-300 focus:border-blue-500"
                  }`}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium pointer-events-none">
                  Siswa
                </span>
              </div>
              {errors.capacity && (
                <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.capacity}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Wali Kelas
              </label>

              {/* Search filter */}
              {teachers.length > 5 && (
                <div className="relative mb-1.5">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[15px] text-slate-400">search</span>
                  <input
                    type="text"
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                    placeholder="Cari nama guru..."
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              )}

              <div className="relative">
                <select
                  name="homeTeacherName"
                  value={formData.homeTeacherName}
                  onChange={handleChange}
                  disabled={loadingTeachers}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white appearance-none disabled:opacity-60"
                >
                  <option value="">— Pilih Wali Kelas —</option>
                  {loadingTeachers ? (
                    <option disabled>Memuat data guru...</option>
                  ) : teachers.length === 0 ? (
                    <option disabled>Belum ada data guru (TEACHER)</option>
                  ) : (
                    teachers
                      .filter((t) =>
                        teacherSearch
                          ? t.name.toLowerCase().includes(teacherSearch.toLowerCase())
                          : true
                      )
                      .map((t) => (
                        <option key={t.id} value={t.name}>
                          {t.name}{t.nip ? ` (${t.nip})` : ""}
                        </option>
                      ))
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  {loadingTeachers ? (
                    <span className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">expand_more</span>
                  )}
                </div>
              </div>

              {/* Fallback manual input if no teachers */}
              {!loadingTeachers && teachers.length === 0 && (
                <input
                  type="text"
                  name="homeTeacherName"
                  value={formData.homeTeacherName}
                  onChange={handleChange}
                  placeholder="Ketik nama wali kelas secara manual"
                  className="w-full mt-2 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              )}

              {formData.homeTeacherName && (
                <p className="text-[10px] text-blue-600 font-semibold mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[11px]">check_circle</span>
                  Wali kelas: {formData.homeTeacherName}
                </p>
              )}
            </div>
          </div>

          {/* Checkbox Set Active - Identical to SemesterFormModal */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-start gap-3">
            <input
              type="checkbox"
              id="isActiveClass"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="mt-0.5 w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="isActiveClass" className="text-xs text-slate-700 cursor-pointer select-none">
              <span className="font-bold text-slate-900 block">Jadikan Rombel Aktif</span>
              Rombel yang aktif dapat dipilih dalam pembuatan jadwal ujian CBT, distribusi token, dan presensi peserta.
            </label>
          </div>

          {/* Buttons Footer - Identical to SemesterFormModal */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>{isEdit ? "Simpan Perubahan" : "Tambah Rombel"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
