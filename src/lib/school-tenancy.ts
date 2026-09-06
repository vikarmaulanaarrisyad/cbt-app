import { EducationLevel } from "./education-level";

export interface School {
  id: string;
  name: string;
  npsn: string;
  nsm?: string;
  educationLevel: EducationLevel;
  city: string;
  province: string;
  address?: string;
  contactEmail: string;
  contactPhone?: string;
  proctorId: string;
  proctorName: string;
  labAllocation: string;
  createdAt: string;
}

// Preset Sekolah & Madrasah Demo Bawaan
export const PRESET_SCHOOLS: School[] = [
  {
    id: "sch-mi-bh01",
    name: "MI Bustanul Huda 01 Dawuhan",
    npsn: "111233040001",
    nsm: "111233040001",
    educationLevel: "MI",
    city: "Banyumas",
    province: "Jawa Tengah",
    address: "Jl. KH. Hasyim Asy'ari No. 01, Dawuhan",
    contactEmail: "mi01.dawuhan@bustanulhuda.sch.id",
    contactPhone: "081234567891",
    proctorId: "usr-proctor-mi01",
    proctorName: "Ustadz Ahmad Fauzi, S.Pd.I.",
    labAllocation: "Lab CBT MI 01",
    createdAt: new Date().toISOString(),
  },
  {
    id: "sch-mi-bh02",
    name: "MI Bustanul Huda 02 Dawuhan",
    npsn: "111233040002",
    nsm: "111233040002",
    educationLevel: "MI",
    city: "Banyumas",
    province: "Jawa Tengah",
    address: "Jl. Pangeran Diponegoro No. 12, Dawuhan",
    contactEmail: "mi02.dawuhan@bustanulhuda.sch.id",
    contactPhone: "081234567892",
    proctorId: "usr-proctor-mi02",
    proctorName: "Ustadzah Siti Fatimah, S.Pd.",
    labAllocation: "Lab Komputer MI 02",
    createdAt: new Date().toISOString(),
  },
  {
    id: "sch-mts-bh",
    name: "MTS Bustanul Huda Dawuhan",
    npsn: "121233040015",
    nsm: "121233040015",
    educationLevel: "MTS",
    city: "Banyumas",
    province: "Jawa Tengah",
    address: "Kompleks Ponpes Bustanul Huda, Dawuhan",
    contactEmail: "mts.dawuhan@bustanulhuda.sch.id",
    contactPhone: "081234567893",
    proctorId: "usr-proctor-mts",
    proctorName: "Ustadz Zulkifli, M.Pd.",
    labAllocation: "Lab CAT MTs Lt. 2",
    createdAt: new Date().toISOString(),
  },
  {
    id: "sch-ma-bh",
    name: "MA Bustanul Huda Dawuhan",
    npsn: "131233040020",
    nsm: "131233040020",
    educationLevel: "MA",
    city: "Banyumas",
    province: "Jawa Tengah",
    address: "Kompleks Kampus MA Bustanul Huda, Dawuhan",
    contactEmail: "ma.dawuhan@bustanulhuda.sch.id",
    contactPhone: "081234567894",
    proctorId: "usr-proctor-ma",
    proctorName: "Drs. M. Taufik, M.Pd.",
    labAllocation: "Lab CAT MA-01",
    createdAt: new Date().toISOString(),
  },
];

declare global {
  var globalSchoolsStore: School[] | undefined;
}

export function getSchoolsStore(): School[] {
  if (!global.globalSchoolsStore) {
    global.globalSchoolsStore = [...PRESET_SCHOOLS];
  }
  return global.globalSchoolsStore;
}

export function findSchoolById(id: string): School | undefined {
  const store = getSchoolsStore();
  return store.find((s) => s.id === id);
}

export function findSchoolByNpsn(npsn: string): School | undefined {
  const store = getSchoolsStore();
  return store.find((s) => s.npsn === npsn || s.nsm === npsn);
}

export function addSchool(school: School): School {
  const store = getSchoolsStore();
  const existingIdx = store.findIndex((s) => s.id === school.id || s.npsn === school.npsn);
  if (existingIdx >= 0) {
    store[existingIdx] = school;
  } else {
    store.unshift(school);
  }
  return school;
}

/**
 * Generate starter classes for a newly registered school based on its educationLevel
 */
