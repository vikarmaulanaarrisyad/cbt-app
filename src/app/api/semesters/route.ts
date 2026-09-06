import { NextResponse } from "next/server";
import { semesterService } from "@/modules/semester";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery: Record<string, string> = {};
    
    searchParams.forEach((value, key) => {
      rawQuery[key] = value;
    });

    const { result, academicYears } = await semesterService.getSemesters(rawQuery);

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: result.meta,
      metrics: result.metrics,
      academicYears,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal mengambil data semester" },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newSemester = await semesterService.createSemester(body);

    return NextResponse.json(
      {
        success: true,
        message: "Semester berhasil ditambahkan",
        data: newSemester,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal menambah semester" },
      { status: 400 }
    );
  }
}
