export type SubjectStatusFilter = "ALL" | "ACTIVE" | "INACTIVE";
export type EducationLevel = "SEMUA" | "MI" | "MTS" | "MA";

export interface Subject {
  id: string;
  code: string;
  name: string;
  educationLevel: EducationLevel;
  category: string;
  gradeLevel: string;
  passingGrade: number;
  description?: string | null;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  questionCount?: number;
}

export interface CreateSubjectInput {
  code: string;
  name: string;
  educationLevel?: EducationLevel;
  category?: string;
  gradeLevel?: string;
  passingGrade?: number;
  description?: string;
  isActive?: boolean;
}

export interface UpdateSubjectInput {
  code?: string;
  name?: string;
  educationLevel?: EducationLevel;
  category?: string;
  gradeLevel?: string;
  passingGrade?: number;
  description?: string;
  isActive?: boolean;
}

export interface SubjectQueryFilter {
  search?: string;
  educationLevel?: EducationLevel | "ALL";
  category?: string;
  gradeLevel?: string;
  status?: SubjectStatusFilter;
  page?: number;
  limit?: number;
  sortBy?: "code" | "name" | "category" | "gradeLevel" | "passingGrade" | "educationLevel" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedSubjectResult {
  data: Subject[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  metrics?: SubjectMetrics;
}

export interface SubjectMetrics {
  totalSubjects: number;
  activeSubjects: number;
  inactiveSubjects: number;
  averagePassingGrade: number;
  totalCategories: number;
  totalMI: number;
  totalMTS: number;
  totalMA: number;
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
