import { NextResponse } from "next/server";
import { questionService } from "@/modules/question";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const educationLevel = searchParams.get("educationLevel") || undefined;
    const difficulty = (searchParams.get("difficulty") as any) || undefined;
    const status = (searchParams.get("status") as any) || undefined;
    const search = searchParams.get("search") || undefined;
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;

    const { data, total } = await questionService.listQuestions({
      category,
      educationLevel,
      difficulty,
      status,
      search,
      page,
      limit,
    });

    const metrics = await questionService.getMetrics();

    return NextResponse.json({
      success: true,
      data,
      total,
      metrics,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal mengambil daftar soal" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newQuestion = await questionService.createQuestion({
      text: body.text,
      category: body.category,
      educationLevel: body.educationLevel || "SEMUA",
      difficulty: body.difficulty,
      status: body.status,
      options: body.options,
    });

    return NextResponse.json({
      success: true,
      message: "Soal baru berhasil disimpan ke database",
      data: newQuestion,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal menyimpan soal" },
      { status: 400 }
    );
  }
}
