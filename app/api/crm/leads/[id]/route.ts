/**
 * Metal Hub — CRM Lead Detail API Route
 *
 * GET    /api/crm/leads/[id]    → Get lead with activities
 * PUT    /api/crm/leads/[id]    → Update lead (stage change, assignment, etc.)
 * DELETE /api/crm/leads/[id]    → Soft delete lead
 */

import { NextResponse } from 'next/server';
import { protectApiRoute, logAdminAction } from '@/lib/auth/protect-route';
import { PERMISSIONS } from '@/lib/constants/permissions';

type RouteParams = { params: { id: string } };

export async function GET(request: Request, { params }: RouteParams) {
  const auth = await protectApiRoute(request, {
    permissions: [PERMISSIONS.CRM_LEADS_LIST],
  });
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { data: lead, error } = await auth.supabase
    .from('leads')
    .select('*')
    .eq('id', params.id)
    .is('deleted_at', null)
    .maybeSingle();

  if (error || !lead) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Lead not found' } },
      { status: 404 },
    );
  }

  // Fetch activities
  const { data: activities } = await auth.supabase
    .from('lead_activities')
    .select('*, profiles:user_id(full_name, email, avatar_url)')
    .eq('lead_id', params.id)
    .order('created_at', { ascending: false })
    .limit(50);

  return NextResponse.json({
    success: true,
    data: { ...lead, activities: activities || [] },
  });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const auth = await protectApiRoute(request, {
    permissions: [PERMISSIONS.CRM_LEADS_UPDATE],
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

  // Get current state for audit diff
  const { data: current } = await auth.supabase
    .from('leads')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (!current) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Lead not found' } },
      { status: 404 },
    );
  }

  // Build update object (only allowed fields)
  const allowedFields = [
    'company_name', 'contact_name', 'contact_email', 'contact_phone',
    'source', 'stage', 'deal_value', 'probability', 'assigned_to',
    'notes', 'next_follow_up', 'lost_reason',
  ];
  const updates: Record<string, any> = { updated_at: new Date().toISOString() };
  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = body[field];
    }
  }

  // Handle stage transitions
  if (body.stage === 'CONVERTED' && current.stage !== 'CONVERTED') {
    updates.converted_at = new Date().toISOString();
  }

  const { data, error } = await auth.supabase
    .from('leads')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 },
    );
  }

  // Log stage change as activity
  if (body.stage && body.stage !== current.stage) {
    await auth.supabase.from('lead_activities').insert({
      lead_id: params.id,
      user_id: auth.user.id,
      type: 'stage_change',
      content: `Stage changed from ${current.stage} to ${body.stage}`,
      metadata: { from: current.stage, to: body.stage },
    });
  }

  // Log note as activity
  if (body.activity_note) {
    await auth.supabase.from('lead_activities').insert({
      lead_id: params.id,
      user_id: auth.user.id,
      type: body.activity_type || 'note',
      content: body.activity_note,
    });
  }

  // Audit log
  await logAdminAction(auth.supabase, {
    userId: auth.user.id,
    action: 'lead_updated',
    resource: 'leads',
    resourceId: params.id,
    details: { changes: updates, previousStage: current.stage },
    request,
  });

  return NextResponse.json({ success: true, data });
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const auth = await protectApiRoute(request, {
    permissions: [PERMISSIONS.CRM_LEADS_DELETE],
  });
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  // Soft delete
  const { error } = await auth.supabase
    .from('leads')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', params.id);

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 },
    );
  }

  await logAdminAction(auth.supabase, {
    userId: auth.user.id,
    action: 'lead_deleted',
    resource: 'leads',
    resourceId: params.id,
    severity: 'warning',
    request,
  });

  return NextResponse.json({ success: true, data: { deleted: true } });
}
