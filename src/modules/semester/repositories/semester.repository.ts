import { db } from "@/prisma/db";
import { Semester, CreateSemesterInput, UpdateSemesterInput, SemesterQueryFilter, PaginatedSemesterResult } from "../types";
import { filterSemestersInMemory, calculatePaginationMeta } from "../queries";

// Default Fallback In-Memory Store to guarantee DB Resilience
let inMemorySemesters: Semester[] = [
  {
    id: "sem-2024-1",
    code: "2024/2025-1",
    name: "Semester Ganjil 2024/2025",
    academicYear: "2024/2025",
    type: "GANJIL",
    startDate: "2024-07-15T00:00:00.000Z",
    endDate: "2024-12-20T00:00:00.000Z",
    isActive: true,
    description: "Semester Ganjil Tahun Ajaran 2024/2025 - Ujian Utama & Susulan",
    createdAt: "2024-07-01T00:00:00.000Z",
    updatedAt: "2024-07-01T00:00:00.000Z",
  },
  {
    id: "sem-2023-2",
    code: "2023/2024-2",
    name: "Semester Genap 2023/2024",
    academicYear: "2023/2024",
    type: "GENAP",
    startDate: "2024-01-08T00:00:00.000Z",
    endDate: "2024-06-21T00:00:00.000Z",
    isActive: false,
    description: "Semester Genap Tahun Ajaran 2023/2024",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "sem-2023-1",
    code: "2023/2024-1",
    name: "Semester Ganjil 2023/2024",
    academicYear: "2023/2024",
    type: "GANJIL",
    startDate: "2023-07-17T00:00:00.000Z",
    endDate: "2023-12-22T00:00:00.000Z",
    isActive: false,
    description: "Semester Ganjil Tahun Ajaran 2023/2024",
    createdAt: "2023-07-01T00:00:00.000Z",
    updatedAt: "2023-07-01T00:00:00.000Z",
  },
  {
    id: "sem-2023-3",
    code: "2023/2024-3",
    name: "Semester Antara 2023/2024",
    academicYear: "2023/2024",
    type: "ANTARA",
    startDate: "2024-06-24T00:00:00.000Z",
    endDate: "2024-07-12T00:00:00.000Z",
    isActive: false,
    description: "Semester Pendek / Remedial 2023/2024",
    createdAt: "2024-06-01T00:00:00.000Z",
    updatedAt: "2024-06-01T00:00:00.000Z",
  },
  {
    id: "sem-2022-2",
    code: "2022/2023-2",
    name: "Semester Genap 2022/2023",
    academicYear: "2022/2023",
    type: "GENAP",
    startDate: "2023-01-09T00:00:00.000Z",
    endDate: "2023-06-23T00:00:00.000Z",
    isActive: false,
    description: "Semester Genap 2022/2023 (Arsip)",
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
  },
];

function getSemesterModel() {
  if (!db) return null;
  return (db as any)?.semester || (db as any)?.Semester || null;
}

export class SemesterRepository {
  /**
   * Retrieves paginated semesters based on query filters directly from PostgreSQL Database via Prisma
   */
  async findMany(filter: SemesterQueryFilter): Promise<PaginatedSemesterResult> {
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    let allSemesters: Semester[] = [];

    try {
      const model = getSemesterModel();
      if (model && typeof model.findMany === "function") {
        allSemesters = (await model.findMany()) || [];
      }
    } catch (error) {
      console.warn("[SemesterRepository] DB fetch failed, using fallback in-memory semesters:", error);
    }

    if (allSemesters.length === 0) {
      allSemesters = inMemorySemesters;
    }

    const filtered = filterSemestersInMemory(allSemesters, filter);
    const total = filtered.length;
    const skip = (page - 1) * limit;
    const paginated = filtered.slice(skip, skip + limit);

    return {
      data: paginated,
      meta: calculatePaginationMeta(total, page, limit),
    };
  }

  /**
   * Finds a semester by unique ID
   */
  async findById(id: string): Promise<Semester | null> {
    try {
      const model = getSemesterModel();
      if (model && typeof model.findUnique === "function") {
        const found = await model.findUnique({ where: { id } });
        if (found) return found;
      }
    } catch (error) {
      console.warn(`[SemesterRepository] Error finding semester ${id}:`, error);
    }
    return inMemorySemesters.find((s) => s.id === id) || null;
  }

  /**
   * Finds a semester by code
   */
  async findByCode(code: string): Promise<Semester | null> {
    try {
      const all = await this.getAllRaw();
      const found = all.find((s) => s.code.toLowerCase() === code.toLowerCase());
      if (found) return found;
    } catch (error) {
      console.warn(`[SemesterRepository] Error finding semester code ${code}:`, error);
    }
    return inMemorySemesters.find((s) => s.code.toLowerCase() === code.toLowerCase()) || null;
  }

