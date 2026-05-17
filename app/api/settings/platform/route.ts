/**
 * Metal Hub — Platform Settings API Route
 *
 * GET  /api/settings/platform       → Get all platform settings (admin only)
 * PUT  /api/settings/platform       → Update platform settings (super_admin only)
 */

import { NextResponse } from 'next/server';
import { protectApiRoute, logAdminAction } from '@/lib/auth/protect-route';
import { PERMISSIONS } from '@/lib/constants/permissions';

export async function GET(request: Request) {
  const auth = await protectApiRoute(request, {
    permissions: [PERMISSIONS.SETTINGS_PLATFORM_READ],
    requireAdmin2FA: true,
  });
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { data, error } = await auth.supabase
    .from('platform_settings')
    .select('key, value, description, updated_at')
    .order('key');

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 },
    );
  }

  // Convert to object for convenience
  const settings: Record<string, any> = {};
  for (const row of data || []) {
    settings[row.key] = { value: row.value, description: row.description, updatedAt: row.updated_at };
  }

  return NextResponse.json({ success: true, data: settings });
}

export async function PUT(request: Request) {
  const auth = await protectApiRoute(request, {
    permissions: [PERMISSIONS.SETTINGS_PLATFORM_UPDATE],
    requireAdmin2FA: true,
  });
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  let body: Record<string, any>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request body' } },
      { status: 400 },
    );
  }

  // Body format: { key: value, key2: value2 }
  const updates: string[] = [];
  for (const [key, value] of Object.entries(body)) {
    const { error } = await auth.supabase
      .from('platform_settings')
      .upsert({
        key,
        value: typeof value === 'object' ? value : JSON.parse(JSON.stringify(value)),
        updated_by: auth.user.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' });

    if (!error) updates.push(key);
  }

  // Audit log
  await logAdminAction(auth.supabase, {
    userId: auth.user.id,
    action: 'platform_settings_updated',
    resource: 'platform_settings',
    details: { keys: updates, changes: body },
    severity: 'warning',
    request,
  });

  return NextResponse.json({ success: true, data: { updated: updates } });
}
