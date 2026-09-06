const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('USERS:', users.map(u => ({
    username: u.username,
    name: u.name,
    role: u.role,
    schoolName: u.schoolName,
    npsn: u.npsn,
    labAllocation: u.labAllocation,
    educationLevel: u.educationLevel
  })));
}

main().finally(() => prisma.$disconnect());
