import { NextResponse } from "next/server";
import { protectApiRoute } from "@/lib/auth/protect-route";
import { evaluateProcurementGate } from "@/lib/marketplace/procurement-gates";
import { getServerDevelopmentTrustMode } from "@/lib/marketplace/trust-mode-server";
import {
  ensureProcurementThread,
  getCounterpartyProfileId,
  listUserThreads,
  sendThreadMessage,
} from "@/lib/marketplace/messaging";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await protectApiRoute(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const threads = await listUserThreads(auth.supabase, auth.user.id);
    return NextResponse.json({ success: true, data: threads });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load threads";
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message } },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await protectApiRoute(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid body" } },
      { status: 400 },
    );
  }

  const rfqId = typeof body.rfq_id === "string" ? body.rfq_id : "";
  const sellerProfileId = typeof body.seller_profile_id === "string" ? body.seller_profile_id : "";
  const initialMessage = typeof body.message === "string" ? body.message.trim() : "";

  if (!rfqId || !sellerProfileId) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "rfq_id and seller_profile_id are required" },
      },
      { status: 400 },
    );
  }

  const developmentTrustMode = await getServerDevelopmentTrustMode(auth.supabase);

  const { data: buyerProfile } = await auth.supabase
    .from("buyer_profiles")
    .select("id, trust_level, profile_completion_percent")
    .eq("profile_id", auth.user.id)
    .maybeSingle();

  const gate = evaluateProcurementGate({
    action: "contact_supplier",
    role: "buyer",
    currentTrustLevel: Math.min(4, Math.max(0, buyerProfile?.trust_level ?? 0)) as 0 | 1 | 2 | 3 | 4,
    profileCompletionPercent: buyerProfile?.profile_completion_percent ?? 0,
    emailVerified: Boolean(auth.user.email_confirmed_at),
    developmentTrustMode,
  });

  if (!gate.allowed && gate.hardBlocked) {
    return NextResponse.json(
      { success: false, error: { code: "PROCUREMENT_GATE", message: gate.message }, gate },
      { status: 403 },
    );
  }

  let buyerProfileId = buyerProfile?.id;
  if (!buyerProfileId) {
    const { data: created } = await auth.supabase
      .from("buyer_profiles")
      .insert({ profile_id: auth.user.id })
      .select("id")
      .single();
    buyerProfileId = created?.id;
  }

  if (!buyerProfileId) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Buyer profile required" } },
      { status: 500 },
    );
  }

  try {
    const threadId = await ensureProcurementThread(auth.supabase, {
      rfqId,
      buyerProfileId,
      sellerProfileId,
    });

    if (initialMessage) {
      const notifyId = await getCounterpartyProfileId(auth.supabase, threadId, auth.user.id);
      const { data: seller } = await auth.supabase
        .from("seller_profiles")
        .select("profile_id")
        .eq("id", sellerProfileId)
        .maybeSingle();

      await sendThreadMessage(auth.supabase, {
        threadId,
        senderId: auth.user.id,
        body: initialMessage,
        notifyProfileId: seller?.profile_id ?? notifyId,
        notificationTitle: "New inquiry message",
        notificationHref: `/messages/${threadId}`,
      });
    }

    return NextResponse.json({ success: true, data: { threadId }, gate: gate.message ? gate : undefined });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create thread";
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message } },
      { status: 500 },
    );
  }
}
