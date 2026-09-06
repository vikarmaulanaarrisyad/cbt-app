import {
  CreateStudentInput,
  ImportStudentRow,
  ImportStudentResult,
  ImportValidationError,
  StudentQueryFilter,
  StudentMetrics,
  PaginatedStudentResult,
  UpdateStudentInput,
  Student,
} from "../types";
import { studentRepository } from "../repositories";

const VALID_JENJANG = ["MI", "MTS", "MA"];
const VALID_GENDER = ["L", "P"];

export class StudentService {
  // ─── Query ───────────────────────────────────────────────────────────────

  async listStudents(filter: StudentQueryFilter): Promise<PaginatedStudentResult & { metrics: StudentMetrics }> {
    const result = await studentRepository.findMany(filter);
    const metrics = await studentRepository.getMetrics(filter.schoolId);
    return { ...result, metrics };
  }

  async getStudentById(id: string): Promise<Student | null> {
    return studentRepository.findById(id);
  }

  // ─── Mutation ─────────────────────────────────────────────────────────────

  async createStudent(data: CreateStudentInput): Promise<Student> {
    this.validateNisn(data.nisn);
    const existing = await studentRepository.findByNisn(data.nisn.trim());
    if (existing) throw new Error(`NISN ${data.nisn} sudah terdaftar. Gunakan NISN yang berbeda.`);
    return studentRepository.create(data);
  }

  async updateStudent(id: string, data: UpdateStudentInput): Promise<Student> {
    return studentRepository.update(id, data);
  }

  async deleteStudent(id: string): Promise<boolean> {
    return studentRepository.delete(id);
  }

  async toggleStudentStatus(id: string): Promise<Student> {
    return studentRepository.toggleStatus(id);
  }

  // ─── Import ──────────────────────────────────────────────────────────────

  /**
   * Validates a single import row and returns an array of errors (empty = valid).
   */
  validateImportRow(row: ImportStudentRow, allRows: ImportStudentRow[]): ImportValidationError[] {
    const errors: ImportValidationError[] = [];
    const { rowNumber } = row;

    // NISN
    if (!row.nisn) {
      errors.push({ rowNumber, field: "NISN", message: "NISN tidak boleh kosong" });
    } else if (!/^\d{10}$/.test(row.nisn.replace(/\s/g, ""))) {
      errors.push({ rowNumber, field: "NISN", message: "NISN harus 10 digit angka" });
    } else {
      // Check duplicate within file
      const dupeInFile = allRows.filter((r) => r.nisn === row.nisn && r.rowNumber !== rowNumber);
      if (dupeInFile.length > 0) {
        errors.push({ rowNumber, field: "NISN", message: `NISN ${row.nisn} duplikat di baris ${dupeInFile.map(d => d.rowNumber).join(", ")}` });
      }
    }

    // Name
    if (!row.name || row.name.trim().length < 3) {
      errors.push({ rowNumber, field: "Nama Lengkap", message: "Nama harus minimal 3 karakter" });
    } else if (row.name.trim().length > 100) {
      errors.push({ rowNumber, field: "Nama Lengkap", message: "Nama maksimal 100 karakter" });
    }

    // Place of birth
    if (!row.placeOfBirth || row.placeOfBirth.trim().length < 2) {
      errors.push({ rowNumber, field: "Tempat Lahir", message: "Tempat lahir tidak boleh kosong" });
    }

    // Date of birth
    if (!row.dateOfBirth) {
      errors.push({ rowNumber, field: "Tanggal Lahir", message: "Tanggal lahir tidak boleh kosong" });
    } else {
      const parsed = this.parseDate(row.dateOfBirth);
      if (!parsed) {
        errors.push({ rowNumber, field: "Tanggal Lahir", message: "Format tanggal tidak valid. Gunakan DD/MM/YYYY" });
      } else if (parsed > new Date()) {
        errors.push({ rowNumber, field: "Tanggal Lahir", message: "Tanggal lahir tidak boleh di masa depan" });
      }
    }

    // Gender
    if (!row.gender || !VALID_GENDER.includes(row.gender.trim().toUpperCase())) {
      errors.push({ rowNumber, field: "Jenis Kelamin", message: "Jenis kelamin harus L (Laki-laki) atau P (Perempuan)" });
    }

    // Education Level
    if (!row.educationLevel || !VALID_JENJANG.includes(row.educationLevel.trim().toUpperCase())) {
      errors.push({ rowNumber, field: "Jenjang", message: "Jenjang harus MI, MTS, atau MA" });
    }

    // Username
    if (!row.username || row.username.trim().length < 4) {
      errors.push({ rowNumber, field: "Username", message: "Username minimal 4 karakter" });
    } else if (/\s/.test(row.username)) {
      errors.push({ rowNumber, field: "Username", message: "Username tidak boleh mengandung spasi" });
    } else {
      // Check duplicate username within file
      const dupeUsername = allRows.filter((r) => r.username === row.username && r.rowNumber !== rowNumber);
      if (dupeUsername.length > 0) {
        errors.push({ rowNumber, field: "Username", message: `Username "${row.username}" duplikat di baris ${dupeUsername.map(d => d.rowNumber).join(", ")}` });
      }
    }

    return errors;
  }

