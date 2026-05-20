/**
 * POST /api/auth/logout
 * Clears elevated admin session + signals middleware to skip auth redirects.
 * Supabase auth cookies are cleared via client signOut(); we delete sb-* cookies when present.
 */

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIES } from "@/lib/auth/session-lifecycle";

export const dynamic = "force-dynamic";

function clearCookie(response: NextResponse, name: string) {
  response.cookies.set(name, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function POST() {
  const response = NextResponse.json({ success: true });

  clearCookie(response, AUTH_COOKIES.adminVerified);

  // Tell middleware: do not send user back to /admin on this navigation window
  response.cookies.set(AUTH_COOKIES.logoutInProgress, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60,
  });

  const cookieStore = cookies();
  for (const cookie of cookieStore.getAll()) {
    if (cookie.name.startsWith("sb-") || cookie.name.includes("auth-token")) {
      clearCookie(response, cookie.name);
    }
  }

  return response;
}
