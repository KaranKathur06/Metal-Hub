/**
 * Metal Hub — Inquiries / RFQs API
 * GET  /api/inquiries → List user's RFQs
 * POST /api/inquiries → Create an RFQ (marketplace-normalized)
 */

import { NextResponse } from "next/server";
import { protectApiRoute } from "@/lib/auth/protect-route";
import { evaluateProcurementGate } from "@/lib/marketplace/procurement-gates";
import { getServerDevelopmentTrustMode } from "@/lib/marketplace/trust-mode-server";
import { createMarketplaceRfq } from "@/lib/marketplace/rfq-create";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await protectApiRoute(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));
  const isAdmin = ["admin", "super_admin", "superadmin", "moderator"].includes(auth.role);

  let query = auth.supabase
    .from("rfqs")
    .select(
      `
      id, title, slug, description, quantity, budget_range,
      delivery_timeline, status, visibility_level, city, state, country,
      created_at, updated_at,
      quotes(count)
    `,
      { count: "exact" },
    )
    ;

  if (!isAdmin) {
    const { data: buyerProfile } = await auth.supabase
      .from("buyer_profiles")
      .select("id")
      .eq("profile_id", auth.user.id)
      .maybeSingle();

    if (buyerProfile) {
      query = query.eq("buyer_profile_id", buyerProfile.id);
    } else {
      query = query.eq("buyer_user_id", auth.user.id);
    }
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    data: data || [],
    meta: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
  });
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
      { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid request body" } },
      { status: 400 },
    );
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "title is required" } },
      { status: 400 },
    );
  }

  const { data: profile } = await auth.supabase
    .from("profiles")
    .select("trust_level, profile_status")
    .eq("id", auth.user.id)
    .maybeSingle();

  const { data: buyerProfile } = await auth.supabase
    .from("buyer_profiles")
    .select("id, trust_level, profile_completion_percent")
    .eq("profile_id", auth.user.id)
    .maybeSingle();

  const developmentTrustMode = await getServerDevelopmentTrustMode(auth.supabase);
  const trustLevel = Math.min(
    4,
    Math.max(0, buyerProfile?.trust_level ?? profile?.trust_level ?? 0),
  ) as 0 | 1 | 2 | 3 | 4;

  const gate = evaluateProcurementGate({
    action: "publish_rfq",
    role: auth.role === "seller" ? "both" : "buyer",
    currentTrustLevel: trustLevel,
    profileCompletionPercent: buyerProfile?.profile_completion_percent ?? 0,
    emailVerified: Boolean(auth.user.email_confirmed_at),
    developmentTrustMode,
  });

  if (!gate.allowed && gate.hardBlocked) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "PROCUREMENT_GATE", message: gate.message ?? "RFQ publishing not allowed" },
        gate,
      },
      { status: 403 },
    );
  }

  let buyerProfileId = buyerProfile?.id;

  if (!buyerProfileId) {
    const { data: created, error: createErr } = await auth.supabase
      .from("buyer_profiles")
      .insert({ profile_id: auth.user.id })
      .select("id")
      .single();

    if (createErr || !created) {
      return NextResponse.json(
        { success: false, error: { code: "SERVER_ERROR", message: "Failed to create buyer profile" } },
        { status: 500 },
      );
    }
    buyerProfileId = created.id;
  }

  const { data: company } = await auth.supabase
    .from("companies")
    .select("id")
    .eq("owner_id", auth.user.id)
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();

  try {
    const rfq = await createMarketplaceRfq(auth.supabase, {
      buyerProfileId,
      buyerUserId: auth.user.id,
      title,
      description: typeof body.description === "string" ? body.description : null,
      quantity: typeof body.quantity === "string" ? body.quantity : null,
      unit: typeof body.unit === "string" ? body.unit : "MT",
      budgetMin: typeof body.budget_min === "number" ? body.budget_min : null,
      budgetMax: typeof body.budget_max === "number" ? body.budget_max : null,
      deliveryLocation: typeof body.delivery_location === "string" ? body.delivery_location : null,
      deliveryTimeline: typeof body.delivery_timeline === "string" ? body.delivery_timeline : null,
      qualitySpecs: typeof body.quality_specs === "string" ? body.quality_specs : null,
      taxonomyId: typeof body.category_id === "string" ? body.category_id : null,
      industryId: typeof body.industry_id === "string" ? body.industry_id : null,
      companyId: company?.id ?? null,
    });

    return NextResponse.json(
      {
        success: true,
        data: rfq,
        gate: gate.message ? gate : undefined,
        href: `/rfq/${rfq.slug}`,
      },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create RFQ";
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message } },
      { status: 500 },
    );
  }
}
