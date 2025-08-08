import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { adminId, password } = await request.json() || {};

    if (!adminId || !password) {
      return NextResponse.json(
        { success: false, error: "adminId and password are required" },
        { status: 400 }
      );
    }

    const backendUrl = `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/adminauth/login`;
    const resp = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ adminId, password }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      return NextResponse.json(
        { success: false, error: data?.message || "Invalid credentials" },
        { status: resp.status }
      );
    }

    const { token, refreshToken, admin } = data || {};
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Login response missing token" },
        { status: 500 }
      );
    }

    const res = NextResponse.json(
      { success: true, admin: admin || null, message: "Login successful" },
      { status: 200 }
    );

    res.cookies.set("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    if (refreshToken) {
      res.cookies.set("adminRefreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }

    return res;
  } catch (err) {
    console.error("Login proxy error:", err);
    return NextResponse.json(
      { success: false, error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
