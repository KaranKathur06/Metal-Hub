/**
 * PATCH /api/ops/verification/[id] — Approve or reject a verification document
 */

import { NextResponse } from "next/server";
import { protectApiRoute, logAdminAction } from "@/lib/auth/protect-route";
import { createNotification } from "@/lib/marketplace/notifications";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;

  const auth = await protectApiRoute(request, {
    requiredRoles: ["admin", "super_admin", "moderator", "supplier_success"],
    requireAdmin2FA: true,
  });

  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  let body: { action?: "approve" | "reject"; notes?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid body" } },
      { status: 400 },
    );
  }

  const action = body.action === "reject" ? "reject" : "approve";
  const newStatus = action === "approve" ? "approved" : "rejected";

  const { data: document, error: fetchError } = await auth.supabase
    .from("verification_documents")
    .select("id, profile_id, company_id, document_type, status")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !document) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "Document not found" } },
      { status: 404 },
    );
  }

  const { error: updateError } = await auth.supabase
    .from("verification_documents")
    .update({
      status: newStatus,
      reviewer_id: auth.user.id,
      reviewer_notes: body.notes ?? null,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: updateError.message } },
      { status: 500 },
    );
  }

  if (action === "approve" && document.company_id) {
    await auth.supabase
      .from("companies")
      .update({ verification_status: "approved", is_verified: true })
      .eq("id", document.company_id);
  }

  if (document.profile_id) {
    await auth.supabase.from("notifications").insert(
      createNotification({
        profileId: document.profile_id,
        type: "verification",
        title: action === "approve" ? "Document verified" : "Document needs revision",
        body:
          action === "approve"
            ? `Your ${document.document_type} was approved.`
            : `Your ${document.document_type} requires updates.${body.notes ? ` ${body.notes}` : ""}`,
        href: "/onboarding/seller",
        metadata: { document_id: id, action },
      }),
    );
  }

  await logAdminAction(auth.supabase, {
    userId: auth.user.id,
    action: `verification_document_${action}d`,
    resource: "verification_documents",
    resourceId: id,
    details: { documentType: document.document_type, notes: body.notes },
    severity: action === "reject" ? "warning" : "info",
    request,
  });

  return NextResponse.json({ success: true, data: { id, status: newStatus } });
}
