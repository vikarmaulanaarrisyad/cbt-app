import { NextResponse } from "next/server";
import { userService } from "@/modules/user";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await userService.updateUser(id, {
      nip: body.nip,
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role,
      labAllocation: body.labAllocation,
      customPermissions: body.customPermissions,
      isActive: body.isActive,
    });

    return NextResponse.json({
      success: true,
      message: "Data pengguna berhasil diperbarui",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal mengedit pengguna" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await userService.deleteUser(id);

    return NextResponse.json({
      success: true,
      message: "Pengguna berhasil dihapus",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal menghapus pengguna" },
      { status: 400 }
    );
  }
}
