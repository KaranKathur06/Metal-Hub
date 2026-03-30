import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ArrowRight, Award, CheckCircle2, Clock3, Factory, Gauge, Globe2,
  MapPin, Package, Shield, ShieldCheck, Star, TrendingUp, Zap,
} from 'lucide-react';

type BuyerInquiry = {
  id: string;
  productName: string;
  description: string;
  quantity: string;
  location: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  budgetRange?: string | null;
  budget?: number | null;
  category: string;
  material?: string | null;
  industry?: { name?: string } | null;
  capabilityMappings?: Array<{ capability?: { name?: string; slug?: string } }>;
  viewsCount?: number;
  quoteCount?: number;
  createdAt: string;
};

type SupplierListing = {
  id: string;
  companyName: string;
  tagline?: string | null;
  description: string;
  location: string;
  isVerified: boolean;
  rating: number;
  responseTimeMinutes?: number;
  completionRate?: number;
  isoCertified?: boolean;
  exportReady?: boolean;
  createdAt: string;
  capabilities?: Array<{ id?: string; name?: string; slug?: string }>;
  industries?: Array<{ id?: string; name?: string; slug?: string }>;
  products?: Array<{
    id: string;
    productName: string;
    category: string;
    material?: string;
    priceRange: string;
    moq: string;
    productionCapacity: string;
  }>;
};