  /**
   * Validates all rows and runs bulk import. Returns detailed results.
   */
  async importFromExcel(rows: ImportStudentRow[], defaultSchoolId?: string, defaultSchoolName?: string): Promise<ImportStudentResult> {
    const allErrors: ImportValidationError[] = [];
    const validInputs: CreateStudentInput[] = [];

    for (const row of rows) {
      const errs = this.validateImportRow(row, rows);
      if (errs.length > 0) {
        allErrors.push(...errs);
      } else {
        const parsedDob = this.parseDate(row.dateOfBirth);
        validInputs.push({
          nisn: row.nisn.trim(),
          name: row.name.trim(),
          placeOfBirth: row.placeOfBirth.trim(),
          dateOfBirth: parsedDob?.toISOString(),
          gender: row.gender.toUpperCase() as any,
          classGroup: row.classGroup?.trim() || undefined,
          educationLevel: row.educationLevel.toUpperCase(),
          username: row.username.trim(),
          password: row.password?.trim() || "password123",
          schoolId: defaultSchoolId,
          schoolName: defaultSchoolName,
          isActive: true,
        });
      }
    }

    const errorCount = new Set(allErrors.map((e) => e.rowNumber)).size;
    const { success, failed } = await studentRepository.bulkCreate(validInputs);

    return {
      successCount: success.length,
      errorCount: errorCount + failed.length,
      skippedCount: failed.length,
      errors: [
        ...allErrors,
        ...failed.map((f) => ({
          rowNumber: rows.find((r) => r.nisn === f.row.nisn)?.rowNumber || 0,
          nisn: f.row.nisn,
          name: f.row.name,
          field: "Database",
          message: f.error,
        })),
      ],
      imported: success.map((s) => ({ nisn: s.nisn, name: s.name })),
    };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private validateNisn(nisn: string) {
    if (!nisn) throw new Error("NISN tidak boleh kosong");
    if (!/^\d{10}$/.test(nisn.replace(/\s/g, ""))) throw new Error("NISN harus berupa 10 digit angka");
  }

  parseDate(val: string): Date | null {
    if (!val) return null;
    val = val.trim();

    // DD/MM/YYYY
    const ddmmyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const m1 = val.match(ddmmyyyy);
    if (m1) {
      const d = new Date(parseInt(m1[3]), parseInt(m1[2]) - 1, parseInt(m1[1]));
      if (!isNaN(d.getTime())) return d;
    }

    // YYYY-MM-DD
    const iso = /^\d{4}-\d{2}-\d{2}/;
    if (iso.test(val)) {
      const d = new Date(val);
      if (!isNaN(d.getTime())) return d;
    }

    // Excel serial date number
    const serial = parseInt(val);
    if (!isNaN(serial) && serial > 1000 && serial < 100000) {
      const d = new Date(Math.round((serial - 25569) * 86400 * 1000));
      if (!isNaN(d.getTime())) return d;
    }

    return null;
  }
}

export const studentService = new StudentService();
