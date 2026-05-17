/**
 * Metal Hub — Company Settings API Route
 *
 * GET /api/settings/company/[id]    → Get company settings (owner/admin)
 * PUT /api/settings/company/[id]    → Update company settings (owner/admin)
 */

import { NextResponse } from 'next/server';
import { protectApiRoute, logAdminAction } from '@/lib/auth/protect-route';

type RouteParams = { params: { id: string } };

export async function GET(request: Request, { params }: RouteParams) {
  const auth = await protectApiRoute(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  // Verify access: company owner or admin
  const { data: company } = await auth.supabase
    .from('companies')
    .select('id, owner_id')
    .eq('id', params.id)
    .maybeSingle();

  if (!company) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Company not found' } },
      { status: 404 },
    );
  }

  const isOwner = company.owner_id === auth.user.id;
  const isAdmin = ['admin', 'super_admin'].includes(auth.role);
  if (!isOwner && !isAdmin) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  let query = auth.supabase
    .from('company_settings')
    .select('id, category, key, value, updated_at')
    .eq('company_id', params.id);

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

  const grouped: Record<string, Record<string, any>> = {};
  for (const setting of data || []) {
    if (!grouped[setting.category]) grouped[setting.category] = {};
    grouped[setting.category][setting.key] = setting.value;
  }

  return NextResponse.json({ success: true, data: grouped });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const auth = await protectApiRoute(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { data: company } = await auth.supabase
    .from('companies')
    .select('id, owner_id')
    .eq('id', params.id)
    .maybeSingle();

  if (!company) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Company not found' } },
      { status: 404 },
    );
  }

  const isOwner = company.owner_id === auth.user.id;
  const isAdmin = ['admin', 'super_admin'].includes(auth.role);
  if (!isOwner && !isAdmin) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
      { status: 403 },
    );
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

  const upserts: any[] = [];
  for (const [category, settings] of Object.entries(body)) {
    if (typeof settings !== 'object' || settings === null) continue;
    for (const [key, value] of Object.entries(settings)) {
      upserts.push({
        company_id: params.id,
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
    .from('company_settings')
    .upsert(upserts, { onConflict: 'company_id,category,key' });

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 },
    );
  }

  await logAdminAction(auth.supabase, {
    userId: auth.user.id,
    action: 'company_settings_updated',
    resource: 'company_settings',
    details: { companyId: params.id, keys: upserts.map(u => `${u.category}.${u.key}`) },
    request,
  });

  return NextResponse.json({ success: true, data: { updated: upserts.length } });
}
