"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { RfqSummaryCard } from "@/components/marketplace/RfqSummaryCard";
import { SellerTrustSection } from "@/components/dashboard/SellerTrustSection";
import type { RfqStatus } from "@/lib/marketplace/procurement-workflow";

type OpenRfq = {
  id: string;
  title: string;
  slug: string;
  status: string;
  visibility_level: string | null;
  quantity: string | null;
  delivery_timeline: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
};

export default function SellerRfqsPage() {
  const { supabase } = useAuth();
  const [rfqs, setRfqs] = useState<OpenRfq[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) return;

    void (async () => {
      const { data } = await supabase
        .from("rfqs")
        .select("id, title, slug, status, visibility_level, quantity, delivery_timeline, city, state, country")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(30);

      setRfqs(data ?? []);
      setLoading(false);
    })();
  }, [supabase]);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Open RFQs</h1>
        <p className="mt-2 text-sm text-slate-600">
          Browse buyer requirements and submit competitive quotes.
        </p>
      </div>

      <div className="mb-8">
        <SellerTrustSection />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rfqs.map((rfq) => (
            <RfqSummaryCard
              key={rfq.id}
              href={`/rfq/${rfq.slug}`}
              title={rfq.title}
              status={(rfq.status as RfqStatus) ?? "open"}
              visibilityLevel={rfq.visibility_level}
              quantity={rfq.quantity}
              deliveryTimeline={rfq.delivery_timeline}
              locationLabel={[rfq.city, rfq.state, rfq.country].filter(Boolean).join(", ") || undefined}
            />
          ))}
        </div>
      )}

      {!loading && rfqs.length === 0 ? (
        <p className="mt-8 text-center text-sm text-slate-500">No open RFQs right now.</p>
      ) : null}
    </div>
  );
}
