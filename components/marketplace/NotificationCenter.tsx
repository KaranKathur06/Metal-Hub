"use client";

import Link from "next/link";
import { Bell, ChevronRight, ShieldAlert, ShieldCheck } from "lucide-react";
import {
  countUnreadNotifications,
  getNotificationTone,
  type MarketplaceNotification,
} from "../../lib/marketplace/notifications";

type NotificationCenterProps = {
  notifications: MarketplaceNotification[];
};

const toneClasses = {
  neutral: "border-zinc-200 bg-white text-zinc-900",
  warning: "border-amber-500/20 bg-amber-500/10 text-amber-900",
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-900",
  danger: "border-rose-500/20 bg-rose-500/10 text-rose-900",
};

export function NotificationCenter({ notifications }: NotificationCenterProps) {
  const unreadCount = countUnreadNotifications(notifications);

  return (
    <section className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-950 text-white">
            <Bell className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-zinc-950">Notifications</h2>
            <p className="mt-1 text-sm text-zinc-600">Trust, verification, procurement, and security activity in one place.</p>
          </div>
        </div>

        <div className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-700">
          {unreadCount} unread
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {notifications.map((notification) => {
          const tone = getNotificationTone(notification.type);

          return (
            <div key={notification.id} className={`rounded-md border px-3 py-3 ${toneClasses[tone]}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {notification.type === "security" ? (
                      <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
                    ) : notification.type === "trust" ? (
                      <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                    ) : null}
                    <span>{notification.title}</span>
                  </div>
                  {notification.body ? <div className="mt-1 text-sm opacity-80">{notification.body}</div> : null}
                </div>

                {!notification.readAt ? <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500" aria-label="Unread" /> : null}
              </div>

              {notification.href ? (
                <Link className="mt-2 inline-flex items-center gap-1 text-sm font-medium hover:opacity-80" href={notification.href}>
                  Open
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

