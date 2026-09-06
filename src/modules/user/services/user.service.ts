import { userRepository } from "../repositories/user.repository";
import { StaffUser, CreateStaffUserInput, UpdateStaffUserInput, StaffUserFilter, StaffUserMetrics } from "../types";

export class UserService {
  async listUsers(filter: StaffUserFilter = {}): Promise<{ data: StaffUser[]; metrics: StaffUserMetrics }> {
    const data = await userRepository.findMany(filter);
    const metrics = await userRepository.getMetrics();
    return { data, metrics };
  }

  async getUserById(id: string): Promise<StaffUser | null> {
    return await userRepository.findById(id);
  }

  async createUser(input: CreateStaffUserInput): Promise<StaffUser> {
    if (!input.nip || !input.name) {
      throw new Error("NIP dan Nama Pengguna wajib diisi.");
    }
    return await userRepository.create(input);
  }

  async updateUser(id: string, input: UpdateStaffUserInput): Promise<StaffUser> {
    const existing = await userRepository.findById(id);
    if (!existing) {
      throw new Error("Pengguna tidak ditemukan.");
    }
    return await userRepository.update(id, input);
  }

  async deleteUser(id: string): Promise<boolean> {
    const existing = await userRepository.findById(id);
    if (!existing) {
      throw new Error("Pengguna tidak ditemukan.");
    }
    return await userRepository.delete(id);
  }
}

export const userService = new UserService();
