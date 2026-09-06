export type UserRole = "ADMIN" | "PROCTOR" | "TEACHER";

export interface StaffUser {
  id: string;
  nip: string;
  name: string;
  email?: string | null;
  password?: string;
  role: UserRole;
  labAllocation?: string | null;
  customPermissions?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffUserInput {
  nip: string;
  name: string;
  email?: string;
  password?: string;
  role?: UserRole;
  labAllocation?: string;
  customPermissions?: string[];
  isActive?: boolean;
}

export interface UpdateStaffUserInput {
  nip?: string;
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  labAllocation?: string;
  customPermissions?: string[];
  isActive?: boolean;
}

export interface StaffUserFilter {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface StaffUserMetrics {
  totalStaff: number;
  adminCount: number;
  proctorCount: number;
  teacherCount: number;
  activeCount: number;
}
