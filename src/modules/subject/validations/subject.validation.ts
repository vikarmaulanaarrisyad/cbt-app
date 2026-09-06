import {
  CreateSubjectInput,
  UpdateSubjectInput,
  SubjectQueryFilter,
  ValidationResult,
  ValidationError,
  SubjectStatusFilter,
} from "../types";

/**
 * Validates subject creation payload
 */
export function validateCreateSubject(
  input: Partial<CreateSubjectInput>
): ValidationResult<CreateSubjectInput> {
  const errors: ValidationError[] = [];

  // Code validation
  if (!input.code || typeof input.code !== "string" || !input.code.trim()) {
    errors.push({ field: "code", message: "Kode mata pelajaran wajib diisi" });
  } else if (input.code.trim().length < 2) {
    errors.push({ field: "code", message: "Kode mata pelajaran minimal 2 karakter" });
  } else if (input.code.trim().length > 20) {
    errors.push({ field: "code", message: "Kode mata pelajaran maksimal 20 karakter" });
  }

  // Name validation
  if (!input.name || typeof input.name !== "string" || !input.name.trim()) {
    errors.push({ field: "name", message: "Nama mata pelajaran wajib diisi" });
  } else if (input.name.trim().length < 2) {
    errors.push({ field: "name", message: "Nama mata pelajaran minimal 2 karakter" });
  }

  // Category validation (default to "Wajib Umum" if omitted)
  const category = input.category?.trim() || "Wajib Umum";

  // Education level validation (default to "SEMUA" if omitted)
  let educationLevel: any = "SEMUA";
  if (input.educationLevel) {
    const el = String(input.educationLevel).trim().toUpperCase();
    if (["SEMUA", "MI", "MTS", "MA"].includes(el)) {
      educationLevel = el;
    }
  }

  // Grade level validation (default to "Semua" if omitted)
  const gradeLevel = input.gradeLevel?.trim() || "Semua";

  // Passing grade (KKM) validation
  let passingGrade = 75.0;
  if (input.passingGrade !== undefined && input.passingGrade !== null) {
    const parsed = Number(input.passingGrade);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      errors.push({ field: "passingGrade", message: "Nilai KKM harus berada di antara 0 dan 100" });
    } else {
      passingGrade = parsed;
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      code: input.code!.trim().toUpperCase(),
      name: input.name!.trim(),
      educationLevel,
      category,
      gradeLevel,
      passingGrade,
      description: input.description?.trim() || "",
      isActive: input.isActive !== undefined ? Boolean(input.isActive) : true,
    },
  };
}

/**
 * Validates subject update payload
 */
export function validateUpdateSubject(
  input: Partial<UpdateSubjectInput>
): ValidationResult<UpdateSubjectInput> {
  const errors: ValidationError[] = [];
  const cleanData: UpdateSubjectInput = {};

  if (input.code !== undefined) {
    if (typeof input.code !== "string" || !input.code.trim()) {
      errors.push({ field: "code", message: "Kode mata pelajaran tidak boleh kosong" });
    } else if (input.code.trim().length < 2) {
      errors.push({ field: "code", message: "Kode mata pelajaran minimal 2 karakter" });
    } else {
      cleanData.code = input.code.trim().toUpperCase();
    }
  }

  if (input.name !== undefined) {
    if (typeof input.name !== "string" || !input.name.trim()) {
      errors.push({ field: "name", message: "Nama mata pelajaran tidak boleh kosong" });
    } else if (input.name.trim().length < 2) {
      errors.push({ field: "name", message: "Nama mata pelajaran minimal 2 karakter" });
    } else {
      cleanData.name = input.name.trim();
    }
  }

  if (input.educationLevel !== undefined) {
    const el = String(input.educationLevel).trim().toUpperCase();
    if (["SEMUA", "MI", "MTS", "MA"].includes(el)) {
      cleanData.educationLevel = el as any;
    }
  }

  if (input.category !== undefined) {
    cleanData.category = input.category.trim() || "Wajib Umum";
  }

  if (input.gradeLevel !== undefined) {
    cleanData.gradeLevel = input.gradeLevel.trim() || "Semua";
  }

  if (input.passingGrade !== undefined && input.passingGrade !== null) {
    const parsed = Number(input.passingGrade);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      errors.push({ field: "passingGrade", message: "Nilai KKM harus berada di antara 0 dan 100" });
    } else {
      cleanData.passingGrade = parsed;
    }
  }

  if (input.description !== undefined) {
    cleanData.description = input.description.trim();
  }

  if (input.isActive !== undefined) {
    cleanData.isActive = Boolean(input.isActive);
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: cleanData };
}

/**
 * Validates and normalizes subject query parameters
 */
export function validateSubjectQuery(
  query: Record<string, string | number | undefined>
): SubjectQueryFilter {
  const page = Math.max(1, parseInt(String(query.page || "1"), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || "10"), 10) || 10));

  let status: SubjectStatusFilter = "ALL";
  if (query.status === "ACTIVE" || query.status === "INACTIVE") {
    status = query.status;
  }

  let educationLevel: any = undefined;
  if (query.educationLevel && query.educationLevel !== "ALL") {
    const el = String(query.educationLevel).trim().toUpperCase();
    if (["SEMUA", "MI", "MTS", "MA"].includes(el)) {
      educationLevel = el;
    }
  }

  const allowedSortBy = ["code", "name", "category", "gradeLevel", "passingGrade", "createdAt"];
  const sortBy = allowedSortBy.includes(String(query.sortBy))
    ? (String(query.sortBy) as SubjectQueryFilter["sortBy"])
    : "name";

  const sortOrder = query.sortOrder === "desc" ? "desc" : "asc";

  return {
    search: typeof query.search === "string" ? query.search.trim() : undefined,
    educationLevel,
    category: typeof query.category === "string" && query.category !== "ALL" ? query.category.trim() : undefined,
    gradeLevel: typeof query.gradeLevel === "string" && query.gradeLevel !== "ALL" ? query.gradeLevel.trim() : undefined,
    status,
    page,
    limit,
    sortBy,
    sortOrder,
  };
}
