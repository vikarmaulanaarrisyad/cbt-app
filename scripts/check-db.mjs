import 'dotenv/config';
import pg from 'pg';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pgPool = new pg.Pool({ connectionString });

async function checkDetails() {
  try {
    const schools = await pgPool.query('SELECT id, name, npsn, "educationLevel" FROM "School";');
    console.log('=== SCHOOLS in DB ===\n', schools.rows);

    const users = await pgPool.query('SELECT id, nip, name, "educationLevel", "schoolId", "schoolName" FROM "User";');
    console.log('=== USERS in DB ===\n', users.rows);

    const classes = await pgPool.query('SELECT id, code, name, "educationLevel", "schoolId" FROM "ClassGroup";');
    console.log('=== CLASSES in DB ===\n', classes.rows);

    const students = await pgPool.query('SELECT id, nisn, name, "educationLevel", "schoolId" FROM "Student";');
    console.log('=== STUDENTS in DB ===\n', students.rows);

    const questions = await pgPool.query('SELECT id, text, category, "educationLevel" FROM "Question";');
    console.log('=== QUESTIONS in DB ===\n', questions.rows);

    const subjects = await pgPool.query('SELECT code, name, "educationLevel" FROM "Subject" WHERE "educationLevel" = \'MI\' OR "educationLevel" = \'SEMUA\';');
    console.log('=== MI & SEMUA SUBJECTS in DB ===\n', subjects.rows.length, 'subjects found');

    const logs = await pgPool.query('SELECT id, "schoolId", "studentName", "eventType", "severity" FROM "IntegrityLog";');
    console.log('=== INTEGRITY LOGS in DB ===\n', logs.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pgPool.end();
  }
}

checkDetails();