export function generateInitialClassesForSchool(school: School) {
  const year = "2024/2025";
  const schoolShort = school.name
    .replace(/Madrasah\s+/i, "")
    .replace(/Ibtidaiyah/i, "MI")
    .replace(/Tsanawiyah/i, "MTs")
    .replace(/Aliyah/i, "MA");

  if (school.educationLevel === "MI") {
    return [
      {
        id: `cls-${school.id}-1a`,
        schoolId: school.id,
        schoolName: school.name,
        code: `1-A-${school.npsn.slice(-3)}`,
        name: `Kelas 1-A (${schoolShort})`,
        educationLevel: "MI",
        gradeLevel: "1",
        major: "Tematik Umum",
        academicYear: year,
        capacity: 28,
        homeTeacherName: "Ustadzah Khadijah, S.Pd.",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `cls-${school.id}-3a`,
        schoolId: school.id,
        schoolName: school.name,
        code: `3-A-${school.npsn.slice(-3)}`,
        name: `Kelas 3-A (${schoolShort})`,
        educationLevel: "MI",
        gradeLevel: "3",
        major: "Tematik Umum",
        academicYear: year,
        capacity: 30,
        homeTeacherName: "Ahmad Syafi'i, S.Pd.",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `cls-${school.id}-6a`,
        schoolId: school.id,
        schoolName: school.name,
        code: `6-A-${school.npsn.slice(-3)}`,
        name: `Kelas 6-A (${schoolShort})`,
        educationLevel: "MI",
        gradeLevel: "6",
        major: "Tematik Umum",
        academicYear: year,
        capacity: 32,
        homeTeacherName: "Nurul Hidayati, M.Pd.",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  if (school.educationLevel === "MTS") {
    return [
      {
        id: `cls-${school.id}-7-1`,
        schoolId: school.id,
        schoolName: school.name,
        code: `VII-1-${school.npsn.slice(-3)}`,
        name: `Kelas VII-1 (${schoolShort})`,
        educationLevel: "MTS",
        gradeLevel: "VII",
        major: "Umum",
        academicYear: year,
        capacity: 32,
        homeTeacherName: "Drs. H. Mahrus, M.Ag.",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `cls-${school.id}-8-1`,
        schoolId: school.id,
        schoolName: school.name,
        code: `VIII-1-${school.npsn.slice(-3)}`,
        name: `Kelas VIII-1 Tahfidz (${schoolShort})`,
        educationLevel: "MTS",
        gradeLevel: "VIII",
        major: "Tahfidz",
        academicYear: year,
        capacity: 30,
        homeTeacherName: "Ustadz Zulkifli, Al-Hafidz",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `cls-${school.id}-9-1`,
        schoolId: school.id,
        schoolName: school.name,
        code: `IX-1-${school.npsn.slice(-3)}`,
        name: `Kelas IX-1 Unggulan (${schoolShort})`,
        educationLevel: "MTS",
        gradeLevel: "IX",
        major: "Umum",
        academicYear: year,
        capacity: 34,
        homeTeacherName: "Dewi Safitri, S.Pd.",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  // MA
  return [
    {
      id: `cls-${school.id}-10-ipa`,
      schoolId: school.id,
      schoolName: school.name,
      code: `X-MIPA-${school.npsn.slice(-3)}`,
      name: `Kelas X MIPA 1 (${schoolShort})`,
      educationLevel: "MA",
      gradeLevel: "X",
      major: "MIPA",
      academicYear: year,
      capacity: 36,
      homeTeacherName: "Dr. Endang Supratman",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `cls-${school.id}-11-ips`,
      schoolId: school.id,
      schoolName: school.name,
      code: `XI-IPS-${school.npsn.slice(-3)}`,
      name: `Kelas XI IPS 1 (${schoolShort})`,
      educationLevel: "MA",
      gradeLevel: "XI",
      major: "IPS",
      academicYear: year,
      capacity: 34,
      homeTeacherName: "Dewi Lestari, S.Pd.",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `cls-${school.id}-12-agm`,
      schoolId: school.id,
      schoolName: school.name,
      code: `XII-AGM-${school.npsn.slice(-3)}`,
      name: `Kelas XII Keagamaan (${schoolShort})`,
      educationLevel: "MA",
      gradeLevel: "XII",
      major: "Keagamaan",
      academicYear: year,
      capacity: 32,
      homeTeacherName: "K.H. Syamsudin, Lc., M.A.",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}
