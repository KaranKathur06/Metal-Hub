"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * SSR-safe Supabase browser client.
 * 
 * Uses `createBrowserClient` from @supabase/ssr instead of the raw
 * `createClient` from @supabase/supabase-js. This is CRITICAL because:
 * 
 * 1. `createClient` stores sessions in localStorage by default
 * 2. `createBrowserClient` stores sessions in cookies
 * 3. The middleware reads sessions from cookies via `createServerClient`
 * 
 * Without this, client sees user as authenticated (localStorage),
 * but middleware sees user as unauthenticated (cookies empty)
 * → false redirects to /login on protected routes.
 */
let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);

  return browserClient;
}
