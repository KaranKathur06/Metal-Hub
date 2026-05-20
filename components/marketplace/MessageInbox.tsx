"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MessageThreadSummary, ThreadMessage } from "@/lib/marketplace/messaging";

export function MessageInbox() {
  const [threads, setThreads] = useState<MessageThreadSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadThreads = useCallback(async () => {
    const response = await fetch("/api/message-threads");
    const result = await response.json();
    if (!response.ok) {
      setError(result.error?.message ?? "Failed to load messages");
      return;
    }
    setThreads(result.data ?? []);
    if (!selectedId && result.data?.[0]?.id) {
      setSelectedId(result.data[0].id);
    }
  }, [selectedId]);

  const loadMessages = useCallback(async (threadId: string) => {
    const response = await fetch(`/api/message-threads/${threadId}/messages`);
    const result = await response.json();
    if (response.ok) {
      setMessages(result.data ?? []);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await loadThreads();
      setLoading(false);
    })();
  }, [loadThreads]);

  useEffect(() => {
    if (!selectedId) return;
    void loadMessages(selectedId);
  }, [selectedId, loadMessages]);

  const handleSend = async () => {
    if (!selectedId || !draft.trim()) return;
    setSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/message-threads/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: draft }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error?.message ?? "Failed to send");
        return;
      }
      setDraft("");
      await loadMessages(selectedId);
      await loadThreads();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!threads.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
        <MessageSquare className="mx-auto mb-3 h-10 w-10 text-slate-300" />
        <p>No conversations yet.</p>
        <p className="mt-1">Messages start when you post an RFQ or receive a supplier quote.</p>
        <Link href="/post-requirement" className="mt-4 inline-block">
          <Button variant="outline" size="sm">
            Post a requirement
          </Button>
        </Link>
      </div>
    );
  }

  const active = threads.find((thread) => thread.id === selectedId);

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <div className="max-h-[420px] space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
        {threads.map((thread) => (
          <button
            key={thread.id}
            type="button"
            onClick={() => setSelectedId(thread.id)}
            className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
              thread.id === selectedId ? "bg-white shadow-sm" : "hover:bg-white/70"
            }`}
          >
            <p className="font-semibold text-slate-900 line-clamp-1">
              {thread.rfqTitle ?? "Procurement thread"}
            </p>
            <p className="mt-0.5 text-xs text-slate-500 capitalize">{thread.role}</p>
            {thread.lastMessagePreview ? (
              <p className="mt-1 line-clamp-2 text-xs text-slate-600">{thread.lastMessagePreview}</p>
            ) : null}
          </button>
        ))}
      </div>

      <div className="flex min-h-[420px] flex-col rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="font-semibold text-slate-900">{active?.rfqTitle ?? "Conversation"}</p>
          {active?.rfqSlug ? (
            <Link href={`/rfq/${active.rfqSlug}`} className="text-xs text-blue-700 hover:underline">
              View RFQ
            </Link>
          ) : null}
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                message.isOwn
                  ? "ml-auto bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-800"
              }`}
            >
              {message.body}
            </div>
          ))}
        </div>

        {error ? <p className="px-4 text-xs text-red-600">{error}</p> : null}

        <div className="flex gap-2 border-t border-slate-100 p-3">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a message..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
          />
          <Button onClick={handleSend} disabled={sending}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
