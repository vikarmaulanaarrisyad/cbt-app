import 'dotenv/config';
import { db } from '../src/prisma/db';

async function main() {
  console.log('🌱 Memulai proses Seeding Database Supabase...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Loaded' : 'MISSING');

  // 1. Seed Users (Proktors & Admins)
  console.log('👤 Seeding Data Proktor & Admin...');
  const users = [
    {
      id: 'usr-proctor-01',
      nip: '198402122008011004',
      name: 'Drs. H. Mulyono',
      email: 'mulyono@cbt-app.sch.id',
      password: 'password123',
      role: 'PROCTOR',
      labAllocation: 'Lab CBT-08',
      isActive: true,
    },
    {
      id: 'usr-proctor-02',
      nip: '199005152015031002',
      name: 'Siti Aminah, S.Kom',
      email: 'siti.aminah@cbt-app.sch.id',
      password: 'password123',
      role: 'TEACHER',
      labAllocation: 'Lab CAT-01',
      isActive: true,
    },
    {
      id: 'usr-admin-01',
      nip: '197508202000031001',
      name: 'Administrator CBT',
      email: 'admin@cbt-app.sch.id',
      password: 'adminpassword',
      role: 'ADMIN',
      labAllocation: 'Pusat Kontrol Utama',
      isActive: true,
    },
  ];

  const existingUsers = (await (db as any).user.findMany()) || [];

  for (const user of users) {
    try {
      const found = existingUsers.find((u: any) => u.nip === user.nip);
      if (found) {
        await (db as any).user.update({
          where: { id: found.id },
          data: { role: user.role, name: user.name, email: user.email, password: user.password, labAllocation: user.labAllocation },
        });
        console.log(`   ✓ User diperbarui: ${user.name} (${user.nip}) [${user.role}]`);
      } else {
        await (db as any).user.create({ data: user });
        console.log(`   ✓ User terbuat: ${user.name} (${user.nip}) [${user.role}]`);
      }
    } catch (e: any) {
      console.log(`   ℹ Gagal menyimpan user: ${user.name} (${user.nip}): ${e?.message}`);
    }
  }

  // 2. Seed Students (Peserta Ujian)
  console.log('🎓 Seeding Data Peserta Ujian (Students)...');
  const students = [
    {
      id: 'std-2025-001',
      nisn: '25-3101-0982-014',
      name: 'Budi Santoso',
      dateOfBirth: '2007-04-18T00:00:00.000Z',
      classGroup: 'XII MIPA 1',
      isActive: true,
    },
    {
      id: 'std-2025-002',
      nisn: '25-3101-0982-015',
      name: 'Siti Rahmawati',
      dateOfBirth: '2007-08-22T00:00:00.000Z',
      classGroup: 'XII MIPA 2',
      isActive: true,
    },
    {
      id: 'std-2025-003',
      nisn: '25-3101-0982-016',
      name: 'Ahmad Fauzi',
      dateOfBirth: '2007-02-10T00:00:00.000Z',
      classGroup: 'XII IPS 1',
      isActive: true,
    },
  ];

  for (const student of students) {
    try {
      await (db as any).student.create({ data: student });
      console.log(`   ✓ Student terbuat: ${student.name} (${student.nisn})`);
    } catch {
      console.log(`   ℹ Student sudah ada: ${student.name} (${student.nisn})`);
    }
  }

  // 3. Seed Exam Tokens
  console.log('🔑 Seeding Data Token Sesi Ujian...');
  const tokens = [
    {
      id: 'token-01',
      token: 'XK9PW2',
      sessionName: 'Sesi 1: Tes Potensi Skolastik (TPS) & Literasi',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
    },
    {
      id: 'token-02',
      token: 'UTBK25',
      sessionName: 'Sesi 2: Penalaran Matematika & Literasi Bahasa',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
    },
  ];

  for (const t of tokens) {
    try {
      await (db as any).examToken.create({ data: t });
      console.log(`   ✓ Token terbuat: ${t.token} (${t.sessionName})`);
    } catch {
      console.log(`   ℹ Token sudah ada: ${t.token}`);
    }
  }

  // 4. Seed Semesters
  console.log('📅 Seeding Data Semester...');
  const semesters = [
    {
      id: 'sem-2024-1',
      code: '2024/2025-1',
      name: 'Semester Ganjil 2024/2025',
      academicYear: '2024/2025',
      type: 'GANJIL',
      startDate: '2024-07-15T00:00:00.000Z',
      endDate: '2024-12-20T00:00:00.000Z',
      isActive: true,
      description: 'Semester Ganjil Tahun Ajaran 2024/2025 - Ujian Utama & Susulan',
    },
    {
      id: 'sem-2023-2',
      code: '2023/2024-2',
      name: 'Semester Genap 2023/2024',
      academicYear: '2023/2024',
      type: 'GENAP',
      startDate: '2024-01-08T00:00:00.000Z',
      endDate: '2024-06-21T00:00:00.000Z',
      isActive: false,
      description: 'Semester Genap Tahun Ajaran 2023/2024',
    },
    {
      id: 'sem-2023-1',
      code: '2023/2024-1',
      name: 'Semester Ganjil 2023/2024',
      academicYear: '2023/2024',
      type: 'GANJIL',
      startDate: '2023-07-17T00:00:00.000Z',
      endDate: '2023-12-22T00:00:00.000Z',
      isActive: false,
      description: 'Semester Ganjil Tahun Ajaran 2023/2024',
    },
    {
      id: 'sem-2023-3',
      code: '2023/2024-3',
      name: 'Semester Antara 2023/2024',
      academicYear: '2023/2024',
      type: 'ANTARA',
      startDate: '2024-06-24T00:00:00.000Z',
      endDate: '2024-07-12T00:00:00.000Z',
      isActive: false,
      description: 'Semester Pendek / Remedial 2023/2024',
    },
    {
      id: 'sem-2022-2',
      code: '2022/2023-2',
      name: 'Semester Genap 2022/2023',
      academicYear: '2022/2023',
      type: 'GENAP',
      startDate: '2023-01-09T00:00:00.000Z',
      endDate: '2023-06-23T00:00:00.000Z',
      isActive: false,
      description: 'Semester Genap 2022/2023 (Arsip)',
    },
  ];

  for (const sem of semesters) {
    try {
      await (db as any).semester.create({ data: sem });
      console.log(`   ✓ Semester terbuat: ${sem.name} (${sem.code})`);
    } catch {
      console.log(`   ℹ Semester sudah ada: ${sem.name} (${sem.code})`);
    }
  }

  // 5. Seed Questions (Bank Soal)
  console.log('📝 Seeding Data Bank Soal (Questions)...');
  const questions = [
    {
      id: 'Q-1042',
      text: 'Berdasarkan paragraf ke-2, apa simpulan yang paling tepat mengenai korelasi antara pertumbuhan ekonomi dan konsumsi energi fosil?',
      category: 'Penalaran Umum',
      difficulty: 'SULIT',
      status: 'AKTIF',
      options: JSON.stringify([
        { id: 'A', text: 'Konsumsi energi fosil selalu berbanding lurus dengan laju inflasi daerah.' },
        { id: 'B', text: 'Pertumbuhan ekonomi berbanding lurus dengan efisiensi energi terbarukan.' },
        { id: 'C', text: 'Kenaikan PDB mendorong peningkatan konsumsi energi fosil pada negara berkembang.' },
        { id: 'D', text: 'Konsumsi energi fosil tidak dipengaruhi oleh aktivitas industri.' }
      ]),
    },
    {
      id: 'Q-1043',
      text: 'Jika x = 5 dan y = 12, maka nilai dari akar kuadrat (x^2 + y^2) adalah...',
      category: 'Pengetahuan Kuantitatif',
      difficulty: 'SEDANG',
      status: 'AKTIF',
      options: JSON.stringify([
        { id: 'A', text: '13' },
        { id: 'B', text: '14' },
        { id: 'C', text: '17' },
        { id: 'D', text: '25' }
      ]),
    },
    {
      id: 'Q-1044',
      text: 'Makna kata "Deforestasi" pada kalimat ketiga bermakna...',
      category: 'Literasi Bahasa Indonesia',
      difficulty: 'MUDAH',
      status: 'AKTIF',
      options: JSON.stringify([
        { id: 'A', text: 'Penanaman kembali hutan yang gundul' },
        { id: 'B', text: 'Penebangan dan penghilangan hutan secara permanen' },
        { id: 'C', text: 'Konservasi wilayah suaka margasatwa' },
        { id: 'D', text: 'Pengolahan hasil hutan menjadi bahan baku' }
      ]),
    },
    {
      id: 'Q-1045',
      text: 'Simpulan yang paling mungkin benar jika harga bahan baku naik adalah...',
      category: 'Penalaran Umum',
      difficulty: 'SEDANG',
      status: 'DRAFT',
      options: JSON.stringify([
        { id: 'A', text: 'Harga jual produk akhir akan mengalami penyesuaian naik' },
        { id: 'B', text: 'Biaya produksi mengalami penurunan secara signifikan' },
        { id: 'C', text: 'Jumlah permintaan pasar meningkat tajam' },
        { id: 'D', text: 'Kapasitas pabrik akan bertambah dua kali lipat' }
      ]),
    },
    {
      id: 'Q-1046',
      text: 'Manakah pernyataan di bawah ini yang memperlemah argumen tokoh A mengenai dampak kecerdasan buatan?',
      category: 'Penalaran Umum',
      difficulty: 'SULIT',
      status: 'AKTIF',
      options: JSON.stringify([
        { id: 'A', text: 'Studi menunjukkan 80% perusahaan mengalami peningkatan produktivitas setelah adopsi AI' },
        { id: 'B', text: 'Penggunaan AI menyebabkan pengangguran massal di sektor manufaktur' },
        { id: 'C', text: 'AI membutuhkan konsumsi energi listrik yang sangat tinggi' },
        { id: 'D', text: 'Banyak pekerja merasa terbantu oleh otomatisasi tugas rutin' }
      ]),
    },
  ];

  for (const q of questions) {
    try {
      await (db as any).question.create({ data: q });
      console.log(`   ✓ Soal terbuat: [${q.id}] ${q.category}`);
    } catch {
      console.log(`   ℹ Soal sudah ada: ${q.id}`);
    }
  }

  console.log('🎉 Seeding Database Supabase Berhasil Selesai!');
}

main().catch((e) => {
  console.error('❌ Gagal menjalankan seeder:', e);
  process.exit(1);
});
