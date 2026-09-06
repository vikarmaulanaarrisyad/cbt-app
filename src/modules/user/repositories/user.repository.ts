import { db } from "@/prisma/db";
import { StaffUser, CreateStaffUserInput, UpdateStaffUserInput, StaffUserFilter, StaffUserMetrics } from "../types";

export class UserRepository {
  async findMany(filter: StaffUserFilter = {}): Promise<StaffUser[]> {
    try {
      const allUsers = (await (db as any).user.findMany()) || [];

      let filtered = allUsers.map((u: any) => ({
        id: u.id,
        nip: u.nip,
        name: u.name,
        email: u.email || null,
        role: u.role || "PROCTOR",
        labAllocation: u.labAllocation || null,
        customPermissions: u.customPermissions || null,
        isActive: u.isActive ?? true,
        createdAt: u.createdAt || new Date().toISOString(),
        updatedAt: u.updatedAt || new Date().toISOString(),
      }));

      if (filter.role) {
        filtered = filtered.filter((u: StaffUser) => u.role === filter.role);
      }

      if (filter.search) {
        const query = filter.search.toLowerCase();
        filtered = filtered.filter(
          (u: StaffUser) =>
            u.name.toLowerCase().includes(query) ||
            u.nip.toLowerCase().includes(query) ||
            (u.email && u.email.toLowerCase().includes(query)) ||
            (u.labAllocation && u.labAllocation.toLowerCase().includes(query))
        );
      }

      return filtered;
    } catch (error) {
      console.error("[UserRepository] Error fetching users:", error);
      return [];
    }
  }

  async findById(id: string): Promise<StaffUser | null> {
    try {
      const u = await (db as any).user.findUnique({ where: { id } });
      if (!u) return null;

      return {
        id: u.id,
        nip: u.nip,
        name: u.name,
        email: u.email || null,
        password: u.password,
        role: u.role || "PROCTOR",
        labAllocation: u.labAllocation || null,
        customPermissions: u.customPermissions || null,
        isActive: u.isActive ?? true,
        createdAt: u.createdAt || new Date().toISOString(),
        updatedAt: u.updatedAt || new Date().toISOString(),
      };
    } catch (error) {
      console.error("[UserRepository] Error finding user by id:", error);
      return null;
    }
  }

  async create(input: CreateStaffUserInput): Promise<StaffUser> {
    const id = `usr-${Date.now()}`;
    const customPermsStr = input.customPermissions
      ? JSON.stringify(input.customPermissions)
      : null;

    const created = await (db as any).user.create({
      data: {
        id,
        nip: input.nip,
        name: input.name,
        email: input.email || null,
        password: input.password || "password123",
        role: input.role || "PROCTOR",
        labAllocation: input.labAllocation || "Lab CBT-08",
        customPermissions: customPermsStr,
        isActive: input.isActive ?? true,
      },
    });

    return {
      id: created.id,
      nip: created.nip,
      name: created.name,
      email: created.email || null,
      role: created.role || "PROCTOR",
      labAllocation: created.labAllocation || null,
      customPermissions: created.customPermissions || null,
      isActive: created.isActive ?? true,
      createdAt: created.createdAt || new Date().toISOString(),
      updatedAt: created.updatedAt || new Date().toISOString(),
    };
  }

  async update(id: string, input: UpdateStaffUserInput): Promise<StaffUser> {
    const updateData: any = {};
    if (input.nip !== undefined) updateData.nip = input.nip;
    if (input.name !== undefined) updateData.name = input.name;
    if (input.email !== undefined) updateData.email = input.email;
    if (input.password) updateData.password = input.password;
    if (input.role !== undefined) updateData.role = input.role;
    if (input.labAllocation !== undefined) updateData.labAllocation = input.labAllocation;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;
    if (input.customPermissions !== undefined) {
      updateData.customPermissions = Array.isArray(input.customPermissions)
        ? JSON.stringify(input.customPermissions)
        : input.customPermissions;
    }

    const updated = await (db as any).user.update({
      where: { id },
      data: updateData,
    });

    return {
      id: updated.id,
      nip: updated.nip,
      name: updated.name,
      email: updated.email || null,
      role: updated.role || "PROCTOR",
      labAllocation: updated.labAllocation || null,
      customPermissions: updated.customPermissions || null,
      isActive: updated.isActive ?? true,
      createdAt: updated.createdAt || new Date().toISOString(),
      updatedAt: updated.updatedAt || new Date().toISOString(),
    };
  }

  async delete(id: string): Promise<boolean> {
    try {
      await (db as any).user.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async getMetrics(): Promise<StaffUserMetrics> {
    const all = await this.findMany();
    return {
      totalStaff: all.length,
      adminCount: all.filter((u) => u.role === "ADMIN").length,
      proctorCount: all.filter((u) => u.role === "PROCTOR").length,
      teacherCount: all.filter((u) => u.role === "TEACHER").length,
      activeCount: all.filter((u) => u.isActive).length,
    };
  }
}

export const userRepository = new UserRepository();
