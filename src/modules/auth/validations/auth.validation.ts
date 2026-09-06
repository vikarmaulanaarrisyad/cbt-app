import { StudentLoginInput, ProctorLoginInput } from "../types";
import { ValidationResult, ValidationError } from "@/modules/semester/types";

/**
 * Validates Student login payload (NISN, DOB, Session Token)
 */
export function validateStudentLogin(input: Partial<StudentLoginInput>): ValidationResult<StudentLoginInput> {
  const errors: ValidationError[] = [];

  if (!input.nisn || typeof input.nisn !== "string" || !input.nisn.trim()) {
    errors.push({ field: "nisn", message: "Nomor Peserta Ujian / NISN wajib diisi" });
  } else {
    const cleanNisn = input.nisn.replace(/[^0-9]/g, "");
    if (cleanNisn.length < 10) {
      errors.push({ field: "nisn", message: "Nomor Peserta minimal 10 digit angka" });
    }
  }

  if (!input.dob || typeof input.dob !== "string" || !input.dob.trim()) {
    errors.push({ field: "dob", message: "Tanggal Lahir wajib diisi" });
  } else {
    const dobDate = new Date(input.dob);
    if (isNaN(dobDate.getTime())) {
      errors.push({ field: "dob", message: "Format Tanggal Lahir tidak valid" });
    }
  }

  if (!input.token || typeof input.token !== "string" || !input.token.trim()) {
    errors.push({ field: "token", message: "Token Sesi Ujian wajib diisi" });
  } else if (input.token.trim().length !== 6) {
    errors.push({ field: "token", message: "Token Sesi Ujian harus 6 karakter" });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      nisn: input.nisn!.trim(),
      dob: input.dob!.trim(),
      token: input.token!.trim().toUpperCase(),
      educationLevel: input.educationLevel?.trim(),
    },
  };
}

/**
 * Validates Proctor login payload (NIP/Email/Username, Password)
 */
export function validateProctorLogin(input: Partial<ProctorLoginInput>): ValidationResult<ProctorLoginInput> {
  const errors: ValidationError[] = [];

  if (!input.nip || typeof input.nip !== "string" || !input.nip.trim()) {
    errors.push({ field: "nip", message: "Username, Email, atau NIP Staf wajib diisi" });
  }

  if (!input.password || typeof input.password !== "string" || !input.password.trim()) {
    errors.push({ field: "password", message: "Kata sandi wajib diisi" });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      nip: input.nip!.trim(),
      password: input.password!.trim(),
      labAllocation: input.labAllocation?.trim() || "lab-08",
      educationLevel: input.educationLevel?.trim() || "SEMUA",
    },
  };
}

