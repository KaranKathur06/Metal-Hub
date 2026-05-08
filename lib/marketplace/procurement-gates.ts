import { evaluateTrustGate, type TrustTier } from "./trust-engine";

export type ProcurementGateAction =
  | "publish_rfq"
  | "contact_supplier"
  | "submit_quote"
  | "access_premium_rfq"
  | "featured_supplier_visibility";

export type ProcurementGateInput = {
  action: ProcurementGateAction;
  role: "buyer" | "seller" | "both" | "admin" | "supplier_success";
  currentTrustLevel: TrustTier["level"];
  profileCompletionPercent?: number | null;
  emailVerified?: boolean;
  developmentTrustMode: boolean;
};

const actionRequirements: Record<ProcurementGateAction, TrustTier["level"]> = {
  publish_rfq: 1,
  contact_supplier: 1,
  submit_quote: 1,
  access_premium_rfq: 2,
  featured_supplier_visibility: 3,
};

const actionLabels: Record<ProcurementGateAction, string> = {
  publish_rfq: "RFQ publishing",
  contact_supplier: "supplier contact",
  submit_quote: "quote submission",
  access_premium_rfq: "premium RFQ",
  featured_supplier_visibility: "featured supplier",
};

export function evaluateProcurementGate(input: ProcurementGateInput) {
  if (input.role === "admin") {
    return {
      allowed: true,
      hardBlocked: false,
    };
  }

  const requiredTier = actionRequirements[input.action];
  const trustGate = evaluateTrustGate({
    developmentTrustMode: input.developmentTrustMode,
    currentTier: input.currentTrustLevel,
    requiredTier,
    actionLabel: actionLabels[input.action],
  });

  if (!trustGate.allowed || trustGate.hardBlocked) {
    return trustGate;
  }

  if (!input.emailVerified && input.action !== "featured_supplier_visibility") {
    return {
      allowed: input.developmentTrustMode,
      hardBlocked: !input.developmentTrustMode,
      requiredTier,
      message: "Verify your email to improve procurement trust and unlock stronger marketplace actions.",
    };
  }

  if ((input.profileCompletionPercent ?? 0) < 40 && input.action !== "contact_supplier") {
    return {
      allowed: input.developmentTrustMode,
      hardBlocked: !input.developmentTrustMode,
      requiredTier,
      message: "Complete your business profile to improve buyer trust and procurement visibility.",
    };
  }

  return {
    allowed: true,
    hardBlocked: false,
  };
}
