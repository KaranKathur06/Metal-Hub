import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSuperAdminRole, roleMatchesAllowed, resolveEffectiveRole } from "@/lib/auth/rbac";

/**
 * Create a Supabase server client for use in:
 * - Server Components
 * - Route Handlers (API routes)
 * - Server Actions
 *
 * This uses @supabase/ssr to read cookies set by the browser client,
 * ensuring consistent auth state between client and server.
 */
export function createSupabaseServerClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const cookieStore = cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // In read-only server contexts (RSC), we can't set cookies.
        // Cookie refreshes happen in middleware instead.
      },
    },
  });
}

/**
 * Get the authenticated user from the server context.
 * Returns null if not authenticated.
 * Uses getUser() which validates the JWT server-side (not from cache).
 */
export async function getServerUser() {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

/**
 * Validate that the current user has one of the required roles.
 * Checks the profiles table in the database for the authoritative role.
 */
export async function validateUserRole(
  supabase: SupabaseClient,
  userId: string,
  allowedRoles: string[],
): Promise<{ valid: boolean; role: string | null }> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  const role = profile?.role
    ? resolveEffectiveRole({ profileRole: profile.role })
    : null;

  return {
    valid: role ? roleMatchesAllowed(role, allowedRoles) || isSuperAdminRole(role) : false,
    role,
  };
}
