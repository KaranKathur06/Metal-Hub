"use client";

type NotificationBellBadgeProps = {
  unreadCount: number;
};

export function NotificationBellBadge({ unreadCount }: NotificationBellBadgeProps) {
  if (unreadCount <= 0) {
    return null;
  }

  return (
    <span className="absolute -right-1 -top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-zinc-950">
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
}

