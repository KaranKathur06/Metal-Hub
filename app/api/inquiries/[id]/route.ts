/**
 * Metal Hub — Inquiry Detail API
 * GET /api/inquiries/[id] → Get inquiry/RFQ details
 */

import { NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth/protect-route';

type RouteParams = { params: { id: string } };

export async function GET(request: Request, { params }: RouteParams) {
  const auth = await protectApiRoute(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const isAdmin = ['admin', 'super_admin', 'moderator'].includes(auth.role);

  const { data: rfq, error } = await auth.supabase
    .from('rfqs')
    .select(`
      *,
      buyer_profiles:buyer_profile_id(
        id,
        profiles:profile_id(id, full_name, email, phone, avatar_url),
        companies:company_id(id, name, logo_url, city, state)
      ),
      quotes(
        id, seller_profile_id, amount, currency, status, message, created_at,
        seller_profiles:seller_profile_id(id, company_name,
          profiles:profile_id(full_name, avatar_url)
        )
      )
    `)
    .eq('id', params.id)
    .maybeSingle();

  if (error || !rfq) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Inquiry not found' } },
      { status: 404 },
    );
  }

  // Access check: owner, quoted seller, or admin
  if (!isAdmin) {
    const buyerProfileData = rfq.buyer_profiles as any;
    const isOwner = buyerProfileData?.profiles?.id === auth.user.id;

    // Check if current user is a seller who quoted
    const { data: sellerProfile } = await auth.supabase
      .from('seller_profiles')
      .select('id')
      .eq('profile_id', auth.user.id)
      .maybeSingle();

    const isQuotedSeller = sellerProfile && (rfq.quotes as any[])?.some(
      (q: any) => q.seller_profile_id === sellerProfile.id
    );

    if (!isOwner && !isQuotedSeller) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 },
      );
    }
  }

  return NextResponse.json({ success: true, data: rfq });
}
