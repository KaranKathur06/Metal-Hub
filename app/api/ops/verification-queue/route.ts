/**
 * GET /api/ops/verification-queue — Pending verification documents for supplier_success
 */

import { NextResponse } from "next/server";
import { protectApiRoute } from "@/lib/auth/protect-route";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await protectApiRoute(request, {
    requiredRoles: ["admin", "super_admin", "moderator", "supplier_success"],
    requireAdmin2FA: true,
  });

  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "pending,in_review";

  const statuses = status.split(",").map((value) => value.trim()).filter(Boolean);

  const { data, error } = await auth.supabase
    .from("verification_documents")
    .select(
      `
      id,
      document_type,
      file_url,
      status,
      reviewer_notes,
      reviewed_at,
      created_at,
      profile_id,
      company_id,
      companies:company_id(id, name, slug),
      profiles:profile_id(id, full_name, email)
    `,
    )
    .in("status", statuses)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, data: data ?? [] });
}
