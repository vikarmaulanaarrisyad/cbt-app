import 'dotenv/config';
import pg from 'pg';

async function bootstrap() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  console.log('🚀 Bootstrapping Supabase PostgreSQL tables & seeding RBAC users...');
  const pool = new pg.Pool({ connectionString });

  try {
    // 1. Create User table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        id TEXT PRIMARY KEY,
        nip TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'PROCTOR',
        "labAllocation" TEXT,
        "customPermissions" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "customPermissions" TEXT;`);
    console.log('   ✓ Table "User" created/verified');

    // Create lower-case view or alias table "user" for contract compatibility if needed
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        id TEXT PRIMARY KEY,
        nip TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'PROCTOR',
        "labAllocation" TEXT,
        "customPermissions" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "customPermissions" TEXT;`);

    // 2. Create Student table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Student" (
        id TEXT PRIMARY KEY,
        nisn TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        "dateOfBirth" TIMESTAMPTZ NOT NULL,
        "classGroup" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "student" (
        id TEXT PRIMARY KEY,
        nisn TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        "dateOfBirth" TIMESTAMPTZ NOT NULL,
        "classGroup" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log('   ✓ Table "Student" / "student" created/verified');

    // 3. Create ExamToken table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "ExamToken" (
        id TEXT PRIMARY KEY,
        token TEXT UNIQUE NOT NULL,
        "sessionName" TEXT NOT NULL,
        "expiresAt" TIMESTAMPTZ NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "examToken" (
        id TEXT PRIMARY KEY,
        token TEXT UNIQUE NOT NULL,
        "sessionName" TEXT NOT NULL,
        "expiresAt" TIMESTAMPTZ NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log('   ✓ Table "ExamToken" / "examToken" created/verified');

    // 4. Create Semester table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Semester" (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        "academicYear" TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'GANJIL',
        "startDate" TIMESTAMPTZ NOT NULL,
        "endDate" TIMESTAMPTZ NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT false,
        description TEXT,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "semester" (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        "academicYear" TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'GANJIL',
        "startDate" TIMESTAMPTZ NOT NULL,
        "endDate" TIMESTAMPTZ NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT false,
        description TEXT,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log('   ✓ Table "Semester" / "semester" created/verified');

    // 5. Create Question table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Question" (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        category TEXT NOT NULL,
        "educationLevel" TEXT NOT NULL DEFAULT 'SEMUA',
        difficulty TEXT NOT NULL DEFAULT 'SEDANG',
        status TEXT NOT NULL DEFAULT 'AKTIF',
        options TEXT,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "question" (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        category TEXT NOT NULL,
        "educationLevel" TEXT NOT NULL DEFAULT 'SEMUA',
        difficulty TEXT NOT NULL DEFAULT 'SEDANG',
        status TEXT NOT NULL DEFAULT 'AKTIF',
        options TEXT,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(`ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "educationLevel" TEXT DEFAULT 'SEMUA';`);
    await pool.query(`ALTER TABLE "question" ADD COLUMN IF NOT EXISTS "educationLevel" TEXT DEFAULT 'SEMUA';`);
    console.log('   ✓ Table "Question" / "question" created/verified');

    // 6. Create Subject table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Subject" (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        "educationLevel" TEXT NOT NULL DEFAULT 'SEMUA',
        category TEXT NOT NULL DEFAULT 'Umum',
        "gradeLevel" TEXT DEFAULT 'Semua',
        "passingGrade" DOUBLE PRECISION NOT NULL DEFAULT 75.0,
        description TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "subject" (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        "educationLevel" TEXT NOT NULL DEFAULT 'SEMUA',
        category TEXT NOT NULL DEFAULT 'Umum',
        "gradeLevel" TEXT DEFAULT 'Semua',
        "passingGrade" DOUBLE PRECISION NOT NULL DEFAULT 75.0,
        description TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(`ALTER TABLE "Subject" ADD COLUMN IF NOT EXISTS "educationLevel" TEXT DEFAULT 'SEMUA';`);
    await pool.query(`ALTER TABLE "subject" ADD COLUMN IF NOT EXISTS "educationLevel" TEXT DEFAULT 'SEMUA';`);
    console.log('   ✓ Table "Subject" / "subject" created/verified');

    // 7. Create ClassGroup table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "ClassGroup" (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        "educationLevel" TEXT NOT NULL DEFAULT 'MA',
        "gradeLevel" TEXT NOT NULL,
        major TEXT,
        "academicYear" TEXT NOT NULL DEFAULT '2024/2025',
        capacity INTEGER NOT NULL DEFAULT 36,
        "homeTeacherName" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "classGroup" (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        "educationLevel" TEXT NOT NULL DEFAULT 'MA',
        "gradeLevel" TEXT NOT NULL,
        major TEXT,
        "academicYear" TEXT NOT NULL DEFAULT '2024/2025',
        capacity INTEGER NOT NULL DEFAULT 36,
        "homeTeacherName" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(`ALTER TABLE "ClassGroup" ADD COLUMN IF NOT EXISTS "educationLevel" TEXT DEFAULT 'MA';`);
    await pool.query(`ALTER TABLE "classGroup" ADD COLUMN IF NOT EXISTS "educationLevel" TEXT DEFAULT 'MA';`);
    console.log('   ✓ Table "ClassGroup" / "classGroup" created/verified');

    // Seed Staff Users for RBAC
    const staffUsers = [
      {
        id: 'usr-proctor-01',
        nip: '198402122008011004',
        name: 'Drs. H. Mulyono',
        email: 'mulyono@cbt-app.sch.id',
        password: 'password123',
        role: 'PROCTOR',
        labAllocation: 'Lab CBT-08',
      },
      {
        id: 'usr-proctor-02',
        nip: '199005152015031002',
        name: 'Siti Aminah, S.Kom',
        email: 'siti.aminah@cbt-app.sch.id',
        password: 'password123',
        role: 'TEACHER',
        labAllocation: 'Lab CAT-01',
      },
      {
        id: 'usr-admin-01',
        nip: '197508202000031001',
        name: 'Administrator CBT',
        email: 'admin@cbt-app.sch.id',
        password: 'adminpassword',
        role: 'ADMIN',
        labAllocation: 'Pusat Kontrol Utama',
      },
    ];

    for (const u of staffUsers) {
      for (const table of ['User', 'user']) {
        await pool.query(
          `INSERT INTO "${table}" (id, nip, name, email, password, role, "labAllocation", "isActive", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())
           ON CONFLICT (nip) DO UPDATE 
           SET role = EXCLUDED.role, name = EXCLUDED.name, email = EXCLUDED.email, password = EXCLUDED.password, "labAllocation" = EXCLUDED."labAllocation";`,
          [u.id, u.nip, u.name, u.email, u.password, u.role, u.labAllocation]
        );
      }
      console.log(`   ✓ Staff user synced: ${u.name} (${u.nip}) -> PERAN: [${u.role}]`);
    }

    // Seed Students
    const students = [
      { id: 'std-2025-001', nisn: '25-3101-0982-014', name: 'Budi Santoso', dateOfBirth: '2007-04-18T00:00:00.000Z', classGroup: 'XII MIPA 1' },
      { id: 'std-2025-002', nisn: '25-3101-0982-015', name: 'Siti Rahmawati', dateOfBirth: '2007-08-22T00:00:00.000Z', classGroup: 'XII MIPA 2' },
      { id: 'std-2025-003', nisn: '25-3101-0982-016', name: 'Ahmad Fauzi', dateOfBirth: '2007-02-10T00:00:00.000Z', classGroup: 'XII IPS 1' },
    ];

    for (const s of students) {
      for (const table of ['Student', 'student']) {
        await pool.query(
          `INSERT INTO "${table}" (id, nisn, name, "dateOfBirth", "classGroup", "isActive", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
           ON CONFLICT (nisn) DO NOTHING;`,
          [s.id, s.nisn, s.name, s.dateOfBirth, s.classGroup]
        );
      }
      console.log(`   ✓ Student synced: ${s.name} (${s.nisn})`);
    }

    // Seed Tokens
    const tokens = [
      { id: 'token-01', token: 'XK9PW2', sessionName: 'Sesi 1: Tes Potensi Skolastik (TPS) & Literasi', expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'token-02', token: 'UTBK25', sessionName: 'Sesi 2: Penalaran Matematika & Literasi Bahasa', expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
    ];

    for (const t of tokens) {
      for (const table of ['ExamToken', 'examToken']) {
        await pool.query(
          `INSERT INTO "${table}" (id, token, "sessionName", "expiresAt", "isActive", "createdAt")
           VALUES ($1, $2, $3, $4, true, NOW())
           ON CONFLICT (token) DO NOTHING;`,
          [t.id, t.token, t.sessionName, t.expiresAt]
        );
      }
      console.log(`   ✓ Token synced: ${t.token}`);
    }

    // Seed Semesters
    const semesters = [
      { id: 'sem-2024-1', code: '2024/2025-1', name: 'Semester Ganjil 2024/2025', academicYear: '2024/2025', type: 'GANJIL', startDate: '2024-07-15T00:00:00.000Z', endDate: '2024-12-20T00:00:00.000Z', isActive: true, description: 'Semester Ganjil 2024/2025' },
    ];

    for (const sem of semesters) {
      for (const table of ['Semester', 'semester']) {
        await pool.query(
          `INSERT INTO "${table}" (id, code, name, "academicYear", type, "startDate", "endDate", "isActive", description, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
           ON CONFLICT (code) DO NOTHING;`,
          [sem.id, sem.code, sem.name, sem.academicYear, sem.type, sem.startDate, sem.endDate, sem.isActive, sem.description]
        );
      }
      console.log(`   ✓ Semester synced: ${sem.name}`);
    }

    // Seed Questions
    const questions = [
      { id: 'Q-1042', text: 'Berdasarkan paragraf ke-2, apa simpulan yang paling tepat mengenai korelasi antara pertumbuhan ekonomi dan konsumsi energi fosil?', category: 'Penalaran Umum', difficulty: 'SULIT', status: 'AKTIF', options: JSON.stringify([{ id: 'A', text: 'PDB' }]) },
      { id: 'Q-1043', text: 'Jika x = 5 dan y = 12, maka nilai dari akar kuadrat (x^2 + y^2) adalah...', category: 'Pengetahuan Kuantitatif', difficulty: 'SEDANG', status: 'AKTIF', options: JSON.stringify([{ id: 'A', text: '13' }]) },
    ];

    for (const q of questions) {
      for (const table of ['Question', 'question']) {
        await pool.query(
          `INSERT INTO "${table}" (id, text, category, difficulty, status, options, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
           ON CONFLICT (id) DO NOTHING;`,
          [q.id, q.text, q.category, q.difficulty, q.status, q.options]
        );
      }
      console.log(`   ✓ Question synced: ${q.id}`);
    }

    // Seed Subjects (Mata Pelajaran) for MI, MTS, MA, and SEMUA
    const subjects = [
      // MI (Madrasah Ibtidaiyah)
      { id: 'subj-mi-01', code: 'QH-MI', name: "Al-Qur'an Hadis MI", educationLevel: 'MI', category: 'PAI & Bahasa Arab', gradeLevel: 'Semua', passingGrade: 75.0, description: "Al-Qur'an Hadis Madrasah Ibtidaiyah (KMA 183)" },
      { id: 'subj-mi-02', code: 'AA-MI', name: 'Akidah Akhlak MI', educationLevel: 'MI', category: 'PAI & Bahasa Arab', gradeLevel: 'Semua', passingGrade: 75.0, description: 'Akidah Akhlak Madrasah Ibtidaiyah' },
      { id: 'subj-mi-03', code: 'FIK-MI', name: 'Fikih MI', educationLevel: 'MI', category: 'PAI & Bahasa Arab', gradeLevel: 'Semua', passingGrade: 75.0, description: 'Fikih Ibadah Madrasah Ibtidaiyah' },
      { id: 'subj-mi-04', code: 'SKI-MI', name: 'Sejarah Kebudayaan Islam MI', educationLevel: 'MI', category: 'PAI & Bahasa Arab', gradeLevel: '4', passingGrade: 75.0, description: 'SKI Madrasah Ibtidaiyah Kelas 3-6' },
      { id: 'subj-mi-05', code: 'ARB-MI', name: 'Bahasa Arab MI', educationLevel: 'MI', category: 'PAI & Bahasa Arab', gradeLevel: 'Semua', passingGrade: 75.0, description: 'Bahasa Arab Dasar Madrasah Ibtidaiyah' },
      { id: 'subj-mi-06', code: 'IPAS-MI', name: 'IPAS Terpadu MI', educationLevel: 'MI', category: 'Wajib Umum', gradeLevel: '4', passingGrade: 75.0, description: 'Ilmu Pengetahuan Alam dan Sosial Kurikulum Merdeka MI' },
      { id: 'subj-mi-07', code: 'MAT-MI', name: 'Matematika MI', educationLevel: 'MI', category: 'Wajib Umum', gradeLevel: 'Semua', passingGrade: 75.0, description: 'Matematika Dasar Madrasah Ibtidaiyah' },
      { id: 'subj-mi-08', code: 'BIND-MI', name: 'Bahasa Indonesia MI', educationLevel: 'MI', category: 'Wajib Umum', gradeLevel: 'Semua', passingGrade: 75.0, description: 'Bahasa Indonesia Literasi Madrasah Ibtidaiyah' },

      // MTS (Madrasah Tsanawiyah)
      { id: 'subj-mts-01', code: 'QH-MTS', name: "Al-Qur'an Hadis MTs", educationLevel: 'MTS', category: 'PAI & Bahasa Arab', gradeLevel: 'Semua', passingGrade: 75.0, description: "Al-Qur'an Hadis Madrasah Tsanawiyah (KMA 183)" },
      { id: 'subj-mts-02', code: 'AA-MTS', name: 'Akidah Akhlak MTs', educationLevel: 'MTS', category: 'PAI & Bahasa Arab', gradeLevel: 'Semua', passingGrade: 75.0, description: 'Akidah Akhlak Madrasah Tsanawiyah' },
      { id: 'subj-mts-03', code: 'FIK-MTS', name: 'Fikih MTs', educationLevel: 'MTS', category: 'PAI & Bahasa Arab', gradeLevel: 'Semua', passingGrade: 75.0, description: 'Fikih Muamalah & Syariah Madrasah Tsanawiyah' },
      { id: 'subj-mts-04', code: 'SKI-MTS', name: 'Sejarah Kebudayaan Islam MTs', educationLevel: 'MTS', category: 'PAI & Bahasa Arab', gradeLevel: 'Semua', passingGrade: 75.0, description: 'SKI Peradaban Islam Madrasah Tsanawiyah' },
      { id: 'subj-mts-05', code: 'ARB-MTS', name: 'Bahasa Arab MTs', educationLevel: 'MTS', category: 'PAI & Bahasa Arab', gradeLevel: 'Semua', passingGrade: 75.0, description: 'Bahasa Arab Komunikatif Madrasah Tsanawiyah' },
      { id: 'subj-mts-06', code: 'IPA-MTS', name: 'IPA Terpadu MTs', educationLevel: 'MTS', category: 'Wajib Umum', gradeLevel: 'Semua', passingGrade: 75.0, description: 'IPA Fisika, Biologi, dan Kimia MTs' },
      { id: 'subj-mts-07', code: 'IPS-MTS', name: 'IPS Terpadu MTs', educationLevel: 'MTS', category: 'Wajib Umum', gradeLevel: 'Semua', passingGrade: 75.0, description: 'IPS Geografi, Sejarah, Ekonomi, Sosiologi MTs' },
      { id: 'subj-mts-08', code: 'MAT-MTS', name: 'Matematika MTs', educationLevel: 'MTS', category: 'Wajib Umum', gradeLevel: 'Semua', passingGrade: 75.0, description: 'Matematika Aljabar dan Geometri MTs' },
      { id: 'subj-mts-09', code: 'BING-MTS', name: 'Bahasa Inggris MTs', educationLevel: 'MTS', category: 'Wajib Umum', gradeLevel: 'Semua', passingGrade: 75.0, description: 'Bahasa Inggris Grammar & Reading MTs' },

      // MA (Madrasah Aliyah)
      { id: 'subj-ma-01', code: 'QH-MA', name: "Al-Qur'an Hadis MA", educationLevel: 'MA', category: 'PAI & Bahasa Arab', gradeLevel: 'Semua', passingGrade: 75.0, description: "Al-Qur'an Hadis Madrasah Aliyah (KMA 183)" },
      { id: 'subj-ma-02', code: 'AA-MA', name: 'Akidah Akhlak MA', educationLevel: 'MA', category: 'PAI & Bahasa Arab', gradeLevel: 'Semua', passingGrade: 75.0, description: 'Akidah Akhlak Madrasah Aliyah' },
      { id: 'subj-ma-03', code: 'FIK-MA', name: 'Fikih MA', educationLevel: 'MA', category: 'PAI & Bahasa Arab', gradeLevel: 'Semua', passingGrade: 75.0, description: 'Fikih & Jinayah Madrasah Aliyah' },
      { id: 'subj-ma-04', code: 'SKI-MA', name: 'Sejarah Kebudayaan Islam MA', educationLevel: 'MA', category: 'PAI & Bahasa Arab', gradeLevel: 'Semua', passingGrade: 75.0, description: 'SKI Tokoh & Dinasti Madrasah Aliyah' },
      { id: 'subj-ma-05', code: 'ARB-MA', name: 'Bahasa Arab MA', educationLevel: 'MA', category: 'PAI & Bahasa Arab', gradeLevel: 'Semua', passingGrade: 75.0, description: 'Bahasa Arab Lanjutan Madrasah Aliyah' },
      { id: 'subj-ma-06', code: 'USH-MA', name: 'Ushul Fikih', educationLevel: 'MA', category: 'Peminatan Keagamaan', gradeLevel: 'XI', passingGrade: 76.0, description: 'Kaidah Ushul Fikih Peminatan Keagamaan (IIK) MA' },
      { id: 'subj-ma-07', code: 'TAF-MA', name: 'Ilmu Tafsir', educationLevel: 'MA', category: 'Peminatan Keagamaan', gradeLevel: 'XI', passingGrade: 76.0, description: 'Ulumul Qur’an & Ilmu Tafsir Peminatan Keagamaan MA' },
      { id: 'subj-ma-08', code: 'FIS-MA', name: 'Fisika MA', educationLevel: 'MA', category: 'Peminatan MIPA', gradeLevel: 'XI', passingGrade: 75.0, description: 'Fisika Teori & Terapan Peminatan MIPA MA' },
      { id: 'subj-ma-09', code: 'KIM-MA', name: 'Kimia MA', educationLevel: 'MA', category: 'Peminatan MIPA', gradeLevel: 'XI', passingGrade: 75.0, description: 'Kimia Analitik & Organik Peminatan MIPA MA' },
      { id: 'subj-ma-10', code: 'BIO-MA', name: 'Biologi MA', educationLevel: 'MA', category: 'Peminatan MIPA', gradeLevel: 'XI', passingGrade: 75.0, description: 'Biologi Sel, Genetika & Ekologi Peminatan MIPA MA' },
      { id: 'subj-ma-11', code: 'EKO-MA', name: 'Ekonomi MA', educationLevel: 'MA', category: 'Peminatan IPS', gradeLevel: 'XI', passingGrade: 75.0, description: 'Ekonomi Mikro, Makro & Syariah Peminatan IPS MA' },
      { id: 'subj-ma-12', code: 'GEO-MA', name: 'Geografi MA', educationLevel: 'MA', category: 'Peminatan IPS', gradeLevel: 'XI', passingGrade: 75.0, description: 'Geosfer & Pemetaan Peminatan IPS MA' },
      { id: 'subj-ma-13', code: 'SOS-MA', name: 'Sosiologi MA', educationLevel: 'MA', category: 'Peminatan IPS', gradeLevel: 'XI', passingGrade: 75.0, description: 'Sosiologi & Dinamika Sosial Peminatan IPS MA' },
      { id: 'subj-ma-14', code: 'MAT-MA', name: 'Matematika Wajib MA', educationLevel: 'MA', category: 'Wajib Umum', gradeLevel: 'Semua', passingGrade: 75.0, description: 'Matematika Wajib Semua Jurusan MA' },

      // Lintas Jenjang / Skolastik
      { id: 'subj-01', code: 'PU-01', name: 'Penalaran Umum', educationLevel: 'SEMUA', category: 'Literasi & Skolastik', gradeLevel: 'Semua', passingGrade: 75.0, description: 'Tes Potensi Skolastik (TPS) Penalaran Umum Lintas Jenjang' },
      { id: 'subj-02', code: 'PK-01', name: 'Pengetahuan Kuantitatif', educationLevel: 'SEMUA', category: 'Literasi & Skolastik', gradeLevel: 'Semua', passingGrade: 75.0, description: 'TPS Pengetahuan Kuantitatif dan Logika Matematika' },
    ];

    for (const s of subjects) {
      for (const table of ['Subject', 'subject']) {
        await pool.query(
          `INSERT INTO "${table}" (id, code, name, "educationLevel", category, "gradeLevel", "passingGrade", description, "isActive", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW())
           ON CONFLICT (code) DO UPDATE SET "educationLevel" = EXCLUDED."educationLevel", category = EXCLUDED.category, name = EXCLUDED.name;`,
          [s.id, s.code, s.name, s.educationLevel, s.category, s.gradeLevel, s.passingGrade, s.description]
        );
      }
      console.log(`   ✓ Subject synced [${s.educationLevel}]: ${s.name} (${s.code})`);
    }

    // Seed Sample ClassGroups (Rombel) for MI, MTS, and MA
    const classGroups = [
      // MI
      { id: 'cls-mi-01', code: '1-A', name: 'Kelas 1-A Abu Bakar Ash-Shiddiq', educationLevel: 'MI', gradeLevel: '1', major: 'Tematik Umum', academicYear: '2024/2025', capacity: 28, homeTeacherName: 'Fatimah Az-Zahra, S.Pd.I.' },
      { id: 'cls-mi-06', code: '6-A', name: 'Kelas 6-A Umar bin Khattab', educationLevel: 'MI', gradeLevel: '6', major: 'Tematik Umum', academicYear: '2024/2025', capacity: 30, homeTeacherName: 'Ahmad Dahlan, M.Pd.' },

      // MTS
      { id: 'cls-mts-07', code: 'VII-1', name: 'Kelas VII-1 Utsman bin Affan', educationLevel: 'MTS', gradeLevel: 'VII', major: 'Umum', academicYear: '2024/2025', capacity: 32, homeTeacherName: 'H. Masykur, S.Ag.' },
      { id: 'cls-mts-09', code: 'IX-1', name: 'Kelas IX-1 Ali bin Abi Thalib', educationLevel: 'MTS', gradeLevel: 'IX', major: 'Umum', academicYear: '2024/2025', capacity: 32, homeTeacherName: 'Dra. Siti Munawwaroh' },

      // MA
      { id: 'cls-ma-10', code: 'X-MIPA-1', name: 'Kelas X MIPA 1 Imam Al-Ghazali', educationLevel: 'MA', gradeLevel: 'X', major: 'MIPA', academicYear: '2024/2025', capacity: 34, homeTeacherName: 'Drs. H. Mulyono' },
      { id: 'cls-ma-11', code: 'XI-IPS-1', name: 'Kelas XI IPS 1 Ibnu Khaldun', educationLevel: 'MA', gradeLevel: 'XI', major: 'IPS', academicYear: '2024/2025', capacity: 34, homeTeacherName: 'Siti Aminah, S.Kom' },
      { id: 'cls-ma-12', code: 'XII-AGM-1', name: 'Kelas XII Keagamaan Imam Bukhari', educationLevel: 'MA', gradeLevel: 'XII', major: 'Keagamaan', academicYear: '2024/2025', capacity: 30, homeTeacherName: 'K.H. Nuruddin, Lc.' },
    ];

    for (const c of classGroups) {
      for (const table of ['ClassGroup', 'classGroup']) {
        await pool.query(
          `INSERT INTO "${table}" (id, code, name, "educationLevel", "gradeLevel", major, "academicYear", capacity, "homeTeacherName", "isActive", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, NOW(), NOW())
           ON CONFLICT (code) DO UPDATE SET "educationLevel" = EXCLUDED."educationLevel", name = EXCLUDED.name, major = EXCLUDED.major;`,
          [c.id, c.code, c.name, c.educationLevel, c.gradeLevel, c.major, c.academicYear, c.capacity, c.homeTeacherName]
        );
      }
      console.log(`   ✓ ClassGroup synced [${c.educationLevel}]: ${c.name} (${c.code})`);
    }

    console.log('🎉 Database Bootstrapping & Seeding Selesai!');
  } catch (err: any) {
    console.error('❌ Error during bootstrapping:', err?.message || err);
  } finally {
    await pool.end();
  }
}

bootstrap().then(() => process.exit(0));
