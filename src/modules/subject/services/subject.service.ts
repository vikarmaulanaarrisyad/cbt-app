import { subjectRepository, SubjectRepository } from "../repositories";
import { validateCreateSubject, validateUpdateSubject, validateSubjectQuery } from "../validations";
import {
  Subject,
  CreateSubjectInput,
  UpdateSubjectInput,
  PaginatedSubjectResult,
  SubjectMetrics,
} from "../types";

export class SubjectService {
  constructor(private repository: SubjectRepository = subjectRepository) {}

  /**
   * Retrieves paginated subjects list with metrics and categories
   */
  async getSubjects(rawQuery: Record<string, string | number | undefined>): Promise<{
    result: PaginatedSubjectResult;
    categories: string[];
    gradeLevels: string[];
  }> {
    const validatedFilter = validateSubjectQuery(rawQuery);
    const result = await this.repository.findMany(validatedFilter);
    const metrics = await this.repository.getMetrics();
    const categories = await this.repository.getCategories();
    const gradeLevels = await this.repository.getGradeLevels();

    result.metrics = metrics;
    return { result, categories, gradeLevels };
  }

  /**
   * Retrieves a single subject by ID
   */
  async getSubjectById(id: string): Promise<Subject> {
    if (!id || typeof id !== "string") {
      throw new Error("ID Mata Pelajaran tidak valid");
    }

    const subject = await this.repository.findById(id);
    if (!subject) {
      throw new Error("Mata pelajaran tidak ditemukan");
    }

    return subject;
  }

  /**
   * Creates a new subject with code uniqueness validation
   */
  async createSubject(input: Partial<CreateSubjectInput>): Promise<Subject> {
    const validation = validateCreateSubject(input);
    if (!validation.success || !validation.data) {
      const errorMessage =
        validation.errors?.map((e) => e.message).join(", ") || "Data input mata pelajaran tidak valid";
      throw new Error(errorMessage);
    }

    const data = validation.data;

    // Check code uniqueness
    const existing = await this.repository.findByCode(data.code);
    if (existing) {
      throw new Error(`Kode mata pelajaran "${data.code}" sudah digunakan oleh mata pelajaran "${existing.name}"`);
    }

    return await this.repository.create(data);
  }

  /**
   * Updates an existing subject
   */
  async updateSubject(id: string, input: Partial<UpdateSubjectInput>): Promise<Subject> {
    if (!id || typeof id !== "string") {
      throw new Error("ID Mata Pelajaran tidak valid");
    }

    const current = await this.repository.findById(id);
    if (!current) {
      throw new Error("Mata pelajaran tidak ditemukan");
    }

    const validation = validateUpdateSubject(input);
    if (!validation.success || !validation.data) {
      const errorMessage =
        validation.errors?.map((e) => e.message).join(", ") || "Data pembaruan tidak valid";
      throw new Error(errorMessage);
    }

    const data = validation.data;

    // If code is modified, check uniqueness against others
    if (data.code && data.code.toUpperCase() !== current.code.toUpperCase()) {
      const existing = await this.repository.findByCode(data.code);
      if (existing && existing.id !== id) {
        throw new Error(`Kode mata pelajaran "${data.code}" sudah digunakan oleh mata pelajaran lain`);
      }
    }

    return await this.repository.update(id, data);
  }

  /**
   * Deletes a subject by ID
   */
  async deleteSubject(id: string): Promise<boolean> {
    if (!id || typeof id !== "string") {
      throw new Error("ID Mata Pelajaran tidak valid");
    }

    const current = await this.repository.findById(id);
    if (!current) {
      throw new Error("Mata pelajaran tidak ditemukan");
    }

    return await this.repository.delete(id);
  }

  /**
   * Toggles active status of a subject
   */
  async toggleStatus(id: string): Promise<Subject> {
    if (!id || typeof id !== "string") {
      throw new Error("ID Mata Pelajaran tidak valid");
    }

    return await this.repository.toggleStatus(id);
  }

  /**
   * Retrieves summary metrics
   */
  async getMetrics(): Promise<SubjectMetrics> {
    return await this.repository.getMetrics();
  }
}

export const subjectService = new SubjectService();
