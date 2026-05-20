"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { SellerTrustSection } from "@/components/dashboard/SellerTrustSection";

type QuoteRow = {
  id: string;
  price: string;
  lead_time: string | null;
  moq: string | null;
  status: string;
  submitted_at: string | null;
  rfqs: { id: string; title: string; slug: string; status: string } | null;
};

export default function SellerQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/quotes");
        const result = await response.json();
        if (!response.ok) {
          setError(result.error?.message ?? "Failed to load quotes");
          return;
        }
        setQuotes(result.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load quotes");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My quotes</h1>
        <p className="mt-2 text-sm text-slate-600">Track submitted quotations and RFQ outcomes.</p>
      </div>

      <div className="mb-8">
        <SellerTrustSection hasListings />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : quotes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-600">
          No quotes submitted yet.{" "}
          <Link href="/seller/rfqs" className="font-semibold text-blue-700 hover:underline">
            Browse open RFQs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((quote) => (
            <article
              key={quote.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={quote.rfqs?.slug ? `/rfq/${quote.rfqs.slug}` : "#"}
                    className="text-base font-semibold text-slate-900 hover:text-blue-700"
                  >
                    {quote.rfqs?.title ?? "RFQ"}
                  </Link>
                  <p className="mt-1 text-sm text-slate-500 capitalize">{quote.status}</p>
                </div>
                <p className="text-lg font-bold text-slate-900">{quote.price}</p>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                {quote.lead_time ? <span>Lead time: {quote.lead_time}</span> : null}
                {quote.moq ? <span>MOQ: {quote.moq}</span> : null}
                {quote.submitted_at ? (
                  <span>Submitted: {new Date(quote.submitted_at).toLocaleDateString()}</span>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
