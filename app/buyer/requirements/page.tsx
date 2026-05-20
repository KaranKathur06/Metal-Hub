"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BuyerProcurementSection } from "@/components/dashboard/BuyerProcurementSection";
import { RfqSummaryCard } from "@/components/marketplace/RfqSummaryCard";
import type { RfqStatus } from "@/lib/marketplace/procurement-workflow";

type RfqRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  quantity: string | null;
  delivery_timeline: string | null;
  visibility_level: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  quotes?: Array<{ count: number }>;
};

export default function BuyerRequirementsPage() {
  const [rfqs, setRfqs] = useState<RfqRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/inquiries?limit=50");
        const result = await response.json();
        if (!response.ok) {
          setError(result.error?.message ?? "Failed to load requirements");
          return;
        }
        setRfqs(result.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load requirements");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="container py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My requirements</h1>
          <p className="mt-2 text-sm text-slate-600">
            Track RFQs, quote activity, and procurement status.
          </p>
        </div>
        <Link href="/post-requirement">
          <Button className="font-bold">
            <Plus className="mr-2 h-4 w-4" />
            Post requirement
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <BuyerProcurementSection />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : rfqs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
          <p className="text-sm text-slate-600">No requirements posted yet.</p>
          <Link href="/post-requirement" className="mt-4 inline-block">
            <Button>Post your first requirement</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {rfqs.map((rfq) => {
            const location = [rfq.city, rfq.state, rfq.country].filter(Boolean).join(", ");
            const quoteCount = rfq.quotes?.[0]?.count ?? 0;

            return (
              <div key={rfq.id} className="space-y-2">
                <RfqSummaryCard
                  href={`/rfq/${rfq.slug}`}
                  title={rfq.title}
                  status={(rfq.status as RfqStatus) ?? "open"}
                  visibilityLevel={rfq.visibility_level}
                  quantity={rfq.quantity}
                  deliveryTimeline={rfq.delivery_timeline}
                  locationLabel={location || undefined}
                />
                <p className="px-1 text-xs text-slate-500">{quoteCount} supplier quotes received</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
