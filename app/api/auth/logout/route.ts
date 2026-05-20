/**
 * POST /api/auth/logout — Clear elevated admin session cookie (admin 2FA).
 * Supabase session is cleared client-side via signOut().
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set("admin_verified", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
