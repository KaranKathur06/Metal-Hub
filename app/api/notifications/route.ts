/**
 * Metal Hub — Notifications API Route
 *
 * GET /api/notifications          → Get user's notifications (paginated)
 * PUT /api/notifications          → Mark notifications as read (batch)
 */

import { NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth/protect-route';

export async function GET(request: Request) {
  const auth = await protectApiRoute(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const unreadOnly = searchParams.get('unread') === 'true';

  let query = auth.supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (unreadOnly) {
    query = query.eq('is_read', false);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 },
    );
  }

  // Unread count (always include)
  const { count: unreadCount } = await auth.supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', auth.user.id)
    .eq('is_read', false);

  return NextResponse.json({
    success: true,
    data: data || [],
    meta: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      unreadCount: unreadCount || 0,
    },
  });
}

export async function PUT(request: Request) {
  const auth = await protectApiRoute(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  let body: { ids?: string[]; markAllRead?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request body' } },
      { status: 400 },
    );
  }

  if (body.markAllRead) {
    // Mark all as read
    const { error } = await auth.supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', auth.user.id)
      .eq('is_read', false);

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: { markedAllRead: true } });
  }

  if (body.ids && body.ids.length > 0) {
    // Mark specific notifications as read
    const { error } = await auth.supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', auth.user.id)
      .in('id', body.ids);

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: { marked: body.ids.length } });
  }

  return NextResponse.json(
    { success: false, error: { code: 'VALIDATION_ERROR', message: 'Provide ids or markAllRead' } },
    { status: 400 },
  );
}
