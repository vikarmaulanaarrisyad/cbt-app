import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const wb = XLSX.utils.book_new();

    // ─── Sheet 1: Template Data Siswa ─────────────────────────────────────
    const headers = [
      "NISN",
      "Nama Lengkap",
      "Tempat Lahir",
      "Tanggal Lahir",
      "Jenis Kelamin",
      "Kelas/Rombel",
      "Jenjang",
      "Username",
      "Password Awal",
    ];

    const examples = [
      ["1234567890", "Ahmad Fauzi Rahmat", "Malang", "15/08/2010", "L", "Kelas 6-A", "MI", "ahmad.fauzi", "password123"],
      ["1234567891", "Siti Nurhaliza Putri", "Surabaya", "20/03/2011", "P", "Kelas 5-A", "MI", "siti.nurhaliza", "password123"],
      ["1234567892", "Rizky Aditya Pratama", "Kediri", "10/11/2010", "L", "Kelas 6-A", "MI", "rizky.pratama", "password123"],
    ];

    const wsData = [headers, ...examples];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Column widths
    ws["!cols"] = [
      { wch: 14 }, // NISN
      { wch: 28 }, // Nama Lengkap
      { wch: 16 }, // Tempat Lahir
      { wch: 15 }, // Tanggal Lahir
      { wch: 14 }, // Jenis Kelamin
      { wch: 16 }, // Kelas/Rombel
      { wch: 10 }, // Jenjang
      { wch: 20 }, // Username
      { wch: 16 }, // Password
    ];

    // Freeze header row
    ws["!freeze"] = { xSplit: 0, ySplit: 1, topLeftCell: "A2" } as any;

    // Header style
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
      fill: { fgColor: { rgb: "1E3A5F" } },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: {
        top: { style: "thin", color: { rgb: "CCCCCC" } },
        bottom: { style: "thin", color: { rgb: "CCCCCC" } },
        left: { style: "thin", color: { rgb: "CCCCCC" } },
        right: { style: "thin", color: { rgb: "CCCCCC" } },
      },
    };

    // Apply styles to header (A1:I1)
    headers.forEach((_, colIdx) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIdx });
      if (!ws[cellRef]) ws[cellRef] = { v: headers[colIdx], t: "s" };
      ws[cellRef].s = headerStyle;
    });

    // Example rows alternating color
    examples.forEach((_, rowIdx) => {
      const fillColor = rowIdx % 2 === 0 ? "F0F4F8" : "FFFFFF";
      headers.forEach((_, colIdx) => {
        const cellRef = XLSX.utils.encode_cell({ r: rowIdx + 1, c: colIdx });
        if (ws[cellRef]) {
          ws[cellRef].s = {
            fill: { fgColor: { rgb: fillColor } },
            font: { sz: 10 },
            alignment: { vertical: "center", wrapText: false },
            border: {
              top: { style: "thin", color: { rgb: "E2E8F0" } },
              bottom: { style: "thin", color: { rgb: "E2E8F0" } },
              left: { style: "thin", color: { rgb: "E2E8F0" } },
              right: { style: "thin", color: { rgb: "E2E8F0" } },
            },
          };
        }
      });
    });

    XLSX.utils.book_append_sheet(wb, ws, "Data Siswa");

    // ─── Sheet 2: Panduan & Keterangan ────────────────────────────────────
    const guideData = [
      ["PANDUAN PENGISIAN TEMPLATE IMPORT DATA SISWA - CBT PRO"],
      [""],
      ["Kolom", "Keterangan", "Wajib?", "Format / Contoh"],
      ["NISN", "Nomor Induk Siswa Nasional - 10 digit angka unik", "YA", "1234567890"],
      ["Nama Lengkap", "Nama siswa tanpa gelar, awalan huruf kapital setiap kata", "YA", "Ahmad Fauzi Rahmat"],
      ["Tempat Lahir", "Nama kota/kabupaten/daerah tempat lahir", "YA", "Malang"],
      ["Tanggal Lahir", "Gunakan format DD/MM/YYYY", "YA", "15/08/2010"],
      ["Jenis Kelamin", "L = Laki-laki, P = Perempuan", "YA", "L atau P"],
      ["Kelas/Rombel", "Nama kelas sesuai data di sistem. Bisa dikosongkan.", "OPSIONAL", "Kelas 6-A"],
      ["Jenjang", "MI (Madrasah Ibtidaiyah), MTS (Tsanawiyah), MA (Aliyah)", "YA", "MI"],
      ["Username", "Username untuk login ujian. Minimal 4 karakter, tanpa spasi.", "YA", "ahmad.fauzi"],
      ["Password Awal", "Password awal untuk login. Bisa dikosongkan (default: password123)", "OPSIONAL", "password123"],
      [""],
      ["CATATAN PENTING:"],
      ["• Hapus baris contoh (baris 2-4) sebelum mengisi data sebenarnya"],
      ["• NISN harus unik — tidak boleh duplikat dalam satu file atau dengan data yang sudah ada di database"],
      ["• Username harus unik — tidak boleh sama antar siswa"],
      ["• Jangan mengubah nama header (baris pertama)"],
      ["• Simpan file dalam format .xlsx sebelum diupload"],
      ["• Maksimal 1000 siswa per file upload"],
    ];

    const wsGuide = XLSX.utils.aoa_to_sheet(guideData);
    wsGuide["!cols"] = [{ wch: 18 }, { wch: 55 }, { wch: 10 }, { wch: 24 }];

    // Style title
    const titleCell = "A1";
    if (wsGuide[titleCell]) {
      wsGuide[titleCell].s = {
        font: { bold: true, sz: 14, color: { rgb: "1E3A5F" } },
        alignment: { horizontal: "left" },
      };
    }

    XLSX.utils.book_append_sheet(wb, wsGuide, "Panduan");

    // Generate buffer
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx", compression: true });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Template_Import_Siswa_CBTPro.xlsx"`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("[students/template] Error:", error);
    return NextResponse.json({ success: false, message: "Gagal membuat template" }, { status: 500 });
  }
}
