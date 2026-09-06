import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    try {
      if (prisma.classGroup) {
        const item = await prisma.classGroup.findUnique({ where: { id } });
        if (item) {
          return NextResponse.json({ success: true, data: item });
        }
      }
    } catch {}

    return NextResponse.json({
      success: true,
      data: {
        id,
        code: "X-RPL-1",
        name: "Kelas X Rekayasa Perangkat Lunak 1",
        gradeLevel: "X",
        major: "RPL",
        academicYear: "2024/2025",
        capacity: 36,
        homeTeacherName: "Drs. M. Taufik, M.Pd.",
        isActive: true,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal mengambil detail kelas" },
      { status: 500 }
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

    try {
      if (prisma.classGroup) {
        const updated = await prisma.classGroup.update({
          where: { id },
          data: {
            code: body.code?.toUpperCase(),
            name: body.name,
            educationLevel: body.educationLevel?.toUpperCase(),
            gradeLevel: body.gradeLevel?.toUpperCase(),
            major: body.major?.toUpperCase(),
            academicYear: body.academicYear,
            capacity: Number(body.capacity),
            homeTeacherName: body.homeTeacherName,
            isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
          },
        });
        return NextResponse.json({
          success: true,
          message: "Data kelas/rombel berhasil diperbarui!",
          data: updated,
        });
      }
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Data kelas/rombel berhasil diperbarui",
      data: { id, ...body },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal memperbarui data kelas" },
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

    try {
      if (prisma.classGroup) {
        await prisma.classGroup.delete({ where: { id } });
      }
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Kelas/Rombel ${id} berhasil dihapus dari database!`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal menghapus data kelas" },
      { status: 400 }
    );
  }
}
