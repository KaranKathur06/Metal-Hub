import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/server-client";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { commitBuyerOnboarding } from "@/lib/marketplace/onboarding-commit-buyer";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  try {
    const result = await commitBuyerOnboarding(supabase, user.id, body);
    return NextResponse.json({ success: true, result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Commit failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
