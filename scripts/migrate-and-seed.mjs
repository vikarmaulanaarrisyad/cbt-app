import 'dotenv/config';
import pg from 'pg';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });

async function run() {
  console.log('🚀 Starting Database Migration and Multi-Tenant Seed for CBT App...');
  const client = await pool.connect();

  try {
    // 1. DDL: Create and Alter Tables
    console.log('📦 Applying DDL Schema updates...');

    // School table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "School" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "npsn" TEXT NOT NULL UNIQUE,
        "nsm" TEXT,
        "educationLevel" TEXT NOT NULL,
        "city" TEXT NOT NULL,
        "province" TEXT NOT NULL,
        "address" TEXT,
        "contactEmail" TEXT NOT NULL,
        "contactPhone" TEXT,
        "proctorId" TEXT,
        "proctorName" TEXT,
        "labAllocation" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // IntegrityLog table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "IntegrityLog" (
        "id" TEXT PRIMARY KEY,
        "schoolId" TEXT,
        "nisn" TEXT NOT NULL,
        "studentName" TEXT NOT NULL,
        "classGroup" TEXT NOT NULL,
        "workstation" TEXT NOT NULL,
        "ipAddress" TEXT NOT NULL,
        "eventType" TEXT NOT NULL,
        "severity" TEXT NOT NULL DEFAULT 'WARNING',
        "description" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'UNRESOLVED',
        "notes" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Add multi-tenant columns to User
    await client.query(`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "schoolId" TEXT,
      ADD COLUMN IF NOT EXISTS "schoolName" TEXT,
      ADD COLUMN IF NOT EXISTS "educationLevel" TEXT DEFAULT 'SEMUA',
      ADD COLUMN IF NOT EXISTS "npsn" TEXT;
    `);

    // Add multi-tenant columns to Student
    await client.query(`
      ALTER TABLE "Student" 
      ADD COLUMN IF NOT EXISTS "schoolId" TEXT,
      ADD COLUMN IF NOT EXISTS "schoolName" TEXT,
      ADD COLUMN IF NOT EXISTS "educationLevel" TEXT DEFAULT 'MA';
    `);

    // Add multi-tenant columns to ClassGroup
    await client.query(`
      ALTER TABLE "ClassGroup" 
      ADD COLUMN IF NOT EXISTS "schoolId" TEXT,
      ADD COLUMN IF NOT EXISTS "schoolName" TEXT;
    `);

    // Add multi-tenant columns to Subject
    await client.query(`
      ALTER TABLE "Subject" 
      ADD COLUMN IF NOT EXISTS "schoolId" TEXT;
    `);

    // Add multi-tenant columns to Question
    await client.query(`
      ALTER TABLE "Question" 
      ADD COLUMN IF NOT EXISTS "schoolId" TEXT;
    `);

    // Add Composite B-Tree Indexes for 1M Concurrency Optimization
    console.log('⚡ Creating Composite B-Tree Performance Indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS "idx_school_level" ON "School" ("educationLevel");
      CREATE INDEX IF NOT EXISTS "idx_user_school_role" ON "User" ("schoolId", "role", "isActive");
      CREATE INDEX IF NOT EXISTS "idx_student_school_level" ON "Student" ("schoolId", "educationLevel", "isActive");
      CREATE INDEX IF NOT EXISTS "idx_student_nisn_active" ON "Student" ("nisn", "isActive");
      CREATE INDEX IF NOT EXISTS "idx_classgroup_school_level" ON "ClassGroup" ("schoolId", "educationLevel", "isActive");
      CREATE INDEX IF NOT EXISTS "idx_subject_school_level" ON "Subject" ("schoolId", "educationLevel", "isActive");
      CREATE INDEX IF NOT EXISTS "idx_question_school_level" ON "Question" ("schoolId", "educationLevel", "status");
      CREATE INDEX IF NOT EXISTS "idx_integrity_school_created" ON "IntegrityLog" ("schoolId", "createdAt" DESC);
      CREATE INDEX IF NOT EXISTS "idx_integrity_school_status" ON "IntegrityLog" ("schoolId", "status");
    `);

    // 2. Seed Schools
    console.log('🏫 Seeding Preset Schools to PostgreSQL...');
    const schools = [
      {
        id: 'sch-mi-bh01',
        name: 'MI Bustanul Huda 01 Dawuhan',
        npsn: '111233040001',
        nsm: '111233040001',
        educationLevel: 'MI',
        city: 'Banyumas',
        province: 'Jawa Tengah',
        address: "Jl. KH. Hasyim Asy'ari No. 01, Dawuhan",
        contactEmail: 'mi01.dawuhan@bustanulhuda.sch.id',
        contactPhone: '081234567891',
        proctorId: 'usr-proctor-mi01',
        proctorName: 'Ustadz Ahmad Fauzi, S.Pd.I.',
        labAllocation: 'Lab CBT MI 01',
      },
      {
        id: 'sch-mi-bh02',
        name: 'MI Bustanul Huda 02 Dawuhan',
        npsn: '111233040002',
        nsm: '111233040002',
        educationLevel: 'MI',
        city: 'Banyumas',
        province: 'Jawa Tengah',
        address: 'Jl. Pangeran Diponegoro No. 12, Dawuhan',
        contactEmail: 'mi02.dawuhan@bustanulhuda.sch.id',
        contactPhone: '081234567892',
        proctorId: 'usr-proctor-mi02',
        proctorName: 'Ustadzah Siti Fatimah, S.Pd.',
        labAllocation: 'Lab Komputer MI 02',
      },
      {
        id: 'sch-mts-bh',
        name: 'MTS Bustanul Huda Dawuhan',
        npsn: '121233040015',
        nsm: '121233040015',
        educationLevel: 'MTS',
        city: 'Banyumas',
        province: 'Jawa Tengah',
        address: 'Kompleks Ponpes Bustanul Huda, Dawuhan',
        contactEmail: 'mts.dawuhan@bustanulhuda.sch.id',
        contactPhone: '081234567893',
        proctorId: 'usr-proctor-mts',
        proctorName: 'Ustadz Zulkifli, M.Pd.',
        labAllocation: 'Lab CAT MTs Lt. 2',
      },
      {
        id: 'sch-ma-bh',
        name: 'MA Bustanul Huda Dawuhan',
        npsn: '131233040020',
        nsm: '131233040020',
        educationLevel: 'MA',
        city: 'Banyumas',
        province: 'Jawa Tengah',
        address: 'Kompleks Kampus MA Bustanul Huda, Dawuhan',
        contactEmail: 'ma.dawuhan@bustanulhuda.sch.id',
        contactPhone: '081234567894',
        proctorId: 'usr-proctor-ma',
        proctorName: 'Drs. M. Taufik, M.Pd.',
        labAllocation: 'Lab CAT MA-01',
      },
    ];

    for (const s of schools) {
      await client.query(`
        INSERT INTO "School" ("id", "name", "npsn", "nsm", "educationLevel", "city", "province", "address", "contactEmail", "contactPhone", "proctorId", "proctorName", "labAllocation", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
        ON CONFLICT ("npsn") DO UPDATE SET
          "name" = EXCLUDED."name",
          "educationLevel" = EXCLUDED."educationLevel",
          "proctorId" = EXCLUDED."proctorId",
          "proctorName" = EXCLUDED."proctorName",
          "labAllocation" = EXCLUDED."labAllocation",
          "updatedAt" = NOW();
      `, [s.id, s.name, s.npsn, s.nsm, s.educationLevel, s.city, s.province, s.address, s.contactEmail, s.contactPhone, s.proctorId, s.proctorName, s.labAllocation]);
    }

    // 3. Seed Users
    console.log('👤 Seeding Proctors and Users to PostgreSQL...');
    const users = [
      {
        id: 'usr-admin-01',
        nip: '197508202000031001',
        name: 'Administrator CBT Pusat',
        email: 'admin@cbt-app.sch.id',
        password: 'adminpassword',
        role: 'ADMIN',
        labAllocation: 'Pusat Kontrol Utama',
        educationLevel: 'SEMUA',
        schoolId: 'sch-pusat',
        schoolName: 'Pusat CBT Kemenag & Kemendikbudristek',
        npsn: '00000000',
        isActive: true,
      },
      {
        id: 'usr-proctor-mi01',
        nip: '198501012010011001',
        name: 'Ustadz Ahmad Fauzi, S.Pd.I.',
        email: 'proktor.mi01@bustanulhuda.sch.id',
        password: 'password123',
        role: 'PROCTOR',
        labAllocation: 'Lab CBT MI 01',
        educationLevel: 'MI',
        schoolId: 'sch-mi-bh01',
        schoolName: 'MI Bustanul Huda 01 Dawuhan',
        npsn: '111233040001',
        isActive: true,
      },
      {
        id: 'usr-proctor-mi02',
        nip: '198602022011012002',
        name: 'Ustadzah Siti Fatimah, S.Pd.',
        email: 'proktor.mi02@bustanulhuda.sch.id',
        password: 'password123',
        role: 'PROCTOR',
        labAllocation: 'Lab Komputer MI 02',
        educationLevel: 'MI',
        schoolId: 'sch-mi-bh02',
        schoolName: 'MI Bustanul Huda 02 Dawuhan',
        npsn: '111233040002',
        isActive: true,
      },
      {
        id: 'usr-proctor-mts',
        nip: '198804102012011003',
        name: 'Ustadz Zulkifli, M.Pd.',
        email: 'proktor.mts@bustanulhuda.sch.id',
        password: 'password123',
        role: 'PROCTOR',
        labAllocation: 'Lab CAT MTs Lt. 2',
        educationLevel: 'MTS',
        schoolId: 'sch-mts-bh',
        schoolName: 'MTS Bustanul Huda Dawuhan',
        npsn: '121233040015',
        isActive: true,
      },
      {
        id: 'usr-proctor-ma',
        nip: '199005152015031002',
        name: 'Drs. M. Taufik, M.Pd.',
        email: 'proktor.ma@bustanulhuda.sch.id',
        password: 'password123',
        role: 'PROCTOR',
        labAllocation: 'Lab CAT MA-01',
        educationLevel: 'MA',
        schoolId: 'sch-ma-bh',
        schoolName: 'MA Bustanul Huda Dawuhan',
        npsn: '131233040020',
        isActive: true,
      },
      {
        id: 'usr-proctor-01',
        nip: '198402122008011004',
        name: 'Drs. H. Mulyono',
        email: 'mulyono@cbt-app.sch.id',
        password: 'password123',
        role: 'PROCTOR',
        labAllocation: 'Lab CBT MI 01',
        educationLevel: 'MI',
        schoolId: 'sch-mi-bh01',
        schoolName: 'MI Bustanul Huda 01 Dawuhan',
        npsn: '111233040001',
        isActive: true,
      },
    ];

    for (const u of users) {
      await client.query(`
        INSERT INTO "User" ("id", "nip", "name", "email", "password", "role", "labAllocation", "educationLevel", "schoolId", "schoolName", "npsn", "isActive", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
        ON CONFLICT ("nip") DO UPDATE SET
          "name" = EXCLUDED."name",
          "email" = EXCLUDED."email",
          "educationLevel" = EXCLUDED."educationLevel",
          "schoolId" = EXCLUDED."schoolId",
          "schoolName" = EXCLUDED."schoolName",
          "npsn" = EXCLUDED."npsn",
          "labAllocation" = EXCLUDED."labAllocation",
          "updatedAt" = NOW();
      `, [u.id, u.nip, u.name, u.email, u.password, u.role, u.labAllocation, u.educationLevel, u.schoolId, u.schoolName, u.npsn, u.isActive]);
    }

    // 4. Seed ClassGroups
    console.log('📚 Seeding Multi-Tenant Classes/Rombel to PostgreSQL...');
    const classes = [
      // MI 01
      {
        id: 'cls-mi01-001',
        schoolId: 'sch-mi-bh01',
        schoolName: 'MI Bustanul Huda 01 Dawuhan',
        code: '1-A-MI1',
        name: 'Kelas 1-A Ibnu Sina (MI 01)',
        educationLevel: 'MI',
        gradeLevel: '1',
        major: 'Tematik Umum',
        academicYear: '2024/2025',
        capacity: 28,
        homeTeacherName: 'Ustadzah Khadijah, S.Pd.',
        isActive: true,
      },
      {
        id: 'cls-mi01-002',
        schoolId: 'sch-mi-bh01',
        schoolName: 'MI Bustanul Huda 01 Dawuhan',
        code: '3-B-MI1',
        name: 'Kelas 3-B Al-Khawarizmi (MI 01)',
        educationLevel: 'MI',
        gradeLevel: '3',
        major: 'Tematik Umum',
        academicYear: '2024/2025',
        capacity: 30,
        homeTeacherName: 'Ahmad Dahlan, S.Pd.',
        isActive: true,
      },
      {
        id: 'cls-mi01-003',
        schoolId: 'sch-mi-bh01',
        schoolName: 'MI Bustanul Huda 01 Dawuhan',
        code: '6-A-MI1',
        name: 'Kelas 6-A Al-Farabi (MI 01)',
        educationLevel: 'MI',
        gradeLevel: '6',
        major: 'Tematik Umum',
        academicYear: '2024/2025',
        capacity: 32,
        homeTeacherName: 'Nurul Hidayati, M.Pd.',
        isActive: true,
      },
      // MI 02
      {
        id: 'cls-mi02-001',
        schoolId: 'sch-mi-bh02',
        schoolName: 'MI Bustanul Huda 02 Dawuhan',
        code: '1-B-MI2',
        name: 'Kelas 1-B Imam Bukhari (MI 02)',
        educationLevel: 'MI',
        gradeLevel: '1',
        major: 'Tematik Umum',
        academicYear: '2024/2025',
        capacity: 28,
        homeTeacherName: 'Ustadzah Siti Fatimah, S.Pd.',
        isActive: true,
      },
      {
        id: 'cls-mi02-002',
        schoolId: 'sch-mi-bh02',
        schoolName: 'MI Bustanul Huda 02 Dawuhan',
        code: '4-A-MI2',
        name: 'Kelas 4-A Imam Muslim (MI 02)',
        educationLevel: 'MI',
        gradeLevel: '4',
        major: 'Tematik Umum',
        academicYear: '2024/2025',
        capacity: 30,
        homeTeacherName: 'Ustadz Hasanuddin, S.Ag.',
        isActive: true,
      },
      {
        id: 'cls-mi02-003',
        schoolId: 'sch-mi-bh02',
        schoolName: 'MI Bustanul Huda 02 Dawuhan',
        code: '6-B-MI2',
        name: 'Kelas 6-B Ibnu Rusyd (MI 02)',
        educationLevel: 'MI',
        gradeLevel: '6',
        major: 'Tematik Umum',
        academicYear: '2024/2025',
        capacity: 30,
        homeTeacherName: 'Zainab Maulida, S.Pd.I.',
        isActive: true,
      },
      // MTS
      {
        id: 'cls-mts-001',
        schoolId: 'sch-mts-bh',
        schoolName: 'MTS Bustanul Huda Dawuhan',
        code: 'VII-1',
        name: 'Kelas VII-1 Tsanawiyah Unggulan',
        educationLevel: 'MTS',
        gradeLevel: 'VII',
        major: 'Umum',
        academicYear: '2024/2025',
        capacity: 32,
        homeTeacherName: 'Drs. H. Mahrus, M.Ag.',
        isActive: true,
      },
      {
        id: 'cls-mts-002',
        schoolId: 'sch-mts-bh',
        schoolName: 'MTS Bustanul Huda Dawuhan',
        code: 'VIII-2',
        name: 'Kelas VIII-2 Tsanawiyah Tahfidz',
        educationLevel: 'MTS',
        gradeLevel: 'VIII',
        major: 'Tahfidz',
        academicYear: '2024/2025',
        capacity: 30,
        homeTeacherName: 'Ustadz Zulkifli, Al-Hafidz',
        isActive: true,
      },
      // MA
      {
        id: 'cls-ma-001',
        schoolId: 'sch-ma-bh',
        schoolName: 'MA Bustanul Huda Dawuhan',
        code: 'X-RPL-1',
        name: 'Kelas X Rekayasa Perangkat Lunak 1',
        educationLevel: 'MA',
        gradeLevel: 'X',
        major: 'RPL',
        academicYear: '2024/2025',
        capacity: 36,
        homeTeacherName: 'Drs. M. Taufik, M.Pd.',
        isActive: true,
      },
      {
        id: 'cls-ma-002',
        schoolId: 'sch-ma-bh',
        schoolName: 'MA Bustanul Huda Dawuhan',
        code: 'XI-IPA-1',
        name: 'Kelas XI Matematika & Ilmu Alam 1',
        educationLevel: 'MA',
        gradeLevel: 'XI',
        major: 'MIPA',
        academicYear: '2024/2025',
        capacity: 36,
        homeTeacherName: 'Dr. Endang Supratman',
        isActive: true,
      },
    ];

    for (const c of classes) {
      await client.query(`
        INSERT INTO "ClassGroup" ("id", "code", "name", "educationLevel", "gradeLevel", "major", "academicYear", "capacity", "homeTeacherName", "schoolId", "schoolName", "isActive", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
        ON CONFLICT ("code") DO UPDATE SET
          "name" = EXCLUDED."name",
          "educationLevel" = EXCLUDED."educationLevel",
          "schoolId" = EXCLUDED."schoolId",
          "schoolName" = EXCLUDED."schoolName",
          "updatedAt" = NOW();
      `, [c.id, c.code, c.name, c.educationLevel, c.gradeLevel, c.major, c.academicYear, c.capacity, c.homeTeacherName, c.schoolId, c.schoolName, c.isActive]);
    }

    // 5. Seed Students
    console.log('🎓 Seeding Students partitioned by School to PostgreSQL...');
    const students = [
      // MI 01
      {
        id: 'std-mi01-001',
        nisn: '25-3101-0982-101',
        name: 'Fathir Muhammad',
        dateOfBirth: '2012-05-14',
        classGroup: 'Kelas 6-A Al-Farabi (MI 01)',
        educationLevel: 'MI',
        schoolId: 'sch-mi-bh01',
        schoolName: 'MI Bustanul Huda 01 Dawuhan',
        isActive: true,
      },
      {
        id: 'std-mi01-002',
        nisn: '25-3101-0982-102',
        name: 'Aisyah Nur Aini',
        dateOfBirth: '2012-08-20',
        classGroup: 'Kelas 6-A Al-Farabi (MI 01)',
        educationLevel: 'MI',
        schoolId: 'sch-mi-bh01',
        schoolName: 'MI Bustanul Huda 01 Dawuhan',
        isActive: true,
      },
      {
        id: 'std-mi01-003',
        nisn: '25-3101-0982-103',
        name: 'Bilal Al-Habasyi',
        dateOfBirth: '2014-02-11',
        classGroup: 'Kelas 3-B Al-Khawarizmi (MI 01)',
        educationLevel: 'MI',
        schoolId: 'sch-mi-bh01',
        schoolName: 'MI Bustanul Huda 01 Dawuhan',
        isActive: true,
      },
      // MI 02
      {
        id: 'std-mi02-001',
        nisn: '25-3101-0982-104',
        name: 'Zaid bin Tsabit',
        dateOfBirth: '2012-04-10',
        classGroup: 'Kelas 6-B Ibnu Rusyd (MI 02)',
        educationLevel: 'MI',
        schoolId: 'sch-mi-bh02',
        schoolName: 'MI Bustanul Huda 02 Dawuhan',
        isActive: true,
      },
      // MTS
      {
        id: 'std-mts-001',
        nisn: '25-3101-0982-201',
        name: 'Naufal Hadi',
        dateOfBirth: '2009-11-20',
        classGroup: 'Kelas VII-1 Tsanawiyah Unggulan',
        educationLevel: 'MTS',
        schoolId: 'sch-mts-bh',
        schoolName: 'MTS Bustanul Huda Dawuhan',
        isActive: true,
      },
      // MA
      {
        id: 'std-ma-001',
        nisn: '25-3101-0982-014',
        name: 'Budi Santoso',
        dateOfBirth: '2007-04-18',
        classGroup: 'Kelas XI Matematika & Ilmu Alam 1',
        educationLevel: 'MA',
        schoolId: 'sch-ma-bh',
        schoolName: 'MA Bustanul Huda Dawuhan',
        isActive: true,
      },
    ];

    for (const st of students) {
      await client.query(`
        INSERT INTO "Student" ("id", "nisn", "name", "dateOfBirth", "classGroup", "educationLevel", "schoolId", "schoolName", "isActive", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        ON CONFLICT ("nisn") DO UPDATE SET
          "name" = EXCLUDED."name",
          "classGroup" = EXCLUDED."classGroup",
          "educationLevel" = EXCLUDED."educationLevel",
          "schoolId" = EXCLUDED."schoolId",
          "schoolName" = EXCLUDED."schoolName",
          "updatedAt" = NOW();
      `, [st.id, st.nisn, st.name, new Date(st.dateOfBirth), st.classGroup, st.educationLevel, st.schoolId, st.schoolName, st.isActive]);
    }

    // 6. Seed Questions
    console.log('📝 Seeding Questions for MI, MTS, MA, and SEMUA to PostgreSQL...');
    const questions = [
      {
        id: 'Q-MI-101',
        text: 'Rukun Iman yang ketiga bagi umat Islam adalah beriman kepada...',
        category: 'Akidah Akhlak',
        educationLevel: 'MI',
        difficulty: 'MUDAH',
        status: 'AKTIF',
        options: JSON.stringify([
          { id: 'A', text: 'Allah SWT' },
          { id: 'B', text: 'Malaikat-malaikat Allah' },
          { id: 'C', text: 'Kitab-kitab Allah', isCorrect: true },
          { id: 'D', text: 'Rasul-rasul Allah' },
        ]),
      },
      {
        id: 'Q-MI-102',
        text: 'Berapakah hasil dari penjumlahan matematika dasar 135 + 248?',
        category: 'Tematik Matematika',
        educationLevel: 'MI',
        difficulty: 'MUDAH',
        status: 'AKTIF',
        options: JSON.stringify([
          { id: 'A', text: '383', isCorrect: true },
          { id: 'B', text: '373' },
          { id: 'C', text: '393' },
          { id: 'D', text: '403' },
        ]),
      },
      {
        id: 'Q-MI-103',
        text: 'Berapa jumlah rakaat shalat Maghrib dalam ibadah fardhu?',
        category: 'Fikih MI',
        educationLevel: 'MI',
        difficulty: 'MUDAH',
        status: 'AKTIF',
        options: JSON.stringify([
          { id: 'A', text: '2 Rakaat' },
          { id: 'B', text: '3 Rakaat', isCorrect: true },
          { id: 'C', text: '4 Rakaat' },
          { id: 'D', text: '5 Rakaat' },
        ]),
      },
      {
        id: 'Q-MTS-201',
        text: 'Hasil penyederhanaan dari bentuk aljabar 3(2x - 4) + 5x adalah...',
        category: 'Matematika',
        educationLevel: 'MTS',
        difficulty: 'SEDANG',
        status: 'AKTIF',
        options: JSON.stringify([
          { id: 'A', text: '11x - 12', isCorrect: true },
          { id: 'B', text: '11x - 4' },
          { id: 'C', text: '6x - 12' },
          { id: 'D', text: '11x + 12' },
        ]),
      },
      {
        id: 'Q-MA-301',
        text: 'Sebuah mobil bergerak dengan kecepatan awal 10 m/s kemudian mengalami percepatan konstan 2 m/s² selama 5 detik. Jarak yang ditempuh mobil tersebut adalah...',
        category: 'Fisika',
        educationLevel: 'MA',
        difficulty: 'SULIT',
        status: 'AKTIF',
        options: JSON.stringify([
          { id: 'A', text: '50 meter' },
          { id: 'B', text: '75 meter', isCorrect: true },
          { id: 'C', text: '100 meter' },
          { id: 'D', text: '125 meter' },
        ]),
      },
    ];

    for (const q of questions) {
      await client.query(`
        INSERT INTO "Question" ("id", "text", "category", "educationLevel", "difficulty", "status", "options", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        ON CONFLICT ("id") DO UPDATE SET
          "text" = EXCLUDED."text",
          "category" = EXCLUDED."category",
          "educationLevel" = EXCLUDED."educationLevel",
          "options" = EXCLUDED."options",
          "updatedAt" = NOW();
      `, [q.id, q.text, q.category, q.educationLevel, q.difficulty, q.status, q.options]);
    }

    // 7. Seed IntegrityLog
    console.log('🛡️ Seeding Integrity Audit Logs to PostgreSQL...');
    const integrityLogs = [
      {
        id: 'LOG-MI01-001',
        schoolId: 'sch-mi-bh01',
        nisn: '25-3101-0982-101',
        studentName: 'Fathir Muhammad',
        classGroup: 'Kelas 6-A Al-Farabi (MI 01)',
        workstation: 'PC-MI-04',
        ipAddress: '192.168.10.14',
        eventType: 'LOST_FOCUS',
        severity: 'CRITICAL',
        description: 'Membuka tab/aplikasi lain di luar browser ujian (Fokus hilang 12 detik).',
        status: 'UNRESOLVED',
      },
      {
        id: 'LOG-MI01-002',
        schoolId: 'sch-mi-bh01',
        nisn: '25-3101-0982-102',
        studentName: 'Aisyah Nur Aini',
        classGroup: 'Kelas 6-A Al-Farabi (MI 01)',
        workstation: 'PC-MI-08',
        ipAddress: '192.168.10.18',
        eventType: 'SHORTCUT_ATTEMPT',
        severity: 'WARNING',
        description: 'Terdeteksi menekan tombol dilarang (Alt + Tab).',
        status: 'UNRESOLVED',
      },
      {
        id: 'LOG-MI02-001',
        schoolId: 'sch-mi-bh02',
        nisn: '25-3101-0982-104',
        studentName: 'Zaid bin Tsabit',
        classGroup: 'Kelas 6-B Ibnu Rusyd (MI 02)',
        workstation: 'PC-MI2-02',
        ipAddress: '192.168.20.12',
        eventType: 'NETWORK_DROPPED',
        severity: 'WARNING',
        description: 'Koneksi jaringan terputus sementara.',
        status: 'RESOLVED',
        notes: 'Koneksi pulih otomatis.',
      },
    ];

    for (const log of integrityLogs) {
      await client.query(`
        INSERT INTO "IntegrityLog" ("id", "schoolId", "nisn", "studentName", "classGroup", "workstation", "ipAddress", "eventType", "severity", "description", "status", "notes", "createdAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
        ON CONFLICT ("id") DO NOTHING;
      `, [log.id, log.schoolId, log.nisn, log.studentName, log.classGroup, log.workstation, log.ipAddress, log.eventType, log.severity, log.description, log.status, log.notes || null]);
    }

    // Clean legacy unassigned classes & students
    await client.query('DELETE FROM "ClassGroup" WHERE "schoolId" IS NULL;');
    await client.query('DELETE FROM "Student" WHERE "schoolId" IS NULL;');

    console.log('✅ Migration and Multi-Tenant Seeding Successfully Completed!');
  } catch (error) {
    console.error('❌ Error during migration and seeding:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(() => process.exit(1));
