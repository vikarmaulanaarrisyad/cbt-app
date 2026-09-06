import 'dotenv/config';
import { db } from '../src/prisma/db';

async function test() {
  console.log("=== MEMANGGIL SELURUH DATA DARI DATABASE POSTGRESQL SUPABASE ===");

  const semesters = await db.semester.findMany();
  console.log(`\n📅 DATA SEMESTER (${semesters.length} Record):`);
  console.log(semesters);

  const users = await db.user.findMany();
  console.log(`\n👤 DATA USER STAF (${users.length} Record):`);
  console.log(users.map((u: any) => ({ id: u.id, nip: u.nip, name: u.name, email: u.email, role: u.role })));

  const students = await db.student.findMany();
  console.log(`\n🎓 DATA PESERTA UJIAN (${students.length} Record):`);
  console.log(students);

  const tokens = await db.examToken.findMany();
  console.log(`\n🔑 DATA TOKEN SESI (${tokens.length} Record):`);
  console.log(tokens);

  const questions = await db.question.findMany();
  console.log(`\n📝 DATA BANK SOAL (${questions.length} Record):`);
  console.log(questions.map((q: any) => ({ id: q.id, category: q.category, text: q.text })));
}

test().catch(console.error);
