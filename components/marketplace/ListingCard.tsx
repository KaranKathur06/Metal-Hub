import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowRight, CheckCircle, Clock3, MapPin, Package, ShieldCheck, Star } from 'lucide-react';

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
  createdAt: string;
};

type SupplierListing = {
  id: string;
  companyName: string;
  description: string;
  location: string;
  isVerified: boolean;
  rating: number;
  createdAt: string;
  products?: Array<{
    id: string;
    productName: string;
    category: string;
    priceRange: string;
    moq: string;
    productionCapacity: string;
  }>;
};

function urgencyTone(urgency: string) {
  if (urgency === 'HIGH') return 'bg-red-100 text-red-700';
  if (urgency === 'LOW') return 'bg-emerald-100 text-emerald-700';
  return 'bg-amber-100 text-amber-700';
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

    return (
      <Link href={`/marketplace/inquiry/${inquiry.id}`} className="block">
        <article className="group h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_35px_rgba(15,23,42,0.10)]">
          <div className="mb-3 flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 text-lg font-semibold text-slate-900 group-hover:text-blue-700">
              {inquiry.productName}
            </h3>
            <Badge className={urgencyTone(inquiry.urgency)}>{inquiry.urgency}</Badge>
          </div>

          <p className="line-clamp-2 text-sm text-slate-600">{inquiry.description}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary" className="capitalize">{inquiry.category.replace('-', ' ')}</Badge>
            <Badge variant="outline" className="border-slate-300 text-slate-600">{inquiry.quantity}</Badge>
          </div>

          <div className="mt-4 grid gap-2 text-sm text-slate-600">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" /> {inquiry.location}
            </p>
            <p className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-slate-400" /> Posted {formatDate(inquiry.createdAt)}
            </p>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Budget</p>
            <p className="text-base font-bold text-slate-900">
              {inquiry.budgetRange || (typeof inquiry.budget === 'number' ? formatCurrency(inquiry.budget) : 'Open for quotation')}
            </p>
          </div>

          <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
            Send Quote
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </div>
        </article>
      </Link>
    );
  }

  const supplier = item as SupplierListing;
  const primaryProduct = supplier.products?.[0];

  return (
    <Link href={`/marketplace/supplier/${supplier.id}`} className="block">
      <article className="group h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_35px_rgba(15,23,42,0.10)]">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-lg font-semibold text-slate-900 group-hover:text-blue-700">{supplier.companyName}</h3>
          {supplier.isVerified ? (
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              <ShieldCheck className="mr-1 h-3 w-3" /> Verified
            </Badge>
          ) : (
            <Badge variant="secondary">Unverified</Badge>
          )}
        </div>

        <p className="line-clamp-2 text-sm text-slate-600">{supplier.description}</p>

        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Featured Product</p>
          <p className="mt-1 line-clamp-1 text-sm font-semibold text-slate-900">{primaryProduct?.productName || 'Product catalog available'}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span>Price: {primaryProduct?.priceRange || 'On request'}</span>
            <span>MOQ: {primaryProduct?.moq || 'Custom'}</span>
            <span>Capacity: {primaryProduct?.productionCapacity || 'On request'}</span>
          </div>
        </div>

        <div className="mt-4 grid gap-2 text-sm text-slate-600">
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" /> {supplier.location}
          </p>
          <p className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {Number(supplier.rating || 0).toFixed(1)} rating
          </p>
        </div>

        <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
          Contact Supplier
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </div>
      </article>
    </Link>
  );
}