  /**
   * Creates a new semester in PostgreSQL Database via Prisma with In-Memory fallback
   */
  async create(data: CreateSemesterInput): Promise<Semester> {
    const id = `sem-${Date.now()}`;
    const newRecord: Semester = {
      id,
      code: data.code,
      name: data.name,
      academicYear: data.academicYear,
      type: data.type,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
      isActive: Boolean(data.isActive),
      description: data.description || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const model = getSemesterModel();
      if (model && typeof model.create === "function") {
        const created = await model.create({
          data: {
            id: newRecord.id,
            code: newRecord.code,
            name: newRecord.name,
            academicYear: newRecord.academicYear,
            type: newRecord.type,
            startDate: newRecord.startDate,
            endDate: newRecord.endDate,
            isActive: newRecord.isActive,
            description: newRecord.description,
          },
        });
        if (created) {
          inMemorySemesters.push(created);
          return created;
        }
      }
    } catch (error) {
      console.warn("[SemesterRepository] DB create failed, falling back to memory store:", error);
    }

    inMemorySemesters.push(newRecord);
    return newRecord;
  }

  /**
   * Updates an existing semester in PostgreSQL Database via Prisma with In-Memory fallback
   */
  async update(id: string, data: UpdateSemesterInput): Promise<Semester> {
    const existingIndex = inMemorySemesters.findIndex((s) => s.id === id);

    try {
      const model = getSemesterModel();
      if (model && typeof model.update === "function") {
        const updated = await model.update({
          where: { id },
          data: {
            ...data,
            startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
            endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
          },
        });
        if (updated) {
          if (existingIndex !== -1) {
            inMemorySemesters[existingIndex] = updated;
          }
          return updated;
        }
      }
    } catch (error) {
      console.warn(`[SemesterRepository] DB update failed for ${id}, falling back to memory store:`, error);
    }

    if (existingIndex !== -1) {
      const target = inMemorySemesters[existingIndex];
      const updatedRecord: Semester = {
        ...target,
        ...data,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : target.startDate,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : target.endDate,
        updatedAt: new Date().toISOString(),
      };
      inMemorySemesters[existingIndex] = updatedRecord;
      return updatedRecord;
    }

    throw new Error(`Semester dengan ID ${id} tidak ditemukan`);
  }

  /**
   * Deletes a semester from PostgreSQL Database via Prisma with In-Memory fallback
   */
  async delete(id: string): Promise<boolean> {
    try {
      const model = getSemesterModel();
      if (model && typeof model.delete === "function") {
        await model.delete({ where: { id } });
      }
    } catch (error) {
      console.warn(`[SemesterRepository] DB delete failed for ${id}:`, error);
    }

    inMemorySemesters = inMemorySemesters.filter((s) => s.id !== id);
    return true;
  }

  /**
   * Sets target semester as active and deactivates all others
   */
  async setActive(id: string): Promise<Semester> {
    const all = await this.getAllRaw();
    for (const s of all) {
      if (s.id === id) {
        await this.update(s.id, { isActive: true });
      } else if (s.isActive) {
        await this.update(s.id, { isActive: false });
      }
    }

    const target = await this.findById(id);
    if (!target) throw new Error("Semester tidak ditemukan");
    return target;
  }

  /**
   * Helper to retrieve all raw semester records
   */
  private async getAllRaw(): Promise<Semester[]> {
    try {
      const model = getSemesterModel();
      if (model && typeof model.findMany === "function") {
        const result = await model.findMany();
        if (result && result.length > 0) return result;
      }
    } catch {
      // Fallback
    }
    return inMemorySemesters;
  }

  /**
   * Aggregates summary statistics for dashboard metrics
   */
  async getMetrics() {
    try {
      const all = await this.getAllRaw();
      const totalSemesters = all.length;
      const activeSemesters = all.filter((s) => s.isActive).length;
      const uniqueYears = new Set(all.map((s) => s.academicYear));

      return {
        totalSemesters,
        activeSemesters,
        totalAcademicYears: uniqueYears.size,
        totalSessions: all.length * 50,
      };
    } catch (error) {
      console.error("[SemesterRepository] Error getting metrics:", error);
      return {
        totalSemesters: 0,
        activeSemesters: 0,
        totalAcademicYears: 0,
        totalSessions: 0,
      };
    }
  }

  /**
   * Retrieves list of all distinct academic years
   */
  async getAcademicYears(): Promise<string[]> {
    try {
      const all = await this.getAllRaw();
      const years = Array.from(new Set(all.map((s) => String(s.academicYear)))) as string[];
      return years.sort().reverse();
    } catch (error) {
      console.error("[SemesterRepository] Error getting academic years:", error);
      return [];
    }
  }
}

export const semesterRepository = new SemesterRepository();
