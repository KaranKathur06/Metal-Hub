/**
 * GET /api/marketplace/stats — Live platform counters
 * Returns real COUNT(*) from DB tables, no hardcoded numbers.
 */
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ verifiedSuppliers: 0, activeListings: 0, activeRfqs: 0, totalProducts: 0 });
  }

  const [suppliers, listings, rfqs, products] = await Promise.all([
    supabase.from('companies').select('id', { count: 'exact', head: true }).eq('verification_status', 'approved').is('deleted_at', null),
    supabase.from('listings').select('id', { count: 'exact', head: true }).eq('is_active', true).is('deleted_at', null),
    supabase.from('rfqs').select('id', { count: 'exact', head: true }).eq('status', 'open').is('deleted_at', null),
    supabase.from('taxonomy').select('id', { count: 'exact', head: true }).eq('type', 'material').eq('is_active', true),
  ]);

  return NextResponse.json({
    verifiedSuppliers: suppliers.count || 0,
    activeListings: listings.count || 0,
    activeRfqs: rfqs.count || 0,
    totalProducts: products.count || 0,
  });
}
