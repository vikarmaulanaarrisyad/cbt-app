export type SemesterType = "GANJIL" | "GENAP" | "ANTARA";

export type SemesterStatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

export interface Semester {
  id: string;
  code: string;
  name: string;
  academicYear: string;
  type: SemesterType;
  startDate: string | Date;
  endDate: string | Date;
  isActive: boolean;
  description?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  sessionCount?: number;
}

export interface CreateSemesterInput {
  code: string;
  name: string;
  academicYear: string;
  type: SemesterType;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  description?: string;
}

export interface UpdateSemesterInput {
  code?: string;
  name?: string;
  academicYear?: string;
  type?: SemesterType;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  description?: string;
}

export interface SemesterQueryFilter {
  search?: string;
  academicYear?: string;
  type?: SemesterType | "ALL";
  status?: SemesterStatusFilter;
  page?: number;
  limit?: number;
  sortBy?: "name" | "code" | "academicYear" | "startDate" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedSemesterResult {
  data: Semester[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  metrics?: SemesterMetrics;
}

export interface SemesterMetrics {
  totalSemesters: number;
  activeSemesters: number;
  totalAcademicYears: number;
  totalSessions: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}
