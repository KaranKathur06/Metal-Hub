/**
 * GET  /api/quotes — Seller's submitted quotes
 * POST /api/quotes — Submit a quote on an RFQ
 */

import { NextResponse } from "next/server";
import { protectApiRoute } from "@/lib/auth/protect-route";
import { evaluateProcurementGate } from "@/lib/marketplace/procurement-gates";
import { getServerDevelopmentTrustMode } from "@/lib/marketplace/trust-mode-server";
import { canTransitionQuote } from "@/lib/marketplace/procurement-workflow";
import { createNotification } from "@/lib/marketplace/notifications";
import { ensureProcurementThread, sendThreadMessage } from "@/lib/marketplace/messaging";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await protectApiRoute(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { data: sellerProfile } = await auth.supabase
    .from("seller_profiles")
    .select("id")
    .eq("profile_id", auth.user.id)
    .maybeSingle();

  if (!sellerProfile) {
    return NextResponse.json({ success: true, data: [] });
  }

  const { data, error } = await auth.supabase
    .from("quotes")
    .select(
      `
      id, price, currency_code, lead_time, moq, message, status, submitted_at, created_at,
      rfqs:rfq_id(id, title, slug, status)
    `,
    )
    .eq("seller_profile_id", sellerProfile.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, data: data ?? [] });
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
  if (!rfqId) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "rfq_id is required" } },
      { status: 400 },
    );
  }

  const { data: sellerProfile } = await auth.supabase
    .from("seller_profiles")
    .select("id, trust_level, company_id, profile_completion_percent")
    .eq("profile_id", auth.user.id)
    .maybeSingle();

  if (!sellerProfile) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SELLER_PROFILE_REQUIRED", message: "Complete seller onboarding first" },
      },
      { status: 400 },
    );
  }

  const developmentTrustMode = await getServerDevelopmentTrustMode(auth.supabase);
  const trustLevel = Math.min(
    4,
    Math.max(0, sellerProfile.trust_level ?? 0),
  ) as 0 | 1 | 2 | 3 | 4;

  const gate = evaluateProcurementGate({
    action: "submit_quote",
    role: "seller",
    currentTrustLevel: trustLevel,
    profileCompletionPercent: sellerProfile.profile_completion_percent ?? 0,
    emailVerified: Boolean(auth.user.email_confirmed_at),
    developmentTrustMode,
  });

  if (!gate.allowed && gate.hardBlocked) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "PROCUREMENT_GATE", message: gate.message ?? "Quote submission blocked" },
        gate,
      },
      { status: 403 },
    );
  }

  const { data: rfq } = await auth.supabase
    .from("rfqs")
    .select("id, status, title, slug, buyer_profile_id, visibility_level")
    .eq("id", rfqId)
    .maybeSingle();

  if (!rfq || !["open", "in_review", "quoted"].includes(rfq.status)) {
    return NextResponse.json(
      { success: false, error: { code: "RFQ_CLOSED", message: "This RFQ is not accepting quotes" } },
      { status: 400 },
    );
  }

  if (rfq.visibility_level === "premium") {
    const premiumGate = evaluateProcurementGate({
      action: "access_premium_rfq",
      role: "seller",
      currentTrustLevel: trustLevel,
      profileCompletionPercent: sellerProfile.profile_completion_percent ?? 0,
      emailVerified: Boolean(auth.user.email_confirmed_at),
      developmentTrustMode,
    });

    if (!premiumGate.allowed && premiumGate.hardBlocked) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PROCUREMENT_GATE",
            message: premiumGate.message ?? "Premium RFQ access requires higher trust tier",
          },
          gate: premiumGate,
        },
        { status: 403 },
      );
    }
  }

  const { data: existing } = await auth.supabase
    .from("quotes")
    .select("id, status")
    .eq("rfq_id", rfqId)
    .eq("seller_profile_id", sellerProfile.id)
    .maybeSingle();

  const price = typeof body.price === "string" ? body.price : String(body.price ?? "");
  const quotePatch = {
    rfq_id: rfqId,
    seller_profile_id: sellerProfile.id,
    company_id: sellerProfile.company_id,
    price,
    currency_code: typeof body.currency_code === "string" ? body.currency_code : "INR",
    lead_time: typeof body.lead_time === "string" ? body.lead_time : null,
    moq: typeof body.moq === "string" ? body.moq : null,
    message: typeof body.message === "string" ? body.message : null,
    status: "submitted" as const,
    submitted_at: new Date().toISOString(),
  };

  if (existing) {
    if (!canTransitionQuote(existing.status as "draft", "submit")) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_STATE", message: "Quote cannot be updated" } },
        { status: 400 },
      );
    }

    const { data, error } = await auth.supabase
      .from("quotes")
      .update(quotePatch)
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: "SERVER_ERROR", message: error.message } },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data, gate: gate.message ? gate : undefined });
  }

  const { data, error } = await auth.supabase
    .from("quotes")
    .insert(quotePatch)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 },
    );
  }

  let threadId: string | null = null;

  if (rfq?.buyer_profile_id) {
    try {
      const createdThreadId = await ensureProcurementThread(auth.supabase, {
        rfqId,
        buyerProfileId: rfq.buyer_profile_id,
        sellerProfileId: sellerProfile.id,
        quoteId: data.id,
      });
      threadId = createdThreadId;

      const summary = `Quote submitted: ${price}${quotePatch.lead_time ? ` · Lead time: ${quotePatch.lead_time}` : ""}${quotePatch.moq ? ` · MOQ: ${quotePatch.moq}` : ""}`;

      const { data: buyer } = await auth.supabase
        .from("buyer_profiles")
        .select("profile_id")
        .eq("id", rfq.buyer_profile_id)
        .maybeSingle();

      await sendThreadMessage(auth.supabase, {
        threadId: createdThreadId,
        senderId: auth.user.id,
        body: quotePatch.message?.trim() || summary,
        notifyProfileId: buyer?.profile_id ?? null,
        notificationTitle: `New quote on ${rfq.title}`,
        notificationHref: rfq.slug ? `/rfq/${rfq.slug}` : `/messages/${threadId}`,
      });

      if (buyer?.profile_id) {
        await auth.supabase.from("notifications").insert(
          createNotification({
            profileId: buyer.profile_id,
            title: `Quote received for ${rfq.title}`,
            body: summary,
            type: "quote",
            href: rfq.slug ? `/rfq/${rfq.slug}` : null,
            metadata: { rfq_id: rfqId, quote_id: data.id },
          }),
        );
      }
    } catch {
      // Non-blocking: quote succeeded even if messaging fails
    }
  }

  return NextResponse.json(
    { success: true, data, threadId, gate: gate.message ? gate : undefined },
    { status: 201 },
  );
}
