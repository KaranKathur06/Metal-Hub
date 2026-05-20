import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { resolveEffectiveRole } from "@/lib/auth/rbac";
import { authLog } from "@/lib/auth/auth-logger";
import { AUTH_COOKIES } from "@/lib/auth/session-lifecycle";

export type ServerAuthBootstrapPayload = {
  userId: string;
  email: string | null;
  role: string;
  fullName: string | null;
};

export type ServerAuthBootstrap = ServerAuthBootstrapPayload | null;

/**
 * Lightweight server-side auth snapshot for instant client hydration.
 * Avoids blocking the full 4-table identity load in the root layout.
 */
export async function getServerAuthBootstrap(): Promise<ServerAuthBootstrap> {
  const cookieStore = cookies();
  if (cookieStore.get(AUTH_COOKIES.logoutInProgress)?.value === "1") {
    authLog("bootstrap", "skipped — logout in progress");
    return null;
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    authLog("bootstrap", "getUser failed", { error: userError.message });
    return null;
  }

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const role = resolveEffectiveRole({
    profileRole: profile?.role,
    appMetadataRole: user.app_metadata?.role,
    userMetadataRole: user.user_metadata?.role,
  });

  authLog("bootstrap", "hydrated", { userId: user.id, role });

  return {
    userId: user.id,
    email: profile?.email ?? user.email ?? null,
    role,
    fullName:
      profile?.full_name ??
      (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null),
  };
}
