/**
 * Metal Hub — Public Capabilities API
 * GET /api/capabilities → Get taxonomy items (capabilities, industries, products)
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: { code: 'SERVICE_UNAVAILABLE', message: 'Service unavailable' } }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'capability', 'industry', 'product_category'

  let query = supabase
    .from('taxonomy')
    .select('id, name, slug, type, description, icon, parent_id, sort_order, is_active')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }

  // Build tree structure if no type filter
  if (!type) {
    const grouped: Record<string, any[]> = {};
    for (const item of data || []) {
      if (!grouped[item.type]) grouped[item.type] = [];
      grouped[item.type].push(item);
    }
    return NextResponse.json({ success: true, data: grouped });
  }

  return NextResponse.json({ success: true, data: data || [] });
}
