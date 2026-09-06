import { db } from "@/prisma/db";
import {
  Student,
  CreateStudentInput,
  UpdateStudentInput,
  StudentQueryFilter,
  PaginatedStudentResult,
  StudentMetrics,
  PaginationMeta,
} from "../types";

// In-memory fallback store with sample data
let inMemoryStudents: Student[] = [
  {
    id: "std-001",
    nisn: "1234567890",
    name: "Ahmad Fauzi",
    placeOfBirth: "Malang",
    dateOfBirth: "2010-08-15T00:00:00.000Z",
    gender: "L",
    classGroup: "Kelas 6-A",
    gradeLevel: "6",
    educationLevel: "MI",
    schoolId: "sch-mi-001",
    schoolName: "MI Bustanul Huda 01 Dawuhan",
    username: "ahmad.fauzi",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "std-002",
    nisn: "1234567891",
    name: "Siti Nurhaliza",
    placeOfBirth: "Surabaya",
    dateOfBirth: "2011-03-20T00:00:00.000Z",
    gender: "P",
    classGroup: "Kelas 5-A",
    gradeLevel: "5",
    educationLevel: "MI",
    schoolId: "sch-mi-001",
    schoolName: "MI Bustanul Huda 01 Dawuhan",
    username: "siti.nurhaliza",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "std-003",
    nisn: "1234567892",
    name: "Rizky Pratama",
    placeOfBirth: "Kediri",
    dateOfBirth: "2010-11-10T00:00:00.000Z",
    gender: "L",
    classGroup: "Kelas 6-A",
    gradeLevel: "6",
    educationLevel: "MI",
    schoolId: "sch-mi-001",
    schoolName: "MI Bustanul Huda 01 Dawuhan",
    username: "rizky.pratama",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

function getStudentModel() {
  return db?.student || db?.Student || null;
}

function calculatePaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

function filterStudentsInMemory(students: Student[], filter: StudentQueryFilter): Student[] {
  let result = [...students];

  if (filter.schoolId) {
    result = result.filter((s) => s.schoolId === filter.schoolId);
  }

  if (filter.educationLevel && filter.educationLevel !== "ALL" && filter.educationLevel !== "SEMUA") {
    result = result.filter((s) => (s.educationLevel || "").toUpperCase() === filter.educationLevel!.toUpperCase());
  }

  if (filter.classGroup) {
    result = result.filter((s) =>
      (s.classGroup || "").toLowerCase().includes(filter.classGroup!.toLowerCase())
    );
  }

  if (filter.gradeLevel) {
    result = result.filter((s) => s.gradeLevel === filter.gradeLevel);
  }

  if (filter.gender) {
    result = result.filter((s) => s.gender === filter.gender);
  }

  if (filter.isActive !== undefined) {
    result = result.filter((s) => s.isActive === filter.isActive);
  }

  if (filter.search) {
    const q = filter.search.toLowerCase();
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.nisn.includes(q) ||
        (s.classGroup || "").toLowerCase().includes(q) ||
        (s.username || "").toLowerCase().includes(q)
    );
  }

  // Sort
  const sortBy = filter.sortBy || "name";
  const sortDir = filter.sortDir === "desc" ? -1 : 1;
  result.sort((a, b) => {
    const aVal = (a as any)[sortBy] || "";
    const bVal = (b as any)[sortBy] || "";
    if (aVal < bVal) return -1 * sortDir;
    if (aVal > bVal) return 1 * sortDir;
    return 0;
  });

  return result;
}

export class StudentRepository {
  async getAllRaw(schoolId?: string): Promise<Student[]> {
    try {
      const model = getStudentModel();
      if (model && typeof model.findMany === "function") {
        const options: any = { orderBy: { name: "asc" } };
        if (schoolId) {
          options.where = { schoolId };
        }
        const rows = await model.findMany(options);
        if (Array.isArray(rows) && rows.length > 0) {
          return rows.map((r: any) => ({
            ...r,
            educationLevel: (r.educationLevel || "MI").toUpperCase(),
            isActive: Boolean(r.isActive),
            dateOfBirth: r.dateOfBirth ? new Date(r.dateOfBirth).toISOString() : null,
            createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
          }));
        }
      }
    } catch (error) {
      console.warn("[StudentRepository] DB query failed, using in-memory fallback:", error);
    }
    return schoolId
      ? inMemoryStudents.filter((s) => s.schoolId === schoolId)
      : [...inMemoryStudents];
  }

  async findMany(filter: StudentQueryFilter): Promise<PaginatedStudentResult> {
    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const all = await this.getAllRaw(filter.schoolId);
    const filtered = filterStudentsInMemory(all, filter);
    const total = filtered.length;
    const skip = (page - 1) * limit;
    const paginated = filtered.slice(skip, skip + limit);

    return {
      data: paginated,
      meta: calculatePaginationMeta(total, page, limit),
    };
  }

  async findById(id: string): Promise<Student | null> {
    try {
      const model = getStudentModel();
      if (model && typeof model.findUnique === "function") {
        const found = await model.findUnique({ where: { id } });
        if (found) return this.mapRow(found);
      }
    } catch {}
    return inMemoryStudents.find((s) => s.id === id) || null;
  }

  async findByNisn(nisn: string): Promise<Student | null> {
    try {
      const model = getStudentModel();
      if (model && typeof model.findUnique === "function") {
        const found = await model.findUnique({ where: { nisn } });
        if (found) return this.mapRow(found);
      }
    } catch {}
    return inMemoryStudents.find((s) => s.nisn === nisn) || null;
  }

  async create(data: CreateStudentInput): Promise<Student> {
    const id = `std-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();
    const newRecord: Student = {
      id,
      nisn: data.nisn.trim(),
      name: data.name.trim(),
      placeOfBirth: data.placeOfBirth?.trim() || null,
      dateOfBirth: data.dateOfBirth || null,
      gender: (data.gender as any) || null,
      classGroup: data.classGroup?.trim() || null,
      classGroupId: data.classGroupId || null,
      gradeLevel: data.gradeLevel || null,
      educationLevel: (data.educationLevel || "MI").toUpperCase(),
      schoolId: data.schoolId || null,
      schoolName: data.schoolName || null,
      username: data.username?.trim() || null,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const model = getStudentModel();
      if (model && typeof model.create === "function") {
        const dbData: any = {
          id: newRecord.id,
          nisn: newRecord.nisn,
          name: newRecord.name,
          educationLevel: newRecord.educationLevel,
          isActive: newRecord.isActive,
        };
        if (newRecord.dateOfBirth) dbData.dateOfBirth = new Date(newRecord.dateOfBirth);
        if (newRecord.schoolId) dbData.schoolId = newRecord.schoolId;
        if (newRecord.schoolName) dbData.schoolName = newRecord.schoolName;
        if (newRecord.classGroup) dbData.classGroup = newRecord.classGroup;

        const created = await model.create({ data: dbData });
        if (created) {
          const synced = this.mapRow(created);
          inMemoryStudents.unshift(synced);
          return synced;
        }
      }
    } catch (error) {
      console.warn("[StudentRepository] DB insert failed, using in-memory:", error);
    }

    inMemoryStudents.unshift(newRecord);
    return newRecord;
  }

  async update(id: string, data: UpdateStudentInput): Promise<Student> {
    const existing = await this.findById(id);
    if (!existing) throw new Error(`Siswa dengan ID ${id} tidak ditemukan`);

    const updatedRecord: Student = {
      ...existing,
      ...data,
      name: data.name?.trim() || existing.name,
      educationLevel: data.educationLevel ? data.educationLevel.toUpperCase() : existing.educationLevel,
      updatedAt: new Date().toISOString(),
    };

    try {
      const model = getStudentModel();
      if (model && typeof model.update === "function") {
        const dbData: any = { ...data };
        if (data.dateOfBirth) dbData.dateOfBirth = new Date(data.dateOfBirth);
        if (data.educationLevel) dbData.educationLevel = data.educationLevel.toUpperCase();
        const updated = await model.update({ where: { id }, data: dbData });
        if (updated) {
          const synced = this.mapRow(updated);
          const idx = inMemoryStudents.findIndex((s) => s.id === id);
          if (idx !== -1) inMemoryStudents[idx] = synced;
          return synced;
        }
      }
    } catch (error) {
      console.warn("[StudentRepository] DB update failed:", error);
    }

    const idx = inMemoryStudents.findIndex((s) => s.id === id);
    if (idx !== -1) inMemoryStudents[idx] = updatedRecord;
    else inMemoryStudents.unshift(updatedRecord);
    return updatedRecord;
  }

  async delete(id: string): Promise<boolean> {
    try {
      const model = getStudentModel();
      if (model && typeof model.delete === "function") {
        await model.delete({ where: { id } });
      }
    } catch (error) {
      console.warn(`[StudentRepository] DB delete failed for ${id}:`, error);
    }
    inMemoryStudents = inMemoryStudents.filter((s) => s.id !== id);
    return true;
  }

  async toggleStatus(id: string): Promise<Student> {
    const student = await this.findById(id);
    if (!student) throw new Error(`Siswa dengan ID ${id} tidak ditemukan`);
    return await this.update(id, { isActive: !student.isActive });
  }

  async bulkCreate(rows: CreateStudentInput[]): Promise<{ success: Student[]; failed: { row: CreateStudentInput; error: string }[] }> {
    const success: Student[] = [];
    const failed: { row: CreateStudentInput; error: string }[] = [];

    for (const row of rows) {
      try {
        // Check NISN uniqueness
        const existing = await this.findByNisn(row.nisn);
        if (existing) {
          failed.push({ row, error: `NISN ${row.nisn} sudah terdaftar di database` });
          continue;
        }
        const created = await this.create(row);
        success.push(created);
      } catch (err: any) {
        failed.push({ row, error: err?.message || "Gagal menyimpan data" });
      }
    }

    return { success, failed };
  }

  async getMetrics(schoolId?: string): Promise<StudentMetrics> {
    const all = await this.getAllRaw(schoolId);
    const totalStudents = all.length;
    const activeStudents = all.filter((s) => s.isActive).length;
    const inactiveStudents = totalStudents - activeStudents;
    const totalMI = all.filter((s) => s.educationLevel === "MI").length;
    const totalMTS = all.filter((s) => s.educationLevel === "MTS").length;
    const totalMA = all.filter((s) => s.educationLevel === "MA").length;

    const totalByClass: Record<string, number> = {};
    for (const s of all) {
      const cls = s.classGroup || "Tidak Berkelas";
      totalByClass[cls] = (totalByClass[cls] || 0) + 1;
    }

    return { totalStudents, activeStudents, inactiveStudents, totalMI, totalMTS, totalMA, totalByClass };
  }

  private mapRow(r: any): Student {
    return {
      id: r.id,
      nisn: r.nisn || "",
      name: r.name || "",
      placeOfBirth: r.placeOfBirth || null,
      dateOfBirth: r.dateOfBirth ? new Date(r.dateOfBirth).toISOString() : null,
      gender: r.gender || null,
      classGroup: r.classGroup || null,
      classGroupId: r.classGroupId || null,
      gradeLevel: r.gradeLevel || null,
      educationLevel: (r.educationLevel || "MI").toUpperCase(),
      schoolId: r.schoolId || null,
      schoolName: r.schoolName || null,
      username: r.username || null,
      isActive: Boolean(r.isActive),
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
    };
  }
}

export const studentRepository = new StudentRepository();
