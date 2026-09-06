"use client";

import React, { useState, useEffect } from "react";
import { Semester, CreateSemesterInput, SemesterType } from "@/modules/semester/types";
import { validateCreateSemester } from "@/modules/semester/validations";

interface SemesterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  semesterToEdit?: Semester | null;
}

export default function SemesterFormModal({
  isOpen,
  onClose,
  onSuccess,
  semesterToEdit,
}: SemesterFormModalProps) {
  const isEdit = Boolean(semesterToEdit);

  const [formData, setFormData] = useState<CreateSemesterInput>({
    code: "",
    name: "",
    academicYear: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
    type: "GANJIL",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    isActive: false,
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (semesterToEdit) {
      const startStr = typeof semesterToEdit.startDate === "string" 
        ? semesterToEdit.startDate.split("T")[0]
        : new Date(semesterToEdit.startDate).toISOString().split("T")[0];
      
      const endStr = typeof semesterToEdit.endDate === "string"
        ? semesterToEdit.endDate.split("T")[0]
        : new Date(semesterToEdit.endDate).toISOString().split("T")[0];

      setFormData({
        code: semesterToEdit.code,
        name: semesterToEdit.name,
        academicYear: semesterToEdit.academicYear,
        type: semesterToEdit.type,
        startDate: startStr,
        endDate: endStr,
        isActive: semesterToEdit.isActive,
        description: semesterToEdit.description || "",
      });
    } else {
      const currentYear = new Date().getFullYear();
      setFormData({
        code: `${currentYear}/${currentYear + 1}-1`,
        name: `Semester Ganjil ${currentYear}/${currentYear + 1}`,
        academicYear: `${currentYear}/${currentYear + 1}`,
        type: "GANJIL",
        startDate: `${currentYear}-07-15`,
        endDate: `${currentYear}-12-20`,
        isActive: false,
        description: "",
      });
    }
    setErrors({});
    setGeneralError(null);
  }, [semesterToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // Auto update name when type or academicYear changes if user hasn't heavily customized
      if (name === "type" || name === "academicYear") {
        const typeLabel = next.type === "GANJIL" ? "Ganjil" : next.type === "GENAP" ? "Genap" : "Antara";
        next.name = `Semester ${typeLabel} ${next.academicYear}`;
        const typeCode = next.type === "GANJIL" ? "1" : next.type === "GENAP" ? "2" : "3";
        next.code = `${next.academicYear}-${typeCode}`;
      }

      return next;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    // Client side validation
    const validation = validateCreateSemester(formData);
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
      const url = isEdit ? `/api/semesters/${semesterToEdit!.id}` : "/api/semesters";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Terjadi kesalahan saat menyimpan data");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setGeneralError(err.message || "Gagal menyimpan semester");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <span className="material-symbols-outlined text-[22px]">
                {isEdit ? "edit_calendar" : "calendar_add_on"}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {isEdit ? "Edit Semester" : "Tambah Semester Baru"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Isi form di bawah ini untuk {isEdit ? "memperbarui" : "menambahkan"} data semester ujian
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {generalError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px] text-red-500 shrink-0">error</span>
              <span>{generalError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tahun Ajaran */}
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

            {/* Tipe Semester */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tipe Semester <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white"
              >
                <option value="GANJIL">Ganjil</option>
                <option value="GENAP">Genap</option>
                <option value="ANTARA">Antara / Remedial</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Kode Semester */}
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kode Semester <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                placeholder="2024/2025-1"
                value={formData.code}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${
                  errors.code ? "border-red-500 bg-red-50/20" : "border-slate-300 focus:border-blue-500"
                }`}
              />
              {errors.code && (
                <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.code}</p>
              )}
            </div>

            {/* Nama Semester */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Semester <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Semester Ganjil 2024/2025"
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tanggal Mulai */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tanggal Mulai <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${
                  errors.startDate ? "border-red-500 bg-red-50/20" : "border-slate-300 focus:border-blue-500"
                }`}
              />
              {errors.startDate && (
                <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.startDate}</p>
              )}
            </div>

            {/* Tanggal Selesai */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tanggal Selesai <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${
                  errors.endDate ? "border-red-500 bg-red-50/20" : "border-slate-300 focus:border-blue-500"
                }`}
              />
              {errors.endDate && (
                <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Deskripsi / Catatan Opsional
            </label>
            <textarea
              name="description"
              rows={2}
              placeholder="Catatan tambahan mengenai semester ini..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
            />
          </div>

          {/* Checkbox Set Active */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-start gap-3">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="mt-0.5 w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="isActive" className="text-xs text-slate-700 cursor-pointer select-none">
              <span className="font-bold text-slate-900 block">Jadikan Semester Aktif Utama</span>
              Mengaktifkan semester ini akan secara otomatis menonaktifkan semester lain yang sedang aktif.
            </label>
          </div>

          {/* Buttons Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>{isEdit ? "Simpan Perubahan" : "Tambah Semester"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
