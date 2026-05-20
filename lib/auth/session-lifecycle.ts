/**
 * Central session lifecycle — single source of truth for sign-out and elevation cookies.
 */

export const AUTH_COOKIES = {
  adminVerified: "admin_verified",
  logoutInProgress: "mh_logout",
} as const;

export const AUTH_STORAGE_KEYS = [
  "supabase.auth.token",
  "sb-auth-token",
] as const;

/** Clear client-side Supabase-related storage (best-effort). */
export function clearClientAuthStorage() {
  if (typeof window === "undefined") return;

  try {
    for (const key of AUTH_STORAGE_KEYS) {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    }

    const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(
      /https:\/\/([^.]+)\.supabase/,
    )?.[1];

    if (projectRef) {
      const prefix = `sb-${projectRef}-`;
      for (let i = window.localStorage.length - 1; i >= 0; i--) {
        const key = window.localStorage.key(i);
        if (key?.startsWith(prefix)) window.localStorage.removeItem(key);
      }
    }
  } catch {
    // ignore private mode / quota errors
  }
}

export type PerformSignOutOptions = {
  supabaseSignOut: () => Promise<unknown>;
  redirectTo?: string;
};

/**
 * Enterprise sign-out sequence (order matters):
 * 1. Mark logout in progress (cookie) so middleware won't redirect back to /admin
 * 2. Clear elevated admin session server-side
 * 3. Invalidate Supabase session globally
 * 4. Clear browser storage
 * 5. Hard navigation (no SPA router — avoids hydration fights)
 */
export async function performSignOut(options: PerformSignOutOptions) {
  const redirectTo =
    options.redirectTo ??
    (typeof window !== "undefined" &&
    (window.location.pathname.startsWith("/admin") ||
      window.location.pathname.startsWith("/ops"))
      ? "/login?signedOut=1"
      : "/");

  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    // continue
  }

  clearClientAuthStorage();

  try {
    await options.supabaseSignOut();
  } catch {
    // continue — still hard redirect
  }

  window.location.replace(redirectTo);
}
