/**
 * Metal Hub — Supplier Products API
 * POST /api/suppliers/products → Create a product listing for current seller
 */

import { NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth/protect-route';
import { PERMISSIONS } from '@/lib/constants/permissions';

export async function POST(request: Request) {
  const auth = await protectApiRoute(request, {
    permissions: [PERMISSIONS.LISTINGS_CREATE],
  });
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

  // Get seller profile
  const { data: sellerProfile } = await auth.supabase
    .from('seller_profiles')
    .select('id, company_id, verification_status')
    .eq('profile_id', auth.user.id)
    .maybeSingle();

  if (!sellerProfile) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Seller profile required' } },
      { status: 403 },
    );
  }

  // Generate slug
  const slug = (body.title || 'product')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    + '-' + Math.random().toString(36).slice(2, 6);

  const isVerified = sellerProfile.verification_status === 'approved';
  const initialStatus = isVerified ? 'approved' : 'pending';

  const { data, error } = await auth.supabase
    .from('listings')
    .insert({
      title: body.title || 'Untitled Product',
      slug,
      description: body.description || null,
      metal_type: body.metal_type || null,
      grade: body.grade || null,
      price_min: body.price_min || null,
      price_max: body.price_max || null,
      price_unit: body.price_unit || 'per MT',
      currency: body.currency || 'INR',
      is_negotiable: body.is_negotiable !== false,
      quantity_available: body.quantity_available || null,
      unit: body.unit || 'MT',
      moq: body.moq || null,
      listing_type: body.listing_type || 'product',
      listing_role: body.listing_role || 'supplier',
      taxonomy_id: body.taxonomy_id || null,
      seller_profile_id: sellerProfile.id,
      company_id: sellerProfile.company_id,
      is_active: true,
      moderation_status: initialStatus,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, data }, { status: 201 });
}
