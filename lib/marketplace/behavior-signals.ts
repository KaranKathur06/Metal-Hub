export type SupplierActivityEventType =
  | "login"
  | "profile_updated"
  | "listing_created"
  | "listing_updated"
  | "listing_media_added"
  | "rfq_viewed"
  | "rfq_replied"
  | "quote_submitted"
  | "message_replied"
  | "document_uploaded";

export type SupplierActivityEvent = {
  eventType: SupplierActivityEventType;
  scoreImpact: number;
  description: string;
};

export const SUPPLIER_ACTIVITY_EVENTS: Record<SupplierActivityEventType, SupplierActivityEvent> = {
  login: {
    eventType: "login",
    scoreImpact: 0.25,
    description: "Supplier account showed recent activity.",
  },
  profile_updated: {
    eventType: "profile_updated",
    scoreImpact: 1,
    description: "Supplier improved marketplace profile quality.",
  },
  listing_created: {
    eventType: "listing_created",
    scoreImpact: 1.5,
    description: "Supplier added marketplace inventory.",
  },
  listing_updated: {
    eventType: "listing_updated",
    scoreImpact: 0.75,
    description: "Supplier kept listing information fresh.",
  },
  listing_media_added: {
    eventType: "listing_media_added",
    scoreImpact: 1.25,
    description: "Supplier added media evidence to listings.",
  },
  rfq_viewed: {
    eventType: "rfq_viewed",
    scoreImpact: 0.5,
    description: "Supplier reviewed buyer demand.",
  },
  rfq_replied: {
    eventType: "rfq_replied",
    scoreImpact: 2,
    description: "Supplier replied to buyer RFQ.",
  },
  quote_submitted: {
    eventType: "quote_submitted",
    scoreImpact: 2.5,
    description: "Supplier submitted a quote.",
  },
  message_replied: {
    eventType: "message_replied",
    scoreImpact: 1.5,
    description: "Supplier replied to buyer communication.",
  },
  document_uploaded: {
    eventType: "document_uploaded",
    scoreImpact: 1.25,
    description: "Supplier submitted verification evidence.",
  },
};

export function normalizeActivityScore(input: {
  recentLoginCount?: number;
  profileUpdateCount?: number;
  listingUpdateCount?: number;
  rfqReplyCount?: number;
  quoteSubmissionCount?: number;
  messageReplyCount?: number;
}) {
  const rawScore =
    (input.recentLoginCount ?? 0) * 0.75 +
    (input.profileUpdateCount ?? 0) * 2 +
    (input.listingUpdateCount ?? 0) * 1.5 +
    (input.rfqReplyCount ?? 0) * 4 +
    (input.quoteSubmissionCount ?? 0) * 4 +
    (input.messageReplyCount ?? 0) * 3;

  return Math.max(0, Math.min(100, Math.round(rawScore)));
}

export function normalizeResponseScore(input: {
  responseRate?: number | null;
  averageResponseHours?: number | null;
}) {
  const responseRateScore = Math.max(0, Math.min(100, input.responseRate ?? 0));

  if (!input.averageResponseHours || input.averageResponseHours <= 0) {
    return responseRateScore;
  }

  const speedScore = input.averageResponseHours <= 4
    ? 100
    : input.averageResponseHours <= 12
      ? 80
      : input.averageResponseHours <= 24
        ? 60
        : input.averageResponseHours <= 48
          ? 40
          : 20;

  return Math.round(responseRateScore * 0.65 + speedScore * 0.35);
}

