"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/AuthProvider";
import { ProcurementGateNotice } from "@/components/marketplace/ProcurementGateNotice";
import { evaluateProcurementGate } from "@/lib/marketplace/procurement-gates";
import { getSellerProcurementContext } from "@/lib/marketplace/procurement-context";

type SubmitQuoteFormProps = {
  rfqId: string;
  rfqSlug: string;
  isPremium?: boolean;
};

export function SubmitQuoteForm({ rfqId, rfqSlug }: SubmitQuoteFormProps) {
  const { isAuthenticated, profile, sellerProfile, company, developmentTrustMode, loading } =
    useAuth();

  const [price, setPrice] = useState("");
  const [leadTime, setLeadTime] = useState("");
  const [moq, setMoq] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);

  const ctx = getSellerProcurementContext({
    profile,
    sellerProfile,
    companyName: company?.name,
    hasListings: true,
    emailVerified: Boolean(profile?.email),
  });

  const quoteGate = evaluateProcurementGate({
    action: "submit_quote",
    role: "seller",
    currentTrustLevel: ctx.trustLevel,
    profileCompletionPercent: ctx.profileCompletion.overallPercent,
    emailVerified: Boolean(profile?.email),
    developmentTrustMode: developmentTrustMode ?? ctx.developmentTrustMode,
  });

  if (loading) {
    return <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Submit quotation</h3>
        <p className="mt-2 text-sm text-slate-600">Login as a supplier to respond to this RFQ.</p>
        <Link href={`/login?redirect=/rfq/${rfqSlug}`} className="mt-4 inline-block">
          <Button className="w-full">Login to quote</Button>
        </Link>
      </div>
    );
  }

  if (!sellerProfile) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Supplier profile required</h3>
        <p className="mt-2 text-sm text-slate-600">
          Complete seller onboarding to submit competitive quotes.
        </p>
        <Link href="/onboarding/seller" className="mt-4 inline-block">
          <Button className="w-full">Complete seller profile</Button>
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-800">
        Quote submitted. The buyer can review your offer from their procurement dashboard.
        <div className="mt-3 flex flex-col gap-1">
          {threadId ? (
            <Link href={`/messages`} className="font-semibold text-emerald-900 hover:underline">
              Open conversation →
            </Link>
          ) : null}
          <Link href="/seller/quotes" className="font-semibold text-emerald-900 hover:underline">
            View my quotes →
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!price.trim()) {
      setError("Enter a quoted price");
      return;
    }

    if (!quoteGate.allowed && quoteGate.hardBlocked) {
      setError(quoteGate.message ?? "Quote submission is not available yet.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rfq_id: rfqId,
          price: price.trim(),
          lead_time: leadTime.trim() || null,
          moq: moq.trim() || null,
          message: message.trim() || null,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error?.message ?? "Failed to submit quote");
        return;
      }

      setThreadId(result.threadId ?? null);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit quote");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900">Submit quotation</h3>
      <p className="mt-2 text-sm text-slate-600">
        Share pricing, lead time, and MOQ to win this procurement opportunity.
      </p>

      <div className="mt-4 space-y-3">
        <ProcurementGateNotice result={quoteGate} compact />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <Input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Quoted price (e.g. INR 45,000 / MT)"
        />
        <Input
          value={leadTime}
          onChange={(e) => setLeadTime(e.target.value)}
          placeholder="Lead time (e.g. 7-10 days)"
        />
        <Input value={moq} onChange={(e) => setMoq(e.target.value)} placeholder="MOQ (optional)" />
        <textarea
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm min-h-[80px]"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message to buyer (optional)"
        />

        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 font-bold"
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Submit quote
        </Button>
      </div>
    </div>
  );
}
