import { db } from "@/prisma/db";
import {
  Subject,
  CreateSubjectInput,
  UpdateSubjectInput,
  SubjectQueryFilter,
  PaginatedSubjectResult,
  SubjectMetrics,
} from "../types";
import { filterSubjectsInMemory, calculatePaginationMeta } from "../queries";

// Default in-memory store to guarantee resilience
let inMemorySubjects: Subject[] = [
  // SEMUA / Lintas Jenjang / Asesmen Umum
  {
    id: "subj-01",
    code: "PU-01",
    name: "Penalaran Umum",
    educationLevel: "SEMUA",
    category: "Literasi & Skolastik",
    gradeLevel: "Semua",
    passingGrade: 75.0,
    description: "Tes Potensi Skolastik (TPS) Penalaran Umum",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "subj-02",
    code: "PK-01",
    name: "Pengetahuan Kuantitatif",
    educationLevel: "SEMUA",
    category: "Literasi & Skolastik",
    gradeLevel: "Semua",
    passingGrade: 75.0,
    description: "TPS Pengetahuan Kuantitatif dan Matematika Dasar",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "subj-03",
    code: "PBM-01",
    name: "Pemahaman Bacaan & Menulis",
    educationLevel: "SEMUA",
    category: "Literasi & Skolastik",
    gradeLevel: "Semua",
    passingGrade: 75.0,
    description: "TPS Pemahaman Bacaan dan Menulis",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "subj-04",
    code: "BIND-01",
    name: "Bahasa Indonesia",
    educationLevel: "SEMUA",
    category: "Wajib Umum",
    gradeLevel: "Semua",
    passingGrade: 75.0,
    description: "Mata Pelajaran Wajib Bahasa Indonesia Kurikulum Nasional",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "subj-05",
    code: "BING-01",
    name: "Bahasa Inggris",
    educationLevel: "SEMUA",
    category: "Wajib Umum",
    gradeLevel: "Semua",
    passingGrade: 75.0,
    description: "Mata Pelajaran Wajib Bahasa Inggris Kurikulum Nasional",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "subj-06",
    code: "MAT-01",
    name: "Matematika Umum",
    educationLevel: "SEMUA",
    category: "Wajib Umum",
    gradeLevel: "Semua",
    passingGrade: 75.0,
    description: "Matematika Wajib Semua Tingkat",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },

  // MI (Madrasah Ibtidaiyah / SD)
  {
    id: "subj-mi-01",
    code: "QH-MI-01",
    name: "Al-Qur'an Hadis MI",
    educationLevel: "MI",
    category: "PAI & Bahasa Arab",
    gradeLevel: "4",
    passingGrade: 75.0,
    description: "Pendidikan Agama Islam Al-Qur'an Hadis MI Tingkat Dasar",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "subj-mi-02",
    code: "AA-MI-01",
    name: "Akidah Akhlak MI",
    educationLevel: "MI",
    category: "PAI & Bahasa Arab",
    gradeLevel: "5",
    passingGrade: 75.0,
    description: "Akidah Akhlak Madrasah Ibtidaiyah",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "subj-mi-03",
    code: "FIQ-MI-01",
    name: "Fikih MI",
    educationLevel: "MI",
    category: "PAI & Bahasa Arab",
    gradeLevel: "6",
    passingGrade: 75.0,
    description: "Fikih Praktis dan Ibadah MI",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "subj-mi-04",
    code: "IPAS-MI-01",
    name: "Ilmu Pengetahuan Alam & Sosial (IPAS) MI",
    educationLevel: "MI",
    category: "Tematik Umum",
    gradeLevel: "4",
    passingGrade: 72.0,
    description: "IPAS Kurikulum Merdeka Madrasah Ibtidaiyah",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "subj-mi-05",
    code: "ARB-MI-01",
    name: "Bahasa Arab MI",
    educationLevel: "MI",
    category: "PAI & Bahasa Arab",
    gradeLevel: "6",
    passingGrade: 75.0,
    description: "Kosa Kata dan Percakapan Bahasa Arab Dasar MI",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },

  // MTS (Madrasah Tsanawiyah / SMP)
  {
    id: "subj-mts-01",
    code: "QH-MTS-01",
    name: "Al-Qur'an Hadis MTs",
    educationLevel: "MTS",
    category: "PAI & Bahasa Arab",
    gradeLevel: "VII",
    passingGrade: 75.0,
    description: "Ulumul Qur'an dan Hadis Dasar Tsanawiyah",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "subj-mts-02",
    code: "AA-MTS-01",
    name: "Akidah Akhlak MTs",
    educationLevel: "MTS",
    category: "PAI & Bahasa Arab",
    gradeLevel: "VIII",
    passingGrade: 75.0,
    description: "Penguatan Akidah dan Adab Madani MTs",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "subj-mts-03",
    code: "FIQ-MTS-01",
    name: "Fikih MTs",
    educationLevel: "MTS",
    category: "PAI & Bahasa Arab",
    gradeLevel: "IX",
    passingGrade: 75.0,
    description: "Hukum Muamalah dan Ibadah Tsanawiyah",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "subj-mts-04",
    code: "SKI-MTS-01",
    name: "Sejarah Kebudayaan Islam MTs",
    educationLevel: "MTS",
    category: "PAI & Bahasa Arab",
    gradeLevel: "VII",
    passingGrade: 75.0,
    description: "Periodisasi Khulafaur Rasyidin dan Daulah Islamiyah",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "subj-mts-05",
    code: "IPA-MTS-01",
    name: "Ilmu Pengetahuan Alam (IPA Terpadu) MTs",
    educationLevel: "MTS",
    category: "Wajib Umum",
    gradeLevel: "VIII",
    passingGrade: 75.0,
    description: "Fisika, Biologi, dan Kimia Terpadu MTs",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "subj-mts-06",
    code: "IPS-MTS-01",
    name: "Ilmu Pengetahuan Sosial (IPS Terpadu) MTs",
    educationLevel: "MTS",
    category: "Wajib Umum",
    gradeLevel: "IX",
    passingGrade: 75.0,
    description: "Geografi, Sejarah, dan Ekonomi Masyarakat MTs",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },

  // MA (Madrasah Aliyah / SMA)
  {
    id: "subj-07",
    code: "FIS-01",
    name: "Fisika",
    educationLevel: "MA",
    category: "Peminatan MIPA",
    gradeLevel: "XI",
    passingGrade: 75.0,
    description: "Fisika Teori dan Terapan SMA/MA",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "subj-08",
    code: "KIM-01",
    name: "Kimia",
    educationLevel: "MA",
    category: "Peminatan MIPA",
    gradeLevel: "XI",
    passingGrade: 75.0,
    description: "Kimia SMA/MA",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "subj-09",
    code: "BIO-01",
    name: "Biologi",
    educationLevel: "MA",
    category: "Peminatan MIPA",
    gradeLevel: "XI",
    passingGrade: 75.0,
    description: "Biologi Eksperimental dan Teori",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "subj-ma-01",
    code: "USH-MA-01",
    name: "Ushul Fikih",
    educationLevel: "MA",
    category: "Peminatan Keagamaan",
    gradeLevel: "XI",
    passingGrade: 78.0,
    description: "Kaidah Ushul Fikih dan Istinbat Hukum Islam",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "subj-ma-02",
    code: "EKO-MA-01",
    name: "Ekonomi & Akuntansi MA",
    educationLevel: "MA",
    category: "Peminatan IPS",
    gradeLevel: "XII",
    passingGrade: 75.0,
    description: "Ekonomi Mikro, Makro, dan Siklus Akuntansi",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "subj-10",
    code: "INF-01",
    name: "Informatika & Komputer",
    educationLevel: "MA",
    category: "Kejuruan / Vokasi",
    gradeLevel: "X",
    passingGrade: 78.0,
    description: "Pemrograman, Jaringan, dan Algoritma CBT",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

function getSubjectModel() {
  return db?.subject || db?.Subject || null;
}

export class SubjectRepository {
  /**
   * Fetches all raw subjects from DB or fallback
   */
  async getAllRaw(): Promise<Subject[]> {
    try {
      const model = getSubjectModel();
      if (model && typeof model.findMany === "function") {
        const rows = await model.findMany();
        if (Array.isArray(rows) && rows.length > 0) {
          return rows.map((r: any) => ({
            ...r,
            educationLevel: (r.educationLevel || "SEMUA").toUpperCase(),
            passingGrade: Number(r.passingGrade) || 75.0,
            isActive: Boolean(r.isActive),
          }));
        }
      }
    } catch (error) {
      console.warn("[SubjectRepository] DB query failed, falling back to memory store:", error);
    }
    return [...inMemorySubjects];
  }

  /**
   * Finds many subjects with filter and pagination
   */
  async findMany(filter: SubjectQueryFilter): Promise<PaginatedSubjectResult> {
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const allSubjects = await this.getAllRaw();

    const filtered = filterSubjectsInMemory(allSubjects, filter);
    const total = filtered.length;
    const skip = (page - 1) * limit;
    const paginated = filtered.slice(skip, skip + limit);

    return {
      data: paginated,
      meta: calculatePaginationMeta(total, page, limit),
    };
  }

  /**
   * Finds a subject by unique ID
   */
  async findById(id: string): Promise<Subject | null> {
    try {
      const model = getSubjectModel();
      if (model && typeof model.findUnique === "function") {
        const found = await model.findUnique({ where: { id } });
        if (found) {
          return {
            ...found,
            educationLevel: (found.educationLevel || "SEMUA").toUpperCase(),
            passingGrade: Number(found.passingGrade) || 75.0,
            isActive: Boolean(found.isActive),
          };
        }
      }
    } catch (error) {
      console.warn(`[SubjectRepository] Error finding subject ${id}:`, error);
    }
    return inMemorySubjects.find((s) => s.id === id) || null;
  }

  /**
   * Finds a subject by code
   */
  async findByCode(code: string): Promise<Subject | null> {
    try {
      const all = await this.getAllRaw();
      const found = all.find((s) => s.code.toLowerCase() === code.toLowerCase());
      if (found) return found;
    } catch (error) {
      console.warn(`[SubjectRepository] Error finding subject code ${code}:`, error);
    }
    return inMemorySubjects.find((s) => s.code.toLowerCase() === code.toLowerCase()) || null;
  }

  /**
   * Creates a new subject
   */
  async create(data: CreateSubjectInput): Promise<Subject> {
    const id = `subj-${Date.now()}`;
    const newRecord: Subject = {
      id,
      code: data.code.trim().toUpperCase(),
      name: data.name.trim(),
      educationLevel: (data.educationLevel || "SEMUA").toUpperCase() as any,
      category: data.category?.trim() || "Wajib Umum",
      gradeLevel: data.gradeLevel?.trim() || "Semua",
      passingGrade: Number(data.passingGrade) || 75.0,
      description: data.description?.trim() || null,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const model = getSubjectModel();
      if (model && typeof model.create === "function") {
        const created = await model.create({
          data: {
            id: newRecord.id,
            code: newRecord.code,
            name: newRecord.name,
            educationLevel: newRecord.educationLevel,
            category: newRecord.category,
            gradeLevel: newRecord.gradeLevel,
            passingGrade: newRecord.passingGrade,
            description: newRecord.description,
            isActive: newRecord.isActive,
          },
        });
        if (created) {
          const synced: Subject = {
            ...created,
            educationLevel: (created.educationLevel || newRecord.educationLevel).toUpperCase(),
            passingGrade: Number(created.passingGrade) || 75.0,
            isActive: Boolean(created.isActive),
          };
          inMemorySubjects.unshift(synced);
          return synced;
        }
      }
    } catch (error) {
      console.warn("[SubjectRepository] DB insert failed, writing to fallback memory store:", error);
    }

    inMemorySubjects.unshift(newRecord);
    return newRecord;
  }

  /**
   * Updates an existing subject
   */
  async update(id: string, data: UpdateSubjectInput): Promise<Subject> {
    let existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Mata pelajaran dengan ID ${id} tidak ditemukan`);
    }

    const updatedRecord: Subject = {
      ...existing,
      ...data,
      code: data.code ? data.code.trim().toUpperCase() : existing.code,
      name: data.name ? data.name.trim() : existing.name,
      educationLevel: data.educationLevel ? (data.educationLevel.toUpperCase() as any) : existing.educationLevel,
      category: data.category !== undefined ? data.category : existing.category,
      gradeLevel: data.gradeLevel !== undefined ? data.gradeLevel : existing.gradeLevel,
      passingGrade: data.passingGrade !== undefined ? Number(data.passingGrade) : existing.passingGrade,
      description: data.description !== undefined ? data.description : existing.description,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : existing.isActive,
      updatedAt: new Date().toISOString(),
    };

    try {
      const model = getSubjectModel();
      if (model && typeof model.update === "function") {
        const updated = await model.update({
          where: { id },
          data: {
            code: updatedRecord.code,
            name: updatedRecord.name,
            educationLevel: updatedRecord.educationLevel,
            category: updatedRecord.category,
            gradeLevel: updatedRecord.gradeLevel,
            passingGrade: updatedRecord.passingGrade,
            description: updatedRecord.description,
            isActive: updatedRecord.isActive,
          },
        });
        if (updated) {
          const synced: Subject = {
            ...updated,
            educationLevel: (updated.educationLevel || updatedRecord.educationLevel).toUpperCase(),
            passingGrade: Number(updated.passingGrade) || 75.0,
            isActive: Boolean(updated.isActive),
          };
          const idx = inMemorySubjects.findIndex((s) => s.id === id);
          if (idx !== -1) inMemorySubjects[idx] = synced;
          return synced;
        }
      }
    } catch (error) {
      console.warn("[SubjectRepository] DB update failed, saving in memory store:", error);
    }

    const idx = inMemorySubjects.findIndex((s) => s.id === id);
    if (idx !== -1) {
      inMemorySubjects[idx] = updatedRecord;
    } else {
      inMemorySubjects.unshift(updatedRecord);
    }
    return updatedRecord;
  }

  /**
   * Deletes a subject by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      const model = getSubjectModel();
      if (model && typeof model.delete === "function") {
        await model.delete({ where: { id } });
      }
    } catch (error) {
      console.warn(`[SubjectRepository] DB delete failed for subject ${id}:`, error);
    }

    inMemorySubjects = inMemorySubjects.filter((s) => s.id !== id);
    return true;
  }

  /**
   * Toggles active status of a subject
   */
  async toggleStatus(id: string): Promise<Subject> {
    const subject = await this.findById(id);
    if (!subject) {
      throw new Error(`Mata pelajaran dengan ID ${id} tidak ditemukan`);
    }

    return await this.update(id, { isActive: !subject.isActive });
  }

  /**
   * Calculates overall metrics for subjects
   */
  async getMetrics(): Promise<SubjectMetrics> {
    const subjects = await this.getAllRaw();
    const totalSubjects = subjects.length;
    const activeSubjects = subjects.filter((s) => s.isActive).length;
    const inactiveSubjects = totalSubjects - activeSubjects;

    const totalPassingGrade = subjects.reduce((sum, s) => sum + (Number(s.passingGrade) || 0), 0);
    const averagePassingGrade = totalSubjects > 0 ? Math.round((totalPassingGrade / totalSubjects) * 10) / 10 : 75.0;

    const uniqueCategories = new Set(subjects.map((s) => s.category));
    const totalCategories = uniqueCategories.size;

    const totalMI = subjects.filter((s) => s.educationLevel === "MI").length;
    const totalMTS = subjects.filter((s) => s.educationLevel === "MTS").length;
    const totalMA = subjects.filter((s) => s.educationLevel === "MA").length;

    return {
      totalSubjects,
      activeSubjects,
      inactiveSubjects,
      averagePassingGrade,
      totalCategories,
      totalMI,
      totalMTS,
      totalMA,
    };
  }

  /**
   * Retrieves unique categories list
   */
  async getCategories(): Promise<string[]> {
    const subjects = await this.getAllRaw();
    const categories = Array.from(new Set(subjects.map((s) => s.category))).filter(Boolean);
    return categories.sort();
  }

  /**
   * Retrieves unique grade levels list
   */
  async getGradeLevels(): Promise<string[]> {
    const subjects = await this.getAllRaw();
    const grades = Array.from(new Set(subjects.map((s) => s.gradeLevel))).filter(Boolean);
    return grades.sort();
  }
}

export const subjectRepository = new SubjectRepository();

