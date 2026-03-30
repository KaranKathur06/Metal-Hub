import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, Award, BarChart3, CheckCircle2, Clock3,
  Factory, Globe2, Mail, MapPin, Package, Phone, Shield, ShieldCheck,
  Star, TrendingUp, Trophy, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { getSupplierDetail } from '@/lib/server/marketplace';

export const dynamic = 'force-dynamic';

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supplier = await getSupplierDetail(params.id);
  if (!supplier) return { title: 'Supplier Not Found | MetalHub' };
  return {
    title: `${supplier.companyName} Supplier Profile | MetalHub`,
    description: supplier.description,
  };
}

export default async function SupplierDetailPage({ params }: Props) {
  const supplier = await getSupplierDetail(params.id);
  if (!supplier) notFound();

  const capabilities = (supplier.capabilities || []).map((i: any) => i.name || i.slug).filter(Boolean);
  const industries = (supplier.industries || []).map((i: any) => i.name || i.slug).filter(Boolean);
  const products = supplier.products || [];
  const ratingNum = Number(supplier.rating || 0);
  const ratingColor = ratingNum >= 4.5 ? 'text-emerald-500' : ratingNum >= 4.0 ? 'text-amber-500' : 'text-slate-500';

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Breadcrumb */}
      <div className="border-b border-slate-200 bg-white">
        <div className="container py-3">
          <Link href="/marketplace?type=suppliers" className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Suppliers
          </Link>
        </div>
      </div>

      {/* ========== HERO SECTION ========== */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="container relative z-10 py-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              {/* Badge row */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {supplier.isVerified ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300 ring-1 ring-emerald-400/30">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified Supplier
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-400">
                    Unverified
                  </span>
                )}
                {supplier.isoCertified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold text-blue-300 ring-1 ring-blue-400/30">
                    <Award className="h-3 w-3" /> ISO Certified
                  </span>
                ) : null}
                {supplier.exportReady ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-bold text-indigo-300 ring-1 ring-indigo-400/30">
                    <Globe2 className="h-3 w-3" /> Export Ready
                  </span>
                ) : null}
                <span className={`inline-flex items-center gap-1 text-lg font-bold ${ratingColor}`}>
                  <Star className="h-4 w-4 fill-current" /> {ratingNum.toFixed(1)}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-white md:text-4xl">{supplier.companyName}</h1>
              <p className="mt-2 text-base text-blue-200">{supplier.tagline || 'Industrial manufacturing and sourcing partner'}</p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">{supplier.description}</p>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-300">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {supplier.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5 text-slate-400" /> Member since {formatDate(supplier.createdAt)}
                </span>
              </div>
            </div>

            {/* Performance stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur">
                <Zap className="mx-auto h-5 w-5 text-amber-400" />
                <p className="mt-1 text-xl font-bold text-white">{supplier.responseTimeMinutes || 120}m</p>
                <p className="text-[11px] text-slate-400">Avg Response</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur">
                <Trophy className="mx-auto h-5 w-5 text-emerald-400" />
                <p className="mt-1 text-xl font-bold text-white">{Math.round(supplier.completionRate || 0)}%</p>
                <p className="text-[11px] text-slate-400">Completion</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur">
                <Package className="mx-auto h-5 w-5 text-blue-400" />
                <p className="mt-1 text-xl font-bold text-white">{products.length}</p>
                <p className="text-[11px] text-slate-400">Products</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur">
                <BarChart3 className="mx-auto h-5 w-5 text-purple-400" />
                <p className="mt-1 text-xl font-bold text-white">{capabilities.length}</p>
                <p className="text-[11px] text-slate-400">Capabilities</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CONTENT GRID ========== */}
      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* LEFT — Main content */}
          <div className="space-y-8">
            {/* Capabilities Matrix */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <Shield className="h-5 w-5 text-blue-600" /> Capabilities Matrix
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {capabilities.length > 0 ? capabilities.map((cap: string) => (
                  <Link
                    key={cap}
                    href={`/marketplace?type=suppliers&capability=${cap.toLowerCase().replace(/\s/g, '-')}`}
                    className="rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                  >
                    {cap}
                  </Link>
                )) : (
                  <p className="text-sm text-slate-500">Capabilities will be updated by supplier.</p>
                )}
              </div>

              {industries.length > 0 ? (
                <>
                  <h3 className="mt-6 text-sm font-bold uppercase tracking-wider text-slate-400">Industries Served</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {industries.map((ind: string) => (
                      <Link
                        key={ind}
                        href={`/marketplace?type=suppliers&industry=${ind.toLowerCase().replace(/[\s&]/g, '-')}`}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
                      >
                        {ind}
                      </Link>
                    ))}
                  </div>
                </>
              ) : null}
            </section>

            {/* Product Catalog */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <Package className="h-5 w-5 text-blue-600" /> Product Catalog
                <span className="ml-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">{products.length}</span>
              </h2>

              <div className="mt-4 space-y-3">
                {products.map((product: any) => (
                  <div key={product.id} className="rounded-xl border border-slate-200 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/30">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-base font-bold text-slate-900">{product.productName}</p>
                        <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-400">{product.category.replace('-', ' ')}</p>
                      </div>
                      <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
                        {product.priceRange}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2 md:grid-cols-4">
                      <p className="flex items-center gap-1.5"><Package className="h-3.5 w-3.5 text-slate-400" /> MOQ: {product.moq}</p>
                      <p className="flex items-center gap-1.5"><Factory className="h-3.5 w-3.5 text-slate-400" /> {product.productionCapacity}</p>
                      <p className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-slate-400" /> {product.material || 'Mixed'}</p>
                    </div>
                  </div>
                ))}

                {products.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
                    <p className="text-sm text-slate-500">Product catalog is being updated.</p>
                  </div>
                ) : null}
              </div>
            </section>

            {/* Company Info */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <Factory className="h-5 w-5 text-blue-600" /> Company Details
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Certifications</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold ${supplier.isoCertified ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                      <Award className="h-3 w-3" /> ISO 9001
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold ${supplier.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                      <CheckCircle2 className="h-3 w-3" /> MetalHub Verified
                    </span>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Export Markets</p>
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {supplier.exportReady ? 'Global Export Support — US, EU, Middle East, APAC' : 'Domestic Delivery Support'}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT — Sticky CTA Panel */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="space-y-4">
              {/* Contact card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">Contact This Supplier</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Share your requirement specs, preferred lead time, and quantities to get a response.
                </p>

                <Button className="mt-5 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-5 text-base font-bold text-white shadow-[0_4px_14px_rgba(59,130,246,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)]">
                  <Mail className="mr-2 h-4 w-4" /> Contact Supplier
                </Button>
                <Button variant="outline" className="mt-3 w-full rounded-xl py-5">
                  <Phone className="mr-2 h-4 w-4" /> Request Callback
                </Button>
              </div>

              {/* Performance card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Performance Metrics</h4>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-slate-600"><Zap className="h-4 w-4 text-amber-500" /> Response Time</span>
                    <span className="text-sm font-bold text-slate-900">{supplier.responseTimeMinutes || 120} mins</span>
                  </div>
                  <div className="h-px bg-slate-100" />
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-slate-600"><Trophy className="h-4 w-4 text-emerald-500" /> Completion Rate</span>
                    <span className="text-sm font-bold text-slate-900">{Math.round(supplier.completionRate || 0)}%</span>
                  </div>
                  <div className="h-px bg-slate-100" />
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-slate-600"><Star className="h-4 w-4 text-amber-500" /> Rating</span>
                    <span className="text-sm font-bold text-slate-900">{ratingNum.toFixed(1)} / 5.0</span>
                  </div>
                  <div className="h-px bg-slate-100" />
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-slate-600"><TrendingUp className="h-4 w-4 text-blue-500" /> Product Count</span>
                    <span className="text-sm font-bold text-slate-900">{products.length}</span>
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Trust & Safety</h4>
                <div className="mt-3 space-y-2 text-sm">
                  <p className="flex items-center gap-2 text-slate-600"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Verified procurement workflow</p>
                  <p className="flex items-center gap-2 text-slate-600"><Shield className="h-4 w-4 text-blue-500" /> Secure communication channel</p>
                  <p className="flex items-center gap-2 text-slate-600"><Award className="h-4 w-4 text-amber-500" /> Quality-assured supply chain</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
