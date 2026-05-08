export type MarketplaceNotificationType =
  | "system"
  | "trust"
  | "verification"
  | "rfq"
  | "quote"
  | "message"
  | "security";

export type MarketplaceNotification = {
  id: string;
  title: string;
  body?: string | null;
  type: MarketplaceNotificationType;
  href?: string | null;
  readAt?: string | null;
  createdAt: string;
};

export function createNotification(input: {
  profileId: string;
  title: string;
  body?: string | null;
  type?: MarketplaceNotificationType;
  href?: string | null;
  metadata?: Record<string, unknown>;
}) {
  return {
    profile_id: input.profileId,
    title: input.title,
    body: input.body ?? null,
    type: input.type ?? "system",
    href: input.href ?? null,
    metadata: input.metadata ?? {},
  };
}

export function countUnreadNotifications(notifications: MarketplaceNotification[]) {
  return notifications.filter((notification) => !notification.readAt).length;
}

export function getNotificationTone(type: MarketplaceNotificationType) {
  const tones: Record<MarketplaceNotificationType, "neutral" | "warning" | "success" | "danger"> = {
    system: "neutral",
    trust: "success",
    verification: "warning",
    rfq: "neutral",
    quote: "success",
    message: "neutral",
    security: "danger",
  };

  return tones[type];
}

