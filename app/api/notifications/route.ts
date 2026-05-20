/**
 * GET  /api/notifications — Paginated notifications for current profile
 * PUT  /api/notifications — Mark notifications read (by id or all)
 */

import { NextResponse } from "next/server";
import { protectApiRoute } from "@/lib/auth/protect-route";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await protectApiRoute(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const unreadOnly = searchParams.get("unread") === "true";

  let query = auth.supabase
    .from("notifications")
    .select("id, title, body, type, href, read_at, created_at", { count: "exact" })
    .eq("profile_id", auth.user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (unreadOnly) {
    query = query.is("read_at", null);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message } },
      { status: 500 },
    );
  }

  const { count: unreadCount } = await auth.supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", auth.user.id)
    .is("read_at", null)
    .is("deleted_at", null);

  return NextResponse.json({
    success: true,
    data: data ?? [],
    meta: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
      unreadCount: unreadCount ?? 0,
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
      { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid request body" } },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();

  if (body.markAllRead) {
    const { error } = await auth.supabase
      .from("notifications")
      .update({ read_at: now })
      .eq("profile_id", auth.user.id)
      .is("read_at", null);

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: "SERVER_ERROR", message: error.message } },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: { markedAllRead: true } });
  }

  if (body.ids && body.ids.length > 0) {
    const { error } = await auth.supabase
      .from("notifications")
      .update({ read_at: now })
      .eq("profile_id", auth.user.id)
      .in("id", body.ids);

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: "SERVER_ERROR", message: error.message } },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: { marked: body.ids.length } });
  }

  return NextResponse.json(
    { success: false, error: { code: "VALIDATION_ERROR", message: "Provide ids or markAllRead" } },
    { status: 400 },
  );
}
