import { NextResponse } from "next/server";
import { semesterService } from "@/modules/semester";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activated = await semesterService.activateSemester(id);

    return NextResponse.json({
      success: true,
      message: `Semester "${activated.name}" berhasil diaktifkan`,
      data: activated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal mengaktifkan semester" },
      { status: 400 }
    );
  }
}
