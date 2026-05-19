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
    keywords?: string[];
    industries?: string[];
    applications?: string[];
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
      <Link href={`/rfq/${(inquiry as { slug?: string }).slug || inquiry.id}`} className="block">
        <article className="group relative h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_20px_40px_rgba(15,23,42,0.1)]">
          {/* Top accent bar */}
          <div className={`h-1 w-full ${inquiry.urgency === 'HIGH' ? 'bg-gradient-to-r from-red-500 to-orange-400' : inquiry.urgency === 'MEDIUM' ? 'bg-gradient-to-r from-amber-400 to-yellow-300' : 'bg-gradient-to-r from-emerald-400 to-teal-300'}`} />

          <div className="p-5">
            {/* Header */}
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="line-clamp-2 text-[17px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-700">
                  {inquiry.productName || (inquiry as any).title || 'Untitled Requirement'}
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
              {(inquiry.category || (inquiry as any).metal_type) ? (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold capitalize text-slate-700">
                  {(inquiry.category || (inquiry as any).metal_type || '').replace(/-/g, ' ')}
                </span>
              ) : null}
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
                <Package className="h-3.5 w-3.5 text-slate-400" /> {inquiry.quantity || 'Contact for qty'}
              </p>
              <p className="flex items-center gap-1.5 text-slate-600">
                <MapPin className="h-3.5 w-3.5 text-slate-400" /> {inquiry.location || 'India'}
              </p>
            </div>

            {/* Budget & specs panel */}
            <div className="mt-4 rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50/80 to-white p-3">
              <div className="grid grid-cols-2 gap-2 text-[13px]">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Budget</p>
                  <p className="mt-0.5 font-bold text-slate-900">
                    {inquiry.budgetRange || (inquiry as any).target_price || (typeof inquiry.budget === 'number' ? formatCurrency(inquiry.budget) : 'Open')}
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
                <span className="flex items-center gap-1"><Clock3 className="h-3 w-3" /> {formatDate(inquiry.createdAt || (inquiry as any).created_at)}</span>
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
  // API returns listing with nested companies{} from join
  const listing = item as any;
  const co = listing.companies || {};
  const companyName = co.name || listing.companyName || 'Supplier';
  const isVerified = co.verification_status === 'approved' || listing.isVerified;
  const description = co.description || listing.description || '';
  const responseRate = co.response_rate || 0;
  const completionRate = co.completion_rate || 0;
  const avgResponseHrs = co.avg_response_hours || 0;
  const isoCertified = co.iso_certified || false;
  const exportCapable = co.export_capability || false;
  const estYear = co.established_year || 0;
  const employees = co.employee_count || 0;
  const yearsInBiz = estYear ? new Date().getFullYear() - estYear : 0;

  // Format price display
  const priceDisplay = listing.price_min
    ? `₹${Number(listing.price_min).toLocaleString('en-IN')}${listing.price_max ? ` – ₹${Number(listing.price_max).toLocaleString('en-IN')}` : '+'}`
    : 'On request';

  return (
    <Link href={`/marketplace/listings/${listing.slug || listing.id}`} className="block">
      <article className="group relative h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(15,23,42,0.1)]">
        {/* Hover gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-600/[0.03] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Verified accent bar */}
        {isVerified ? (
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400" />
        ) : (
          <div className="h-1 w-full bg-slate-200" />
        )}

        <div className="relative z-10 p-5">
          {/* Company header */}
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="line-clamp-1 text-[17px] font-bold text-slate-900 transition-colors group-hover:text-blue-700">
                {companyName}
              </h3>
              <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">
                {listing.title}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              {isVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200/60">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                  Unverified
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="line-clamp-2 text-[13px] leading-relaxed text-slate-500">{description}</p>

          {/* Performance metrics */}
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[13px]">
            {avgResponseHrs > 0 && (
              <p className="flex items-center gap-1.5 text-slate-600">
                <Gauge className="h-3.5 w-3.5 text-blue-500" /> {avgResponseHrs}h response
              </p>
            )}
            {completionRate > 0 && (
              <p className="flex items-center gap-1.5 text-slate-600">
                <Factory className="h-3.5 w-3.5 text-emerald-500" /> {completionRate}% completion
              </p>
            )}
            {yearsInBiz > 0 && (
              <p className="flex items-center gap-1.5 text-slate-600">
                <TrendingUp className="h-3.5 w-3.5 text-amber-500" /> {yearsInBiz} yrs experience
              </p>
            )}
            {employees > 0 && (
              <p className="flex items-center gap-1.5 text-slate-600">
                <Package className="h-3.5 w-3.5 text-slate-400" /> {employees} employees
              </p>
            )}
          </div>

          {/* Featured Listing info */}
          <div className="mt-3 rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50/80 to-white p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Listed Product</p>
                <p className="mt-0.5 line-clamp-1 text-sm font-bold text-slate-900">{listing.title}</p>
              </div>
              <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
                {priceDisplay}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-x-2 text-[12px] text-slate-600">
              <span>Metal: {listing.metal_type || 'Various'}</span>
              <span>Grade: {listing.grade || '—'}</span>
              <span>MOQ: {listing.moq || 'Custom'}</span>
            </div>
          </div>

          {/* Trust layer + CTA */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-[11px] font-semibold ${isoCertified ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50' : 'bg-slate-50 text-slate-400'}`}>
                <Award className="h-3 w-3" /> ISO
              </span>
              <span className={`inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-[11px] font-semibold ${exportCapable ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/50' : 'bg-slate-50 text-slate-400'}`}>
                <Globe2 className="h-3 w-3" /> Export
              </span>
              {responseRate > 0 && (
                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200/50">
                  {responseRate}% response
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-blue-600 transition-colors group-hover:text-blue-700">
              Details <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}




