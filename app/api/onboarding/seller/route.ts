import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, getServerUser } from "@/lib/supabase/server-client";
import {
  applySellerOnboardingPatch,
  createSellerOnboardingSession,
  toOnboardingSessionUpsert,
  type OnboardingSession,
} from "@/lib/marketplace/onboarding-session";
import {
  buildCommitSessionFromDraft,
  commitSellerOnboardingSession,
} from "@/lib/marketplace/onboarding-commit";

export const dynamic = "force-dynamic";

async function getAuthUserId() {
  const user = await getServerUser();
  return user?.id ?? null;
}

function mapDbSession(row: Record<string, unknown>): OnboardingSession {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    role: (row.role as OnboardingSession["role"]) ?? "seller",
    flowKey: (row.flow_key as string) ?? "seller_onboarding",
    flowVersion: (row.flow_version as number) ?? 1,
    currentStep: row.current_step as string,
    draftPayload: (row.draft_payload as Record<string, unknown>) ?? {},
    completionPercentage: (row.completion_percentage as number) ?? 0,
    lastCompletedStep: (row.last_completed_step as string) ?? null,
    skippedSteps: (row.skipped_steps as string[]) ?? [],
    skippedStepDetails:
      (row.skipped_step_details as OnboardingSession["skippedStepDetails"]) ?? {},
    isCompleted: Boolean(row.is_completed),
    status: (row.status as OnboardingSession["status"]) ?? "active",
  };
}

export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("onboarding_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("role", "seller")
    .eq("flow_key", "seller_onboarding")
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    session: data ? mapDbSession(data) : null,
  });
}

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const body = await request.json();
  const action = body.action as "save" | "commit";

  if (action === "commit") {
    const draftPayload = (body.draftPayload ?? {}) as Record<string, unknown>;
    const session = buildCommitSessionFromDraft({
      userId,
      draftPayload,
      sessionId: body.sessionId,
      skippedSteps: body.skippedSteps,
    });

    try {
      const result = await commitSellerOnboardingSession(supabase, userId, session);
      return NextResponse.json({ success: true, result });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Commit failed";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  const patch = {
    stepKey: body.stepKey as string,
    values: (body.values ?? {}) as Record<string, unknown>,
    markComplete: Boolean(body.markComplete),
    skipStep: Boolean(body.skipStep),
    skipReason: body.skipReason as string | null,
    developmentTrustMode: body.developmentTrustMode !== false,
  };

  let session: OnboardingSession;

  if (body.sessionId) {
    const { data: existing } = await supabase
      .from("onboarding_sessions")
      .select("*")
      .eq("id", body.sessionId)
      .eq("user_id", userId)
      .maybeSingle();

    session = existing
      ? applySellerOnboardingPatch(mapDbSession(existing), patch)
      : createSellerOnboardingSession({ userId, initialPayload: patch.values });
  } else {
    const { data: existing } = await supabase
      .from("onboarding_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("role", "seller")
      .eq("flow_key", "seller_onboarding")
      .eq("status", "active")
      .maybeSingle();

    session = existing
      ? applySellerOnboardingPatch(mapDbSession(existing), patch)
      : applySellerOnboardingPatch(
          createSellerOnboardingSession({ userId, initialPayload: patch.values }),
          patch,
        );
  }

  const upsert = toOnboardingSessionUpsert(session);
  let saved;
  let error;

  if (session.id) {
    ({ data: saved, error } = await supabase
      .from("onboarding_sessions")
      .update(upsert)
      .eq("id", session.id)
      .select("*")
      .single());
  } else {
    ({ data: saved, error } = await supabase
      .from("onboarding_sessions")
      .insert(upsert)
      .select("*")
      .single());
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ session: mapDbSession(saved) });
}
