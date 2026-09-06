import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/prisma/db";
import { findSchoolById, generateInitialClassesForSchool, getSchoolsStore } from "@/lib/school-tenancy";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") || "").trim().toLowerCase();
    const educationLevel = searchParams.get("educationLevel") || "";
    const gradeLevel = searchParams.get("gradeLevel") || "";
    const major = searchParams.get("major") || "";
    let schoolIdParam = searchParams.get("schoolId") || "";

    // Resolve tenant school and education level from session cookie
    let userRole = "PROCTOR";
    let proctorSchoolId: string | null = null;
    let proctorSchoolName: string | null = null;
    let proctorEducationLevel: string | null = null;

    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get("cbt_session")?.value;
      if (sessionCookie) {
        let parsed: any;
        try {
          parsed = JSON.parse(sessionCookie);
        } catch {
          try {
            parsed = JSON.parse(decodeURIComponent(sessionCookie));
          } catch {}
        }
        if (parsed?.user) {
          userRole = parsed.user.role || "PROCTOR";
          proctorSchoolId = parsed.user.schoolId || null;
          proctorSchoolName = parsed.user.schoolName || null;
          proctorEducationLevel = parsed.user.educationLevel || null;
        }
      }
      if (!proctorSchoolId) {
        proctorSchoolId = cookieStore.get("cbt_school_id")?.value || null;
      }
    } catch {}

    const targetSchoolId = schoolIdParam || (userRole !== "ADMIN" ? proctorSchoolId : "");

    // Build database query filter with indexed columns
    const whereClause: Record<string, any> = {};
    if (targetSchoolId) {
      whereClause.schoolId = targetSchoolId;
    }
    if (educationLevel && educationLevel !== "ALL" && educationLevel !== "SEMUA") {
      whereClause.educationLevel = educationLevel.toUpperCase();
    } else if (userRole !== "ADMIN" && proctorEducationLevel && proctorEducationLevel !== "SEMUA" && !educationLevel) {
      whereClause.educationLevel = proctorEducationLevel.toUpperCase();
    }

    let classesList = await db.classGroup.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      orderBy: { code: "asc" },
    });

    // Auto-seed initial classes for newly registered schools if empty
    if (classesList.length === 0 && targetSchoolId) {
      let schoolObj: any = (await db.school.findUnique({ where: { id: targetSchoolId } }).catch(() => null)) ||
        findSchoolById(targetSchoolId) ||
        getSchoolsStore().find((s) => s.id === targetSchoolId || s.name === proctorSchoolName);

      if (!schoolObj && proctorSchoolName) {
        schoolObj = {
          id: targetSchoolId,
          name: proctorSchoolName,
          npsn: "11123304" + (targetSchoolId.slice(-4) || "0001"),
          educationLevel: (proctorEducationLevel as any) || "MI",
          city: "Banyumas",
          province: "Jawa Tengah",
          contactEmail: "admin@school.sch.id",
          proctorId: "usr-" + targetSchoolId,
          proctorName: "Proktor",
          labAllocation: "Lab CBT",
          createdAt: new Date().toISOString(),
        };
      }

      if (schoolObj) {
        const initialClasses = generateInitialClassesForSchool(schoolObj);
        for (const cls of initialClasses) {
          try {
            await db.classGroup.create({
              data: {
                id: cls.id,
                code: cls.code,
                name: cls.name,
                educationLevel: cls.educationLevel,
                gradeLevel: cls.gradeLevel,
                major: cls.major,
                academicYear: cls.academicYear,
                capacity: cls.capacity,
                homeTeacherName: cls.homeTeacherName,
                isActive: cls.isActive,
                schoolId: cls.schoolId,
                schoolName: cls.schoolName,
              },
            });
          } catch {}
        }
        classesList = await db.classGroup.findMany({
          where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
          orderBy: { code: "asc" },
        });
      }
    }

    // Apply any non-indexed search filters (search term, major, grade)
    const filtered = classesList.filter((c: any) => {
      const matchSearch =
        !search ||
        c.code.toLowerCase().includes(search) ||
        c.name.toLowerCase().includes(search) ||
        (c.homeTeacherName && c.homeTeacherName.toLowerCase().includes(search)) ||
        (c.schoolName && c.schoolName.toLowerCase().includes(search));

      const matchGrade = !gradeLevel || gradeLevel === "ALL" || c.gradeLevel === gradeLevel;
      const matchMajor = !major || major === "ALL" || c.major === major;

      return matchSearch && matchGrade && matchMajor;
    });

    const totalClasses = filtered.length;
    const activeClasses = filtered.filter((c: any) => c.isActive).length;
    const totalCapacity = filtered.reduce((acc: number, c: any) => acc + (c.capacity || 36), 0);

    const totalMI = filtered.filter((c: any) => (c.educationLevel || "MA").toUpperCase() === "MI").length;
    const totalMTS = filtered.filter((c: any) => (c.educationLevel || "MA").toUpperCase() === "MTS").length;
    const totalMA = filtered.filter((c: any) => (c.educationLevel || "MA").toUpperCase() === "MA").length;

    return NextResponse.json({
      success: true,
      data: filtered,
      total: totalClasses,
      activeSchool: {
        id: targetSchoolId || null,
        name: proctorSchoolName || (filtered[0]?.schoolName ?? null),
        educationLevel: proctorEducationLevel || "MI",
      },
      metrics: {
        totalClasses,
        activeClasses,
        totalCapacity,
        totalStudents: Math.round(totalCapacity * 0.95),
        totalMI,
        totalMTS,
        totalMA,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal mengambil data kelas dari database" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      code,
      name,
      educationLevel = "MI",
      gradeLevel,
      major,
      academicYear,
      capacity,
      homeTeacherName,
      isActive = true,
      schoolId: bodySchoolId,
      schoolName: bodySchoolName,
    } = body;

    if (!code || !name || !gradeLevel) {
      return NextResponse.json(
        { success: false, message: "Kode kelas, nama kelas, dan tingkat wajib diisi!" },
        { status: 400 }
      );
    }

    // Extract proctor school from session cookie if not provided
    let schoolId = bodySchoolId || null;
    let schoolName = bodySchoolName || null;

    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get("cbt_session")?.value;
      if (sessionCookie) {
        const parsed = JSON.parse(sessionCookie);
        if (parsed?.user) {
          if (!schoolId) schoolId = parsed.user.schoolId;
          if (!schoolName) schoolName = parsed.user.schoolName;
        }
      }
    } catch {}

    const id = `cls-${Date.now()}`;
    const cleanSchoolId = schoolId || "sch-mi-bh01";
    const cleanSchoolName = schoolName || "MI Bustanul Huda 01 Dawuhan";

    const created = await db.classGroup.create({
      data: {
        id,
        code: code.toUpperCase(),
        name,
        educationLevel: (educationLevel || "MI").toUpperCase(),
        gradeLevel: gradeLevel.toUpperCase(),
        major: major ? major.toUpperCase() : "UMUM",
        academicYear: academicYear || "2024/2025",
        capacity: Number(capacity) || 36,
        homeTeacherName: homeTeacherName || "-",
        schoolId: cleanSchoolId,
        schoolName: cleanSchoolName,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Kelas/Rombel "${created.name}" berhasil disimpan ke database ${cleanSchoolName}!`,
        data: created,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal menambah kelas/rombel ke database" },
      { status: 400 }
    );
  }
}
