import { NextResponse } from "next/server";
import { userService } from "@/modules/user";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = (searchParams.get("role") as any) || undefined;
    const search = searchParams.get("search") || undefined;

    const { data, metrics } = await userService.listUsers({
      role,
      search,
    });

    return NextResponse.json({
      success: true,
      data,
      metrics,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal mengambil data pengguna" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newUser = await userService.createUser({
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
      message: "Pengguna baru berhasil ditambahkan",
      data: newUser,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal menambah pengguna" },
      { status: 400 }
    );
  }
}
