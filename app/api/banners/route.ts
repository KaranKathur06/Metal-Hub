/**
 * Metal Hub — Public Banners API
 * GET /api/banners → Get active banners for homepage
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: { code: 'SERVICE_UNAVAILABLE', message: 'Service unavailable' } }, { status: 503 });
  }

  const { data, error } = await supabase
    .from('banners')
    .select('id, title, subtitle, image_url, cta_text, cta_link, order_index')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (error) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: data || [] });
}
