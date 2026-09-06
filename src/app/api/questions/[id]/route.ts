import { NextResponse } from "next/server";
import { questionService } from "@/modules/question";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const question = await questionService.getQuestionById(id);
    return NextResponse.json({ success: true, data: question });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Soal tidak ditemukan" },
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
    const updated = await questionService.updateQuestion(id, body);
    return NextResponse.json({
      success: true,
      message: "Soal berhasil diperbarui",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal memperbarui soal" },
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
    await questionService.deleteQuestion(id);
    return NextResponse.json({
      success: true,
      message: "Soal berhasil dihapus dari database",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal menghapus soal" },
      { status: 400 }
    );
  }
}
