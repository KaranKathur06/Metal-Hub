/**
 * Metal Hub — Supplier Profile Management API
 * POST /api/suppliers/profile → Create/update seller profile
 * GET  /api/suppliers/profile → Get current user's seller profile
 */

import { NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth/protect-route';

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

  // Check existing
  const { data: existing } = await auth.supabase
    .from('seller_profiles')
    .select('id')
    .eq('profile_id', auth.user.id)
    .maybeSingle();

  if (existing) {
    // Update
    const { data, error } = await auth.supabase
      .from('seller_profiles')
      .update({
        company_name: body.company_name,
        certifications: body.certifications || [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
    }
    return NextResponse.json({ success: true, data });
  }

  // Create
  const { data, error } = await auth.supabase
    .from('seller_profiles')
    .insert({
      profile_id: auth.user.id,
      company_name: body.company_name || '',
      company_id: body.company_id || null,
      certifications: body.certifications || [],
      verification_status: 'pending',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }

  return NextResponse.json({ success: true, data }, { status: 201 });
}

export async function GET(request: Request) {
  const auth = await protectApiRoute(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { data, error } = await auth.supabase
    .from('seller_profiles')
    .select(`
      *,
      companies:company_id(id, name, logo_url, website, city, state, gst_number, is_verified),
      listings:listings(count)
    `)
    .eq('profile_id', auth.user.id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'No seller profile found' } },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, data });
}
