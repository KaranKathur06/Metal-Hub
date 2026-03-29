import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Clock3, MapPin, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getInquiryDetail } from '@/lib/server/marketplace';

export const dynamic = 'force-dynamic';

type Props = {
  params: {
    id: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const inquiry = await getInquiryDetail(params.id);

  if (!inquiry) {
    return {
      title: 'Inquiry Not Found | MetalHub',
    };
  }

  return {
    title: `${inquiry.productName} Requirement | MetalHub`,
    description: inquiry.description,
  };
}

function urgencyTone(urgency: string) {
  if (urgency === 'HIGH') return 'bg-red-100 text-red-700';
  if (urgency === 'LOW') return 'bg-emerald-100 text-emerald-700';
  return 'bg-amber-100 text-amber-700';
}

export default async function InquiryDetailPage({ params }: Props) {
  const inquiry = await getInquiryDetail(params.id);

  if (!inquiry) {
    notFound();
  }

  return (
    <div className="container py-10">
      <div className="mb-6">
        <Link href="/marketplace?type=buyers" className="text-sm font-medium text-blue-700 hover:text-blue-800">
          ? Back to Buyers Marketplace
        </Link>
      </div>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 p-7 text-white">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge className={urgencyTone(inquiry.urgency || 'MEDIUM')}>{inquiry.urgency || 'MEDIUM'}</Badge>
            <Badge variant="secondary" className="capitalize">{inquiry.category?.replace('-', ' ') || 'general'}</Badge>
          </div>
          <h1 className="max-w-4xl text-3xl font-bold">{inquiry.productName}</h1>
          <p className="mt-3 max-w-3xl text-slate-200">{inquiry.description}</p>
        </div>

        <div className="grid gap-8 p-7 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Requirement Overview</h2>
            <div className="mt-5 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
              <p className="flex items-center gap-2 rounded-lg border border-slate-200 p-3">
                <Package className="h-4 w-4 text-slate-400" /> Quantity: {inquiry.quantity}
              </p>
              <p className="flex items-center gap-2 rounded-lg border border-slate-200 p-3">
                <MapPin className="h-4 w-4 text-slate-400" /> Location: {inquiry.location}
              </p>
              <p className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 sm:col-span-2">
                <Clock3 className="h-4 w-4 text-slate-400" /> Posted: {formatDate(inquiry.createdAt)}
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Budget Expectation</p>
              <p className="mt-2 text-xl font-bold text-slate-900">
                {inquiry.budgetRange ||
                  (typeof inquiry.budget === 'number' ? formatCurrency(inquiry.budget) : 'Open for quotation')}
              </p>
            </div>
          </div>

          <aside className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-slate-900">Supplier Action</h3>
            <p className="mt-2 text-sm text-slate-600">
              Share your quote with lead time, compliance details, and commercial terms to engage this buyer.
            </p>
            <Button className="mt-6 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700">
              Send Quote
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </aside>
        </div>
      </article>
    </div>
  );
}
