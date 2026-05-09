import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

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
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route)

  // Unauthenticated → protected route: redirect to login
  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated → auth route: redirect to dashboard
  if (isAuthRoute && user) {
    const role = user.user_metadata?.role
    let dashboardUrl = "/dashboard"
    if (role === "seller") dashboardUrl = "/seller/dashboard"
    else if (role === "buyer") dashboardUrl = "/buyer/dashboard"
    else if (role === "admin") dashboardUrl = "/admin"
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
    "/login",
    "/register",
  ],
}
