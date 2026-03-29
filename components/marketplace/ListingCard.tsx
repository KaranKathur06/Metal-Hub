import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CheckCircle, Clock3, MapPin, Package } from 'lucide-react';

type BuyerInquiry = {
  id: string;
  productName: string;
  quantity: string;
  location: string;
  budget?: number | null;
  createdAt: string;
  capability?: {
    name: string;
    slug: string;
  } | null;
};

type SupplierListing = {
  id: string;
  companyName: string;
  description: string;
  location: string;
  isVerified: boolean;
  createdAt: string;
  products?: Array<{
    id: string;
    productName: string;
    priceRange: string;
    moq: string;
    capability?: {
      name: string;
      slug: string;
    } | null;
  }>;
};

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
      <article className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_35px_rgba(15,23,42,0.08)]">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">{inquiry.productName}</h3>
          {inquiry.capability ? <Badge variant="secondary">{inquiry.capability.name}</Badge> : null}
        </div>

        <div className="grid gap-2 text-sm text-slate-600">
          <p className="flex items-center gap-2">
            <Package className="h-4 w-4 text-slate-400" /> Quantity: {inquiry.quantity}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" /> {inquiry.location}
          </p>
          <p className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-slate-400" /> Posted {formatDate(inquiry.createdAt)}
          </p>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-500">Budget</p>
          <p className="text-lg font-bold text-slate-900">
            {typeof inquiry.budget === 'number' ? formatCurrency(inquiry.budget) : 'Open for quotation'}
          </p>
        </div>
      </article>
    );
  }

  const supplier = item as SupplierListing;
  const primaryProduct = supplier.products?.[0];

  return (
    <article className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_35px_rgba(15,23,42,0.08)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">{supplier.companyName}</h3>
        {supplier.isVerified ? (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
            <CheckCircle className="mr-1 h-3 w-3" /> Verified
          </Badge>
        ) : (
          <Badge variant="secondary">Pending</Badge>
        )}
      </div>

      <p className="line-clamp-2 text-sm text-slate-600">{supplier.description}</p>

      <div className="mt-4 grid gap-2 text-sm text-slate-600">
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-400" /> {supplier.location}
        </p>
        <p className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-slate-400" /> Joined {formatDate(supplier.createdAt)}
        </p>
      </div>

      <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Product Highlight</p>
        <p className="mt-1 line-clamp-1 text-sm font-semibold text-slate-900">
          {primaryProduct?.productName || 'Product catalog available on request'}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <span>Price: {primaryProduct?.priceRange || 'Contact for price'}</span>
          <span>MOQ: {primaryProduct?.moq || 'Custom'}</span>
        </div>
      </div>
    </article>
  );
}
