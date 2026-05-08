"use client";

import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import type { TrustGateResult } from "../../lib/marketplace/trust-engine";

type ProcurementGateNoticeProps = {
  result: TrustGateResult;
  compact?: boolean;
};

export function ProcurementGateNotice({ result, compact = false }: ProcurementGateNoticeProps) {
  if (result.allowed && !result.message) {
    return null;
  }

  if (result.allowed && result.message) {
    return (
      <div className={`flex items-start gap-2 rounded-md border border-amber-500/25 bg-amber-500/10 text-amber-800 ${compact ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm"}`}>
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{result.message}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-2 rounded-md border border-rose-500/25 bg-rose-500/10 text-rose-800 ${compact ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm"}`}>
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{result.message || "This action is not available yet."}</span>
    </div>
  );
}

export function ProcurementGateSuccess({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

