import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle, Factory, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { getSupplierDetail } from '@/lib/server/marketplace';

export const dynamic = 'force-dynamic';

type Props = {
  params: {
    id: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supplier = await getSupplierDetail(params.id);

  if (!supplier) {
    return {
      title: 'Supplier Not Found | MetalHub',
    };
  }

  return {
    title: `${supplier.companyName} Supplier Profile | MetalHub`,
    description: supplier.description,
  };
}

export default async function SupplierDetailPage({ params }: Props) {
  const supplier = await getSupplierDetail(params.id);

  if (!supplier) {
    notFound();
  }

  return (
    <div className="container py-10">
      <div className="mb-6">
        <Link href="/marketplace?type=suppliers" className="text-sm font-medium text-blue-700 hover:text-blue-800">
          ? Back to Suppliers Marketplace
        </Link>
      </div>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 p-7 text-white">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {supplier.isVerified ? (
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                <CheckCircle className="mr-1 h-3 w-3" /> Verified Supplier
              </Badge>
            ) : (
              <Badge variant="secondary">Unverified</Badge>
            )}
            <Badge variant="secondary">
              <Star className="mr-1 h-3 w-3 fill-amber-400 text-amber-400" /> {Number(supplier.rating || 0).toFixed(1)}
            </Badge>
          </div>
          <h1 className="max-w-4xl text-3xl font-bold">{supplier.companyName}</h1>
          <p className="mt-3 max-w-3xl text-slate-200">{supplier.description}</p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-1 text-sm">
            <MapPin className="h-4 w-4" /> {supplier.location}
          </p>
        </div>

        <div className="grid gap-8 p-7 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Product Catalog</h2>
            <div className="mt-4 space-y-3">
              {(supplier.products || []).map((product: any) => (
                <div key={product.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-base font-semibold text-slate-900">{product.productName}</p>
                      <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">{product.category}</p>
                    </div>
                    <Badge variant="outline" className="border-slate-300 text-slate-600">
                      {product.priceRange}
                    </Badge>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                    <p>MOQ: {product.moq}</p>
                    <p>Capacity: {product.productionCapacity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-slate-900">Company Snapshot</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <p className="flex items-center gap-2">
                <Factory className="h-4 w-4 text-slate-400" /> Products: {(supplier.products || []).length}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" /> {supplier.location}
              </p>
              <p>Onboarded: {formatDate(supplier.createdAt)}</p>
            </div>
            <Button className="mt-6 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700">
              Contact Supplier
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </aside>
        </div>
      </article>
    </div>
  );
}
