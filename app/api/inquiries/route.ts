/**
 * Metal Hub — Inquiries / RFQs API
 * GET  /api/inquiries → List user's inquiries
 * POST /api/inquiries → Create an inquiry/RFQ
 */

import { NextResponse } from 'next/server';
import { protectApiRoute, logAdminAction } from '@/lib/auth/protect-route';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = await protectApiRoute(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'));
  const isAdmin = ['admin', 'super_admin', 'moderator'].includes(auth.role);

  let query = auth.supabase
    .from('rfqs')
    .select(`
      id, title, description, metal_type, quantity, unit,
      budget_min, budget_max, currency, delivery_location,
      status, urgency, created_at, updated_at,
      buyer_profiles:buyer_profile_id(id, profiles:profile_id(full_name, email)),
      quotes(count)
    `, { count: 'exact' });

  // Non-admins only see their own
  if (!isAdmin) {
    const { data: buyerProfile } = await auth.supabase
      .from('buyer_profiles')
      .select('id')
      .eq('profile_id', auth.user.id)
      .maybeSingle();

    if (buyerProfile) {
      query = query.eq('buyer_profile_id', buyerProfile.id);
    } else {
      return NextResponse.json({ success: true, data: [], meta: { page, limit, total: 0, totalPages: 0 } });
    }
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
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

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request body' } },
      { status: 400 },
    );
  }

  if (!body.title) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'title is required' } },
      { status: 400 },
    );
  }

  // Get or create buyer profile
  let buyerProfileId: string;
  const { data: existing } = await auth.supabase
    .from('buyer_profiles')
    .select('id')
    .eq('profile_id', auth.user.id)
    .maybeSingle();

  if (existing) {
    buyerProfileId = existing.id;
  } else {
    const { data: created, error: createErr } = await auth.supabase
      .from('buyer_profiles')
      .insert({ profile_id: auth.user.id })
      .select('id')
      .single();

    if (createErr || !created) {
      return NextResponse.json(
        { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create buyer profile' } },
        { status: 500 },
      );
    }
    buyerProfileId = created.id;
  }

  const { data, error } = await auth.supabase
    .from('rfqs')
    .insert({
      buyer_profile_id: buyerProfileId,
      title: body.title,
      description: body.description || null,
      metal_type: body.metal_type || null,
      quantity: body.quantity || null,
      unit: body.unit || 'MT',
      budget_min: body.budget_min || null,
      budget_max: body.budget_max || null,
      currency: body.currency || 'INR',
      delivery_location: body.delivery_location || null,
      urgency: body.urgency || 'normal',
      status: 'open',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }

  // Increment inquiry count on related listing if provided
  if (body.listing_id) {
    try {
      await auth.supabase.rpc('increment_listing_inquiries', { listing_id: body.listing_id });
    } catch {
      await auth.supabase.from('listings')
        .update({ inquiry_count: (body.current_inquiry_count || 0) + 1 })
        .eq('id', body.listing_id);
    }
  }

  return NextResponse.json({ success: true, data }, { status: 201 });
}
