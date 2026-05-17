/**
 * Metal Hub — Supplier Approve/Reject API
 * POST /api/admin/suppliers/[id]/approve → Approve or reject a seller
 */

import { NextResponse } from 'next/server';
import { protectApiRoute, logAdminAction } from '@/lib/auth/protect-route';

type RouteParams = { params: { id: string } };

export async function POST(request: Request, { params }: RouteParams) {
  const auth = await protectApiRoute(request, {
    requiredRoles: ['admin', 'super_admin', 'moderator', 'supplier_success'],
    requireAdmin2FA: true,
  });
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  let body: { action: 'approve' | 'reject'; notes?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request body' } },
      { status: 400 },
    );
  }

  const action = body.action || 'approve';
  if (!['approve', 'reject'].includes(action)) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'action must be approve or reject' } },
      { status: 400 },
    );
  }

  // Get seller profile
  const { data: seller } = await auth.supabase
    .from('seller_profiles')
    .select('id, profile_id, company_id, company_name, verification_status')
    .eq('id', params.id)
    .maybeSingle();

  if (!seller) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Seller not found' } },
      { status: 404 },
    );
  }

  const newStatus = action === 'approve' ? 'approved' : 'rejected';

  // Update seller profile
  await auth.supabase
    .from('seller_profiles')
    .update({ verification_status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', params.id);

  // Update company if approving
  if (action === 'approve' && seller.company_id) {
    await auth.supabase
      .from('companies')
      .update({ is_verified: true, updated_at: new Date().toISOString() })
      .eq('id', seller.company_id);
  }

  // Notify seller (in-app + email)
  if (seller.profile_id) {
    await auth.supabase.from('notifications').insert({
      user_id: seller.profile_id,
      type: 'verification',
      title: action === 'approve' ? 'Verification Approved! 🎉' : 'Verification Update',
      message: action === 'approve'
        ? `Congratulations! Your seller profile "${seller.company_name}" has been verified. You can now create listings.`
        : `Your seller verification for "${seller.company_name}" requires additional information. ${body.notes || ''}`,
      data: { seller_profile_id: seller.id, action },
      is_read: false,
    });

    // Send email notification
    const { data: sellerUser } = await auth.supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', seller.profile_id)
      .maybeSingle();

    if (sellerUser?.email) {
      const { sendEmail, verificationEmailTemplate } = await import('@/lib/services/email');
      const template = verificationEmailTemplate(
        sellerUser.full_name || 'Seller',
        action === 'approve' ? 'approved' : 'rejected',
        body.notes,
      );
      await sendEmail({ to: sellerUser.email, ...template });
    }
  }

  // Audit
  await logAdminAction(auth.supabase, {
    userId: auth.user.id,
    action: `supplier_${action}d`,
    resource: 'seller_profiles',
    resourceId: params.id,
    details: { company: seller.company_name, previousStatus: seller.verification_status, notes: body.notes },
    severity: action === 'reject' ? 'warning' : 'info',
    request,
  });

  return NextResponse.json({
    success: true,
    data: { id: params.id, status: newStatus, action },
  });
}
