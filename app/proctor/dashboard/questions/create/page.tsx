"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert } from "@/lib/sweetalert";

export default function CreateQuestionPage() {
  const router = useRouter();

  const handleSave = () => {
    Alert.success("Tersimpan!", "Soal baru berhasil ditambahkan ke dalam database.").then(() => {
      router.push("/proctor/dashboard/questions");
    });
  };

  return (
    <main className="flex-1 flex flex-col font-sans relative w-full pb-20">
      
      {/* Clean Top Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 sm:px-10 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4">
          <Link href="/proctor/dashboard/questions" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors shadow-sm border border-slate-200 bg-white">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 shadow-lg shadow-blue-600/20 text-white rounded-xl flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">note_add</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">Formulir Soal Baru</h1>
              <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Mode Pembuatan Bebas</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl border border-slate-200">
            <input type="checkbox" id="draft" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
            <label htmlFor="draft" className="text-xs font-bold text-slate-600 cursor-pointer select-none">Simpan Draft</label>
          </div>
          <button onClick={handleSave} className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">save</span>
            Simpan Soal
          </button>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="max-w-4xl mx-auto w-full mt-8 px-6 flex-1">
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Meta Panel */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Kategori Modul</label>
              <div className="relative">
                <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-5 pr-10 py-4 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 appearance-none transition-all cursor-pointer">
                  <option>Penalaran Umum</option>
                  <option>Pemahaman Bacaan & Menulis</option>
                  <option>Pengetahuan Kuantitatif</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Tingkat Kesulitan</label>
              <div className="relative">
                <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-5 pr-10 py-4 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 appearance-none transition-all cursor-pointer">
                  <option>Mudah (Level 1)</option>
                  <option>Sedang (Level 2)</option>
                  <option>Sulit (Level 3)</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
              </div>
            </div>
          </div>

          {/* Editor Wacana */}
          <div>
            <label className="flex items-center justify-between mb-4">
              <span className="text-[12px] font-black text-slate-700 uppercase tracking-widest">Konten Wacana / Pertanyaan</span>
              <button className="text-blue-600 font-bold text-xs bg-blue-50 px-4 py-2 rounded-xl flex items-center gap-1.5 hover:bg-blue-100 transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[16px]">add_photo_alternate</span> Upload Media
              </button>
            </label>
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
              {/* Toolbar */}
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2 overflow-x-auto">
                <button className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-200 text-slate-700 font-serif font-black transition-colors">B</button>
                <button className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-200 text-slate-700 font-serif italic font-bold transition-colors">I</button>
                <button className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-200 text-slate-700 font-serif underline font-bold transition-colors">U</button>
                <div className="w-px h-6 bg-slate-300 mx-2"></div>
                <button className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-200 text-slate-700 transition-colors"><span className="material-symbols-outlined text-[20px]">format_list_bulleted</span></button>
                <button className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-200 text-slate-700 transition-colors"><span className="material-symbols-outlined text-[20px]">format_list_numbered</span></button>
                <div className="w-px h-6 bg-slate-300 mx-2"></div>
                <button className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-200 text-slate-700 transition-colors"><span className="material-symbols-outlined text-[20px]">functions</span></button>
              </div>
              <textarea 
                className="w-full p-8 h-72 text-[16px] focus:outline-none resize-none leading-relaxed text-slate-800 placeholder:text-slate-300 font-medium"
                placeholder="Ketik teks wacana atau pertanyaan Anda di sini..."
              ></textarea>
            </div>
          </div>

          {/* Opsi Jawaban */}
          <div>
            <label className="block text-[12px] font-black text-slate-700 uppercase tracking-widest mb-6">
              Opsi Jawaban & Penentuan Kunci
            </label>
            
            <div className="space-y-5">
              {['A', 'B', 'C', 'D', 'E'].map((opt, idx) => (
                <div key={opt} className={`flex items-start gap-5 p-6 rounded-3xl border-2 transition-all ${idx === 0 ? 'border-emerald-400 bg-emerald-50/50 shadow-[0_0_30px_rgba(16,185,129,0.15)] ring-4 ring-emerald-400/20' : 'border-slate-100 bg-white hover:border-blue-200 hover:shadow-md'}`}>
                  <div className="pt-2">
                    <input type="radio" name="correct_answer" defaultChecked={idx === 0} className="w-6 h-6 text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shadow-sm ${idx === 0 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>{opt}</span>
                      {idx === 0 && <span className="text-[11px] uppercase font-black tracking-widest text-emerald-600 bg-emerald-100 px-3 py-1 rounded-lg">Kunci Jawaban</span>}
                    </div>
                    <textarea 
                      className="w-full bg-transparent border-none text-[15px] font-medium focus:outline-none resize-none h-20 leading-relaxed text-slate-800 placeholder:text-slate-400"
                      placeholder={`Masukkan teks untuk opsi ${opt}...`}
                    ></textarea>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </main>
  );
}
