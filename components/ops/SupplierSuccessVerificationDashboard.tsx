"use client";

import Link from "next/link";
import { ArrowRight, FileBadge2, ShieldAlert } from "lucide-react";
import {
  formatQueueAge,
  groupSupplierOpsQueue,
  summarizeSupplierOpsQueue,
  type SupplierOpsQueueItem,
} from "../../lib/marketplace/ops-queue";

type SupplierSuccessVerificationDashboardProps = {
  items: SupplierOpsQueueItem[];
  pendingCount: number;
  approvedToday: number;
  averageReviewHours?: number | null;
};

function QueueSection({
  title,
  items,
}: {
  title: string;
  items: SupplierOpsQueueItem[];
}) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-950">{title}</h3>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-md border border-zinc-200 px-3 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium text-zinc-950">{item.title}</div>
                <div className="mt-1 text-sm text-zinc-600">
                  {item.supplierHref ? <Link className="hover:text-zinc-900" href={item.supplierHref}>{item.supplierName}</Link> : item.supplierName}
                </div>
              </div>

              <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-700">
                {item.statusLabel}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="text-xs text-zinc-500">
                {formatQueueAge(item.ageHours)}
                {item.reviewerNotes ? ` - ${item.reviewerNotes}` : ""}
              </div>

              {item.href ? (
                <Link className="inline-flex items-center gap-1 text-sm font-medium text-zinc-900 hover:text-amber-700" href={item.href}>
                  Open
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SupplierSuccessVerificationDashboard({
  items,
  pendingCount,
  approvedToday,
  averageReviewHours,
}: SupplierSuccessVerificationDashboardProps) {
  const grouped = groupSupplierOpsQueue(items);
  const stats = summarizeSupplierOpsQueue({
    pendingCount,
    approvedToday,
    averageReviewHours,
  });

  return (
    <div className="space-y-4">
      <section className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-950 text-white">
            <FileBadge2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-zinc-950">Verification Queue</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Review supplier trust evidence, clear backlog, and keep marketplace credibility moving.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.key} className="rounded-md border border-zinc-200 px-3 py-3 text-sm">
              <div className="text-zinc-500">{stat.label}</div>
              <div className="mt-1 font-semibold text-zinc-900">{stat.value}</div>
            </div>
          ))}
        </div>
      </section>

      <QueueSection title="Pending Verification Backlog" items={grouped.verificationBacklog} />
      <QueueSection title="Recently Submitted Suppliers" items={grouped.recentSubmissions} />
      <QueueSection title="Suppliers Needing Follow-Up" items={grouped.followUps} />

      {!items.length ? (
        <section className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-100 text-zinc-700">
              <ShieldAlert className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-zinc-950">Queue is clear</h3>
              <p className="mt-1 text-sm text-zinc-600">
                No active verification tasks are waiting right now.
              </p>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
