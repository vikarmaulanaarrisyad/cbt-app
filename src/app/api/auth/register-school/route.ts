import { NextResponse } from "next/server";
import { addSchool, School, generateInitialClassesForSchool } from "@/lib/school-tenancy";
import { EducationLevel } from "@/lib/education-level";
import { getHomePathForRole } from "@/lib/rbac";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      schoolName,
      educationLevel = "MI",
      npsn,
      nsm,
      city = "Banyumas",
      province = "Jawa Tengah",
      address,
      proctorName,
      nip,
      email,
      password = "password123",
      labAllocation,
    } = body;

    if (!schoolName || !educationLevel || !proctorName || (!nip && !email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama Sekolah, Jenjang Pendidikan, Nama Proktor, dan NIP/Email wajib diisi!",
        },
        { status: 400 }
      );
    }

    const cleanNpsn = (npsn || "").trim() || Math.floor(10000000 + Math.random() * 90000000).toString();
    const slug = schoolName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 20);
    const schoolId = `sch-${slug}-${Date.now().toString().slice(-4)}`;
    const proctorId = `usr-proctor-${Date.now().toString().slice(-6)}`;
    const effectiveLab = labAllocation || `Lab CBT ${schoolName}`;

    const newSchool: School = {
      id: schoolId,
      name: schoolName,
      npsn: cleanNpsn,
      nsm: nsm || cleanNpsn,
      educationLevel: educationLevel.toUpperCase() as EducationLevel,
      city,
      province,
      address: address || `Kabupaten ${city}`,
      contactEmail: email || `${slug}@cbt-app.sch.id`,
      proctorId,
      proctorName,
      labAllocation: effectiveLab,
      createdAt: new Date().toISOString(),
    };

    // 1. Save to schools store
    addSchool(newSchool);

    // 2. Auto-generate starter classes for this school
    const initialClasses = generateInitialClassesForSchool(newSchool);
    if (typeof globalThis !== "undefined") {
      if (!(globalThis as any).globalCustomClasses) {
        (globalThis as any).globalCustomClasses = [];
      }
      (globalThis as any).globalCustomClasses.unshift(...initialClasses);
    }

    // 3. Create active proctor session
    const session = {
      user: {
        id: proctorId,
        nip: (nip || cleanNpsn).trim(),
        name: proctorName,
        email: email || `${slug}@cbt-app.sch.id`,
        role: "PROCTOR",
        labAllocation: effectiveLab,
        educationLevel: newSchool.educationLevel,
        schoolId: newSchool.id,
        schoolName: newSchool.name,
        npsn: newSchool.npsn,
      },
      token: `cbt-proctor-sess-${proctorId}-${Date.now()}`,
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    };

    const redirectUrl = getHomePathForRole("PROCTOR");

    const response = NextResponse.json({
      success: true,
      message: `Sekolah "${newSchool.name}" dan Akun Proktor berhasil didaftarkan!`,
      data: {
        school: newSchool,
        session,
        redirectUrl,
        educationLevel: newSchool.educationLevel,
        schoolId: newSchool.id,
        schoolName: newSchool.name,
      },
    });

    // Set Cookies
    response.cookies.set({
      name: "cbt_session",
      value: JSON.stringify(session),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 12 * 60 * 60,
    });

    response.cookies.set({
      name: "cbt_education_level",
      value: newSchool.educationLevel,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 12 * 60 * 60,
    });

    response.cookies.set({
      name: "cbt_school_id",
      value: newSchool.id,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 12 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("[RegisterSchool] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Terjadi kesalahan saat mendaftarkan sekolah.",
      },
      { status: 500 }
    );
  }
}