function urgencyConfig(urgency: string) {
  if (urgency === 'HIGH') return { bg: 'bg-red-50 border-red-200', text: 'text-red-700', dot: 'bg-red-500', label: 'Urgent' };
  if (urgency === 'LOW') return { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Flexible' };
  return { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Standard' };
}

export default function ListingCard({
  tab,
  item,
}: {
  tab: 'buyers' | 'suppliers';
  item: BuyerInquiry | SupplierListing;
}) {
  if (tab === 'buyers') {
    const inquiry = item as BuyerInquiry;
    const mappedCaps = (inquiry.capabilityMappings || [])
      .map((entry) => entry.capability?.name || entry.capability?.slug)
      .filter(Boolean)
      .slice(0, 3) as string[];
    const urg = urgencyConfig(inquiry.urgency);

    return (
      <Link href={`/marketplace/inquiry/${inquiry.id}`} className="block">
        <article className="group relative h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_20px_40px_rgba(15,23,42,0.1)]">
          {/* Top accent bar */}
          <div className={`h-1 w-full ${inquiry.urgency === 'HIGH' ? 'bg-gradient-to-r from-red-500 to-orange-400' : inquiry.urgency === 'MEDIUM' ? 'bg-gradient-to-r from-amber-400 to-yellow-300' : 'bg-gradient-to-r from-emerald-400 to-teal-300'}`} />

          <div className="p-5">
            {/* Header */}
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="line-clamp-2 text-[17px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-700">
                  {inquiry.productName}
                </h3>
              </div>
              <div className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${urg.bg} ${urg.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${urg.dot}`} />
                {urg.label}
              </div>
            </div>

            <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">{inquiry.description}</p>

            {/* Tags */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold capitalize text-slate-700">
                {inquiry.category.replace('-', ' ')}
              </span>
              {inquiry.industry?.name ? (
                <span className="rounded-md border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {inquiry.industry.name}
                </span>
              ) : null}
              {mappedCaps.map((cap) => (
                <span key={cap} className="rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs font-medium capitalize text-blue-700">
                  {cap}
                </span>
              ))}
            </div>

            {/* Grid metadata */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-[13px]">
              <p className="flex items-center gap-1.5 text-slate-600">
                <Package className="h-3.5 w-3.5 text-slate-400" /> {inquiry.quantity}
              </p>
              <p className="flex items-center gap-1.5 text-slate-600">
                <MapPin className="h-3.5 w-3.5 text-slate-400" /> {inquiry.location}
              </p>
            </div>

            {/* Budget & specs panel */}
            <div className="mt-4 rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50/80 to-white p-3">
              <div className="grid grid-cols-2 gap-2 text-[13px]">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Budget</p>
                  <p className="mt-0.5 font-bold text-slate-900">
                    {inquiry.budgetRange || (typeof inquiry.budget === 'number' ? formatCurrency(inquiry.budget) : 'Open')}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Material</p>
                  <p className="mt-0.5 font-medium text-slate-700">{inquiry.material || 'As per supplier'}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {inquiry.viewsCount || 0} views</span>
                <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {inquiry.quoteCount || 0} quotes</span>
                <span className="flex items-center gap-1"><Clock3 className="h-3 w-3" /> {formatDate(inquiry.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1 text-sm font-bold text-blue-600 transition-colors group-hover:text-blue-700">
                Quote <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // ============ SUPPLIER CARD ============
  const supplier = item as SupplierListing;
  const primaryProduct = supplier.products?.[0];
  const ratingColor = Number(supplier.rating) >= 4.5 ? 'text-emerald-600' : Number(supplier.rating) >= 4.0 ? 'text-amber-600' : 'text-slate-600';

  return (
    <Link href={`/marketplace/supplier/${supplier.id}`} className="block">
      <article className="group relative h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(15,23,42,0.1)]">
        {/* Hover gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-600/[0.03] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Verified accent bar */}
        {supplier.isVerified ? (
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400" />
        ) : (
          <div className="h-1 w-full bg-slate-200" />
        )}

        <div className="relative z-10 p-5">
          {/* Header row */}
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="line-clamp-1 text-[17px] font-bold text-slate-900 transition-colors group-hover:text-blue-700">
                  {supplier.companyName}
                </h3>
              </div>
              <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">
                {supplier.tagline || 'Industrial manufacturing partner'}
              </p>
            </div>

            {/* Badges column */}
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              {supplier.isVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200/60">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                  Unverified
                </span>
              )}
              <span className={`inline-flex items-center gap-1 text-sm font-bold ${ratingColor}`}>
                <Star className="h-3.5 w-3.5 fill-current" />
                {Number(supplier.rating || 0).toFixed(1)}
              </span>
            </div>
          </div>

          {/* Metadata grid */}
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[13px]">
            <p className="flex items-center gap-1.5 text-slate-600">
              <MapPin className="h-3.5 w-3.5 text-slate-400" /> {supplier.location}
            </p>
            <p className="flex items-center gap-1.5 text-slate-600">
              <Gauge className="h-3.5 w-3.5 text-slate-400" /> {supplier.responseTimeMinutes || 120}m response
            </p>
            <p className="flex items-center gap-1.5 text-slate-600">
              <Factory className="h-3.5 w-3.5 text-slate-400" /> {Math.round(supplier.completionRate || 0)}% completion
            </p>
            <p className="flex items-center gap-1.5 text-slate-600">
              <Globe2 className="h-3.5 w-3.5 text-slate-400" /> {supplier.exportReady ? 'Export Ready' : 'Domestic'}
            </p>
          </div>

          {/* Capability & Industry chips */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(supplier.capabilities || []).slice(0, 3).map((cap: any) => (
              <span key={cap.id || cap.slug || cap.name} className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                {cap.name || cap.slug}
              </span>
            ))}
            {(supplier.industries || []).slice(0, 2).map((industry: any) => (
              <span key={industry.id || industry.slug || industry.name} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                {industry.name || industry.slug}
              </span>
            ))}
          </div>

          {/* Featured Product */}
          <div className="mt-3 rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50/80 to-white p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Featured Product</p>
            <p className="mt-1 line-clamp-1 text-sm font-bold text-slate-900">{primaryProduct?.productName || 'Product catalog available'}</p>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-0.5 text-[12px] text-slate-600">
              <span>💰 {primaryProduct?.priceRange || 'On request'}</span>
              <span>📦 {primaryProduct?.moq || 'Custom'}</span>
              <span>⚡ {primaryProduct?.productionCapacity || 'On request'}</span>
              <span>🔧 {primaryProduct?.material || 'Mixed'}</span>
            </div>
          </div>

          {/* Trust layer + CTA */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-[11px] font-semibold ${supplier.isoCertified ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50' : 'bg-slate-50 text-slate-400'}`}>
                <Award className="h-3 w-3" /> ISO
              </span>
              <span className={`inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-[11px] font-semibold ${supplier.exportReady ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/50' : 'bg-slate-50 text-slate-400'}`}>
                <Globe2 className="h-3 w-3" /> Export
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-blue-600 transition-colors group-hover:text-blue-700">
              Profile <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
