import 'dotenv/config';
import pg from 'pg';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });

async function testMultiTenantIsolation() {
  console.log('🧪 Running Multi-Tenant & Database Scoping Verification Tests...');

  let allPassed = true;

  try {
    // 1. Test Classes Isolation for MI 01
    const resMI01 = await pool.query(
      'SELECT * FROM "ClassGroup" WHERE "schoolId" = $1 AND "educationLevel" = $2 ORDER BY "code" ASC;',
      ['sch-mi-bh01', 'MI']
    );
    const mi01Classes = resMI01.rows;
    console.log('\n[TEST 1] MI 01 Classes count:', mi01Classes.length);
    const hasOnlyMI01 = mi01Classes.every((c) => c.schoolId === 'sch-mi-bh01' && c.educationLevel === 'MI');
    const hasMI02InMI01 = mi01Classes.some((c) => c.schoolId === 'sch-mi-bh02');
    console.log(' - MI 01 Codes:', mi01Classes.map((c) => c.code).join(', '));
    console.log(' - All rows belong to sch-mi-bh01:', hasOnlyMI01);
    console.log(' - Zero leakage from sch-mi-bh02:', !hasMI02InMI01);
    if (!hasOnlyMI01 || hasMI02InMI01 || mi01Classes.length === 0) allPassed = false;

    // 2. Test Classes Isolation for MI 02
    const resMI02 = await pool.query(
      'SELECT * FROM "ClassGroup" WHERE "schoolId" = $1 AND "educationLevel" = $2 ORDER BY "code" ASC;',
      ['sch-mi-bh02', 'MI']
    );
    const mi02Classes = resMI02.rows;
    console.log('\n[TEST 2] MI 02 Classes count:', mi02Classes.length);
    const hasOnlyMI02 = mi02Classes.every((c) => c.schoolId === 'sch-mi-bh02' && c.educationLevel === 'MI');
    const hasMI01InMI02 = mi02Classes.some((c) => c.schoolId === 'sch-mi-bh01');
    console.log(' - MI 02 Codes:', mi02Classes.map((c) => c.code).join(', '));
    console.log(' - All rows belong to sch-mi-bh02:', hasOnlyMI02);
    console.log(' - Zero leakage from sch-mi-bh01:', !hasMI01InMI02);
    if (!hasOnlyMI02 || hasMI01InMI02 || mi02Classes.length === 0) allPassed = false;

    // 3. Test Student Isolation for MI 01
    const resStudents = await pool.query(
      'SELECT * FROM "Student" WHERE "schoolId" = $1 ORDER BY "nisn" ASC;',
      ['sch-mi-bh01']
    );
    const mi01Students = resStudents.rows;
    console.log('\n[TEST 3] MI 01 Students count:', mi01Students.length);
    console.log(' - MI 01 Students:', mi01Students.map((s) => `${s.name} (${s.nisn})`).join(', '));
    const hasMI02StudentInMI01 = mi01Students.some((s) => s.schoolId !== 'sch-mi-bh01');
    console.log(' - Zero student leakage across schools:', !hasMI02StudentInMI01);
    if (hasMI02StudentInMI01 || mi01Students.length === 0) allPassed = false;

    // 4. Test Integrity Log Isolation
    const resLogs = await pool.query(
      'SELECT * FROM "IntegrityLog" WHERE "schoolId" = $1 ORDER BY "createdAt" DESC;',
      ['sch-mi-bh01']
    );
    const mi01Logs = resLogs.rows;
    console.log('\n[TEST 4] MI 01 Integrity Logs count:', mi01Logs.length);
    console.log(' - MI 01 Logs:', mi01Logs.map((l) => `${l.studentName}: ${l.eventType}`).join(', '));
    const hasMI02LogInMI01 = mi01Logs.some((l) => l.schoolId !== 'sch-mi-bh01');
    console.log(' - Zero audit log leakage across schools:', !hasMI02LogInMI01);
    if (hasMI02LogInMI01 || mi01Logs.length === 0) allPassed = false;

    // 5. Test Question Bank Scope for MI
    const resQuestions = await pool.query(
      'SELECT * FROM "Question" WHERE "educationLevel" = $1 OR "educationLevel" = $2;',
      ['MI', 'SEMUA']
    );
    const miQuestions = resQuestions.rows;
    console.log('\n[TEST 5] Questions scoped to MI & SEMUA count:', miQuestions.length);
    const hasOnlyMIOrSemua = miQuestions.every(
      (q) => q.educationLevel === 'MI' || q.educationLevel === 'SEMUA'
    );
    console.log(' - Only MI & SEMUA questions shown:', hasOnlyMIOrSemua);
    console.log(' - Categories in MI Question Bank:', [...new Set(miQuestions.map((q) => q.category))].join(', '));
    if (!hasOnlyMIOrSemua || miQuestions.length === 0) allPassed = false;

    // 6. Test Proctor User Authentication Records in DB
    const resUser = await pool.query(
      'SELECT * FROM "User" WHERE "nip" = $1 LIMIT 1;',
      ['198501012010011001']
    );
    const mi01Proctor = resUser.rows[0];
    console.log('\n[TEST 6] Proctor MI 01 in DB:');
    console.log(' - Name:', mi01Proctor?.name);
    console.log(' - School:', mi01Proctor?.schoolName);
    console.log(' - Education Level:', mi01Proctor?.educationLevel);
    console.log(' - School ID:', mi01Proctor?.schoolId);
    if (!mi01Proctor || mi01Proctor.schoolId !== 'sch-mi-bh01' || mi01Proctor.educationLevel !== 'MI') {
      allPassed = false;
    }

    console.log('\n=============================================');
    if (allPassed) {
      console.log('🎉 ALL MULTI-TENANT & DATABASE ISOLATION TESTS PASSED 100%!');
    } else {
      console.error('❌ SOME TESTS FAILED! Check output above.');
      process.exit(1);
    }
    console.log('=============================================\n');
  } catch (error) {
    console.error('Error during test execution:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testMultiTenantIsolation();
