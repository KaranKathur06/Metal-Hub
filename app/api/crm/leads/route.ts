/**
 * Metal Hub — CRM Leads API Route
 *
 * GET  /api/crm/leads    → List leads (filtered, paginated)
 * POST /api/crm/leads    → Create a new lead
 */

import { NextResponse } from 'next/server';
import { protectApiRoute, logAdminAction } from '@/lib/auth/protect-route';
import { PERMISSIONS } from '@/lib/constants/permissions';

export async function GET(request: Request) {
  const auth = await protectApiRoute(request, {
    permissions: [PERMISSIONS.CRM_LEADS_LIST],
  });
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const stage = searchParams.get('stage');
  const assignedTo = searchParams.get('assigned_to');
  const source = searchParams.get('source');
  const sort = searchParams.get('sort') || 'created_at';
  const order = searchParams.get('order') || 'desc';
  const search = searchParams.get('search');

  // Build query
  let query = auth.supabase
    .from('leads')
    .select('*, lead_activities(count)', { count: 'exact' })
    .is('deleted_at', null);

  if (stage) query = query.eq('stage', stage);
  if (assignedTo) query = query.eq('assigned_to', assignedTo);
  if (source) query = query.eq('source', source);
  if (search) {
    query = query.or(`company_name.ilike.%${search}%,contact_name.ilike.%${search}%,contact_email.ilike.%${search}%`);
  }

  query = query
    .order(sort, { ascending: order === 'asc' })
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
    permissions: [PERMISSIONS.CRM_LEADS_CREATE],
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
  if (!body.company_name || !body.contact_name) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'company_name and contact_name are required' } },
      { status: 400 },
    );
  }

  const { data, error } = await auth.supabase
    .from('leads')
    .insert({
      company_name: body.company_name,
      contact_name: body.contact_name,
      contact_email: body.contact_email || null,
      contact_phone: body.contact_phone || null,
      source: body.source || 'MANUAL',
      stage: body.stage || 'NEW',
      deal_value: body.deal_value || null,
      probability: body.probability || 0,
      assigned_to: body.assigned_to || auth.user.id,
      notes: body.notes || null,
      next_follow_up: body.next_follow_up || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 },
    );
  }

  // Create initial activity
  await auth.supabase.from('lead_activities').insert({
    lead_id: data.id,
    user_id: auth.user.id,
    type: 'created',
    content: `Lead created from ${body.source || 'manual entry'}`,
  });

  // Audit log
  await logAdminAction(auth.supabase, {
    userId: auth.user.id,
    action: 'lead_created',
    resource: 'leads',
    resourceId: data.id,
    details: { company: body.company_name, source: body.source },
    request,
  });

  return NextResponse.json({ success: true, data }, { status: 201 });
}
