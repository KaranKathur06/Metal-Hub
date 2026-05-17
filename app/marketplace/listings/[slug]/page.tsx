import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, CheckCircle, Clock, MapPin, Package, Shield, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type Props = { params: { slug: string } };

async function getListing(slug: string) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from('listings')
    .select(`
      id, title, slug, description, metal_type, grade, material_spec,
      price_min, price_max, price_unit, currency, is_negotiable,
      moq, lead_time, production_capacity, certifications,
      quantity_available, unit, listing_type, is_featured,
      views_count, inquiry_count, keywords, applications,
      seo_title, seo_description, is_active, created_at,
      company_id, seller_profile_id
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .is('deleted_at', null)
    .maybeSingle();

  return data;
}

async function getCompany(companyId: string | null) {
  if (!companyId) return null;
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from('companies')
    .select('id, name, slug, logo_url, verification_status, trust_level, years_in_business, company_size, website, gst_number')
    .eq('id', companyId)
    .maybeSingle();

  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await getListing(params.slug);
  return {
    title: listing?.seo_title || listing?.title || 'Listing | MetalHub',
    description: listing?.seo_description || listing?.description || 'Industrial listing on MetalHub B2B marketplace.',
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const listing = await getListing(params.slug);
  if (!listing) notFound();

  const company = await getCompany(listing.company_id);
  const isVerified = company?.verification_status === 'approved';
  const certs = listing.certifications || [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Breadcrumb */}
      <div className="border-b bg-white">
        <div className="container flex items-center gap-2 py-3 text-sm text-slate-500">
          <Link href="/marketplace" className="inline-flex items-center gap-1 hover:text-primary">
            <ArrowLeft className="h-3.5 w-3.5" /> Marketplace
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-medium truncate">{listing.title}</span>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Placeholder */}
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-200">
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                <Package className="h-16 w-16" />
              </div>
              <div className="absolute left-4 top-4 flex gap-2">
                <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">{listing.metal_type || 'Metal'}</Badge>
                {listing.is_featured && (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0">Premium</Badge>
                )}
              </div>
              {isVerified && (
                <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
                  <CheckCircle className="h-3 w-3" /> Verified
                </div>
              )}
            </div>

            {/* Title & Price */}
            <div>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{listing.title}</h1>
              {listing.grade && <p className="mt-1 text-sm text-slate-500">Grade: {listing.grade}</p>}

              <div className="mt-4 flex flex-wrap items-baseline gap-4">
                {listing.price_min != null && (
                  <div className="text-3xl font-bold text-slate-900">
                    {formatCurrency(listing.price_min)}
                    {listing.price_max && listing.price_max !== listing.price_min && (
                      <span> — {formatCurrency(listing.price_max)}</span>
                    )}
                    <span className="ml-1 text-base font-medium text-slate-500">{listing.price_unit || '/ MT'}</span>
                  </div>
                )}
                {listing.is_negotiable && (
                  <Badge variant="outline" className="text-emerald-600 border-emerald-200">Negotiable</Badge>
                )}
              </div>
            </div>

            {/* Specs Grid */}
            <div className="rounded-xl border bg-white p-6">
              <h2 className="mb-4 text-lg font-bold">Specifications</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {listing.material_spec && (
                  <div><p className="text-xs font-medium text-slate-400 uppercase">Material Spec</p><p className="font-semibold">{listing.material_spec}</p></div>
                )}
                {listing.moq && (
                  <div><p className="text-xs font-medium text-slate-400 uppercase">Minimum Order</p><p className="font-semibold">{listing.moq}</p></div>
                )}
                {listing.lead_time && (
                  <div><p className="text-xs font-medium text-slate-400 uppercase">Lead Time</p><p className="font-semibold">{listing.lead_time}</p></div>
                )}
                {listing.production_capacity && (
                  <div><p className="text-xs font-medium text-slate-400 uppercase">Production Capacity</p><p className="font-semibold">{listing.production_capacity}</p></div>
                )}
                {listing.quantity_available && (
                  <div><p className="text-xs font-medium text-slate-400 uppercase">Available Qty</p><p className="font-semibold">{listing.quantity_available} {listing.unit}</p></div>
                )}
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="rounded-xl border bg-white p-6">
                <h2 className="mb-3 text-lg font-bold">Description</h2>
                <p className="text-slate-600 whitespace-pre-line">{listing.description}</p>
              </div>
            )}

            {/* Certifications */}
            {certs.length > 0 && (
              <div className="rounded-xl border bg-white p-6">
                <h2 className="mb-3 text-lg font-bold">Certifications</h2>
                <div className="flex flex-wrap gap-2">
                  {certs.map((c: string) => (
                    <Badge key={c} variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">{c}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* CTA Card */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <Link href={`/post-requirement?listing=${listing.id}`}>
                <Button className="w-full h-12 text-base font-bold bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white rounded-xl">
                  <MessageSquare className="mr-2 h-5 w-5" /> Send Inquiry
                </Button>
              </Link>
              <p className="mt-3 text-center text-xs text-slate-400">Typically responds within 4 hours</p>
            </div>

            {/* Supplier Card */}
            {company && (
              <div className="rounded-xl border bg-white p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                    <Building2 className="h-6 w-6 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{company.name}</p>
                    {isVerified && (
                      <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                        <Shield className="h-3 w-3" /> Verified Business
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {company.years_in_business && (
                    <div className="flex justify-between"><span className="text-slate-500">Years in Business</span><span className="font-semibold">{company.years_in_business}</span></div>
                  )}
                  {company.company_size && (
                    <div className="flex justify-between"><span className="text-slate-500">Company Size</span><span className="font-semibold">{company.company_size}</span></div>
                  )}
                  {company.gst_number && (
                    <div className="flex justify-between"><span className="text-slate-500">GST</span><span className="font-semibold">{company.gst_number}</span></div>
                  )}
                </div>

                <Link href={`/suppliers/${company.slug || company.id}`}>
                  <Button variant="outline" className="w-full mt-4">View Company Profile</Button>
                </Link>
              </div>
            )}

            {/* Stats */}
            <div className="rounded-xl border bg-white p-6">
              <h3 className="mb-3 text-sm font-bold text-slate-400 uppercase">Listing Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Views</span><span className="font-semibold">{listing.views_count || 0}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Inquiries</span><span className="font-semibold">{listing.inquiry_count || 0}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Listed</span><span className="font-semibold">{new Date(listing.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
