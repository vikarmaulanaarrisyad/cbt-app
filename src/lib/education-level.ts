"use client";

export type EducationLevel = "ALL" | "SEMUA" | "MI" | "MTS" | "MA";

export interface JenjangInfo {
  key: EducationLevel;
  label: string;
  fullName: string;
  grades: string[];
  gradeLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  ringColor: string;
  icon: string;
}

export const JENJANG_CONFIG: Record<string, JenjangInfo> = {
  SEMUA: {
    key: "SEMUA",
    label: "Semua",
    fullName: "Semua Jenjang (MI, MTs, MA)",
    grades: ["1", "2", "3", "4", "5", "6", "VII", "VIII", "IX", "X", "XI", "XII"],
    gradeLabel: "Semua Tingkat",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
    badgeBorder: "border-blue-200",
    ringColor: "ring-blue-500/20",
    icon: "domain",
  },
  ALL: {
    key: "ALL",
    label: "Semua",
    fullName: "Semua Jenjang (MI, MTs, MA)",
    grades: ["1", "2", "3", "4", "5", "6", "VII", "VIII", "IX", "X", "XI", "XII"],
    gradeLabel: "Semua Tingkat",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
    badgeBorder: "border-blue-200",
    ringColor: "ring-blue-500/20",
    icon: "domain",
  },
  MI: {
    key: "MI",
    label: "MI",
    fullName: "Madrasah Ibtidaiyah (Kelas 1 - 6)",
    grades: ["1", "2", "3", "4", "5", "6"],
    gradeLabel: "Kelas 1 s/d 6",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    badgeBorder: "border-emerald-300",
    ringColor: "ring-emerald-500/20",
    icon: "child_care",
  },
  MTS: {
    key: "MTS",
    label: "MTs",
    fullName: "Madrasah Tsanawiyah (Kelas VII - IX)",
    grades: ["VII", "VIII", "IX"],
    gradeLabel: "Tingkat VII s/d IX",
    badgeBg: "bg-sky-50",
    badgeText: "text-sky-700",
    badgeBorder: "border-sky-300",
    ringColor: "ring-sky-500/20",
    icon: "school",
  },
  MA: {
    key: "MA",
    label: "MA",
    fullName: "Madrasah Aliyah (Kelas X - XII)",
    grades: ["X", "XI", "XII"],
    gradeLabel: "Tingkat X s/d XII",
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-700",
    badgeBorder: "border-purple-300",
    ringColor: "ring-purple-500/20",
    icon: "account_balance",
  },
};

export const MAJORS_BY_JENJANG: Record<string, string[]> = {
  MI: ["Tematik Umum", "PAI & B. Arab", "Umum"],
  MTS: ["Umum", "Tahfidz", "Unggulan", "Kelas Riset"],
  MA: ["MIPA", "IPS", "Keagamaan", "Bahasa & Budaya", "RPL", "TKJ", "Umum"],
};

export const STORAGE_KEY_JENJANG = "cbt_education_level";
export const EVENT_JENJANG_CHANGE = "cbt-education-level-change";

/**
 * Mendapatkan jenjang aktif dari localStorage / default "SEMUA"
 */
export function getActiveEducationLevel(): EducationLevel {
  if (typeof window === "undefined") return "SEMUA";
  try {
    const stored = localStorage.getItem(STORAGE_KEY_JENJANG);
    if (stored && ["SEMUA", "ALL", "MI", "MTS", "MA"].includes(stored.toUpperCase())) {
      const normalized = stored.toUpperCase() === "ALL" ? "SEMUA" : stored.toUpperCase();
      return normalized as EducationLevel;
    }
  } catch {}
  return "SEMUA";
}

/**
 * Menyimpan jenjang aktif ke localStorage dan mengirim event global
 */
export function setActiveEducationLevel(level: EducationLevel): void {
  const normalized = level === "ALL" ? "SEMUA" : level.toUpperCase();
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_JENJANG, normalized);
      window.dispatchEvent(
        new CustomEvent(EVENT_JENJANG_CHANGE, {
          detail: { educationLevel: normalized },
        })
      );
    } catch {}
  }
}

/**
 * Mendapatkan daftar tingkat kelas yang relevan untuk jenjang tertentu
 */
export function getGradesForJenjang(level: string): string[] {
  const key = (level || "SEMUA").toUpperCase();
  return JENJANG_CONFIG[key]?.grades || JENJANG_CONFIG.SEMUA.grades;
}

/**
 * Mendapatkan daftar jurusan yang relevan untuk jenjang tertentu
 */
export function getMajorsForJenjang(level: string): string[] {
  const key = (level || "SEMUA").toUpperCase();
  if (key === "SEMUA" || key === "ALL") {
    return Array.from(
      new Set([...MAJORS_BY_JENJANG.MI, ...MAJORS_BY_JENJANG.MTS, ...MAJORS_BY_JENJANG.MA])
    );
  }
  return MAJORS_BY_JENJANG[key] || MAJORS_BY_JENJANG.MA;
}

/**
 * Mendapatkan info visual / badge konfigurasi jenjang
 */
export function getJenjangInfo(level: string): JenjangInfo {
  const key = (level || "SEMUA").toUpperCase();
  return JENJANG_CONFIG[key] || JENJANG_CONFIG.SEMUA;
}
