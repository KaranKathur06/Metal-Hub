import type { SupabaseClient } from "@supabase/supabase-js";
import { getPublicDevelopmentTrustMode } from "./platform-settings";

export async function getServerDevelopmentTrustMode(
  supabase?: SupabaseClient | null,
): Promise<boolean> {
  if (!supabase) {
    return getPublicDevelopmentTrustMode();
  }

  const { data } = await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", "development_trust_mode")
    .maybeSingle();

  return getPublicDevelopmentTrustMode(data?.value);
}
