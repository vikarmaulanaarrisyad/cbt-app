import { authRepository, AuthRepository } from "../repositories";
import { validateStudentLogin, validateProctorLogin } from "../validations";
import { StudentLoginInput, ProctorLoginInput, AuthSession, AuthUser } from "../types";

export class AuthService {
  constructor(private repository: AuthRepository = authRepository) {}

  /**
   * Authenticates student with NISN, DOB, and Exam Token
   */
  async authenticateStudent(input: Partial<StudentLoginInput>): Promise<AuthSession> {
    const validation = validateStudentLogin(input);
    if (!validation.success || !validation.data) {
      const errorMessage = validation.errors?.map((e) => e.message).join(", ") || "Data login tidak valid";
      throw new Error(errorMessage);
    }

    const { nisn, dob, token } = validation.data;

    // Verify token validity
    const isTokenValid = await this.repository.verifyExamToken(token);
    if (!isTokenValid) {
      throw new Error(`Token Sesi Ujian "${token}" tidak terdaftar atau sudah kadaluarsa. Harap minta token terbaru dari Pengawas.`);
    }

    // Find student record
    const student = await this.repository.findStudentByNisn(validation.data);
    if (!student) {
      throw new Error("Data Peserta Ujian tidak ditemukan pada database.");
    }

    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(); // 4 hours session
    const sessionToken = `cbt-student-sess-${student.id}-${Date.now()}`;

    return {
      user: student,
      token: sessionToken,
      expiresAt,
    };
  }

  /**
   * Authenticates proctor with NIP and Password
   */
  async authenticateProctor(input: Partial<ProctorLoginInput>): Promise<AuthSession> {
    const validation = validateProctorLogin(input);
    if (!validation.success || !validation.data) {
      const errorMessage = validation.errors?.map((e) => e.message).join(", ") || "Kredensial proktor tidak valid";
      throw new Error(errorMessage);
    }

    const proctor = await this.repository.findProctorByCredentials(validation.data);
    if (!proctor) {
      throw new Error("Username, Email, NIP, atau Kata Sandi salah. Silakan periksa kembali.");
    }

    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(); // 12 hours session
    const sessionToken = `cbt-proctor-sess-${proctor.id}-${Date.now()}`;

    return {
      user: proctor,
      token: sessionToken,
      expiresAt,
    };
  }
}

export const authService = new AuthService();
