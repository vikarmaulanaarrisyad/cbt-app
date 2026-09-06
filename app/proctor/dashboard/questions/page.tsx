"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Alert } from "@/lib/sweetalert";

export default function QuestionBankPage() {
  const handleImport = () => {
    Alert.info("Simulasi Import", "Fungsi ini akan membuka dialog upload file Excel/Word di versi produksi.");
  };

  const dummyQuestions = [
    { id: "Q-1042", text: "Berdasarkan paragraf ke-2, apa simpulan yang paling tepat mengenai korelasi...", category: "Penalaran Umum", diff: "Sulit", status: "Aktif" },
    { id: "Q-1043", text: "Jika x = 5 dan y = 12, maka nilai dari akar kuadrat...", category: "Pengetahuan Kuantitatif", diff: "Sedang", status: "Aktif" },
    { id: "Q-1044", text: "Makna kata 'Deforestasi' pada kalimat ketiga bermakna...", category: "Literasi Bahasa Indonesia", diff: "Mudah", status: "Aktif" },
    { id: "Q-1045", text: "Simpulan yang paling mungkin benar jika harga bahan baku naik adalah...", category: "Penalaran Umum", diff: "Sedang", status: "Draft" },
    { id: "Q-1046", text: "Manakah pernyataan di bawah ini yang memperlemah argumen tokoh A?", category: "Penalaran Umum", diff: "Sulit", status: "Aktif" },
  ];

  return (
    <main className="flex-1 flex flex-col font-sans relative w-full">
        
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-slate-200 px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              <span>Pusat Data CBT</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-blue-600">Manajemen Ujian</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bank Soal</h1>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={handleImport}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 transition-all font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
              Import Data
            </button>
            <Link 
              href="/proctor/dashboard/questions/create"
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Buat Soal
            </Link>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="p-8 flex-1 max-w-[1600px] mx-auto w-full flex flex-col gap-6">
          
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow">
              <span className="text-slate-500 font-bold text-[11px] uppercase tracking-widest">Total Soal</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 tracking-tight">1,248</span>
                <span className="text-emerald-500 text-xs font-bold flex items-center bg-emerald-50 px-1.5 py-0.5 rounded-md">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>+12
                </span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none"></div>
              <span className="text-slate-500 font-bold text-[11px] uppercase tracking-widest relative z-10">Soal Aktif (Siap Uji)</span>
              <div className="flex items-baseline gap-2 relative z-10">
                <span className="text-3xl font-black text-blue-600 tracking-tight">892</span>
                <span className="text-slate-400 text-xs font-semibold">Tervalidasi</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow">
              <span className="text-slate-500 font-bold text-[11px] uppercase tracking-widest">Draft / Review</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-amber-500 tracking-tight">356</span>
                <span className="text-slate-400 text-xs font-semibold">Perlu dicek</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow cursor-pointer hover:border-slate-300">
              <span className="text-slate-500 font-bold text-[11px] uppercase tracking-widest">Kategori Terpopuler</span>
              <div className="flex flex-col gap-0.5 mt-1">
                <span className="text-[17px] font-black text-slate-800 truncate leading-tight">Penalaran Umum</span>
                <span className="text-slate-400 text-[11px] font-semibold">420 Soal Tersedia</span>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col flex-1 overflow-hidden">
            
            {/* Toolbar */}
            <div className="p-5 border-b border-slate-200 flex flex-wrap gap-4 items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <div className="relative w-full lg:w-96 group">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] group-focus-within:text-blue-500 transition-colors">search</span>
                  <input 
                    type="text" 
                    placeholder="Cari ID soal, cuplikan wacana..." 
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-400 font-medium"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-500 font-bold shadow-sm">⌘</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-500 font-bold shadow-sm">K</kbd>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <button className="flex-1 lg:flex-none px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">filter_list</span> Filter
                </button>
                <div className="h-6 w-px bg-slate-200 hidden lg:block"></div>
                <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200 shadow-inner">
                  <button className="px-3 py-1.5 bg-white shadow-sm rounded-lg text-slate-800 text-sm font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">table_rows</span> Tabel
                  </button>
                  <button className="px-3 py-1.5 text-slate-500 hover:text-slate-800 text-sm font-bold transition-colors flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">grid_view</span> Grid
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="px-6 py-4 w-12 text-center">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    </th>
                    <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest w-28">ID Soal</th>
                    <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Cuplikan Wacana</th>
                    <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Kategori Modul</th>
                    <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest w-28">Level</th>
                    <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest w-28">Status</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest w-16 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dummyQuestions.map((q) => (
                    <tr key={q.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4 text-center">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer opacity-50 group-hover:opacity-100 transition-opacity" />
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">{q.id}</span>
                      </td>
                      <td className="px-4 py-4 max-w-sm">
                        <p className="text-sm font-semibold text-slate-800 line-clamp-1 mb-1">{q.text}</p>
                        <p className="text-[11px] font-medium text-slate-400">Terakhir diubah: 2 jam lalu oleh <span className="font-semibold text-slate-500">Admin</span></p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>{q.category}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-[11px] font-black uppercase tracking-wider px-2 py-1 rounded-md flex items-center justify-center w-fit ${
                          q.diff === 'Mudah' ? 'text-emerald-700 bg-emerald-100' : 
                          q.diff === 'Sedang' ? 'text-amber-700 bg-amber-100' : 
                          'text-rose-700 bg-rose-100'
                        }`}>
                          {q.diff}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1.5 w-fit ${
                          q.status === 'Aktif' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-slate-200 text-slate-500 bg-slate-50'
                        }`}>
                          {q.status === 'Aktif' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                          {q.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="w-8 h-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-colors tooltip-trigger" title="Edit Soal">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors" title="Lebih Banyak">
                            <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Footer */}
            <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50">
              <span className="text-slate-500 font-medium text-xs">Menampilkan <strong>1-5</strong> dari <strong>1,248</strong> soal</span>
              <div className="flex gap-1.5">
                <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 bg-white shadow-sm font-semibold text-xs disabled:opacity-50 hover:bg-slate-50 transition-colors">Prev</button>
                <button className="px-3 py-1.5 rounded-lg border border-slate-900 bg-slate-900 text-white font-bold text-xs shadow-sm">1</button>
                <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 bg-white font-bold text-xs hover:bg-slate-50 transition-colors shadow-sm">2</button>
                <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 bg-white font-bold text-xs hover:bg-slate-50 transition-colors shadow-sm">3</button>
                <span className="px-2 py-1.5 text-slate-400">...</span>
                <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 bg-white shadow-sm font-semibold text-xs hover:bg-slate-50 transition-colors">Next</button>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}
