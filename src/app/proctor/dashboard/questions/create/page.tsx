"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert } from "@/lib/sweetalert";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  getActiveEducationLevel,
  EVENT_JENJANG_CHANGE,
  EducationLevel,
} from "@/lib/education-level";

export default function CreateQuestionPage() {
  const router = useRouter();

  // Form State
  const [educationLevel, setEducationLevel] = useState<"MI" | "MTS" | "MA" | "SEMUA">("SEMUA");
  const [category, setCategory] = useState("Penalaran Umum");
  const [subjectsList, setSubjectsList] = useState<{ id: string; code: string; name: string; educationLevel?: string }[]>([]);
  const [difficulty, setDifficulty] = useState<"MUDAH" | "SEDANG" | "SULIT">("SEDANG");
  const [text, setText] = useState("");
  const [explanation, setExplanation] = useState("");
  const [scoreWeight, setScoreWeight] = useState("4");
  const [correctKey, setCorrectKey] = useState<string>("A");
  const [isDraft, setIsDraft] = useState(false);
  const [options, setOptions] = useState<Record<string, string>>({
    A: "",
    B: "",
    C: "",
    D: "",
    E: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const activeLevel = getActiveEducationLevel();
    if (activeLevel === "MI" || activeLevel === "MTS" || activeLevel === "MA") {
      setEducationLevel(activeLevel);
    }

    const handleJenjangChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ educationLevel: EducationLevel }>;
      if (customEvent.detail && customEvent.detail.educationLevel) {
        const lvl = customEvent.detail.educationLevel;
        if (lvl === "MI" || lvl === "MTS" || lvl === "MA") {
          setEducationLevel(lvl);
        } else {
          setEducationLevel("SEMUA");
        }
      }
    };

    window.addEventListener(EVENT_JENJANG_CHANGE, handleJenjangChange);
    return () => window.removeEventListener(EVENT_JENJANG_CHANGE, handleJenjangChange);
  }, []);

  useEffect(() => {
    fetch("/api/subjects?status=ACTIVE&limit=100")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setSubjectsList(data.data);
        }
      })
      .catch(() => {});
  }, []);

  // Filtered subjects based on educationLevel
  const filteredSubjects = subjectsList.filter((s) => {
    if (educationLevel === "SEMUA") return true;
    const sLvl = (s.educationLevel || "SEMUA").toUpperCase();
    return sLvl === educationLevel || sLvl === "SEMUA";
  });

  const handleSave = async () => {
    if (!text.trim()) {
      Alert.error("Form Inkomplit", "Silakan isi konten wacana/pertanyaan terlebih dahulu.");
      return;
    }

    // Check if correct option has text
    if (!options[correctKey]?.trim()) {
      Alert.error(
        "Kunci Jawaban Kosong",
        `Opsi ${correctKey} dipilih sebagai kunci jawaban tetapi konten teksnya masih kosong.`
      );
      return;
    }

    setLoading(true);
    try {
      const optionsArray = Object.entries(options)
        .filter(([_, val]) => val.trim().length > 0)
        .map(([id, val]) => ({
          id,
          text: val,
          isCorrect: id === correctKey,
        }));

      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          category,
          educationLevel,
          difficulty,
          explanation,
          scoreWeight: Number(scoreWeight) || 4,
          correctKey,
          status: isDraft ? "DRAFT" : "AKTIF",
          options: optionsArray.length > 0 ? optionsArray : null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        Alert.success("Tersimpan!", "Butir soal baru berhasil ditambahkan ke bank soal database.").then(() => {
          router.push("/proctor/dashboard/questions");
        });
      } else {
        Alert.error("Gagal Menyimpan", data.message || "Terjadi kesalahan saat menyimpan soal.");
      }
    } catch {
      Alert.error("Gagal Menyimpan", "Terjadi kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col font-sans relative w-full pb-24 bg-slate-50/50 min-h-screen">
      {/* Glassmorphism Sticky Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/proctor/dashboard/questions"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs shrink-0 cursor-pointer"
            title="Kembali ke Bank Soal"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div className="h-6 w-px bg-slate-200 hidden sm:block shrink-0"></div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Bank Soal Ujian
              </span>
              <span className="text-slate-300">•</span>
              <Badge variant={isDraft ? "warning" : "success"}>
                {isDraft ? "Draft" : "Aktif Ujian"}
              </Badge>
              <Badge variant="purple">
                Jenjang: {educationLevel}
              </Badge>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight truncate">
              Formulir Pembuatan Butir Soal Baru
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="draft"
              checked={isDraft}
              onChange={(e) => setIsDraft(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="draft" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
              Simpan Draft
            </label>
          </div>

          <Button
            variant="outline"
            onClick={() => Alert.info("Simulasi Preview", "Preview tampilan soal di layar Kiosk peserta.")}
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            Preview Kiosk
          </Button>

          <Button onClick={handleSave} disabled={loading} variant="default">
            <span className="material-symbols-outlined text-[18px]">save</span>
            {loading ? "Menyimpan..." : "Simpan Soal"}
          </Button>
        </div>
      </header>

      {/* Main Content Layout (Two Columns) */}
      <div className="max-w-[1600px] mx-auto w-full p-4 sm:p-6 lg:p-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Wacana Editor & Opsi Jawaban (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Wacana / Teks Pertanyaan Editor Card */}
            <Card className="shadow-xs overflow-hidden">
              <CardHeader className="bg-slate-50/60 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-blue-600">article</span>
                    Konten Wacana / Teks Pertanyaan
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Tuliskan wacana, narasi soal, atau pertanyaan utama ujian
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
                  <button type="button" className="p-1 text-slate-500 hover:bg-slate-100 rounded text-xs font-bold px-2 cursor-pointer" title="Cetak Tebal">
                    <b>B</b>
                  </button>
                  <button type="button" className="p-1 text-slate-500 hover:bg-slate-100 rounded text-xs italic font-bold px-2 cursor-pointer" title="Cetak Miring">
                    <i>I</i>
                  </button>
                  <button type="button" className="p-1 text-slate-500 hover:bg-slate-100 rounded text-xs font-bold px-2 cursor-pointer" title="Formula LaTeX">
                    ∑
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full p-4 min-h-[220px] text-sm focus:outline-none resize-y leading-relaxed text-slate-800 placeholder:text-slate-400 font-medium bg-slate-50/30 rounded-xl border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all"
                  placeholder="Tuliskan narasi soal atau pertanyaan di sini..."
                ></textarea>
              </CardContent>
            </Card>

            {/* Pilihan Jawaban Card */}
            <Card className="shadow-xs overflow-hidden">
              <CardHeader className="bg-slate-50/60 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-blue-600">checklist</span>
                    Pilihan Jawaban & Kunci Jawaban
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Isi pilihan A-E dan klik tombol radio untuk menandai Kunci Jawaban Benar
                  </CardDescription>
                </div>
                <Badge variant="purple">5 Opsi Pilihan</Badge>
              </CardHeader>
              <CardContent className="p-5 flex flex-col gap-4">
                {["A", "B", "C", "D", "E"].map((opt) => {
                  const isCorrect = correctKey === opt;
                  return (
                    <div
                      key={opt}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col gap-2 ${
                        isCorrect
                          ? "bg-emerald-50/40 border-emerald-500 shadow-xs"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="correctKeyRadio"
                            id={`radio-${opt}`}
                            checked={isCorrect}
                            onChange={() => setCorrectKey(opt)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <label
                            htmlFor={`radio-${opt}`}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs cursor-pointer border transition-colors ${
                              isCorrect
                                ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {opt}
                          </label>
                          <span className="text-xs font-bold text-slate-700 cursor-pointer" onClick={() => setCorrectKey(opt)}>
                            Pilihan {opt}
                          </span>
                        </div>

                        {isCorrect && (
                          <Badge variant="success" className="shadow-2xs">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            Kunci Benar
                          </Badge>
                        )}
                      </div>

                      <textarea
                        value={options[opt] || ""}
                        onChange={(e) => setOptions({ ...options, [opt]: e.target.value })}
                        className="w-full mt-1 p-3 text-xs sm:text-sm font-medium focus:outline-none resize-none h-16 leading-relaxed text-slate-800 placeholder:text-slate-400 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                        placeholder={`Masukkan isi teks untuk pilihan ${opt}...`}
                      ></textarea>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Pembahasan Soal (Optional) */}
            <Card className="shadow-xs">
              <CardHeader className="bg-slate-50/60">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-purple-600">lightbulb</span>
                  Pembahasan Soal (Opsional)
                </CardTitle>
                <CardDescription>
                  Penjelasan rincian solusi atau kunci pembahasan untuk rekap pasca ujian
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full p-4 min-h-[100px] text-xs sm:text-sm focus:outline-none resize-y leading-relaxed text-slate-800 placeholder:text-slate-400 font-medium bg-slate-50/30 rounded-xl border border-slate-200 focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-500/10 transition-all"
                  placeholder="Tuliskan rincian langkah pembahasan atau alasan jawaban di sini..."
                ></textarea>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Parameters & Metadata (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
            
            {/* Metadata Modul & Tingkat Card */}
            <Card className="shadow-xs">
              <CardHeader className="bg-slate-50/60">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-blue-600">tune</span>
                  Parameter Soal
                </CardTitle>
                <CardDescription>Jenjang pendidikan, kategori modul, dan bobot</CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">

                {/* Jenjang Pendidikan Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Jenjang Pendidikan
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                    {(["MI", "MTS", "MA", "SEMUA"] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setEducationLevel(lvl)}
                        className={`py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          educationLevel === lvl
                            ? lvl === "MI"
                              ? "bg-emerald-600 text-white shadow-xs"
                              : lvl === "MTS"
                              ? "bg-sky-600 text-white shadow-xs"
                              : lvl === "MA"
                              ? "bg-purple-600 text-white shadow-xs"
                              : "bg-blue-600 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {educationLevel === "MI" && "Untuk jenjang Madrasah Ibtidaiyah (Kelas 1 - 6)"}
                    {educationLevel === "MTS" && "Untuk jenjang Madrasah Tsanawiyah (Kelas VII - IX)"}
                    {educationLevel === "MA" && "Untuk jenjang Madrasah Aliyah / SMA (Kelas X - XII)"}
                    {educationLevel === "SEMUA" && "Dapat digunakan lintas seluruh jenjang madrasah"}
                  </p>
                </div>
                
                {/* Modul Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mata Pelajaran / Modul
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer shadow-xs"
                  >
                    {filteredSubjects.length > 0 ? (
                      filteredSubjects.map((s) => (
                        <option key={s.id} value={s.name}>
                          [{s.educationLevel || "SEMUA"}] {s.name} ({s.code})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Penalaran Umum">Penalaran Umum</option>
                        <option value="Pemahaman Bacaan & Menulis">Pemahaman Bacaan & Menulis</option>
                        <option value="Pengetahuan Kuantitatif">Pengetahuan Kuantitatif</option>
                        <option value="Literasi Bahasa Indonesia">Literasi Bahasa Indonesia</option>
                        <option value="Literasi Bahasa Inggris">Literasi Bahasa Inggris</option>
                        <option value="Matematika">Matematika</option>
                        <option value="Akidah Akhlak">Akidah Akhlak</option>
                        <option value="Fikih">Fikih</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Difficulty Segmented Control */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tingkat Kesulitan
                  </label>
                  <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setDifficulty("MUDAH")}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        difficulty === "MUDAH"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Mudah
                    </button>
                    <button
                      type="button"
                      onClick={() => setDifficulty("SEDANG")}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        difficulty === "SEDANG"
                          ? "bg-amber-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Sedang
                    </button>
                    <button
                      type="button"
                      onClick={() => setDifficulty("SULIT")}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        difficulty === "SULIT"
                          ? "bg-red-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Sulit
                    </button>
                  </div>
                </div>

                {/* Score Weight Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Bobot Poin Soal
                  </label>
                  <Input
                    type="number"
                    value={scoreWeight}
                    onChange={(e) => setScoreWeight(e.target.value)}
                    placeholder="4"
                    className="font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Bobot standar butir soal: 4.0 poin
                  </span>
                </div>

              </CardContent>
            </Card>

            {/* Quick Preview Card */}
            <Card className="shadow-xs bg-slate-900 text-white border-slate-800">
              <CardHeader className="border-slate-800">
                <CardTitle className="text-sm font-bold flex items-center justify-between text-white">
                  <span>Pratinjau Kiosk [{educationLevel}]</span>
                  <Badge variant="success">Kunci: {correctKey}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-xs space-y-3">
                <p className="line-clamp-3 text-slate-300 font-medium">
                  {text || "Teks wacana soal belum diisi..."}
                </p>
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  {["A", "B", "C", "D", "E"].map((opt) => (
                    <div
                      key={opt}
                      className={`px-2.5 py-1.5 rounded-lg flex items-center gap-2 ${
                        correctKey === opt
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                          : "bg-slate-800/60 text-slate-400"
                      }`}
                    >
                      <span className="font-bold font-mono">{opt}.</span>
                      <span className="truncate">{options[opt] || "(Kosong)"}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </main>
  );
}
