"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  FileText,
  Loader2,
  MessageSquare,
  Package,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import type { MarketplaceNotificationType } from "@/lib/marketplace/notifications";

type ApiNotification = {
  id: string;
  title: string;
  body: string | null;
  type: MarketplaceNotificationType;
  href: string | null;
  read_at: string | null;
  created_at: string;
};

const ICON_MAP: Record<string, typeof Bell> = {
  rfq: MessageSquare,
  quote: FileText,
  verification: ShieldCheck,
  trust: ShieldCheck,
  message: MessageSquare,
  security: ShieldCheck,
  system: Bell,
  listing: Package,
};

export default function NotificationsPage() {
  const { isAuthenticated, loading } = useAuth();
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [marking, setMarking] = useState(false);

  const load = useCallback(async () => {
    setFetching(true);
    try {
      const query = filter === "unread" ? "?unread=true&limit=50" : "?limit=50";
      const response = await fetch(`/api/notifications${query}`, { credentials: "include" });
      if (!response.ok) return;
      const payload = await response.json();
      setNotifications(payload.data ?? []);
    } finally {
      setFetching(false);
    }
  }, [filter]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void load();
  }, [isAuthenticated, load]);

  const markAllRead = async () => {
    setMarking(true);
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      await load();
    } finally {
      setMarking(false);
    }
  };

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read_at: new Date().toISOString() } : item)),
    );
  };

  if (!loading && !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <Bell className="mb-4 h-12 w-12 text-slate-300" />
        <h1 className="mb-2 text-xl font-bold text-slate-900">Login required</h1>
        <p className="mb-6 text-sm text-slate-500">Please login to view notifications.</p>
        <Link href="/login?redirect=/notifications">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }

  const unreadCount = notifications.filter((item) => !item.read_at).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-bold text-slate-900">Notifications</h1>
          <div className="flex items-center gap-2">
            {unreadCount > 0 ? (
              <Button variant="outline" size="sm" onClick={markAllRead} disabled={marking}>
                {marking ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <CheckCheck className="mr-1 h-3 w-3" />}
                Mark all read
              </Button>
            ) : null}
            <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-semibold",
                  filter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500",
                )}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilter("unread")}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-semibold",
                  filter === "unread" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500",
                )}
              >
                Unread
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-6">
        {fetching ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <CheckCheck className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm text-slate-500">You&apos;re all caught up!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => {
              const Icon = ICON_MAP[notif.type] ?? Bell;
              const isUnread = !notif.read_at;
              const content = (
                <>
                  <span
                    className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      isUnread ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{notif.title}</span>
                      {isUnread ? <span className="h-2 w-2 rounded-full bg-blue-500" /> : null}
                    </div>
                    {notif.body ? (
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{notif.body}</p>
                    ) : null}
                    <span className="mt-1 text-[10px] text-slate-400">
                      {new Date(notif.created_at).toLocaleString()}
                    </span>
                  </div>
                </>
              );

              const className = cn(
                "flex w-full items-start gap-4 rounded-xl border bg-white px-5 py-4 text-left transition-colors hover:bg-slate-50",
                isUnread && "border-blue-100 bg-blue-50/30",
              );

              if (notif.href) {
                return (
                  <Link
                    key={notif.id}
                    href={notif.href}
                    className={className}
                    onClick={() => isUnread && void markRead(notif.id)}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={notif.id}
                  type="button"
                  className={className}
                  onClick={() => isUnread && void markRead(notif.id)}
                >
                  {content}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
