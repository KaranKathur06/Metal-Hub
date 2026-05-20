import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client for server-only writes after auth/RBAC checks.
 * Never expose this client to the browser.
 */
export function createSupabaseServiceRoleClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
