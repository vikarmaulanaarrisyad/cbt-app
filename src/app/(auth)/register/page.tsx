"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert } from "@/lib/sweetalert";
import { EducationLevel, JENJANG_CONFIG, setActiveEducationLevel } from "@/lib/education-level";

export default function RegisterSchoolPage() {
  const router = useRouter();

  // Form states
  const [educationLevel, setEducationLevel] = useState<EducationLevel>("MI");
  const [schoolName, setSchoolName] = useState("MI Bustanul Huda 01 Dawuhan");
  const [npsn, setNpsn] = useState("111233040001");
  const [nsm, setNsm] = useState("111233040001");
  const [city, setCity] = useState("Banyumas");
  const [province, setProvince] = useState("Jawa Tengah");
  const [address, setAddress] = useState("Jl. KH. Hasyim Asy'ari No. 01, Dawuhan");

  // Proctor account states
  const [proctorName, setProctorName] = useState("Ustadz Ahmad Fauzi, S.Pd.I.");
  const [nip, setNip] = useState("198501012010011001");
  const [email, setEmail] = useState("proktor.mi01@bustanulhuda.sch.id");
  const [password, setPassword] = useState("password123");
  const [labAllocation, setLabAllocation] = useState("Lab CBT MI 01");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preset demo helpers
  const handleQuickDemo = (type: "mi01" | "mi02" | "mts" | "ma") => {
    if (type === "mi01") {
      setEducationLevel("MI");
      setSchoolName("MI Bustanul Huda 01 Dawuhan");
      setNpsn("111233040001");
      setNsm("111233040001");
      setCity("Banyumas");
      setProvince("Jawa Tengah");
      setAddress("Jl. KH. Hasyim Asy'ari No. 01, Dawuhan");
      setProctorName("Ustadz Ahmad Fauzi, S.Pd.I.");
      setNip("198501012010011001");
      setEmail("proktor.mi01@bustanulhuda.sch.id");
      setPassword("password123");
      setLabAllocation("Lab CBT MI 01");
    } else if (type === "mi02") {
      setEducationLevel("MI");
      setSchoolName("MI Bustanul Huda 02 Dawuhan");
      setNpsn("111233040002");
      setNsm("111233040002");
      setCity("Banyumas");
      setProvince("Jawa Tengah");
      setAddress("Jl. Pangeran Diponegoro No. 12, Dawuhan");
      setProctorName("Ustadzah Siti Fatimah, S.Pd.");
      setNip("198602022011012002");
      setEmail("proktor.mi02@bustanulhuda.sch.id");
      setPassword("password123");
      setLabAllocation("Lab Komputer MI 02");
    } else if (type === "mts") {
      setEducationLevel("MTS");
      setSchoolName("MTS Bustanul Huda Dawuhan");
      setNpsn("121233040015");
      setNsm("121233040015");
      setCity("Banyumas");
      setProvince("Jawa Tengah");
      setAddress("Kompleks Ponpes Bustanul Huda, Dawuhan");
      setProctorName("Ustadz Zulkifli, M.Pd.");
      setNip("198804102012011003");
      setEmail("proktor.mts@bustanulhuda.sch.id");
      setPassword("password123");
      setLabAllocation("Lab CAT MTs Lt. 2");
    } else {
      setEducationLevel("MA");
      setSchoolName("MA Bustanul Huda Dawuhan");
      setNpsn("131233040020");
      setNsm("131233040020");
      setCity("Banyumas");
      setProvince("Jawa Tengah");
      setAddress("Kompleks Kampus MA Bustanul Huda, Dawuhan");
      setProctorName("Drs. M. Taufik, M.Pd.");
      setNip("199005152015031002");
      setEmail("proktor.ma@bustanulhuda.sch.id");
      setPassword("password123");
      setLabAllocation("Lab CAT MA-01");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!schoolName || !proctorName || !email) {
      Alert.warning("Data Belum Lengkap", "Mohon isi Nama Madrasah/Sekolah, Nama Proktor, dan Email.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/register-school", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName,
          educationLevel,
          npsn,
          nsm,
          city,
          province,
          address,
          proctorName,
          nip,
          email,
          password,
          labAllocation,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setActiveEducationLevel(educationLevel);
        if (typeof window !== "undefined") {
          localStorage.setItem("cbt_education_level", educationLevel);
          localStorage.setItem("cbt_school_name", schoolName);
          localStorage.setItem("cbt_school_id", data.data?.schoolId || "");
        }

        Alert.success(
          "Pendaftaran Berhasil!",
          `Lembaga ${schoolName} (Jenjang ${educationLevel}) dan akun proktor ${proctorName} berhasil terdaftar. Membuka Konsol Ujian...`
        ).then(() => {
          router.push(data.data?.redirectUrl || "/proctor/dashboard");
        });
      } else {
        Alert.error("Pendaftaran Gagal", data.message || "Gagal mendaftarkan madrasah.");
      }
    } catch (err: any) {
      Alert.error("Kesalahan Koneksi", err.message || "Terjadi kendala jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeJenjangInfo = JENJANG_CONFIG[educationLevel] || JENJANG_CONFIG.MI;

  return (
    <div className="bg-slate-50 font-body-default text-slate-800 antialiased min-h-screen flex flex-col">
      {/* Top Institutional Header */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900 flex items-center justify-center text-white shadow-xs shrink-0">
              <svg className="w-6 h-6 fill-amber-300" viewBox="0 0 24 24">
                <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z"></path>
              </svg>
            </div>
            <div>
              <span className="font-extrabold text-blue-950 text-sm tracking-tight uppercase block leading-tight">
                PORTAL PENDAFTARAN RESMI CBT MADRASAH & SEKOLAH
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Sistem Ujian Berbasis Komputer Mandiri Multi-Jenjang (MI, MTs, MA)
              </span>
            </div>
          </div>

          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">login</span>
            <span>Masuk ke Akun</span>
          </Link>
        </div>
      </header>

      {/* Main Registration Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {/* Banner Quick Demo Selector */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shadow-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                Pintasan Demo
              </span>
              <h2 className="font-bold text-sm sm:text-base">
                Coba Skenario Multi-Sekolah Mandiri (Isolasi Data)
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Klik salah satu tombol di bawah untuk mengisi formulir pendaftaran dengan contoh madrasah secara otomatis:
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleQuickDemo("mi01")}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                schoolName.includes("01")
                  ? "bg-emerald-500 text-white shadow-md ring-2 ring-emerald-300"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              MI Bustanul Huda 01
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("mi02")}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                schoolName.includes("02")
                  ? "bg-emerald-500 text-white shadow-md ring-2 ring-emerald-300"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              MI Bustanul Huda 02
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("mts")}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                schoolName.includes("MTS")
                  ? "bg-sky-500 text-white shadow-md ring-2 ring-sky-300"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              MTS Bustanul Huda
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("ma")}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                schoolName.includes("MA")
                  ? "bg-purple-500 text-white shadow-md ring-2 ring-purple-300"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              MA Bustanul Huda
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Form Card (2 Columns) */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 flex flex-col gap-6">
            {/* 1. Step: Pilih Jenjang Pendidikan */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="font-bold text-base text-slate-900">
                  Pilih Jenjang Lembaga Pendidikan
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Pilih jenjang sekolah Anda. Seluruh data rombongan belajar, bank soal, kurikulum, dan berita acara akan disesuaikan otomatis dengan jenjang ini.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    key: "MI" as EducationLevel,
                    title: "Madrasah Ibtidaiyah",
                    sub: "Tingkat Kelas 1 s/d 6",
                    icon: "child_care",
                    badge: "MI (Dasar)",
                    borderActive: "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20",
                    textColor: "text-emerald-700",
                  },
                  {
                    key: "MTS" as EducationLevel,
                    title: "Madrasah Tsanawiyah",
                    sub: "Tingkat Kelas VII, VIII, IX",
                    icon: "school",
                    badge: "MTs (Menengah)",
                    borderActive: "border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/20",
                    textColor: "text-sky-700",
                  },
                  {
                    key: "MA" as EducationLevel,
                    title: "Madrasah Aliyah",
                    sub: "Tingkat Kelas X, XI, XII",
                    icon: "account_balance",
                    badge: "MA / SMA",
                    borderActive: "border-purple-500 bg-purple-50/50 ring-2 ring-purple-500/20",
                    textColor: "text-purple-700",
                  },
                ].map((item) => {
                  const isSelected = educationLevel === item.key;
                  return (
                    <div
                      key={item.key}
                      onClick={() => setEducationLevel(item.key)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? `${item.borderActive} shadow-sm`
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/70"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`material-symbols-outlined text-[26px] ${isSelected ? item.textColor : "text-slate-400"}`}>
                          {item.icon}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected ? "bg-white border border-current/30 " + item.textColor : "bg-slate-100 text-slate-500"
                        }`}>
                          {item.badge}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">{item.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Step: Data Identitas Sekolah / Madrasah */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="font-bold text-base text-slate-900">
                  Identitas Madrasah / Sekolah
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <span>Nama Resmi Madrasah / Sekolah</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="Contoh: MI Bustanul Huda 01 Dawuhan"
                    className="px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-semibold outline-none"
                  />
                  <span className="text-[11px] text-slate-400">
                    Nama ini akan muncul pada Kop Berita Acara, Lembar Soal, dan Dashboard Pengawas.
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">NPSN / NSM</label>
                  <input
                    type="text"
                    value={npsn}
                    onChange={(e) => {
                      setNpsn(e.target.value);
                      setNsm(e.target.value);
                    }}
                    placeholder="Nomor Pokok Sekolah / NSM"
                    className="px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-semibold outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Kabupaten / Kota</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Contoh: Banyumas"
                    className="px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-semibold outline-none"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Alamat Lengkap</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Jl. Raya No. ..., Desa/Kelurahan..."
                    className="px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-semibold outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Step: Akun Proktor & Fasilitas CBT */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">
                  3
                </span>
                <h3 className="font-bold text-base text-slate-900">
                  Akun Proktor Utama Sekolah
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <span>Nama Lengkap Proktor</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={proctorName}
                    onChange={(e) => setProctorName(e.target.value)}
                    placeholder="Nama Lengkap Beserta Gelar"
                    className="px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-semibold outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">NIP / NUPTK / No. Pegawai</label>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="NIP atau ID Proktor"
                    className="px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-semibold outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <span>Email Akun Proktor</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="proktor@madrasah.sch.id"
                    className="px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-semibold outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Kata Sandi</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-semibold outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Alokasi Laboratorium CBT</label>
                  <input
                    type="text"
                    value={labAllocation}
                    onChange={(e) => setLabAllocation(e.target.value)}
                    placeholder="Contoh: Lab CBT MI 01"
                    className="px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-semibold outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                  <span>Mendaftarkan Madrasah & Membuat Ruang Ujian...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                  <span>Daftarkan Lembaga & Masuk ke Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Side Live Preview Card (1 Column) */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs sticky top-20">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Pratinjau Ruang Mandiri
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>

              {/* School Badge */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 mb-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${activeJenjangInfo.badgeBg} ${activeJenjangInfo.badgeText}`}>
                    Jenjang: {educationLevel}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">NPSN: {npsn || "-"}</span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                  {schoolName || "Nama Madrasah Belum Diisi"}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {city}, {province}
                </p>
              </div>

              {/* Proctor Badge */}
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                    {proctorName ? proctorName.charAt(0) : "P"}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-blue-700 uppercase">PROKTOR UTAMA</span>
                    <h5 className="font-bold text-slate-900 text-xs truncate">{proctorName}</h5>
                    <p className="text-[11px] text-slate-500 truncate">{email}</p>
                  </div>
                </div>
              </div>

              {/* Auto-generated initial rombel preview */}
              <div className="border-t border-slate-100 pt-3">
                <span className="text-[11px] font-bold text-slate-700 block mb-2">
                  Rombel Awal Otomatis Dibuat:
                </span>
                <div className="flex flex-col gap-1.5">
                  {educationLevel === "MI" ? (
                    <>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60 text-xs flex items-center justify-between">
                        <span className="font-bold text-slate-800">Kelas 1-A (Tematik)</span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">MI</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60 text-xs flex items-center justify-between">
                        <span className="font-bold text-slate-800">Kelas 3-A (Tematik)</span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">MI</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60 text-xs flex items-center justify-between">
                        <span className="font-bold text-slate-800">Kelas 6-A (Persiapan Asesmen)</span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">MI</span>
                      </div>
                    </>
                  ) : educationLevel === "MTS" ? (
                    <>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60 text-xs flex items-center justify-between">
                        <span className="font-bold text-slate-800">Kelas VII-1 (Tsanawiyah)</span>
                        <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">MTs</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60 text-xs flex items-center justify-between">
                        <span className="font-bold text-slate-800">Kelas VIII-1 Tahfidz</span>
                        <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">MTs</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60 text-xs flex items-center justify-between">
                        <span className="font-bold text-slate-800">Kelas IX-1 Unggulan</span>
                        <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">MTs</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60 text-xs flex items-center justify-between">
                        <span className="font-bold text-slate-800">Kelas X MIPA 1</span>
                        <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">MA</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60 text-xs flex items-center justify-between">
                        <span className="font-bold text-slate-800">Kelas XI IPS 1</span>
                        <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">MA</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60 text-xs flex items-center justify-between">
                        <span className="font-bold text-slate-800">Kelas XII Keagamaan</span>
                        <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">MA</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
