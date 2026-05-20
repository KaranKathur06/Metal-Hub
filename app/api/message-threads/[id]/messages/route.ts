import { NextResponse } from "next/server";
import { protectApiRoute } from "@/lib/auth/protect-route";
import {
  getCounterpartyProfileId,
  listThreadMessages,
  sendThreadMessage,
} from "@/lib/marketplace/messaging";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const auth = await protectApiRoute(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;

  try {
    const messages = await listThreadMessages(auth.supabase, id, auth.user.id);
    return NextResponse.json({ success: true, data: messages });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load messages";
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message } },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await protectApiRoute(request);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { id: threadId } = await context.params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid body" } },
      { status: 400 },
    );
  }

  const messageBody = typeof body.body === "string" ? body.body : "";
  if (!messageBody.trim()) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "body is required" } },
      { status: 400 },
    );
  }

  try {
    const notifyProfileId = await getCounterpartyProfileId(
      auth.supabase,
      threadId,
      auth.user.id,
    );

    const message = await sendThreadMessage(auth.supabase, {
      threadId,
      senderId: auth.user.id,
      body: messageBody,
      notifyProfileId,
      notificationTitle: "New procurement message",
      notificationHref: `/messages/${threadId}`,
    });

    return NextResponse.json({ success: true, data: message });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send message";
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message } },
      { status: 500 },
    );
  }
}
