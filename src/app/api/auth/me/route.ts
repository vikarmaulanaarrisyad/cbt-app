import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("cbt_session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { success: false, message: "Tidak ada sesi aktif" },
        { status: 401 }
      );
    }

    const sessionData = JSON.parse(sessionCookie.value);
    return NextResponse.json({
      success: true,
      data: sessionData,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid" },
      { status: 401 }
    );
  }
}
