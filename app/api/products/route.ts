/**
 * Metal Hub — Products API Route
 *
 * GET  /api/products       → List products (public, filtered, paginated)
 * POST /api/products       → Create a new product listing (sellers only)
 */

import { NextResponse } from 'next/server';
import { protectApiRoute, logAdminAction } from '@/lib/auth/protect-route';
import { PERMISSIONS } from '@/lib/constants/permissions';
import { RATE_LIMITS } from '@/lib/auth/rate-limiter';

export async function GET(request: Request) {
  // Public endpoint — parse user if present but don't require auth
  const auth = await protectApiRoute(request, { allowPublic: true });
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const sort = searchParams.get('sort') || 'created_at';
  const order = searchParams.get('order') || 'desc';

  // Filters
  const metalType = searchParams.get('metal_type');
  const taxonomyId = searchParams.get('taxonomy_id');
  const listingType = searchParams.get('listing_type');
  const listingRole = searchParams.get('listing_role');
  const minPrice = searchParams.get('min_price');
  const maxPrice = searchParams.get('max_price');
  const isFeatured = searchParams.get('featured');
  const search = searchParams.get('search');
  const sellerId = searchParams.get('seller_id');
  const companyId = searchParams.get('company_id');

  let query = auth.supabase
    .from('listings')
    .select(`
      id, title, slug, description, metal_type, grade, material_spec,
      price_min, price_max, price_unit, currency, is_negotiable,
      quantity_available, unit, moq, lead_time,
      listing_type, listing_role, applications, keywords,
      is_featured, views_count, inquiry_count,
      seo_title, seo_description,
      is_active, moderation_status, created_at, updated_at,
      seller_profile_id, company_id,
      taxonomy:taxonomy_id(id, name, slug, type),
      listing_media(id, url, alt_text, media_type, is_primary, sort_order),
      companies:company_id(id, name, logo_url, city, state)
    `, { count: 'exact' })
    .eq('is_active', true)
    .eq('moderation_status', 'approved');

  // Apply filters
  if (metalType) query = query.eq('metal_type', metalType);
  if (taxonomyId) query = query.eq('taxonomy_id', taxonomyId);
  if (listingType) query = query.eq('listing_type', listingType);
  if (listingRole) query = query.eq('listing_role', listingRole);
  if (minPrice) query = query.gte('price_min', parseFloat(minPrice));
  if (maxPrice) query = query.lte('price_max', parseFloat(maxPrice));
  if (isFeatured === 'true') query = query.eq('is_featured', true);
  if (sellerId) query = query.eq('seller_profile_id', sellerId);
  if (companyId) query = query.eq('company_id', companyId);
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,metal_type.ilike.%${search}%,grade.ilike.%${search}%`);
  }

  // Sort mapping
  const sortColumn = sort === 'price' ? 'price_min'
    : sort === 'views' ? 'views_count'
    : sort === 'newest' ? 'created_at'
    : sort;

  query = query
    .order(sortColumn, { ascending: order === 'asc' })
    .range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    data: data || [],
    meta: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
}

export async function POST(request: Request) {
  const auth = await protectApiRoute(request, {
    permissions: [PERMISSIONS.LISTINGS_CREATE],
    rateLimit: RATE_LIMITS.PRODUCT_CREATE,
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

  // Validate required fields
  if (!body.title || body.title.length < 3) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Title is required (min 3 characters)' } },
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
      { success: false, error: { code: 'FORBIDDEN', message: 'Seller profile required to create listings' } },
      { status: 403 },
    );
  }

  // Generate SEO slug
  const slug = generateSlug(body.title, body.metal_type);

  // Determine initial moderation status
  // Verified sellers get auto-approved in development mode
  const isDevTrust = process.env.NEXT_PUBLIC_DEVELOPMENT_TRUST_MODE === 'true';
  const isVerified = sellerProfile.verification_status === 'approved';
  const initialStatus = (isDevTrust || isVerified) ? 'approved' : 'pending';

  const { data, error } = await auth.supabase
    .from('listings')
    .insert({
      title: body.title,
      slug,
      description: body.description || null,
      metal_type: body.metal_type || null,
      grade: body.grade || null,
      material_spec: body.material_spec || null,
      price_min: body.price_min || null,
      price_max: body.price_max || null,
      price_unit: body.price_unit || 'per MT',
      currency: body.currency || 'INR',
      is_negotiable: body.is_negotiable !== false,
      quantity_available: body.quantity_available || null,
      unit: body.unit || 'MT',
      moq: body.moq || null,
      lead_time: body.lead_time || null,
      listing_type: body.listing_type || 'product',
      listing_role: body.listing_role || 'supplier',
      applications: body.applications || [],
      keywords: body.keywords || [],
      taxonomy_id: body.taxonomy_id || null,
      seller_profile_id: sellerProfile.id,
      company_id: sellerProfile.company_id,
      is_active: true,
      moderation_status: initialStatus,
      seo_title: body.seo_title || body.title,
      seo_description: body.seo_description || (body.description?.slice(0, 160) || null),
      expires_at: body.expires_at || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 },
    );
  }

  // Insert specifications if provided
  if (body.specifications && Array.isArray(body.specifications)) {
    const specs = body.specifications.map((spec: any, i: number) => ({
      listing_id: data.id,
      spec_key: spec.key,
      spec_value: spec.value,
      unit: spec.unit || null,
      sort_order: i,
    }));
    await auth.supabase.from('listing_specifications').insert(specs);
  }

  // Insert pricing tiers if provided
  if (body.pricing_tiers && Array.isArray(body.pricing_tiers)) {
    const tiers = body.pricing_tiers.map((tier: any, i: number) => ({
      listing_id: data.id,
      min_quantity: tier.min_quantity,
      max_quantity: tier.max_quantity || null,
      price_per_unit: tier.price_per_unit,
      currency: tier.currency || 'INR',
      sort_order: i,
    }));
    await auth.supabase.from('listing_pricing_tiers').insert(tiers);
  }

  // Audit log
  await logAdminAction(auth.supabase, {
    userId: auth.user.id,
    action: 'listing_created',
    resource: 'listings',
    resourceId: data.id,
    details: { title: body.title, metalType: body.metal_type, status: initialStatus },
    request,
  });

  return NextResponse.json({ success: true, data }, { status: 201 });
}

// ── Slug generation ──
function generateSlug(title: string, metalType?: string): string {
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  if (metalType) {
    slug = `${slug}-${metalType.toLowerCase().replace(/\s+/g, '-')}`;
  }

  // Add random suffix for uniqueness
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${slug}-${suffix}`;
}
