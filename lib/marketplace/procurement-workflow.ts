export type RfqStatus = "draft" | "open" | "in_review" | "quoted" | "closed" | "cancelled";
export type QuoteStatus = "draft" | "submitted" | "viewed" | "shortlisted" | "accepted" | "rejected" | "withdrawn" | "expired";
export type MessageThreadStatus = "open" | "archived" | "closed";

export type RfqAction = "edit" | "publish" | "cancel" | "close" | "quote";
export type QuoteAction = "edit" | "submit" | "withdraw" | "accept" | "reject" | "shortlist";

export function canTransitionRfq(status: RfqStatus, action: RfqAction) {
  const transitions: Record<RfqStatus, RfqAction[]> = {
    draft: ["edit", "publish", "cancel"],
    open: ["quote", "close", "cancel"],
    in_review: ["quote", "close", "cancel"],
    quoted: ["quote", "close", "cancel"],
    closed: [],
    cancelled: [],
  };

  return transitions[status].includes(action);
}

export function canTransitionQuote(status: QuoteStatus, action: QuoteAction) {
  const transitions: Record<QuoteStatus, QuoteAction[]> = {
    draft: ["edit", "submit", "withdraw"],
    submitted: ["withdraw", "shortlist", "accept", "reject"],
    viewed: ["withdraw", "shortlist", "accept", "reject"],
    shortlisted: ["accept", "reject", "withdraw"],
    accepted: [],
    rejected: [],
    withdrawn: [],
    expired: [],
  };

  return transitions[status].includes(action);
}

export function getRfqVisibilityLabel(visibilityLevel?: string | null) {
  if (visibilityLevel === "premium") {
    return "Premium RFQ";
  }

  if (visibilityLevel === "verified_suppliers") {
    return "Verified Suppliers";
  }

  return "Standard RFQ";
}

export function getQuoteFreshnessLabel(submittedAt?: string | null) {
  if (!submittedAt) {
    return "Draft";
  }

  const submittedTime = new Date(submittedAt).getTime();
  const ageHours = (Date.now() - submittedTime) / 36e5;

  if (ageHours <= 24) {
    return "New quote";
  }

  if (ageHours <= 72) {
    return "Recent quote";
  }

  return "Quote submitted";
}

