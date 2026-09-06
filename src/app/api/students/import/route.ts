import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as XLSX from "xlsx";
import { studentService } from "@/modules/student";
import { ImportStudentRow } from "@/modules/student/types";

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

// Column header aliases
const COLUMN_MAP: Record<string, keyof ImportStudentRow> = {
  nisn: "nisn",
  "nisn siswa": "nisn",
  nama: "name",
  "nama lengkap": "name",
  "nama siswa": "name",
  "tempat lahir": "placeOfBirth",
  "tempat_lahir": "placeOfBirth",
  "tgl lahir": "dateOfBirth",
  "tanggal lahir": "dateOfBirth",
  "tanggal_lahir": "dateOfBirth",
  "date of birth": "dateOfBirth",
  "jenis kelamin": "gender",
  "jenis_kelamin": "gender",
  gender: "gender",
  "l/p": "gender",
  "kelas": "classGroup",
  "kelas/rombel": "classGroup",
  "rombel": "classGroup",
  "jenjang": "educationLevel",
  "education level": "educationLevel",
  "username": "username",
  "username login": "username",
  "password": "password",
  "password awal": "password",
};

function parseExcelRows(workbook: XLSX.WorkBook): ImportStudentRow[] {
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert to array of arrays for flexible header detection
  const aoa: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  if (aoa.length < 2) return [];

  // Find header row (first row with 'NISN' or 'Nama')
  let headerRowIdx = 0;
  for (let i = 0; i < Math.min(5, aoa.length); i++) {
    const row = aoa[i];
    const hasNisn = row.some((c: any) => String(c).toLowerCase().trim().includes("nisn"));
    const hasNama = row.some((c: any) => String(c).toLowerCase().trim().includes("nama"));
    if (hasNisn || hasNama) { headerRowIdx = i; break; }
  }

  const headers = aoa[headerRowIdx].map((h: any) => String(h).toLowerCase().trim());
  const rows: ImportStudentRow[] = [];

  for (let i = headerRowIdx + 1; i < aoa.length; i++) {
    const rowArr = aoa[i];
    // Skip empty rows
    if (rowArr.every((c: any) => !String(c).trim())) continue;

    const mapped: any = { rowNumber: i + 1, _raw: {} };
    headers.forEach((h, colIdx) => {
      const field = COLUMN_MAP[h];
      const cellVal = String(rowArr[colIdx] ?? "").trim();
      if (field) mapped[field] = cellVal;
      mapped._raw[h] = cellVal;
    });

    // Ensure required fields exist
    mapped.nisn = mapped.nisn || "";
    mapped.name = mapped.name || "";
    mapped.placeOfBirth = mapped.placeOfBirth || "";
    mapped.dateOfBirth = mapped.dateOfBirth || "";
    mapped.gender = (mapped.gender || "").toUpperCase();
    mapped.classGroup = mapped.classGroup || "";
    mapped.educationLevel = (mapped.educationLevel || "").toUpperCase();
    mapped.username = mapped.username || "";
    mapped.password = mapped.password || "password123";

    rows.push(mapped as ImportStudentRow);
  }

  return rows;
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: "File tidak ditemukan. Upload file Excel (.xlsx)" }, { status: 400 });
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(extension || "")) {
      return NextResponse.json({ success: false, message: "Format file tidak didukung. Gunakan .xlsx atau .xls" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: false });
    const rows = parseExcelRows(workbook);

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "File tidak mengandung data siswa. Pastikan format sesuai template." }, { status: 400 });
    }

    // Validate-only mode: return validation results without saving
    const validateOnly = formData.get("validateOnly") === "true";

    if (validateOnly) {
      const errors: any[] = [];
      const svc = studentService;
      for (const row of rows) {
        const errs = svc.validateImportRow(row, rows);
        errors.push(...errs);
      }
      const errorRows = new Set(errors.map((e) => e.rowNumber));
      return NextResponse.json({
        success: true,
        validateOnly: true,
        totalRows: rows.length,
        validCount: rows.length - errorRows.size,
        errorCount: errorRows.size,
        errors,
        rows: rows.map((r) => ({
          rowNumber: r.rowNumber,
          nisn: r.nisn,
          name: r.name,
          placeOfBirth: r.placeOfBirth,
          dateOfBirth: r.dateOfBirth,
          gender: r.gender,
          classGroup: r.classGroup,
          educationLevel: r.educationLevel,
          username: r.username,
          hasError: errors.some((e) => e.rowNumber === r.rowNumber),
          errors: errors.filter((e) => e.rowNumber === r.rowNumber),
        })),
      });
    }

    // Full import
    const schoolId = sessionUser?.schoolId;
    const schoolName = sessionUser?.schoolName;
    const result = await studentService.importFromExcel(rows, schoolId, schoolName);

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("[students/import] Error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal memproses file import" },
      { status: 500 }
    );
  }
}
