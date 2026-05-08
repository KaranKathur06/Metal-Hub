export type SupplierOpsQueueType =
  | "verification_backlog"
  | "recent_submission"
  | "follow_up";

export type SupplierOpsQueueItem = {
  id: string;
  title: string;
  supplierName: string;
  supplierHref?: string | null;
  queueType: SupplierOpsQueueType;
  statusLabel: string;
  ageHours?: number | null;
  reviewerNotes?: string | null;
  href?: string | null;
  createdAt?: string | null;
};

export function groupSupplierOpsQueue(items: SupplierOpsQueueItem[]) {
  return {
    verificationBacklog: items.filter((item) => item.queueType === "verification_backlog"),
    recentSubmissions: items.filter((item) => item.queueType === "recent_submission"),
    followUps: items.filter((item) => item.queueType === "follow_up"),
  };
}

export function summarizeSupplierOpsQueue(input: {
  pendingCount: number;
  approvedToday: number;
  averageReviewHours?: number | null;
}) {
  return [
    {
      key: "pending",
      label: "Pending reviews",
      value: String(input.pendingCount),
    },
    {
      key: "approved_today",
      label: "Approved today",
      value: String(input.approvedToday),
    },
    {
      key: "avg_review_time",
      label: "Avg review time",
      value: input.averageReviewHours ? `${Math.round(input.averageReviewHours)}h` : "-",
    },
  ];
}

export function formatQueueAge(ageHours?: number | null) {
  if (!ageHours || ageHours <= 0) {
    return "New";
  }

  if (ageHours < 24) {
    return `${Math.round(ageHours)}h old`;
  }

  return `${Math.round(ageHours / 24)}d old`;
}

