import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as XLSX from "xlsx";
import { studentService } from "@/modules/student";

async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const val = cookieStore.get("cbt_session")?.value;
    if (!val) return null;
    return JSON.parse(decodeURIComponent(val))?.user || null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    const { searchParams } = new URL(request.url);

    let schoolId = searchParams.get("schoolId") || sessionUser?.schoolId;
    let educationLevel = searchParams.get("educationLevel") || undefined;
    const classGroup = searchParams.get("classGroup") || undefined;

    // Tenant isolation
    if (sessionUser?.role !== "ADMIN" && sessionUser?.schoolId) {
      schoolId = sessionUser.schoolId;
    }
    if (sessionUser?.educationLevel && sessionUser.educationLevel !== "SEMUA") {
      educationLevel = sessionUser.educationLevel;
    }

    const { data: students } = await studentService.listStudents({
      schoolId,
      educationLevel,
      classGroup,
      limit: 10000,
    });

    const wb = XLSX.utils.book_new();

    // Build rows
    const headers = ["No.", "NISN", "Nama Lengkap", "Tempat Lahir", "Tanggal Lahir", "Jenis Kelamin", "Kelas/Rombel", "Jenjang", "Username", "Status"];
    const dataRows = students.map((s, idx) => [
      idx + 1,
      s.nisn,
      s.name,
      s.placeOfBirth || "",
      s.dateOfBirth ? new Date(s.dateOfBirth).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }) : "",
      s.gender || "",
      s.classGroup || "",
      s.educationLevel || "",
      s.username || "",
      s.isActive ? "Aktif" : "Nonaktif",
    ]);

    const wsData = [headers, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws["!cols"] = [
      { wch: 5 },
      { wch: 14 },
      { wch: 28 },
      { wch: 16 },
      { wch: 14 },
      { wch: 14 },
      { wch: 16 },
      { wch: 10 },
      { wch: 22 },
      { wch: 10 },
    ];

    ws["!freeze"] = { xSplit: 0, ySplit: 1 } as any;

    // Style header row
    headers.forEach((_, colIdx) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIdx });
      if (ws[cellRef]) {
        ws[cellRef].s = {
          font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
          fill: { fgColor: { rgb: "1E3A5F" } },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }
    });

    // Alternating row colors
    dataRows.forEach((_, rowIdx) => {
      const fillColor = rowIdx % 2 === 0 ? "F8FAFC" : "FFFFFF";
      headers.forEach((_, colIdx) => {
        const cellRef = XLSX.utils.encode_cell({ r: rowIdx + 1, c: colIdx });
        if (ws[cellRef]) {
          ws[cellRef].s = {
            fill: { fgColor: { rgb: fillColor } },
            font: { sz: 10 },
            alignment: { vertical: "center" },
          };
        }
      });
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    const levelLabel = educationLevel || "Semua";
    XLSX.utils.book_append_sheet(wb, ws, `Siswa ${levelLabel}`);

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx", compression: true });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Data_Siswa_${levelLabel}_${timestamp}.xlsx"`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("[students/export] Error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengekspor data siswa" }, { status: 500 });
  }
}
