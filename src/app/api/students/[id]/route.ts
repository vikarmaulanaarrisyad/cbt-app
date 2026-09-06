import { NextResponse } from "next/server";
import { studentService } from "@/modules/student";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const student = await studentService.getStudentById(id);
    if (!student) {
      return NextResponse.json({ success: false, message: "Siswa tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: student });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "Gagal mengambil data siswa" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await studentService.updateStudent(id, body);
    return NextResponse.json({ success: true, message: "Data siswa berhasil diperbarui", data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "Gagal memperbarui data siswa" }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await studentService.deleteStudent(id);
    return NextResponse.json({ success: true, message: "Siswa berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "Gagal menghapus siswa" }, { status: 400 });
  }
}
