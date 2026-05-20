"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerificationReviewQueue } from "@/components/marketplace/VerificationReviewQueue";
import type { VerificationDocumentRecord } from "@/lib/marketplace/verification-documents";

type QueueRow = {
  id: string;
  document_type: string;
  file_url: string;
  status: string;
  reviewer_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  companies?: { name?: string; slug?: string } | { name?: string; slug?: string }[] | null;
  profiles?: { full_name?: string; email?: string } | { full_name?: string; email?: string }[] | null;
};

function pickRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export default function VerificationQueuePage() {
  const [rows, setRows] = useState<QueueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ops/verification-queue?status=pending,in_review", {
        credentials: "include",
      });
      if (!response.ok) return;
      const payload = await response.json();
      setRows(payload.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const review = async (id: string, action: "approve" | "reject") => {
    setActingId(id);
    try {
      const response = await fetch(`/api/ops/verification/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (response.ok) {
        setRows((prev) => prev.filter((row) => row.id !== id));
      }
    } finally {
      setActingId(null);
    }
  };

  const items = rows.map((row) => {
    const company = pickRelation(row.companies);
    const profile = pickRelation(row.profiles);
    const supplierName = company?.name ?? profile?.full_name ?? profile?.email ?? "Unknown supplier";

    return {
      id: row.id,
      documentType: row.document_type,
      fileUrl: row.file_url,
      status: row.status as VerificationDocumentRecord["status"],
      reviewerNotes: row.reviewer_notes,
      reviewedAt: row.reviewed_at,
      createdAt: row.created_at,
      supplierName,
      supplierHref: company?.slug ? `/suppliers/${company.slug}` : undefined,
    };
  });

  return (
    <div>
      <div className="ops-section-header">
        <div>
          <h1 className="ops-section-title">Supplier verification queue</h1>
          <p className="ops-section-subtitle">
            Review business documents submitted by suppliers (supplier_success workflow)
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : items.length === 0 ? (
        <div className="ops-panel">
          <div className="ops-panel-body py-12 text-center text-sm text-slate-500">
            No documents awaiting review.
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="ops-panel">
              <div className="ops-panel-body space-y-3">
                <VerificationReviewQueue items={[item]} />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={actingId === item.id}
                    onClick={() => void review(item.id, "approve")}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actingId === item.id}
                    onClick={() => void review(item.id, "reject")}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
