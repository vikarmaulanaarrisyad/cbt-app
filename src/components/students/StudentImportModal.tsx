"use client";

import React, { useState, useRef, useCallback } from "react";
import { Alert } from "@/lib/sweetalert";

interface ValidationError {
  rowNumber: number;
  field: string;
  message: string;
  nisn?: string;
  name?: string;
}

interface PreviewRow {
  rowNumber: number;
  nisn: string;
  name: string;
  placeOfBirth: string;
  dateOfBirth: string;
  gender: string;
  classGroup: string;
  educationLevel: string;
  username: string;
  hasError: boolean;
  errors: ValidationError[];
}

interface ImportResult {
  successCount: number;
  errorCount: number;
  skippedCount: number;
  errors: ValidationError[];
  imported: { nisn: string; name: string }[];
}

type Step = "upload" | "preview" | "importing" | "done";

interface StudentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
}

export default function StudentImportModal({ isOpen, onClose, onImported }: StudentImportModalProps) {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [validCount, setValidCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [filterError, setFilterError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep("upload");
    setFile(null);
    setPreviewRows([]);
    setValidCount(0);
    setErrorCount(0);
    setImportResult(null);
    setFilterError(false);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("validateOnly", "true");

      const res = await fetch("/api/students/import", { method: "POST", body: formData });
      const data = await res.json();

      if (!data.success) {
        Alert.error("Gagal Membaca File", data.message);
        setLoading(false);
        return;
      }

      setPreviewRows(data.rows || []);
      setValidCount(data.validCount || 0);
      setErrorCount(data.errorCount || 0);
      setStep("preview");
    } catch {
      Alert.error("Terjadi Kesalahan", "Gagal memproses file. Pastikan format file benar.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFileSelect(f);
    },
    [handleFileSelect]
  );

  const handleImport = async () => {
    if (!file) return;
    setStep("importing");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/students/import", { method: "POST", body: formData });
      const data = await res.json();

      setImportResult(data.success ? data : { successCount: 0, errorCount: 0, skippedCount: 0, errors: [{ rowNumber: 0, field: "Server", message: data.message }], imported: [] });
      setStep("done");
    } catch {
      setImportResult({ successCount: 0, errorCount: 1, skippedCount: 0, errors: [{ rowNumber: 0, field: "Koneksi", message: "Gagal terhubung ke server" }], imported: [] });
      setStep("done");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    window.open("/api/students/template", "_blank");
  };

  const displayedRows = filterError ? previewRows.filter((r) => r.hasError) : previewRows;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200/80">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <span className="material-symbols-outlined text-white text-[20px]">upload_file</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">Import Data Siswa via Excel</h2>
              <div className="flex items-center gap-2 mt-0.5">
                {(["upload", "preview", "importing", "done"] as Step[]).map((s, i) => (
                  <React.Fragment key={s}>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${step === s ? "bg-blue-600 text-white" : ["upload", "preview", "importing", "done"].indexOf(s) < ["upload", "preview", "importing", "done"].indexOf(step) ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                      {i + 1}. {s === "upload" ? "Upload" : s === "preview" ? "Validasi" : s === "importing" ? "Import" : "Selesai"}
                    </span>
                    {i < 3 && <span className="text-slate-300 text-[10px]">›</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
          <button onClick={handleClose} type="button" className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {/* ── Step: Upload ── */}
          {step === "upload" && (
            <div className="p-6 flex flex-col gap-5">
              {/* Download template */}
              <div className="flex items-center gap-4 p-4 bg-blue-50/70 rounded-2xl border border-blue-200/60">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-blue-600 text-[22px]">description</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">Gunakan Template Resmi CBT Pro</p>
                  <p className="text-xs text-slate-500 mt-0.5">Download template Excel yang sudah terformat dengan contoh data dan panduan pengisian kolom.</p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  type="button"
                  className="shrink-0 px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                >
                  <span className="material-symbols-outlined text-[15px]">download</span>
                  Download Template
                </button>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${isDragging ? "border-blue-500 bg-blue-50/60" : "border-slate-200 hover:border-blue-400 hover:bg-slate-50/60"}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="sr-only"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
                />
                {loading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-semibold text-slate-600">Membaca dan memvalidasi file...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-slate-400 text-[36px]">upload</span>
                    </div>
                    <p className="text-base font-black text-slate-700 mb-1">Drag & drop file Excel ke sini</p>
                    <p className="text-sm text-slate-500">atau klik untuk memilih file</p>
                    <p className="text-[11px] text-slate-400 mt-3 font-medium">Format didukung: .xlsx, .xls • Maksimal 1.000 baris siswa</p>
                  </>
                )}
              </div>

              {/* Rules */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: "pin", text: "NISN harus 10 digit angka unik" },
                  { icon: "person", text: "Nama minimal 3 karakter" },
                  { icon: "calendar_today", text: "Tanggal lahir format DD/MM/YYYY" },
                  { icon: "school", text: "Jenjang: MI, MTS, atau MA" },
                ].map((rule) => (
                  <div key={rule.text} className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                    <span className="material-symbols-outlined text-[14px] text-blue-400 shrink-0">{rule.icon}</span>
                    {rule.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Step: Preview & Validation ── */}
          {step === "preview" && (
            <div className="flex flex-col h-full">
              {/* Summary bar */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4 shrink-0 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
                  <span className="material-symbols-outlined text-[16px]">table_rows</span>
                  <span className="text-sm font-bold">{previewRows.length} baris</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span className="text-sm font-bold">{validCount} valid</span>
                </div>
                {errorCount > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    <span className="text-sm font-bold">{errorCount} error</span>
                  </div>
                )}
                <div className="ml-auto flex items-center gap-2">
                  {errorCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilterError((f) => !f)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors ${filterError ? "bg-rose-100 text-rose-700 border-rose-200" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                    >
                      {filterError ? "Tampilkan Semua" : `Tampilkan Error Saja (${errorCount})`}
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-auto flex-1">
                <table className="w-full text-xs border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50 sticky top-0 z-10">
                      <th className="px-3 py-2.5 text-left font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 w-10">No.</th>
                      <th className="px-3 py-2.5 text-left font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">Status</th>
                      <th className="px-3 py-2.5 text-left font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">NISN</th>
                      <th className="px-3 py-2.5 text-left font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">Nama Lengkap</th>
                      <th className="px-3 py-2.5 text-left font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">Tgl Lahir</th>
                      <th className="px-3 py-2.5 text-left font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">L/P</th>
                      <th className="px-3 py-2.5 text-left font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">Kelas</th>
                      <th className="px-3 py-2.5 text-left font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">Jenjang</th>
                      <th className="px-3 py-2.5 text-left font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">Username</th>
                      <th className="px-3 py-2.5 text-left font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">Detail Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedRows.map((row) => (
                      <tr
                        key={row.rowNumber}
                        className={`border-b border-slate-100 transition-colors ${row.hasError ? "bg-rose-50/60 hover:bg-rose-50" : "hover:bg-emerald-50/40"}`}
                      >
                        <td className="px-3 py-2.5 text-slate-400 font-mono">{row.rowNumber}</td>
                        <td className="px-3 py-2.5">
                          {row.hasError ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px]">
                              <span className="material-symbols-outlined text-[11px]">error</span>ERROR
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                              <span className="material-symbols-outlined text-[11px]">check_circle</span>VALID
                            </span>
                          )}
                        </td>
                        <td className={`px-3 py-2.5 font-mono ${row.errors.some((e) => e.field === "NISN") ? "text-rose-700 font-bold" : "text-slate-800"}`}>{row.nisn || "—"}</td>
                        <td className={`px-3 py-2.5 font-medium ${row.errors.some((e) => e.field === "Nama Lengkap") ? "text-rose-700 font-bold" : "text-slate-800"}`}>{row.name || "—"}</td>
                        <td className={`px-3 py-2.5 ${row.errors.some((e) => e.field === "Tanggal Lahir") ? "text-rose-700 font-bold" : "text-slate-600"}`}>{row.dateOfBirth || "—"}</td>
                        <td className={`px-3 py-2.5 text-center ${row.errors.some((e) => e.field === "Jenis Kelamin") ? "text-rose-700 font-bold" : "text-slate-600"}`}>{row.gender || "—"}</td>
                        <td className="px-3 py-2.5 text-slate-600">{row.classGroup || "—"}</td>
                        <td className="px-3 py-2.5">
                          {row.educationLevel && (
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${row.educationLevel === "MI" ? "bg-emerald-100 text-emerald-700" : row.educationLevel === "MTS" ? "bg-sky-100 text-sky-700" : "bg-purple-100 text-purple-700"}`}>
                              {row.educationLevel || "—"}
                            </span>
                          )}
                          {!row.educationLevel && <span className="text-rose-600 font-bold">—</span>}
                        </td>
                        <td className={`px-3 py-2.5 font-mono ${row.errors.some((e) => e.field === "Username") ? "text-rose-700 font-bold" : "text-slate-600"}`}>{row.username || "—"}</td>
                        <td className="px-3 py-2.5">
                          {row.errors.length > 0 ? (
                            <div className="space-y-0.5">
                              {row.errors.map((e, i) => (
                                <div key={i} className="text-[10px] text-rose-700 font-semibold">
                                  <span className="font-black">[{e.field}]</span> {e.message}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-emerald-600 text-[10px] font-semibold">Siap diimport</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {displayedRows.length === 0 && (
                  <div className="py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-[40px] block mb-2">search_off</span>
                    <p className="text-sm font-semibold">Tidak ada baris untuk ditampilkan</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Step: Importing ── */}
          {step === "importing" && (
            <div className="p-12 flex flex-col items-center gap-6 text-center">
              <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="text-xl font-black text-slate-800">Mengimpor Data Siswa...</p>
                <p className="text-sm text-slate-500 mt-1">Hanya baris yang valid ({validCount} siswa) yang akan disimpan ke database</p>
              </div>
            </div>
          )}

          {/* ── Step: Done ── */}
          {step === "done" && importResult && (
            <div className="p-6 flex flex-col gap-5">
              <div className={`flex items-center gap-4 p-5 rounded-2xl ${importResult.successCount > 0 ? "bg-emerald-50 border border-emerald-200" : "bg-rose-50 border border-rose-200"}`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${importResult.successCount > 0 ? "bg-emerald-100" : "bg-rose-100"}`}>
                  <span className={`material-symbols-outlined text-[32px] ${importResult.successCount > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {importResult.successCount > 0 ? "check_circle" : "cancel"}
                  </span>
                </div>
                <div>
                  <p className={`text-lg font-black ${importResult.successCount > 0 ? "text-emerald-800" : "text-rose-800"}`}>
                    {importResult.successCount > 0 ? `${importResult.successCount} Siswa Berhasil Diimport!` : "Import Gagal"}
                  </p>
                  <p className="text-sm text-slate-600 mt-0.5">
                    {importResult.errorCount > 0 && `${importResult.errorCount} baris dilewati karena error`}
                    {importResult.successCount === 0 && importResult.errors[0]?.message}
                  </p>
                </div>
              </div>

              {importResult.imported.length > 0 && (
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                  {importResult.imported.map((s, i) => (
                    <div key={i} className="px-4 py-2 flex items-center gap-3">
                      <span className="material-symbols-outlined text-emerald-500 text-[15px]">check</span>
                      <span className="text-sm font-semibold text-slate-700">{s.name}</span>
                      <span className="text-xs font-mono text-slate-400">{s.nisn}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0 bg-slate-50/80 rounded-b-3xl">
          <button
            type="button"
            onClick={step === "preview" ? reset : handleClose}
            className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {step === "preview" ? "← Upload Ulang" : "Tutup"}
          </button>

          <div className="flex items-center gap-3">
            {step === "preview" && (
              <>
                {validCount === 0 ? (
                  <p className="text-sm text-rose-600 font-semibold">Tidak ada baris valid untuk diimport</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={loading || validCount === 0}
                    className="px-6 py-2.5 text-sm font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                    Import {validCount} Siswa Valid
                  </button>
                )}
              </>
            )}
            {step === "done" && importResult && importResult.successCount > 0 && (
              <button
                type="button"
                onClick={() => { onImported(); handleClose(); }}
                className="px-6 py-2.5 text-sm font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-md shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Selesai & Lihat Data
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
