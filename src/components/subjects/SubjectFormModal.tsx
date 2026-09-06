"use client";

import React, { useState, useEffect } from "react";
import { Subject, CreateSubjectInput } from "@/modules/subject/types";
import { validateCreateSubject } from "@/modules/subject/validations";
import { Alert } from "@/lib/sweetalert";

interface SubjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message?: string) => void;
  subjectToEdit?: Subject | null;
  existingCategories?: string[];
  existingGradeLevels?: string[];
}

const DEFAULT_CATEGORIES = [
  "Wajib Umum",
  "Peminatan MIPA",
  "Peminatan IPS",
  "Bahasa & Budaya",
  "Kejuruan / Vokasi",
  "Muatan Lokal",
  "Literasi & Skolastik",
];

const DEFAULT_GRADE_LEVELS = ["Semua", "X", "XI", "XII"];

export default function SubjectFormModal({
  isOpen,
  onClose,
  onSuccess,
  subjectToEdit,
  existingCategories = [],
  existingGradeLevels = [],
}: SubjectFormModalProps) {
  const isEdit = Boolean(subjectToEdit);

  const [formData, setFormData] = useState<CreateSubjectInput>({
    code: "",
    name: "",
    educationLevel: "SEMUA",
    category: "Wajib Umum",
    gradeLevel: "Semua",
    passingGrade: 75,
    description: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [customCategory, setCustomCategory] = useState(false);

  // Dynamic Grade Options based on selected educationLevel
  const getGradeOptionsForLevel = (level?: string) => {
    switch (level) {
      case "MI":
        return ["Semua", "1", "2", "3", "4", "5", "6"];
      case "MTS":
        return ["Semua", "VII", "VIII", "IX"];
      case "MA":
        return ["Semua", "X", "XI", "XII"];
      default:
        return ["Semua", "1-6 (MI)", "VII-IX (MTs)", "X-XII (MA)"];
    }
  };

  const getCategorySuggestionsForLevel = (level?: string) => {
    switch (level) {
      case "MI":
        return ["PAI & Bahasa Arab", "Tematik Umum", "Wajib Umum", "Muatan Lokal", "Literasi & Skolastik"];
      case "MTS":
        return ["PAI & Bahasa Arab", "Wajib Umum", "Muatan Lokal", "Literasi & Skolastik"];
      case "MA":
        return [
          "PAI & Bahasa Arab",
          "Wajib Umum",
          "Peminatan MIPA",
          "Peminatan IPS",
          "Peminatan Keagamaan",
          "Bahasa & Budaya",
          "Kejuruan / Vokasi",
          "Muatan Lokal",
          "Literasi & Skolastik",
        ];
      default:
        return DEFAULT_CATEGORIES;
    }
  };

  const currentGradeOptions = Array.from(
    new Set([...getGradeOptionsForLevel(formData.educationLevel), ...existingGradeLevels])
  );

  const categoryOptions = Array.from(
    new Set([...getCategorySuggestionsForLevel(formData.educationLevel), ...existingCategories])
  );

  useEffect(() => {
    if (subjectToEdit) {
      setFormData({
        code: subjectToEdit.code,
        name: subjectToEdit.name,
        educationLevel: (subjectToEdit.educationLevel || "SEMUA").toUpperCase() as any,
        category: subjectToEdit.category || "Wajib Umum",
        gradeLevel: subjectToEdit.gradeLevel || "Semua",
        passingGrade: Number(subjectToEdit.passingGrade) || 75,
        description: subjectToEdit.description || "",
        isActive: subjectToEdit.isActive,
      });
      setCustomCategory(!DEFAULT_CATEGORIES.includes(subjectToEdit.category));
    } else {
      setFormData({
        code: "",
        name: "",
        educationLevel: "SEMUA",
        category: "Wajib Umum",
        gradeLevel: "Semua",
        passingGrade: 75,
        description: "",
        isActive: true,
      });
      setCustomCategory(false);
    }
    setErrors({});
  }, [subjectToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "code") {
      setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
    } else if (name === "passingGrade") {
      const num = parseFloat(value);
      setFormData((prev) => ({ ...prev, [name]: isNaN(num) ? 0 : num }));
    } else if (name === "educationLevel") {
      setFormData((prev) => ({
        ...prev,
        educationLevel: value as any,
        gradeLevel: "Semua",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateCreateSubject(formData);
    if (!validation.success && validation.errors) {
      const errMap: Record<string, string> = {};
      validation.errors.forEach((err) => {
        errMap[err.field] = err.message;
      });
      setErrors(errMap);
      return;
    }

    setSubmitting(true);
    try {
      const url = isEdit ? `/api/subjects/${subjectToEdit!.id}` : "/api/subjects";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal menyimpan mata pelajaran");
      }

      const successMsg = isEdit
        ? `Mata pelajaran "${formData.name}" berhasil diperbarui.`
        : `Mata pelajaran "${formData.name}" berhasil ditambahkan ke kurikulum.`;

      Alert.success(isEdit ? "Perubahan Disimpan" : "Berhasil Ditambahkan", successMsg);
      onSuccess(successMsg);
      onClose();
    } catch (err: any) {
      Alert.error("Gagal Menyimpan", err.message || "Terjadi kesalahan saat memproses data");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <span className="material-symbols-outlined text-[22px]">menu_book</span>
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {isEdit ? "Edit Data Mata Pelajaran" : "Tambah Mata Pelajaran Baru"}
              </h3>
              <p className="text-xs text-slate-400">
                {isEdit
                  ? `Mengubah konfigurasi mata pelajaran ${subjectToEdit?.code}`
                  : "Daftarkan mata pelajaran atau bidang studi ke sistem CBT"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Jenjang Pendidikan Scope Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Jenjang Pendidikan <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              {[
                { id: "SEMUA", label: "SEMUA", desc: "Lintas Jenjang / Umum" },
                { id: "MI", label: "MI", desc: "Madrasah Ibtidaiyah (SD)" },
                { id: "MTS", label: "MTs", desc: "Madrasah Tsanawiyah (SMP)" },
                { id: "MA", label: "MA", desc: "Madrasah Aliyah (SMA)" },
              ].map((lvl) => {
                const isSelected = (formData.educationLevel || "SEMUA") === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        educationLevel: lvl.id as any,
                        gradeLevel: "Semua",
                      }));
                    }}
                    className={`px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white text-blue-600 shadow-sm font-bold ring-2 ring-blue-500/20"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    }`}
                  >
                    <div className="text-xs font-black">{lvl.label}</div>
                    <div className="text-[10px] text-slate-500 leading-tight">{lvl.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Baris 1: Kode & Nama Mapel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kode Mapel <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="CONTOH: MAT-01"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                  errors.code ? "border-red-400 bg-red-50/20" : "border-slate-200"
                }`}
              />
              {errors.code ? (
                <p className="text-[11px] text-red-500 mt-1">{errors.code}</p>
              ) : (
                <p className="text-[10px] text-slate-400 mt-1">Gunakan kode unik (kapital)</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Mata Pelajaran <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Contoh: Matematika Peminatan"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                  errors.name ? "border-red-400 bg-red-50/20" : "border-slate-200"
                }`}
              />
              {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
            </div>
          </div>

          {/* Baris 2: Kelompok / Kategori & Tingkat Kelas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Kategori / Kelompok
                </label>
                <button
                  type="button"
                  onClick={() => setCustomCategory(!customCategory)}
                  className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold underline"
                >
                  {customCategory ? "Pilih dari daftar" : "+ Input Kustom"}
                </button>
              </div>

              {customCategory ? (
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Ketik kategori baru..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              ) : (
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Tingkat Kelas ({formData.educationLevel || "SEMUA"})
              </label>
              <select
                name="gradeLevel"
                value={formData.gradeLevel}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                {currentGradeOptions.map((grd) => (
                  <option key={grd} value={grd}>
                    {grd === "Semua" ? "Semua Tingkat (Umum)" : `Kelas ${grd}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Baris 3: Nilai KKM & Status Aktif */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nilai KKM Minimal
                </label>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                  {formData.passingGrade}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  name="passingGrade"
                  min="50"
                  max="100"
                  step="1"
                  value={formData.passingGrade}
                  onChange={handleChange}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <input
                  type="number"
                  name="passingGrade"
                  min="0"
                  max="100"
                  value={formData.passingGrade}
                  onChange={handleChange}
                  className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-center text-slate-800"
                />
              </div>
              {errors.passingGrade && (
                <p className="text-[11px] text-red-500 mt-1">{errors.passingGrade}</p>
              )}
              <p className="text-[10px] text-slate-400 mt-1">Standar kelulusan ujian CBT (0 - 100)</p>
            </div>

            <div className="flex flex-col justify-center">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Status Aktivasi
              </label>
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800">
                    {formData.isActive ? "Aktif (Dapat Dijadwalkan)" : "Nonaktif (Diarsipkan)"}
                  </span>
                  <p className="text-[10px] text-slate-500">
                    Mata pelajaran aktif dapat dipilih pada bank soal dan pembuatan ujian.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Baris 4: Deskripsi / Catatan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Deskripsi / Catatan Kurikulum (Opsional)
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description || ""}
              onChange={handleChange}
              placeholder="Tambahkan ringkasan silabus, ruang lingkup materi, atau instruksi pengampu..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              {submitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>{isEdit ? "Simpan Perubahan" : "Tambah Mata Pelajaran"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
