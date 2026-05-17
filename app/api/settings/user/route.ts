/**
 * Metal Hub — User Settings API Route
 *
 * GET  /api/settings/user          → Get all settings for current user
 * PUT  /api/settings/user          → Batch update settings
 *
 * Settings are stored as key-value pairs in user_settings table.
 */

import { NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth/protect-route';

export async function GET(request: Request) {
  const auth = await protectApiRoute(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  let query = auth.supabase
    .from('user_settings')
    .select('id, category, key, value, updated_at')
    .eq('user_id', auth.user.id);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query.order('category').order('key');

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 },
    );
  }

  // Group by category for convenience
  const grouped: Record<string, Record<string, any>> = {};
  for (const setting of data || []) {
    if (!grouped[setting.category]) {
      grouped[setting.category] = {};
    }
    grouped[setting.category][setting.key] = setting.value;
  }

  return NextResponse.json({ success: true, data: grouped });
}

export async function PUT(request: Request) {
  const auth = await protectApiRoute(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  let body: Record<string, Record<string, any>>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request body' } },
      { status: 400 },
    );
  }

  // Body format: { category: { key: value, ... }, ... }
  const upserts: { user_id: string; category: string; key: string; value: any; updated_at: string }[] = [];

  for (const [category, settings] of Object.entries(body)) {
    if (typeof settings !== 'object' || settings === null) continue;
    for (const [key, value] of Object.entries(settings)) {
      upserts.push({
        user_id: auth.user.id,
        category,
        key,
        value: typeof value === 'object' ? value : JSON.parse(JSON.stringify(value)),
        updated_at: new Date().toISOString(),
      });
    }
  }

  if (upserts.length === 0) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'No settings to update' } },
      { status: 400 },
    );
  }

  const { error } = await auth.supabase
    .from('user_settings')
    .upsert(upserts, { onConflict: 'user_id,category,key' });

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, data: { updated: upserts.length } });
}
