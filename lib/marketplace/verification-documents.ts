export type VerificationDocumentStatus = "draft" | "pending" | "in_review" | "approved" | "rejected" | "expired";

export type VerificationDocumentRecord = {
  id: string;
  documentType: string;
  fileUrl: string;
  status: VerificationDocumentStatus;
  reviewerNotes?: string | null;
  reviewedAt?: string | null;
  expiresAt?: string | null;
  createdAt?: string | null;
};

export function getVerificationStatusLabel(status: VerificationDocumentStatus) {
  const labels: Record<VerificationDocumentStatus, string> = {
    draft: "Draft",
    pending: "Pending review",
    in_review: "In review",
    approved: "Approved",
    rejected: "Rejected",
    expired: "Expired",
  };

  return labels[status];
}

export function getVerificationStatusTone(status: VerificationDocumentStatus) {
  const tones: Record<VerificationDocumentStatus, "neutral" | "warning" | "success" | "danger"> = {
    draft: "neutral",
    pending: "warning",
    in_review: "warning",
    approved: "success",
    rejected: "danger",
    expired: "danger",
  };

  return tones[status];
}

export function summarizeVerificationDocuments(documents: VerificationDocumentRecord[]) {
  return documents.reduce(
    (summary, document) => {
      summary.total += 1;
      summary[document.status] += 1;
      return summary;
    },
    {
      total: 0,
      draft: 0,
      pending: 0,
      in_review: 0,
      approved: 0,
      rejected: 0,
      expired: 0,
    },
  );
}

