import { NextResponse } from "next/server";
import { subjectService } from "@/modules/subject";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery: Record<string, string> = {};

    searchParams.forEach((value, key) => {
      rawQuery[key] = value;
    });

    const { result, categories, gradeLevels } = await subjectService.getSubjects(rawQuery);

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: result.meta,
      metrics: result.metrics,
      categories,
      gradeLevels,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal mengambil data mata pelajaran" },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newSubject = await subjectService.createSubject(body);

    return NextResponse.json(
      {
        success: true,
        message: `Mata pelajaran "${newSubject.name}" berhasil ditambahkan`,
        data: newSubject,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal menambah mata pelajaran" },
      { status: 400 }
    );
  }
}
