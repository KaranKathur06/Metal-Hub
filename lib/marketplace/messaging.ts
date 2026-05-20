import type { SupabaseClient } from "@supabase/supabase-js";
import { createNotification } from "./notifications";

export type MessageThreadSummary = {
  id: string;
  rfqId: string | null;
  quoteId: string | null;
  status: string;
  lastMessageAt: string | null;
  rfqTitle: string | null;
  rfqSlug: string | null;
  lastMessagePreview: string | null;
  role: "buyer" | "seller";
};

export type ThreadMessage = {
  id: string;
  body: string;
  senderId: string | null;
  createdAt: string;
  readAt: string | null;
  isOwn: boolean;
};

export async function ensureProcurementThread(
  supabase: SupabaseClient,
  input: {
    rfqId: string;
    buyerProfileId: string;
    sellerProfileId: string;
    quoteId?: string | null;
  },
) {
  const { data: existing } = await supabase
    .from("message_threads")
    .select("id")
    .eq("rfq_id", input.rfqId)
    .eq("buyer_profile_id", input.buyerProfileId)
    .eq("seller_profile_id", input.sellerProfileId)
    .maybeSingle();

  if (existing?.id) {
    if (input.quoteId) {
      await supabase
        .from("message_threads")
        .update({ quote_id: input.quoteId, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
    }
    return existing.id;
  }

  const { data: created, error } = await supabase
    .from("message_threads")
    .insert({
      rfq_id: input.rfqId,
      quote_id: input.quoteId ?? null,
      buyer_profile_id: input.buyerProfileId,
      seller_profile_id: input.sellerProfileId,
      status: "open",
    })
    .select("id")
    .single();

  if (error || !created) {
    throw new Error(error?.message ?? "Failed to create message thread");
  }

  return created.id;
}

export async function sendThreadMessage(
  supabase: SupabaseClient,
  input: {
    threadId: string;
    senderId: string;
    body: string;
    notifyProfileId?: string | null;
    notificationTitle?: string;
    notificationHref?: string;
  },
) {
  const trimmed = input.body.trim();
  if (!trimmed) {
    throw new Error("Message body is required");
  }

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      thread_id: input.threadId,
      sender_id: input.senderId,
      body: trimmed,
    })
    .select("id, body, sender_id, created_at, read_at")
    .single();

  if (error || !message) {
    throw new Error(error?.message ?? "Failed to send message");
  }

  await supabase
    .from("message_threads")
    .update({
      last_message_at: message.created_at,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.threadId);

  if (input.notifyProfileId) {
    await supabase.from("notifications").insert(
      createNotification({
        profileId: input.notifyProfileId,
        title: input.notificationTitle ?? "New message",
        body: trimmed.slice(0, 140),
        type: "message",
        href: input.notificationHref ?? `/messages/${input.threadId}`,
      }),
    );
  }

  return message;
}

export async function listUserThreads(
  supabase: SupabaseClient,
  userId: string,
): Promise<MessageThreadSummary[]> {
  const [{ data: buyerProfile }, { data: sellerProfile }] = await Promise.all([
    supabase.from("buyer_profiles").select("id").eq("profile_id", userId).maybeSingle(),
    supabase.from("seller_profiles").select("id").eq("profile_id", userId).maybeSingle(),
  ]);

  const filters: string[] = [];
  if (buyerProfile?.id) filters.push(`buyer_profile_id.eq.${buyerProfile.id}`);
  if (sellerProfile?.id) filters.push(`seller_profile_id.eq.${sellerProfile.id}`);

  if (!filters.length) return [];

  let query = supabase
    .from("message_threads")
    .select(
      `
      id,
      rfq_id,
      quote_id,
      status,
      last_message_at,
      buyer_profile_id,
      seller_profile_id,
      rfqs:rfq_id(title, slug),
      messages(body, created_at)
    `,
    )
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(40);

  query = query.or(filters.join(","));

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => {
    const messages = (row.messages as Array<{ body: string; created_at: string }> | null) ?? [];
    const sorted = [...messages].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    const rfq = Array.isArray(row.rfqs) ? row.rfqs[0] : row.rfqs;

    return {
      id: row.id,
      rfqId: row.rfq_id,
      quoteId: row.quote_id,
      status: row.status,
      lastMessageAt: row.last_message_at,
      rfqTitle: rfq?.title ?? null,
      rfqSlug: rfq?.slug ?? null,
      lastMessagePreview: sorted[0]?.body ?? null,
      role:
        buyerProfile?.id && row.buyer_profile_id === buyerProfile.id
          ? "buyer"
          : "seller",
    } satisfies MessageThreadSummary;
  });
}

export async function listThreadMessages(
  supabase: SupabaseClient,
  threadId: string,
  userId: string,
): Promise<ThreadMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id, body, sender_id, created_at, read_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    body: row.body,
    senderId: row.sender_id,
    createdAt: row.created_at,
    readAt: row.read_at,
    isOwn: row.sender_id === userId,
  }));
}

export async function getCounterpartyProfileId(
  supabase: SupabaseClient,
  threadId: string,
  currentUserId: string,
): Promise<string | null> {
  const { data: thread } = await supabase
    .from("message_threads")
    .select(
      `
      buyer_profile_id,
      seller_profile_id,
      buyer_profiles:buyer_profile_id(profile_id),
      seller_profiles:seller_profile_id(profile_id)
    `,
    )
    .eq("id", threadId)
    .maybeSingle();

  if (!thread) return null;

  const buyer = Array.isArray(thread.buyer_profiles)
    ? thread.buyer_profiles[0]
    : thread.buyer_profiles;
  const seller = Array.isArray(thread.seller_profiles)
    ? thread.seller_profiles[0]
    : thread.seller_profiles;

  if (buyer?.profile_id === currentUserId) {
    return seller?.profile_id ?? null;
  }

  if (seller?.profile_id === currentUserId) {
    return buyer?.profile_id ?? null;
  }

  return null;
}
