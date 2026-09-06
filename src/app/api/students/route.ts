import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { studentService } from "@/modules/student";

async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("cbt_session")?.value;
    if (!sessionCookie) return null;
    const parsed = JSON.parse(decodeURIComponent(sessionCookie));
    return parsed?.user || null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || undefined;
    const educationLevel = searchParams.get("educationLevel") || undefined;
    const classGroup = searchParams.get("classGroup") || undefined;
    const gradeLevel = searchParams.get("gradeLevel") || undefined;
    const gender = searchParams.get("gender") || undefined;
    const isActiveParam = searchParams.get("isActive");
    const isActive = isActiveParam !== null ? isActiveParam === "true" : undefined;
    const sortBy = searchParams.get("sortBy") || "name";
    const sortDir = (searchParams.get("sortDir") || "asc") as "asc" | "desc";

    // Tenant isolation: non-admin sees only their school's students
    let schoolId = searchParams.get("schoolId") || undefined;
    let effectiveEducationLevel = educationLevel;

    if (sessionUser && sessionUser.role !== "ADMIN" && sessionUser.schoolId) {
      schoolId = sessionUser.schoolId;
    }
    if (sessionUser && sessionUser.educationLevel && sessionUser.educationLevel !== "SEMUA") {
      effectiveEducationLevel = sessionUser.educationLevel;
    }

    const { data, meta, metrics } = await studentService.listStudents({
      search,
      educationLevel: effectiveEducationLevel,
      classGroup,
      gradeLevel,
      gender,
      isActive,
      schoolId,
      page,
      limit,
      sortBy,
      sortDir,
    });

    return NextResponse.json({ success: true, data, meta, metrics });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal mengambil data siswa" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    const body = await request.json();

    // Auto-bind school from session
    const schoolId = body.schoolId || sessionUser?.schoolId || undefined;
    const schoolName = body.schoolName || sessionUser?.schoolName || undefined;

    const student = await studentService.createStudent({
      ...body,
      schoolId,
      schoolName,
    });

    return NextResponse.json({ success: true, message: "Siswa berhasil ditambahkan", data: student }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal menambah siswa" },
      { status: 400 }
    );
  }
}
