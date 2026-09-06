import { NextResponse } from "next/server";
import { authService } from "@/modules/auth";
import { getHomePathForRole } from "@/lib/rbac";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const role = (body.role || "student").toLowerCase();

    let session;
    let redirectUrl = "/exam";

    if (role === "proctor") {
      session = await authService.authenticateProctor({
        nip: body.nip,
        password: body.password,
        labAllocation: body.labAllocation,
        educationLevel: body.educationLevel || "SEMUA",
      });
      redirectUrl = getHomePathForRole(session.user.role);
    } else {
      session = await authService.authenticateStudent({
        nisn: body.nisn,
        dob: body.dob,
        token: body.token,
        educationLevel: body.educationLevel,
      });
      redirectUrl = "/student/dashboard";
    }

    const effectiveLevel = session.user.educationLevel || body.educationLevel || "SEMUA";

    const response = NextResponse.json({
      success: true,
      message: `Autentikasi ${role === "proctor" ? "Proktor" : "Peserta"} Berhasil`,
      data: {
        ...session,
        redirectUrl,
        educationLevel: effectiveLevel,
      },
    });

    // Set HTTP-Only session cookie
    response.cookies.set({
      name: "cbt_session",
      value: JSON.stringify(session),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: role === "proctor" ? 12 * 60 * 60 : 4 * 60 * 60,
    });

    // Set accessible educationLevel cookie
    response.cookies.set({
      name: "cbt_education_level",
      value: effectiveLevel,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: role === "proctor" ? 12 * 60 * 60 : 4 * 60 * 60,
    });

    if ((session.user as any).schoolId) {
      response.cookies.set({
        name: "cbt_school_id",
        value: (session.user as any).schoolId,
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: role === "proctor" ? 12 * 60 * 60 : 4 * 60 * 60,
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Gagal melakukan autentikasi login",
      },
      { status: 400 }
    );
  }
}
