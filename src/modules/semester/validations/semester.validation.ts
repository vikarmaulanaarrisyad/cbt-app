import { CreateSemesterInput, UpdateSemesterInput, SemesterQueryFilter, ValidationResult, ValidationError } from "../types";

/**
 * Validates semester creation data payload
 */
export function validateCreateSemester(input: Partial<CreateSemesterInput>): ValidationResult<CreateSemesterInput> {
  const errors: ValidationError[] = [];

  if (!input.code || typeof input.code !== "string" || !input.code.trim()) {
    errors.push({ field: "code", message: "Kode semester wajib diisi" });
  } else if (input.code.trim().length < 3) {
    errors.push({ field: "code", message: "Kode semester minimal 3 karakter" });
  }

  if (!input.name || typeof input.name !== "string" || !input.name.trim()) {
    errors.push({ field: "name", message: "Nama semester wajib diisi" });
  }

  if (!input.academicYear || typeof input.academicYear !== "string" || !input.academicYear.trim()) {
    errors.push({ field: "academicYear", message: "Tahun ajaran wajib diisi (contoh: 2024/2025)" });
  } else {
    const yearRegex = /^\d{4}\/\d{4}$/;
    if (!yearRegex.test(input.academicYear.trim())) {
      errors.push({ field: "academicYear", message: "Format tahun ajaran harus YYYY/YYYY (contoh: 2024/2025)" });
    }
  }

  if (!input.type || !["GANJIL", "GENAP", "ANTARA"].includes(input.type)) {
    errors.push({ field: "type", message: "Tipe semester harus GANJIL, GENAP, atau ANTARA" });
  }

  if (!input.startDate || typeof input.startDate !== "string" || !input.startDate.trim()) {
    errors.push({ field: "startDate", message: "Tanggal mulai semester wajib diisi" });
  }

  if (!input.endDate || typeof input.endDate !== "string" || !input.endDate.trim()) {
    errors.push({ field: "endDate", message: "Tanggal selesai semester wajib diisi" });
  }

  if (input.startDate && input.endDate) {
    const start = new Date(input.startDate);
    const end = new Date(input.endDate);
    if (isNaN(start.getTime())) {
      errors.push({ field: "startDate", message: "Format tanggal mulai tidak valid" });
    }
    if (isNaN(end.getTime())) {
      errors.push({ field: "endDate", message: "Format tanggal selesai tidak valid" });
    }
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start >= end) {
      errors.push({ field: "endDate", message: "Tanggal selesai harus setelah tanggal mulai" });
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      code: input.code!.trim(),
      name: input.name!.trim(),
      academicYear: input.academicYear!.trim(),
      type: input.type!,
      startDate: input.startDate!.trim(),
      endDate: input.endDate!.trim(),
      isActive: Boolean(input.isActive),
      description: input.description?.trim() || "",
    },
  };
}

/**
 * Validates semester update data payload
 */
export function validateUpdateSemester(input: Partial<UpdateSemesterInput>): ValidationResult<UpdateSemesterInput> {
  const errors: ValidationError[] = [];

  if (input.code !== undefined) {
    if (typeof input.code !== "string" || !input.code.trim()) {
      errors.push({ field: "code", message: "Kode semester tidak boleh kosong" });
    } else if (input.code.trim().length < 3) {
      errors.push({ field: "code", message: "Kode semester minimal 3 karakter" });
    }
  }

  if (input.name !== undefined) {
    if (typeof input.name !== "string" || !input.name.trim()) {
      errors.push({ field: "name", message: "Nama semester tidak boleh kosong" });
    }
  }

  if (input.academicYear !== undefined) {
    const yearRegex = /^\d{4}\/\d{4}$/;
    if (typeof input.academicYear !== "string" || !yearRegex.test(input.academicYear.trim())) {
      errors.push({ field: "academicYear", message: "Format tahun ajaran harus YYYY/YYYY (contoh: 2024/2025)" });
    }
  }

  if (input.type !== undefined) {
    if (!["GANJIL", "GENAP", "ANTARA"].includes(input.type)) {
      errors.push({ field: "type", message: "Tipe semester harus GANJIL, GENAP, atau ANTARA" });
    }
  }

  if (input.startDate && input.endDate) {
    const start = new Date(input.startDate);
    const end = new Date(input.endDate);
    if (isNaN(start.getTime())) {
      errors.push({ field: "startDate", message: "Format tanggal mulai tidak valid" });
    }
    if (isNaN(end.getTime())) {
      errors.push({ field: "endDate", message: "Format tanggal selesai tidak valid" });
    }
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start >= end) {
      errors.push({ field: "endDate", message: "Tanggal selesai harus setelah tanggal mulai" });
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const cleanedData: UpdateSemesterInput = {};
  if (input.code !== undefined) cleanedData.code = input.code.trim();
  if (input.name !== undefined) cleanedData.name = input.name.trim();
  if (input.academicYear !== undefined) cleanedData.academicYear = input.academicYear.trim();
  if (input.type !== undefined) cleanedData.type = input.type;
  if (input.startDate !== undefined) cleanedData.startDate = input.startDate;
  if (input.endDate !== undefined) cleanedData.endDate = input.endDate;
  if (input.isActive !== undefined) cleanedData.isActive = Boolean(input.isActive);
  if (input.description !== undefined) cleanedData.description = input.description.trim();

  return { success: true, data: cleanedData };
}

/**
 * Sanitizes and validates query parameters for pagination & filtering
 */
export function validateSemesterQuery(query: Record<string, string | number | undefined>): SemesterQueryFilter {
  const page = Math.max(1, parseInt(String(query.page || 1), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || 10), 10) || 10));
  
  const search = typeof query.search === "string" ? query.search.trim() : undefined;
  const academicYear = typeof query.academicYear === "string" && query.academicYear !== "ALL" ? query.academicYear.trim() : undefined;
  
  let type: SemesterQueryFilter["type"] = "ALL";
  if (query.type && ["GANJIL", "GENAP", "ANTARA"].includes(String(query.type))) {
    type = String(query.type) as SemesterQueryFilter["type"];
  }

  let status: SemesterQueryFilter["status"] = "ALL";
  if (query.status && ["ACTIVE", "INACTIVE"].includes(String(query.status).toUpperCase())) {
    status = String(query.status).toUpperCase() as SemesterQueryFilter["status"];
  }

  const validSortFields = ["name", "code", "academicYear", "startDate", "createdAt"];
  const sortBy = validSortFields.includes(String(query.sortBy))
    ? (String(query.sortBy) as SemesterQueryFilter["sortBy"])
    : "startDate";

  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  return { page, limit, search, academicYear, type, status, sortBy, sortOrder };
}
