// Student module type definitions

export type EducationLevel = "MI" | "MTS" | "MA";
export type GenderType = "L" | "P";

export interface Student {
  id: string;
  nisn: string;
  name: string;
  placeOfBirth?: string | null;
  dateOfBirth?: string | null; // ISO string
  gender?: GenderType | null;
  classGroup?: string | null; // e.g. "Kelas 6-A"
  classGroupId?: string | null;
  gradeLevel?: string | null;
  educationLevel?: string; // "MI", "MTS", "MA"
  schoolId?: string | null;
  schoolName?: string | null;
  username?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentInput {
  nisn: string;
  name: string;
  placeOfBirth?: string;
  dateOfBirth?: string;
  gender?: GenderType;
  classGroup?: string;
  classGroupId?: string;
  gradeLevel?: string;
  educationLevel?: string;
  schoolId?: string;
  schoolName?: string;
  username?: string;
  password?: string;
  isActive?: boolean;
}

export interface UpdateStudentInput {
  name?: string;
  placeOfBirth?: string;
  dateOfBirth?: string;
  gender?: GenderType;
  classGroup?: string;
  classGroupId?: string;
  gradeLevel?: string;
  educationLevel?: string;
  username?: string;
  password?: string;
  isActive?: boolean;
}

export interface StudentQueryFilter {
  search?: string;
  educationLevel?: string;
  classGroup?: string;
  gradeLevel?: string;
  gender?: string;
  isActive?: boolean;
  schoolId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedStudentResult {
  data: Student[];
  meta: PaginationMeta;
}

export interface StudentMetrics {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  totalMI: number;
  totalMTS: number;
  totalMA: number;
  totalByClass: Record<string, number>;
}

// --- Import/Export Types ---

export interface ImportStudentRow {
  rowNumber: number;
  nisn: string;
  name: string;
  placeOfBirth: string;
  dateOfBirth: string;
  gender: string;
  classGroup: string;
  educationLevel: string;
  username: string;
  password?: string;
  // raw parsed values
  _raw?: Record<string, any>;
}

export interface ImportValidationError {
  rowNumber: number;
  nisn?: string;
  name?: string;
  field: string;
  message: string;
}

export interface ImportStudentResult {
  successCount: number;
  errorCount: number;
  skippedCount: number;
  errors: ImportValidationError[];
  imported: { nisn: string; name: string }[];
}
