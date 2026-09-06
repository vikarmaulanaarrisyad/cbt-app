async function runVerification() {
  console.log('🌐 Starting End-to-End HTTP Session & Multi-Tenant Audit on http://localhost:3000...\n');

  // --- Scenario A: Proctor MI 01 Login ---
  console.log('📌 SCENARIO A: Login as Proctor MI Bustanul Huda 01 Dawuhan (NIP: 198501012010011001)...');
  const loginRes1 = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: 'proctor',
      nip: '198501012010011001',
      password: 'password123',
    }),
  });

  const loginData1 = await loginRes1.json();
  const setCookie1 = loginRes1.headers.get('set-cookie') || '';
  console.log(' - Login Success:', loginData1.success);
  console.log(' - User:', loginData1.data?.user?.name);
  console.log(' - School Name:', loginData1.data?.user?.schoolName);
  console.log(' - School ID:', loginData1.data?.user?.schoolId);
  console.log(' - Education Level:', loginData1.data?.user?.educationLevel);

  // Extract cbt_session cookie
  const sessionMatch1 = setCookie1.match(/cbt_session=([^;]+)/);
  const cookieHeader1 = sessionMatch1 ? `cbt_session=${sessionMatch1[1]}` : '';

  // 1. Check /api/proctor/dashboard-stats for MI 01
  const statsRes1 = await fetch('http://localhost:3000/api/proctor/dashboard-stats', {
    headers: { Cookie: cookieHeader1 },
  });
  const statsData1 = await statsRes1.json();
  console.log('\n📊 [MI 01 Dashboard Stats API]:');
  console.log(' - Target School:', statsData1.data?.schoolName);
  console.log(' - Education Level:', statsData1.data?.educationLevel);
  console.log(' - Total Students in MI 01:', statsData1.data?.totalStudents);
  console.log(' - Active Students in MI 01:', statsData1.data?.activeStudents);
  console.log(' - Students List:', statsData1.data?.studentsList?.map((s) => s.name).join(', '));
  console.log(' - Unresolved Anomalies in MI 01:', statsData1.data?.anomalyCount);

  // 2. Check /api/classes for MI 01
  const classesRes1 = await fetch('http://localhost:3000/api/classes', {
    headers: { Cookie: cookieHeader1 },
  });
  const classesData1 = await classesRes1.json();
  console.log('\n📚 [MI 01 Classes API]:');
  console.log(' - Active School:', classesData1.activeSchool?.name);
  console.log(' - Classes Count:', classesData1.total);
  console.log(' - Classes Codes:', classesData1.data?.map((c) => c.code).join(', '));
  const hasOnlyMI01Classes = classesData1.data?.every((c) => c.schoolId === 'sch-mi-bh01');
  console.log(' - 100% Isolated to MI 01:', hasOnlyMI01Classes);

  // 3. Check /api/proctor/integrity-logs for MI 01
  const logsRes1 = await fetch('http://localhost:3000/api/proctor/integrity-logs', {
    headers: { Cookie: cookieHeader1 },
  });
  const logsData1 = await logsRes1.json();
  console.log('\n🛡️ [MI 01 Integrity Logs API]:');
  console.log(' - Logs Count for MI 01:', logsData1.metrics?.total);
  console.log(' - Students in Logs:', logsData1.data?.map((l) => `${l.studentName} (${l.eventType})`).join(', '));
  const hasOnlyMI01Logs = logsData1.data?.every((l) => l.schoolId === 'sch-mi-bh01');
  console.log(' - 100% Isolated to MI 01:', hasOnlyMI01Logs);

  // --- Scenario B: Proctor MI 02 Login ---
  console.log('\n-----------------------------------------------------------');
  console.log('📌 SCENARIO B: Login as Proctor MI Bustanul Huda 02 Dawuhan (NIP: 198602022011012002)...');
  const loginRes2 = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: 'proctor',
      nip: '198602022011012002',
      password: 'password123',
    }),
  });

  const loginData2 = await loginRes2.json();
  const setCookie2 = loginRes2.headers.get('set-cookie') || '';
  console.log(' - Login Success:', loginData2.success);
  console.log(' - User:', loginData2.data?.user?.name);
  console.log(' - School Name:', loginData2.data?.user?.schoolName);
  console.log(' - School ID:', loginData2.data?.user?.schoolId);

  const sessionMatch2 = setCookie2.match(/cbt_session=([^;]+)/);
  const cookieHeader2 = sessionMatch2 ? `cbt_session=${sessionMatch2[1]}` : '';

  // Check /api/classes for MI 02
  const classesRes2 = await fetch('http://localhost:3000/api/classes', {
    headers: { Cookie: cookieHeader2 },
  });
  const classesData2 = await classesRes2.json();
  console.log('\n📚 [MI 02 Classes API]:');
  console.log(' - Active School:', classesData2.activeSchool?.name);
  console.log(' - Classes Count:', classesData2.total);
  console.log(' - Classes Codes:', classesData2.data?.map((c) => c.code).join(', '));
  const hasOnlyMI02Classes = classesData2.data?.every((c) => c.schoolId === 'sch-mi-bh02');
  console.log(' - 100% Isolated to MI 02:', hasOnlyMI02Classes);
  const hasZeroMI01InMI02 = !classesData2.data?.some((c) => c.schoolId === 'sch-mi-bh01');
  console.log(' - Zero Cross-School Leakage:', hasZeroMI01InMI02);

  console.log('\n===========================================================');
  if (hasOnlyMI01Classes && hasOnlyMI01Logs && hasOnlyMI02Classes && hasZeroMI01InMI02) {
    console.log('✅ ALL SCENARIOS VERIFIED: COMPLETE MULTI-TENANT ISOLATION CONFIRMED!');
  } else {
    console.error('❌ VERIFICATION FAILED! Review details above.');
    process.exit(1);
  }
  console.log('===========================================================\n');
}

runVerification().catch((e) => {
  console.error('Test error:', e);
  process.exit(1);
});
