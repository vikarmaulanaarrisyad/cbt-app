"use client";

import React, { useState, useEffect } from "react";
import { Alert } from "@/lib/sweetalert";
import {
  getActiveEducationLevel,
  setActiveEducationLevel,
  EVENT_JENJANG_CHANGE,
  EducationLevel,
} from "@/lib/education-level";

interface StudentAttendance {
  nisn: string;
  name: string;
  educationLevel: "MI" | "MTS" | "MA";
  classGroup: string;
  workstation: string;
  status: "HADIR" | "TERLAMBAT" | "IZIN" | "ALPA";
  signedTime?: string;
}

export default function AttendancePage() {
  const [selectedLevelFilter, setSelectedLevelFilter] = useState("ALL");

  const [proctorUser, setProctorUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.user) {
          setProctorUser(data.data.user);
          if (data.data.user.educationLevel && data.data.user.educationLevel !== "SEMUA") {
            setSelectedLevelFilter(data.data.user.educationLevel);
            setActiveEducationLevel(data.data.user.educationLevel);
          }
        }
      })
      .catch(() => {});

    const activeLevel = getActiveEducationLevel();
    if (activeLevel && activeLevel !== "SEMUA") {
      setSelectedLevelFilter(activeLevel);
    }

    const handleJenjangChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ educationLevel: EducationLevel }>;
      if (customEvent.detail && customEvent.detail.educationLevel) {
        const lvl = customEvent.detail.educationLevel;
        setSelectedLevelFilter(lvl === "SEMUA" ? "ALL" : lvl);
      }
    };

    window.addEventListener(EVENT_JENJANG_CHANGE, handleJenjangChange);
    return () => window.removeEventListener(EVENT_JENJANG_CHANGE, handleJenjangChange);
  }, []);
  const [attendanceList, setAttendanceList] = useState<StudentAttendance[]>([
    // MI
    { nisn: "25-3101-0982-101", name: "Fathir Muhammad", educationLevel: "MI", classGroup: "6 Ibnu Sina", workstation: "PC-CBT-01", status: "HADIR", signedTime: "07:30 WIB" },
    { nisn: "25-3101-0982-102", name: "Aisyah Nurul Ilmi", educationLevel: "MI", classGroup: "5 Al-Farabi", workstation: "PC-CBT-02", status: "HADIR", signedTime: "07:35 WIB" },
    
    // MTS
    { nisn: "25-3101-0982-201", name: "Naufal Hadi", educationLevel: "MTS", classGroup: "IX-A", workstation: "PC-CBT-03", status: "HADIR", signedTime: "07:42 WIB" },
    { nisn: "25-3101-0982-202", name: "Zahra Ramadhani", educationLevel: "MTS", classGroup: "VIII-B", workstation: "PC-CBT-04", status: "TERLAMBAT", signedTime: "08:10 WIB" },
    
    // MA
    { nisn: "25-3101-0982-301", name: "Budi Santoso", educationLevel: "MA", classGroup: "XII MIPA 1", workstation: "PC-CBT-05", status: "HADIR", signedTime: "07:45 WIB" },
    { nisn: "25-3101-0982-302", name: "Siti Rahmawati", educationLevel: "MA", classGroup: "XII IPS 1", workstation: "PC-CBT-06", status: "HADIR", signedTime: "07:50 WIB" },
    { nisn: "25-3101-0982-303", name: "Dewi Lestari", educationLevel: "MA", classGroup: "XI Keagamaan", workstation: "PC-CBT-07", status: "ALPA" },
  ]);

  const toggleStatus = (index: number) => {
    const nextList = [...attendanceList];
    const current = nextList[index].status;
    if (current === "HADIR") nextList[index].status = "TERLAMBAT";
    else if (current === "TERLAMBAT") nextList[index].status = "ALPA";
    else if (current === "ALPA") nextList[index].status = "IZIN";
    else nextList[index].status = "HADIR";
    setAttendanceList(nextList);
  };

  const filteredList = attendanceList.filter((s) => {
    if (selectedLevelFilter === "ALL") return true;
    return s.educationLevel === selectedLevelFilter;
  });

  const hadirCount = filteredList.filter((s) => s.status === "HADIR" || s.status === "TERLAMBAT").length;

  return (
    <div className="flex-1 min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 w-full min-w-0">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-20 shadow-xs px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs shrink-0">
            <span className="material-symbols-outlined text-[22px]">fact_check</span>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              <span>Pusat Data CBT</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-emerald-600">
                {proctorUser?.educationLevel && proctorUser.educationLevel !== "SEMUA" ? `Presensi Ujian (${proctorUser.educationLevel})` : "Presensi Ujian Multi-Jenjang"}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
              Presensi & Verifikasi Peserta Ujian
            </h1>
          </div>
        </div>

        <button
          onClick={() => Alert.success("Ekspor Presensi", "Daftar Presensi berhasil diekspor ke Excel.")}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">file_download</span>
          <span>Ekspor Presensi (Excel)</span>
        </button>
      </header>

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-[1600px] mx-auto w-full">
        {/* Jenjang Selector Cards */}
        {proctorUser?.educationLevel && proctorUser.educationLevel !== "SEMUA" ? (
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shadow-xs ${
                proctorUser.educationLevel === "MI"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                  : proctorUser.educationLevel === "MTS"
                  ? "bg-sky-50 border border-sky-200 text-sky-700"
                  : "bg-purple-50 border border-purple-200 text-purple-700"
              }`}>
                <span className="material-symbols-outlined text-[24px]">fact_check</span>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  Presensi Peserta Tingkat {proctorUser.educationLevel === "MI" ? "Madrasah Ibtidaiyah (MI)" : proctorUser.educationLevel === "MTS" ? "Madrasah Tsanawiyah (MTs)" : "Madrasah Aliyah (MA)"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar absensi terfilter khusus untuk rombel dan peserta jenjang {proctorUser.educationLevel}.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              Total {filteredList.length} Peserta Terdaftar
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div
              onClick={() => {
                setSelectedLevelFilter("ALL");
                setActiveEducationLevel("SEMUA");
              }}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                selectedLevelFilter === "ALL" ? "bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20 shadow-xs" : "bg-slate-50 border-slate-200/60 hover:bg-slate-100"
              }`}
            >
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Semua Jenjang</span>
              <div className="text-xl font-black text-slate-900 mt-1">{attendanceList.length} Siswa</div>
              <span className="text-[10px] text-slate-400 font-medium">Total seluruh ruang</span>
            </div>

            <div
              onClick={() => {
                setSelectedLevelFilter("MI");
                setActiveEducationLevel("MI");
              }}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                selectedLevelFilter === "MI" ? "bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs" : "bg-slate-50 border-slate-200/60 hover:bg-slate-100"
              }`}
            >
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">MI (Ibtidaiyah)</span>
              <div className="text-xl font-black text-emerald-700 mt-1">
                {attendanceList.filter((s) => s.educationLevel === "MI").length} Siswa
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold">Tingkat MI Kelas 1-6</span>
            </div>

            <div
              onClick={() => {
                setSelectedLevelFilter("MTS");
                setActiveEducationLevel("MTS");
              }}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                selectedLevelFilter === "MTS" ? "bg-sky-50/70 border-sky-300 ring-2 ring-sky-500/20 shadow-xs" : "bg-slate-50 border-slate-200/60 hover:bg-slate-100"
              }`}
            >
              <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">MTs (Tsanawiyah)</span>
              <div className="text-xl font-black text-sky-700 mt-1">
                {attendanceList.filter((s) => s.educationLevel === "MTS").length} Siswa
              </div>
              <span className="text-[10px] text-sky-600 font-semibold">Tingkat MTs Kelas VII-IX</span>
            </div>

            <div
              onClick={() => {
                setSelectedLevelFilter("MA");
                setActiveEducationLevel("MA");
              }}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                selectedLevelFilter === "MA" ? "bg-purple-50/70 border-purple-300 ring-2 ring-purple-500/20 shadow-xs" : "bg-slate-50 border-slate-200/60 hover:bg-slate-100"
              }`}
            >
              <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">MA (Aliyah/SMA)</span>
              <div className="text-xl font-black text-purple-700 mt-1">
                {attendanceList.filter((s) => s.educationLevel === "MA").length} Siswa
              </div>
              <span className="text-[10px] text-purple-600 font-semibold">Tingkat MA Kelas X-XII</span>
            </div>
          </div>
        )}

        {/* Metrics summary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Terdaftar ({selectedLevelFilter})</p>
              <p className="text-2xl font-black text-slate-900 font-mono">{filteredList.length}</p>
            </div>
            <div className="border-r border-slate-200 h-8"></div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Hadir</p>
              <p className="text-2xl font-black text-emerald-600 font-mono">{hadirCount}</p>
            </div>
            <div className="border-r border-slate-200 h-8"></div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Persentase</p>
              <p className="text-2xl font-black text-blue-700 font-mono">
                {filteredList.length > 0 ? Math.round((hadirCount / filteredList.length) * 100) : 0}%
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-medium">Klik pada status kehadiran untuk mengubah secara langsung</span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 font-bold text-slate-800 text-sm flex items-center justify-between">
            <span>Daftar Peserta Ruang CBT</span>
            <span className="text-xs text-slate-400 font-normal">Filter: {selectedLevelFilter}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">NISN / Nomor</th>
                  <th className="py-3 px-4">Nama Lengkap Peserta</th>
                  <th className="py-3 px-4">Jenjang</th>
                  <th className="py-3 px-4">Rombel / Kelas</th>
                  <th className="py-3 px-4">Workstation</th>
                  <th className="py-3 px-4">Waktu Presensi</th>
                  <th className="py-3 px-4">Status Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((st, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{st.nisn}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{st.name}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${
                          st.educationLevel === "MI"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : st.educationLevel === "MTS"
                            ? "bg-sky-50 text-sky-700 border-sky-300"
                            : "bg-purple-50 text-purple-700 border-purple-300"
                        }`}
                      >
                        {st.educationLevel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{st.classGroup}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-blue-700">{st.workstation}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{st.signedTime || "-"}</td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => toggleStatus(idx)}
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] border cursor-pointer transition-all ${
                          st.status === "HADIR"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : st.status === "TERLAMBAT"
                            ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                            : st.status === "IZIN"
                            ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                            : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        }`}
                      >
                        {st.status}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
