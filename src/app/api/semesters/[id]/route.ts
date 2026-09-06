import { NextResponse } from "next/server";
import { semesterService } from "@/modules/semester";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const semester = await semesterService.getSemesterById(id);

    return NextResponse.json({
      success: true,
      data: semester,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Semester tidak ditemukan" },
      { status: 404 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await semesterService.updateSemester(id, body);

    return NextResponse.json({
      success: true,
      message: "Data semester berhasil diperbarui",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal mengupdate semester" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await semesterService.deleteSemester(id);

    return NextResponse.json({
      success: true,
      message: "Semester berhasil dihapus",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal menghapus semester" },
      { status: 400 }
    );
  }
}
