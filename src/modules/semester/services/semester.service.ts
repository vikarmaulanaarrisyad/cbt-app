import { semesterRepository, SemesterRepository } from "../repositories";
import { validateCreateSemester, validateUpdateSemester, validateSemesterQuery } from "../validations";
import {
  Semester,
  CreateSemesterInput,
  UpdateSemesterInput,
  SemesterQueryFilter,
  PaginatedSemesterResult,
  SemesterMetrics,
} from "../types";

export class SemesterService {
  constructor(private repository: SemesterRepository = semesterRepository) {}

  /**
   * Business Logic: Get paginated semesters list with metrics and active academic years list
   */
  async getSemesters(rawQuery: Record<string, string | number | undefined>): Promise<{
    result: PaginatedSemesterResult;
    academicYears: string[];
  }> {
    const validatedFilter = validateSemesterQuery(rawQuery);
    const result = await this.repository.findMany(validatedFilter);
    const metrics = await this.repository.getMetrics();
    const academicYears = await this.repository.getAcademicYears();

    result.metrics = metrics;
    return { result, academicYears };
  }

  /**
   * Business Logic: Get a single semester by ID
   */
  async getSemesterById(id: string): Promise<Semester> {
    if (!id || typeof id !== "string") {
      throw new Error("ID Semester tidak valid");
    }

    const semester = await this.repository.findById(id);
    if (!semester) {
      throw new Error("Semester tidak ditemukan");
    }

    return semester;
  }

  /**
   * Business Logic: Create new semester with code uniqueness & validation
   */
  async createSemester(input: Partial<CreateSemesterInput>): Promise<Semester> {
    const validation = validateCreateSemester(input);
    if (!validation.success || !validation.data) {
      const errorMessage = validation.errors?.map((e) => e.message).join(", ") || "Data tidak valid";
      throw new Error(errorMessage);
    }

    const data = validation.data;

    // Check code uniqueness
    const existingCode = await this.repository.findByCode(data.code);
    if (existingCode) {
      throw new Error(`Kode semester "${data.code}" sudah digunakan oleh semester lain`);
    }

    return await this.repository.create(data);
  }

  /**
   * Business Logic: Update existing semester
   */
  async updateSemester(id: string, input: Partial<UpdateSemesterInput>): Promise<Semester> {
    if (!id || typeof id !== "string") {
      throw new Error("ID Semester tidak valid");
    }

    const existingSemester = await this.repository.findById(id);
    if (!existingSemester) {
      throw new Error("Semester tidak ditemukan");
    }

    const validation = validateUpdateSemester(input);
    if (!validation.success || !validation.data) {
      const errorMessage = validation.errors?.map((e) => e.message).join(", ") || "Data tidak valid";
      throw new Error(errorMessage);
    }

    const data = validation.data;

    // If code is being changed, verify uniqueness
    if (data.code && data.code.toLowerCase() !== existingSemester.code.toLowerCase()) {
      const duplicateCode = await this.repository.findByCode(data.code);
      if (duplicateCode && duplicateCode.id !== id) {
        throw new Error(`Kode semester "${data.code}" sudah digunakan oleh semester lain`);
      }
    }

    return await this.repository.update(id, data);
  }

  /**
   * Business Logic: Toggle or activate a specific semester
   */
  async activateSemester(id: string): Promise<Semester> {
    if (!id) throw new Error("ID Semester tidak valid");

    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Semester tidak ditemukan");
    }

    return await this.repository.setActive(id);
  }

  /**
   * Business Logic: Delete semester
   */
  async deleteSemester(id: string): Promise<boolean> {
    if (!id) throw new Error("ID Semester tidak valid");

    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Semester tidak ditemukan");
    }

    if (existing.isActive) {
      throw new Error("Semester sedang aktif. Harap aktifkan semester lain terlebih dahulu sebelum menghapus semester ini.");
    }

    return await this.repository.delete(id);
  }

  /**
   * Business Logic: Retrieve summary metrics
   */
  async getMetrics(): Promise<SemesterMetrics> {
    return await this.repository.getMetrics();
  }
}

export const semesterService = new SemesterService();
