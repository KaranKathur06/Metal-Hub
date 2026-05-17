/**
 * Metal Hub — Pending Suppliers API
 * GET /api/admin/suppliers/pending → List sellers awaiting verification
 */

import { NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth/protect-route';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = await protectApiRoute(request, {
    requiredRoles: ['admin', 'super_admin', 'moderator', 'supplier_success'],
    requireAdmin2FA: true,
  });
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'));

  const { data, error, count } = await auth.supabase
    .from('seller_profiles')
    .select(`
      id, company_name, verification_status, certifications, created_at,
      profiles:profile_id(id, full_name, email, phone, avatar_url),
      companies:company_id(id, name, logo_url, city, state, gst_number, business_type, is_verified)
    `, { count: 'exact' })
    .eq('verification_status', 'pending')
    .order('created_at', { ascending: true })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    data: data || [],
    meta: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
  });
}
