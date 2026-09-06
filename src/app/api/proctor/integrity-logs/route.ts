import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/prisma/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status") || "ALL";
    const severityFilter = searchParams.get("severity") || "ALL";
    const query = (searchParams.get("q") || "").trim().toLowerCase();
    let schoolIdParam = searchParams.get("schoolId") || "";

    // Resolve tenant proctor from session
    let userRole = "PROCTOR";
    let proctorSchoolId: string | null = null;

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
        }
      }
      if (!proctorSchoolId) {
        proctorSchoolId = cookieStore.get("cbt_school_id")?.value || null;
      }
    } catch {}

    const targetSchoolId = schoolIdParam || (userRole !== "ADMIN" ? (proctorSchoolId || "sch-mi-bh01") : "");

    // Fetch from PostgreSQL with schoolId isolation
    const whereClause: Record<string, any> = {};
    if (targetSchoolId) {
      whereClause.schoolId = targetSchoolId;
    }

    const allLogs = await db.integrityLog.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      orderBy: { createdAt: "desc" },
    });

    let filtered = allLogs;

    if (statusFilter !== "ALL") {
      if (statusFilter === "UNRESOLVED") {
        filtered = filtered.filter((log: any) => log.status === "UNRESOLVED");
      } else if (statusFilter === "RESOLVED") {
        filtered = filtered.filter((log: any) => log.status !== "UNRESOLVED");
      }
    }

    if (severityFilter !== "ALL") {
      filtered = filtered.filter((log: any) => log.severity === severityFilter);
    }

    if (query) {
      filtered = filtered.filter(
        (log: any) =>
          log.studentName.toLowerCase().includes(query) ||
          log.nisn.toLowerCase().includes(query) ||
          log.workstation.toLowerCase().includes(query) ||
          log.description.toLowerCase().includes(query)
      );
    }

    const unresolvedCount = allLogs.filter((l: any) => l.status === "UNRESOLVED").length;
    const criticalCount = allLogs.filter((l: any) => l.severity === "CRITICAL").length;
    const warningCount = allLogs.filter((l: any) => l.severity === "WARNING").length;
    const resolvedCount = allLogs.filter((l: any) => l.status !== "UNRESOLVED").length;

    const formattedData = filtered.map((l: any) => ({
      ...l,
      timestamp: l.createdAt
        ? new Date(l.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " WIB"
        : "12:00:00 WIB",
    }));

    return NextResponse.json({
      success: true,
      data: formattedData,
      metrics: {
        total: allLogs.length,
        unresolved: unresolvedCount,
        critical: criticalCount,
        warning: warningCount,
        resolved: resolvedCount,
        integrityScore: allLogs.length > 0 ? Math.round((1 - criticalCount / (allLogs.length * 2)) * 1000) / 10 : 100,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal mengambil log integritas dari database" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, logId, notes } = body;

    if (!logId || !action) {
      return NextResponse.json({ success: false, message: "Parameter logId dan action wajib diisi" }, { status: 400 });
    }

    let nextStatus = "RESOLVED";
    let defaultNote = "Diverifikasi & diselesaikan oleh pengawas.";

    switch (action) {
      case "RESOLVE":
        nextStatus = "RESOLVED";
        defaultNote = "Diverifikasi & diselesaikan oleh pengawas ruangan.";
        break;
      case "RESET_SESSION":
        nextStatus = "SESSION_RESET";
        defaultNote = "Sesi ujian di-reset. Peserta diizinkan melanjutkan ujian.";
        break;
      case "ISSUE_WARNING":
        nextStatus = "WARNING_ISSUED";
        defaultNote = "Peringatan resmi diterbitkan kepada peserta di layar kiosk.";
        break;
      case "FORCE_SUBMIT":
        nextStatus = "FORCE_SUBMITTED";
        defaultNote = "Ujian dihentikan dan jawaban dipaksa kumpul karena pelanggaran berat.";
        break;
      default:
        return NextResponse.json({ success: false, message: "Action tidak dikenal" }, { status: 400 });
    }

    const updated = await db.integrityLog.update({
      where: { id: logId },
      data: {
        status: nextStatus,
        notes: notes || defaultNote,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Tindakan "${action}" berhasil diterapkan pada log ${logId} di database`,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "Gagal memproses aksi log di database" }, { status: 500 });
  }
}
