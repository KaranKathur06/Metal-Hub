/**
 * Metal Hub — Public Marketplace API
 * GET /api/marketplace → Marketplace data (listings + categories + stats)
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: { code: 'SERVICE_UNAVAILABLE', message: 'Service unavailable' } }, { status: 503 });
  }

  // Parallel fetch marketplace data
  const [listingsResult, categoriesResult, statsResult, featuredResult] = await Promise.all([
    // Recent listings
    supabase.from('listings')
      .select('id, title, slug, metal_type, grade, price_min, price_max, currency, moq, created_at, listing_media(url, is_primary), companies:company_id(name, logo_url, city)')
      .eq('is_active', true).eq('moderation_status', 'approved')
      .order('created_at', { ascending: false })
      .limit(12),

    // Active categories from taxonomy
    supabase.from('taxonomy')
      .select('id, name, slug, type, icon, description')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),

    // Platform stats
    Promise.all([
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('companies').select('id', { count: 'exact', head: true }).eq('is_verified', true),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
    ]),

    // Featured listings
    supabase.from('listings')
      .select('id, title, slug, metal_type, grade, price_min, currency, listing_media(url, is_primary), companies:company_id(name, logo_url)')
      .eq('is_active', true).eq('is_featured', true)
      .limit(6),
  ]);

  const [activeListings, verifiedCompanies, totalUsers] = statsResult;

  return NextResponse.json({
    success: true,
    data: {
      recentListings: listingsResult.data || [],
      categories: categoriesResult.data || [],
      featured: featuredResult.data || [],
      stats: {
        activeListings: activeListings.count || 0,
        verifiedSuppliers: verifiedCompanies.count || 0,
        totalUsers: totalUsers.count || 0,
      },
    },
  });
}
