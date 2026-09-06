import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/prisma/db";

export async function GET() {
  try {
    // Read proctor session
    let schoolName = "MI Bustanul Huda 01 Dawuhan";
    let schoolId = "sch-mi-bh01";
    let proctorEducationLevel = "MI";
    let proctorRole = "PROCTOR";

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
          schoolName = parsed.user.schoolName || schoolName;
          schoolId = parsed.user.schoolId || schoolId;
          proctorEducationLevel = parsed.user.educationLevel || proctorEducationLevel;
          proctorRole = parsed.user.role || proctorRole;
        }
      }
      if (!schoolId) {
        schoolId = cookieStore.get("cbt_school_id")?.value || "sch-mi-bh01";
      }
    } catch {}

    // 1. Fetch Students scoped to this proctor's school
    const studentFilter = proctorRole === "ADMIN" ? {} : { schoolId };
    const students = await db.student.findMany({
      where: Object.keys(studentFilter).length > 0 ? studentFilter : undefined,
    });

    const totalStudents = students.length;
    const activeStudents = students.filter((s: any) => s.isActive).length;

    // 2. Fetch ClassGroups scoped to this proctor's school
    const classFilter = proctorRole === "ADMIN" ? {} : { schoolId };
    const classes = await db.classGroup.findMany({
      where: Object.keys(classFilter).length > 0 ? classFilter : undefined,
    });
    const totalClasses = classes.length;
    const totalCapacity = classes.reduce((acc: number, c: any) => acc + (c.capacity || 30), 0) || 40;

    // 3. Fetch Questions scoped to proctor's educationLevel
    const allQuestions = await db.question.findMany();
    const relevantQuestions = allQuestions.filter((q: any) => {
      const lvl = (q.educationLevel || "SEMUA").toUpperCase();
      if (proctorRole === "ADMIN" || proctorEducationLevel === "SEMUA") return true;
      return lvl === proctorEducationLevel || lvl === "SEMUA";
    });

    // 4. Fetch Active Exam Token & Semester
    const tokens = await db.examToken.findMany();
    const activeToken = tokens.find((t: any) => t.isActive);

    const semesters = await db.semester.findMany();
    const activeSemester = semesters.find((s: any) => s.isActive) || semesters[0];

    // 5. Fetch Integrity Logs scoped to this proctor's school
    const logFilter = proctorRole === "ADMIN" ? {} : { schoolId };
    const integrityLogs = await db.integrityLog.findMany({
      where: Object.keys(logFilter).length > 0 ? logFilter : undefined,
    });
    const unresolvedAnomalies = integrityLogs.filter((l: any) => l.status === "UNRESOLVED").length;

    // Multi-jenjang breakdown for overview
    const miQuestions = allQuestions.filter((q: any) => (q.educationLevel || "").toUpperCase() === "MI").length;
    const mtsQuestions = allQuestions.filter((q: any) => (q.educationLevel || "").toUpperCase() === "MTS").length;
    const maQuestions = allQuestions.filter((q: any) => (q.educationLevel || "").toUpperCase() === "MA").length;

    const miClasses = classes.filter((c: any) => (c.educationLevel || "").toUpperCase() === "MI").length;
    const mtsClasses = classes.filter((c: any) => (c.educationLevel || "").toUpperCase() === "MTS").length;
    const maClasses = classes.filter((c: any) => (c.educationLevel || "").toUpperCase() === "MA").length;

    const subjects = await db.subject.findMany();
    const miSubjects = subjects.filter((s: any) => (s.educationLevel || "").toUpperCase() === "MI").length;
    const mtsSubjects = subjects.filter((s: any) => (s.educationLevel || "").toUpperCase() === "MTS").length;
    const maSubjects = subjects.filter((s: any) => (s.educationLevel || "").toUpperCase() === "MA").length;

    const sessionTitle =
      proctorEducationLevel === "MI"
        ? `Sesi 1 • Asesmen CBT Madrasah Ibtidaiyah`
        : proctorEducationLevel === "MTS"
        ? `Sesi 1 • Asesmen CBT Madrasah Tsanawiyah`
        : `Sesi 1 • Asesmen CBT Madrasah Aliyah`;

    return NextResponse.json({
      success: true,
      data: {
        schoolName,
        schoolId,
        educationLevel: proctorEducationLevel,
        activeToken: activeToken?.token || "MI2025",
        sessionName: activeToken?.sessionName || sessionTitle,
        activeSemester: activeSemester?.name || "Semester Ganjil 2024/2025",
        academicYear: activeSemester?.academicYear || "2024/2025",
        totalStudents,
        activeStudents,
        totalClasses,
        totalQuestions: relevantQuestions.length,
        capacity: totalCapacity,
        workingCount: activeStudents,
        anomalyCount: unresolvedAnomalies,
        offlineCount: Math.max(0, totalStudents - activeStudents),
        studentsList: students.map((s: any) => ({
          id: s.id,
          nisn: s.nisn,
          name: s.name,
          classGroup: s.classGroup,
          educationLevel: s.educationLevel,
          isActive: s.isActive,
        })),
        jenjangBreakdown: {
          MI: { questions: miQuestions, classes: miClasses, subjects: miSubjects },
          MTS: { questions: mtsQuestions, classes: mtsClasses, subjects: mtsSubjects },
          MA: { questions: maQuestions, classes: maClasses, subjects: maSubjects },
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal mengambil statistik proktor dari database" },
      { status: 500 }
    );
  }
}
