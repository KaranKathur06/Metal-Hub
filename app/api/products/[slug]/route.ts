/**
 * Metal Hub — Product Detail API Route
 *
 * GET    /api/products/[slug]               → Get product by slug (public)
 * PUT    /api/products/[slug]               → Update product (owner/admin)
 * DELETE /api/products/[slug]               → Soft delete (owner/admin)
 */

import { NextResponse } from 'next/server';
import { protectApiRoute, logAdminAction } from '@/lib/auth/protect-route';

type RouteParams = { params: { slug: string } };

export async function GET(request: Request, { params }: RouteParams) {
  const auth = await protectApiRoute(request, { allowPublic: true });
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { data: product, error } = await auth.supabase
    .from('listings')
    .select(`
      *,
      taxonomy:taxonomy_id(id, name, slug, type, parent_id),
      listing_media(id, url, alt_text, media_type, is_primary, sort_order),
      listing_specifications(id, spec_key, spec_value, unit, sort_order),
      listing_pricing_tiers(id, min_quantity, max_quantity, price_per_unit, currency, sort_order),
      companies:company_id(id, name, logo_url, website, city, state, country, industry_type, is_verified),
      seller_profiles:seller_profile_id(id, company_name, verification_status, certifications)
    `)
    .eq('slug', params.slug)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !product) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
      { status: 404 },
    );
  }

  // Increment view count (deduplicated per session via IP)
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const viewKey = `view:${product.id}:${ip}`;

  // Simple deduplication: check rate_limits for recent view from same IP
  const { data: recentView } = await auth.supabase
    .from('rate_limits')
    .select('id')
    .eq('identifier', viewKey)
    .eq('action', 'product_view')
    .gt('window_end', new Date().toISOString())
    .maybeSingle();

  if (!recentView) {
    // No recent view — increment and record
    try {
      await auth.supabase.rpc('increment_listing_views', { listing_id: product.id });
    } catch {
      // Fallback: direct update if RPC doesn't exist
      await auth.supabase
        .from('listings')
        .update({ views_count: (product.views_count || 0) + 1 })
        .eq('id', product.id);
    }

    // Record view for deduplication (1 hour window)
    const windowEnd = new Date(Date.now() + 3600000);
    try {
      await auth.supabase.from('rate_limits').insert({
        identifier: viewKey,
        action: 'product_view',
        attempts: 1,
        window_start: new Date().toISOString(),
        window_end: windowEnd.toISOString(),
      });
    } catch { /* Silently ignore if fails */ }
  }

  // Sort media and specs
  if (product.listing_media) {
    product.listing_media.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
  }
  if (product.listing_specifications) {
    product.listing_specifications.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
  }
  if (product.listing_pricing_tiers) {
    product.listing_pricing_tiers.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
  }

  return NextResponse.json({ success: true, data: product });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const auth = await protectApiRoute(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  // Get current listing
  const { data: current } = await auth.supabase
    .from('listings')
    .select('*, seller_profiles:seller_profile_id(profile_id)')
    .eq('slug', params.slug)
    .maybeSingle();

  if (!current) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
      { status: 404 },
    );
  }

  // Access check: owner or admin
  // seller_profiles join returns an object (single relation via FK)
  const sellerProfiles = current.seller_profiles as any;
  const isOwner = sellerProfiles?.profile_id === auth.user.id;
  const isAdmin = ['admin', 'super_admin'].includes(auth.role);
  if (!isOwner && !isAdmin) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Only the listing owner or admin can edit' } },
      { status: 403 },
    );
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

  // Build update object (allowed fields only)
  const allowedFields = [
    'title', 'description', 'metal_type', 'grade', 'material_spec',
    'price_min', 'price_max', 'price_unit', 'currency', 'is_negotiable',
    'quantity_available', 'unit', 'moq', 'lead_time',
    'listing_type', 'listing_role', 'applications', 'keywords',
    'taxonomy_id', 'seo_title', 'seo_description', 'expires_at',
  ];

  // Admins can also update moderation fields
  const adminFields = ['is_active', 'moderation_status', 'is_featured', 'featured_until'];

  const updates: Record<string, any> = { updated_at: new Date().toISOString() };
  for (const field of allowedFields) {
    if (field in body) updates[field] = body[field];
  }
  if (isAdmin) {
    for (const field of adminFields) {
      if (field in body) updates[field] = body[field];
    }
  }

  const { data, error } = await auth.supabase
    .from('listings')
    .update(updates)
    .eq('id', current.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 },
    );
  }

  // Update specifications if provided
  if (body.specifications && Array.isArray(body.specifications)) {
    // Delete existing specs
    await auth.supabase.from('listing_specifications').delete().eq('listing_id', current.id);
    // Insert new
    const specs = body.specifications.map((spec: any, i: number) => ({
      listing_id: current.id,
      spec_key: spec.key,
      spec_value: spec.value,
      unit: spec.unit || null,
      sort_order: i,
    }));
    if (specs.length > 0) await auth.supabase.from('listing_specifications').insert(specs);
  }

  // Update pricing tiers if provided
  if (body.pricing_tiers && Array.isArray(body.pricing_tiers)) {
    await auth.supabase.from('listing_pricing_tiers').delete().eq('listing_id', current.id);
    const tiers = body.pricing_tiers.map((tier: any, i: number) => ({
      listing_id: current.id,
      min_quantity: tier.min_quantity,
      max_quantity: tier.max_quantity || null,
      price_per_unit: tier.price_per_unit,
      currency: tier.currency || 'INR',
      sort_order: i,
    }));
    if (tiers.length > 0) await auth.supabase.from('listing_pricing_tiers').insert(tiers);
  }

  // Audit log
  await logAdminAction(auth.supabase, {
    userId: auth.user.id,
    action: 'listing_updated',
    resource: 'listings',
    resourceId: current.id,
    details: { changes: Object.keys(updates), isAdmin },
    request,
  });

  return NextResponse.json({ success: true, data });
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const auth = await protectApiRoute(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { data: current } = await auth.supabase
    .from('listings')
    .select('id, seller_profiles:seller_profile_id(profile_id)')
    .eq('slug', params.slug)
    .maybeSingle();

  if (!current) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
      { status: 404 },
    );
  }

  const delSellerProfiles = current.seller_profiles as any;
  const isOwner = delSellerProfiles?.profile_id === auth.user.id;
  const isAdmin = ['admin', 'super_admin'].includes(auth.role);
  if (!isOwner && !isAdmin) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
      { status: 403 },
    );
  }

  // Soft delete: deactivate
  await auth.supabase
    .from('listings')
    .update({ is_active: false, moderation_status: 'expired', updated_at: new Date().toISOString() })
    .eq('id', current.id);

  await logAdminAction(auth.supabase, {
    userId: auth.user.id,
    action: 'listing_deleted',
    resource: 'listings',
    resourceId: current.id,
    severity: 'warning',
    request,
  });

  return NextResponse.json({ success: true, data: { deleted: true } });
}
