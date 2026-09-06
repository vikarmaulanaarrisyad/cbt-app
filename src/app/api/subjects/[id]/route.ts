import { NextResponse } from "next/server";
import { subjectService } from "@/modules/subject";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const subject = await subjectService.getSubjectById(id);

    return NextResponse.json({
      success: true,
      data: subject,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Mata pelajaran tidak ditemukan" },
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
    const updated = await subjectService.updateSubject(id, body);

    return NextResponse.json({
      success: true,
      message: "Data mata pelajaran berhasil diperbarui",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal mengupdate mata pelajaran" },
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
    await subjectService.deleteSubject(id);

    return NextResponse.json({
      success: true,
      message: "Mata pelajaran berhasil dihapus",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal menghapus mata pelajaran" },
      { status: 400 }
    );
  }
}
