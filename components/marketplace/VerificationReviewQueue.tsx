"use client";

import Link from "next/link";
import { ExternalLink, FileBadge2 } from "lucide-react";
import {
  getVerificationStatusLabel,
  getVerificationStatusTone,
  type VerificationDocumentRecord,
} from "../../lib/marketplace/verification-documents";

type VerificationQueueItem = VerificationDocumentRecord & {
  supplierName: string;
  supplierHref?: string;
};

type VerificationReviewQueueProps = {
  items: VerificationQueueItem[];
};

const toneClasses = {
  neutral: "border-zinc-200 bg-zinc-50 text-zinc-700",
  warning: "border-amber-500/25 bg-amber-500/10 text-amber-800",
  success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-800",
  danger: "border-rose-500/25 bg-rose-500/10 text-rose-800",
};

export function VerificationReviewQueue({ items }: VerificationReviewQueueProps) {
  return (
    <section className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-950 text-white">
          <FileBadge2 className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-zinc-950">Verification review queue</h2>
          <p className="mt-1 text-sm text-zinc-600">Review business evidence, identify blockers, and keep supplier trust progression moving.</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {items.map((item) => {
          const tone = getVerificationStatusTone(item.status);

          return (
            <div key={item.id} className="rounded-md border border-zinc-200 px-3 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-zinc-950">{item.documentType}</div>
                  <div className="mt-1 text-sm text-zinc-600">
                    {item.supplierHref ? <Link className="hover:text-zinc-900" href={item.supplierHref}>{item.supplierName}</Link> : item.supplierName}
                  </div>
                </div>

                <span className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${toneClasses[tone]}`}>
                  {getVerificationStatusLabel(item.status)}
                </span>
              </div>

              {item.reviewerNotes ? <div className="mt-2 text-sm text-zinc-600">{item.reviewerNotes}</div> : null}

              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="text-xs text-zinc-500">
                  {item.reviewedAt ? `Reviewed ${new Date(item.reviewedAt).toLocaleDateString()}` : "Awaiting review"}
                </div>

                <Link className="inline-flex items-center gap-1 text-sm font-medium text-zinc-900 hover:text-amber-700" href={item.fileUrl} target="_blank">
                  Open document
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

