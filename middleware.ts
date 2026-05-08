import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Routes that require authentication
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/seller",
  "/buyer",
  "/settings",
  "/post-requirement",
  "/onboarding",
  "/notifications",
  "/ops",
]

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ["/login", "/register"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if Supabase env vars exist
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next()
  }

  // Get the session token from cookies
  const accessToken = request.cookies.get("sb-lrfvfvxfjpowskzqebar-auth-token")?.value
    || request.cookies.get("sb-access-token")?.value

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route)

  // If no token and trying to access protected route, redirect to login
  if (isProtected && !accessToken) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/seller/:path*",
    "/buyer/:path*",
    "/settings/:path*",
    "/post-requirement/:path*",
    "/onboarding/:path*",
    "/notifications/:path*",
    "/ops/:path*",
    "/login",
    "/register",
  ],
}
