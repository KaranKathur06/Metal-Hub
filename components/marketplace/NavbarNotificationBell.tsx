"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { NotificationBellBadge } from "@/components/marketplace/NotificationBellBadge";

export function NavbarNotificationBell() {
  const { isAuthenticated, loading } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await fetch("/api/notifications?limit=1&unread=true", {
        credentials: "include",
      });
      if (!response.ok) return;
      const payload = await response.json();
      setUnreadCount(payload.meta?.unreadCount ?? 0);
    } catch {
      // ignore polling errors
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (loading) return;
    void refresh();
    const interval = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(interval);
  }, [loading, refresh]);

  if (!isAuthenticated) return null;

  return (
    <Link
      href="/notifications"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
    >
      <Bell className="h-4 w-4" />
      <NotificationBellBadge unreadCount={unreadCount} />
    </Link>
  );
}
