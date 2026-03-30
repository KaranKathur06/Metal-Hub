import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, Award, Calendar, Clock3, Download, Eye,
  FileText, Globe2, MapPin, Package, Shield, ShieldCheck, TrendingUp,
  Wallet, Wrench, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getInquiryDetail } from '@/lib/server/marketplace';

export const dynamic = 'force-dynamic';

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const inquiry = await getInquiryDetail(params.id);
  if (!inquiry) return { title: 'Inquiry Not Found | MetalHub' };
  return {
    title: `${inquiry.productName} Requirement | MetalHub`,
    description: inquiry.description,
  };
}

function urgencyConfig(urgency: string) {
  if (urgency === 'HIGH') return { bg: 'bg-red-500/15', text: 'text-red-300', ring: 'ring-red-400/30', dot: 'bg-red-400', label: 'Urgent Priority' };
  if (urgency === 'LOW') return { bg: 'bg-emerald-500/15', text: 'text-emerald-300', ring: 'ring-emerald-400/30', dot: 'bg-emerald-400', label: 'Flexible Timeline' };
  return { bg: 'bg-amber-500/15', text: 'text-amber-300', ring: 'ring-amber-400/30', dot: 'bg-amber-400', label: 'Standard Priority' };
}

export default async function InquiryDetailPage({ params }: Props) {
  const inquiry = await getInquiryDetail(params.id);
  if (!inquiry) notFound();

  const urg = urgencyConfig(inquiry.urgency || 'MEDIUM');
  const mappedCapabilities = (inquiry.capabilityMappings || [])
    .map((entry: any) => entry?.capability?.name || entry?.capability?.slug)
    .filter(Boolean);
  const attachments = inquiry.specDocUrls || [];

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Breadcrumb */}
      <div className="border-b border-slate-200 bg-white">
        <div className="container py-3">
          <Link href="/marketplace?type=buyers" className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Buyer Requirements
          </Link>
        </div>
      </div>

      {/* ========== HERO ========== */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="container relative z-10 py-10">
          {/* Badges */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ${urg.bg} ${urg.text} ${urg.ring}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${urg.dot}`} />
              {urg.label}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold capitalize text-white">
              {inquiry.category?.replace('-', ' ') || 'General'}
            </span>
            {inquiry.industry?.name ? (
              <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-300 ring-1 ring-blue-400/30">
                {inquiry.industry.name}
              </span>
            ) : null}
          </div>

          <h1 className="max-w-4xl text-3xl font-bold text-white md:text-4xl">{inquiry.productName}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">{inquiry.description}</p>

          {/* Quick stats row */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300">
              <MapPin className="h-3.5 w-3.5" /> {inquiry.location}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300">
              <Package className="h-3.5 w-3.5" /> {inquiry.quantity}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300">
              <Calendar className="h-3.5 w-3.5" /> Posted {formatDate(inquiry.createdAt)}
            </span>
          </div>
        </div>
      </section>

      {/* ========== CONTENT 70/30 ========== */}
      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* LEFT — 70% */}
          <div className="space-y-6">
            {/* Requirement Overview */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <Package className="h-5 w-5 text-blue-600" /> Requirement Overview
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Quantity</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{inquiry.quantity}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Budget Range</p>
                  <p className="mt-1 text-lg font-bold text-emerald-700">
                    {inquiry.budgetRange || (typeof inquiry.budget === 'number' ? formatCurrency(inquiry.budget) : 'Open Budget')}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Delivery Location</p>
                  <p className="mt-1 text-base font-semibold text-slate-800">{inquiry.location}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Posted On</p>
                  <p className="mt-1 text-base font-semibold text-slate-800">{formatDate(inquiry.createdAt)}</p>
                </div>
              </div>
            </section>

            {/* Technical Specifications */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <Wrench className="h-5 w-5 text-blue-600" /> Technical Specifications
              </h2>
              <div className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Material</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {inquiry.material || 'To be finalized with qualified supplier'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Capability Match</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {mappedCapabilities.length > 0 ? mappedCapabilities.map((cap: string) => (
                        <span key={cap} className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                          {cap}
                        </span>
                      )) : (
                        <span className="text-sm font-medium text-slate-600 capitalize">
                          {inquiry.capability?.name || inquiry.category?.replace('-', ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-500">Timeline Expectation</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    Target closure in 7–14 days from supplier shortlist. {inquiry.urgency === 'HIGH' ? 'Fast-track evaluation for urgent requirements.' : 'Standard evaluation timeline.'}
                  </p>
                </div>
              </div>
            </section>

            {/* Attachments */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <FileText className="h-5 w-5 text-blue-600" /> Attachments & Drawings
              </h2>
              <div className="mt-4 space-y-2">
                {attachments.length > 0 ? (
                  attachments.map((url: string, index: number) => (
                    <a
                      key={url + index}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-xl border border-slate-200 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50"
                    >
                      <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <FileText className="h-4 w-4 text-blue-500" /> Specification Document {index + 1}
                      </span>
                      <Download className="h-4 w-4 text-blue-600" />
                    </a>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
                    <FileText className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-sm text-slate-500">
                      Technical drawings and spec documents available after supplier engagement.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT — 30% Sticky */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="space-y-4">
              {/* Primary CTA */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">Submit Your Quote</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Include lead time, QA plan, and commercial terms to improve your win rate.
                </p>

                <Button className="mt-5 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-5 text-base font-bold text-white shadow-[0_4px_14px_rgba(59,130,246,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)]">
                  Send Quote <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" className="mt-3 w-full rounded-xl py-5">
                  Contact Buyer
                </Button>
              </div>

              {/* Engagement stats */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Engagement</h4>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-slate-600">
                      <Eye className="h-4 w-4 text-blue-500" /> Profile Views
                    </span>
                    <span className="text-sm font-bold text-slate-900">{inquiry.viewsCount || 0}</span>
                  </div>
                  <div className="h-px bg-slate-100" />
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-slate-600">
                      <Zap className="h-4 w-4 text-amber-500" /> Supplier Quotes
                    </span>
                    <span className="text-sm font-bold text-slate-900">{inquiry.quoteCount || 0}</span>
                  </div>
                  <div className="h-px bg-slate-100" />
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-slate-600">
                      <TrendingUp className="h-4 w-4 text-emerald-500" /> Competition Level
                    </span>
                    <span className={`text-sm font-bold ${(inquiry.quoteCount || 0) > 5 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {(inquiry.quoteCount || 0) > 5 ? 'High' : 'Low'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Trust & Safety</h4>
                <div className="mt-3 space-y-2 text-sm">
                  <p className="flex items-center gap-2 text-slate-600">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" /> Verified procurement workflow
                  </p>
                  <p className="flex items-center gap-2 text-slate-600">
                    <Shield className="h-4 w-4 text-blue-500" /> Secure quote submission
                  </p>
                  <p className="flex items-center gap-2 text-slate-600">
                    <Award className="h-4 w-4 text-amber-500" /> MetalHub escrow protection
                  </p>
                  <p className="flex items-center gap-2 text-slate-600">
                    <Globe2 className="h-4 w-4 text-indigo-500" /> International trade support
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
