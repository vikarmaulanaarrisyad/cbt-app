export type UserRole = "STUDENT" | "PROCTOR" | "TEACHER" | "ADMIN";

export interface StudentAuthUser {
  id: string;
  nisn: string;
  name: string;
  dateOfBirth: string;
  classGroup?: string;
  educationLevel?: string; // "MI", "MTS", "MA"
  schoolId?: string;
  schoolName?: string;
  role: "STUDENT";
  tokenUsed: string;
}

export interface ProctorAuthUser {
  id: string;
  nip: string;
  name: string;
  email?: string;
  role: "PROCTOR" | "TEACHER" | "ADMIN";
  labAllocation?: string;
  educationLevel?: string; // "SEMUA", "MI", "MTS", "MA"
  schoolId?: string;
  schoolName?: string;
  npsn?: string;
  customPermissions?: string;
}

export type AuthUser = StudentAuthUser | ProctorAuthUser;

export interface StudentLoginInput {
  nisn: string;
  dob: string;
  token: string;
  educationLevel?: string;
  schoolId?: string;
}

export interface ProctorLoginInput {
  nip: string;
  password: string;
  labAllocation?: string;
  educationLevel?: string;
  schoolId?: string;
  schoolName?: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: string;
}
