import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const ADMIN_ROLE_SET = new Set([
  "super_admin",
  "superadmin",
  "admin",
  "moderator",
  "support_agent",
  "supplier_success",
  "finance",
  "marketing",
]);
const OPS_ROLE_SET = new Set([
  "super_admin",
  "superadmin",
  "admin",
  "moderator",
  "support_agent",
  "supplier_success",
]);
const REQUIRES_2FA_SET = new Set(["super_admin", "admin"]);

const LOGOUT_COOKIE = "mh_logout";
const ADMIN_VERIFIED_COOKIE = "admin_verified";

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
];

const AUTH_ROUTES = ["/login", "/register"];

function normalizeEdgeRole(role: unknown): string {
  if (typeof role !== "string" || !role) return "";
  if (role === "superadmin") return "super_admin";
  return role;
}

function isAdminVerified(request: NextRequest): boolean {
  const raw = request.cookies.get(ADMIN_VERIFIED_COOKIE)?.value;
  if (!raw) return false;
  try {
    const data = JSON.parse(raw) as { expires?: number };
    if (data.expires && Date.now() > data.expires) return false;
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  const logoutInProgress = request.cookies.get(LOGOUT_COOKIE)?.value === "1";
  const signedOutQuery = searchParams.get("signedOut") === "1";

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Logout in progress: never trap user on admin verify / admin redirect loop ──
  if (logoutInProgress || signedOutQuery) {
    response.cookies.set(LOGOUT_COOKIE, "", { path: "/", maxAge: 0 });
    response.cookies.set(ADMIN_VERIFIED_COOKIE, "", { path: "/", maxAge: 0 });

    if (pathname.startsWith("/admin") || pathname.startsWith("/ops")) {
      const login = new URL("/login", request.url);
      login.searchParams.set("signedOut", "1");
      return NextResponse.redirect(login);
    }

    if (AUTH_ROUTES.includes(pathname)) {
      return response;
    }

    return response;
  }

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/ops");
  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isVerifyPage = pathname.startsWith("/admin/verify");

  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    if (!isVerifyPage) {
      loginUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && user) {
    const effectiveRole = normalizeEdgeRole(
      user.app_metadata?.role ?? user.user_metadata?.role ?? "",
    );

    const isAdminUser = pathname.startsWith("/ops")
      ? OPS_ROLE_SET.has(effectiveRole)
      : ADMIN_ROLE_SET.has(effectiveRole);

    if (!isAdminUser) {
      let redirectUrl = "/dashboard";
      if (
        effectiveRole === "seller" ||
        effectiveRole === "manufacturer" ||
        effectiveRole === "distributor"
      ) {
        redirectUrl = "/seller/dashboard";
      } else if (effectiveRole === "buyer") {
        redirectUrl = "/buyer/dashboard";
      }
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    const needs2fa =
      pathname.startsWith("/admin") &&
      !isVerifyPage &&
      REQUIRES_2FA_SET.has(effectiveRole);

    if (needs2fa && !isAdminVerified(request)) {
      const verifyUrl = new URL("/admin/verify", request.url);
      if (pathname !== "/admin") {
        verifyUrl.searchParams.set("redirect", pathname);
      }
      return NextResponse.redirect(verifyUrl);
    }
  }

  // Authenticated user on login/register — send to home route (not verify trap)
  if (isAuthRoute && user && !signedOutQuery) {
    const role = normalizeEdgeRole(
      user.app_metadata?.role ?? user.user_metadata?.role ?? "",
    );
    let dashboardUrl = "/dashboard";
    if (
      role === "seller" ||
      role === "manufacturer" ||
      role === "distributor"
    ) {
      dashboardUrl = "/seller/dashboard";
    } else if (role === "buyer") {
      dashboardUrl = "/buyer/dashboard";
    } else if (role === "admin" || role === "super_admin") {
      dashboardUrl = isAdminVerified(request) ? "/admin" : "/admin/verify";
    } else if (
      role === "moderator" ||
      role === "support_agent" ||
      role === "supplier_success"
    ) {
      dashboardUrl = "/ops";
    } else if (role === "finance" || role === "marketing") {
      dashboardUrl = "/admin";
    }
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  return response;
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
};
