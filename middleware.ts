import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

// ── Centralized role definitions ──
// These are inlined here because middleware runs in Edge Runtime
// and cannot import from lib/ modules that use Node.js APIs.
const ADMIN_ROLE_SET = new Set([
  'super_admin', 'admin', 'moderator', 'support_agent',
  'supplier_success', 'finance', 'marketing',
])
const OPS_ROLE_SET = new Set([
  'super_admin', 'admin', 'moderator', 'support_agent', 'supplier_success',
])
const REQUIRES_2FA_SET = new Set(['super_admin', 'admin'])

// ═══════════════════════════════════════════════════════
// ROUTE PROTECTION CONFIGURATION
// ═══════════════════════════════════════════════════════

// Routes that require basic authentication
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/seller",
  "/buyer",
  "/settings",
  "/post-requirement",
  "/onboarding",
  "/notifications",
  "/ops",
  "/admin",
]

// Routes requiring admin/super_admin role
const ADMIN_PREFIXES = [
  "/admin",
  "/ops",
]

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ["/login", "/register"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next()
  }

  // Create a mutable response so @supabase/ssr can set/refresh cookies
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        // Write cookies into the mutable response
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  // Refresh the session — this also refreshes expired access tokens
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  const isAdminRoute = ADMIN_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route)

  // ── Unauthenticated → protected route: redirect to login ──
  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Admin/Ops route protection: RBAC enforcement ──
  // Check role from user_metadata first (fast check in middleware)
  // Deep DB-level role check happens in API routes and server components
  if (isAdminRoute && user) {
    const role = user.user_metadata?.role
    const profileRole = user.app_metadata?.role // Supabase app_metadata is more secure
    const effectiveRole = profileRole || role || ''

    // Check if the role is allowed for admin/ops routes
    const isAdminUser = pathname.startsWith("/ops")
      ? OPS_ROLE_SET.has(effectiveRole)
      : ADMIN_ROLE_SET.has(effectiveRole)

    if (!isAdminUser) {
      // Non-admin user trying to access admin routes → redirect to their dashboard
      let redirectUrl = "/dashboard"
      if (effectiveRole === "seller" || effectiveRole === "manufacturer" || effectiveRole === "distributor") redirectUrl = "/seller/dashboard"
      else if (effectiveRole === "buyer") redirectUrl = "/buyer/dashboard"

      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }

    // For /admin routes, check if admin has verified 2FA session
    // Only require 2FA for super_admin and admin roles
    if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/verify") && REQUIRES_2FA_SET.has(effectiveRole)) {
      const adminVerified = request.cookies.get("admin_verified")
      if (!adminVerified?.value) {
        // Admin must complete 2FA verification first
        const verifyUrl = new URL("/admin/verify", request.url)
        verifyUrl.searchParams.set("redirect", pathname)
        return NextResponse.redirect(verifyUrl)
      }

      // Verify the admin session hasn't expired (cookie contains expiry timestamp)
      try {
        const sessionData = JSON.parse(adminVerified.value)
        if (sessionData.expires && Date.now() > sessionData.expires) {
          // Session expired — clear and re-verify
          response.cookies.delete("admin_verified")
          const verifyUrl = new URL("/admin/verify", request.url)
          verifyUrl.searchParams.set("redirect", pathname)
          return NextResponse.redirect(verifyUrl)
        }
      } catch {
        // Invalid cookie data — clear and re-verify
        response.cookies.delete("admin_verified")
        const verifyUrl = new URL("/admin/verify", request.url)
        verifyUrl.searchParams.set("redirect", pathname)
        return NextResponse.redirect(verifyUrl)
      }
    }
  }

  // ── Authenticated → auth route: redirect to dashboard ──
  if (isAuthRoute && user) {
    const role = user.app_metadata?.role || user.user_metadata?.role || ''
    let dashboardUrl = "/dashboard"
    if (role === "seller" || role === "manufacturer" || role === "distributor") dashboardUrl = "/seller/dashboard"
    else if (role === "buyer") dashboardUrl = "/buyer/dashboard"
    else if (role === "admin" || role === "super_admin") dashboardUrl = "/admin"
    else if (role === "moderator" || role === "support_agent" || role === "supplier_success") dashboardUrl = "/ops"
    else if (role === "finance" || role === "marketing") dashboardUrl = "/admin"
    return NextResponse.redirect(new URL(dashboardUrl, request.url))
  }

  return response
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
    "/admin/:path*",
    "/login",
    "/register",
  ],
}
