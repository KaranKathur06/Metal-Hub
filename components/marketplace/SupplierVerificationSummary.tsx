"use client";

import { FileBadge2, ShieldCheck } from "lucide-react";
import {
  getVerificationStatusLabel,
  getVerificationStatusTone,
  summarizeVerificationDocuments,
  type VerificationDocumentRecord,
} from "../../lib/marketplace/verification-documents";

type SupplierVerificationSummaryProps = {
  documents: VerificationDocumentRecord[];
};

const toneClasses = {
  neutral: "border-zinc-200 bg-zinc-50 text-zinc-700",
  warning: "border-amber-500/25 bg-amber-500/10 text-amber-800",
  success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-800",
  danger: "border-rose-500/25 bg-rose-500/10 text-rose-800",
};

export function SupplierVerificationSummary({ documents }: SupplierVerificationSummaryProps) {
  const summary = summarizeVerificationDocuments(documents);

  return (
    <section className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-950 text-white">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-zinc-950">Verification center</h2>
          <p className="mt-1 text-sm text-zinc-600">Track submitted business evidence and move toward stronger marketplace trust.</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-4">
        <div className="rounded-md border border-zinc-200 px-3 py-3 text-sm">
          <div className="text-zinc-500">Submitted</div>
          <div className="mt-1 font-semibold text-zinc-900">{summary.total}</div>
        </div>
        <div className="rounded-md border border-zinc-200 px-3 py-3 text-sm">
          <div className="text-zinc-500">Approved</div>
          <div className="mt-1 font-semibold text-zinc-900">{summary.approved}</div>
        </div>
        <div className="rounded-md border border-zinc-200 px-3 py-3 text-sm">
          <div className="text-zinc-500">In review</div>
          <div className="mt-1 font-semibold text-zinc-900">{summary.pending + summary.in_review}</div>
        </div>
        <div className="rounded-md border border-zinc-200 px-3 py-3 text-sm">
          <div className="text-zinc-500">Needs action</div>
          <div className="mt-1 font-semibold text-zinc-900">{summary.rejected + summary.expired + summary.draft}</div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {documents.map((document) => {
          const tone = getVerificationStatusTone(document.status);

          return (
            <div key={document.id} className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 px-3 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-900">
                  <FileBadge2 className="h-4 w-4 text-zinc-500" aria-hidden="true" />
                  {document.documentType}
                </div>
                {document.reviewerNotes ? <div className="mt-1 text-sm text-zinc-600">{document.reviewerNotes}</div> : null}
              </div>

              <span className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${toneClasses[tone]}`}>
                {getVerificationStatusLabel(document.status)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

