'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight, Building2, ChevronRight, Cog, Factory,
  FlaskConical, GitBranch, MapPin, Package, Search,
  ShieldCheck, Truck, Wrench, Zap, type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';

const ICON_MAP: Record<string, LucideIcon> = {
  Building2, Cog, Factory, FlaskConical, GitBranch,
  Package, ShieldCheck, Truck, Wrench, Zap,
};

function TaxIcon({ name, className }: { name?: string | null; className?: string }) {
  const Icon = (name && ICON_MAP[name]) || Factory;
  return <Icon className={className || 'h-5 w-5'} />;
}

type IndustryData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  industry_code: string | null;
  seo_title: string | null;
  seo_description: string | null;
};

export default function IndustryPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [industry, setIndustry] = useState<IndustryData | null>(null);
  const [related, setRelated] = useState<IndustryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !slug) return;

    setLoading(true);

    // Fetch this industry
    supabase
      .from('taxonomy')
      .select('*')
      .eq('slug', slug)
      .eq('type', 'industry')
      .eq('is_active', true)
      .single()
      .then(({ data }) => {
        setIndustry(data as IndustryData | null);
        setLoading(false);
      });

    // Fetch other industries for sidebar
    supabase
      .from('taxonomy')
      .select('id,name,slug,description,icon,industry_code')
      .eq('type', 'industry')
      .eq('is_active', true)
      .neq('slug', slug)
      .order('sort_order')
      .then(({ data }) => {
        setRelated((data as IndustryData[]) || []);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container py-16">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
          <div className="mt-4 h-4 w-96 animate-pulse rounded bg-slate-200" />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl bg-slate-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!industry) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold text-slate-900">Industry Not Found</h1>
        <p className="mt-2 text-slate-500">The industry &quot;{slug}&quot; doesn&apos;t exist.</p>
        <Link href="/marketplace"><Button className="mt-4">Browse Marketplace</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="border-b bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
        <div className="container py-12">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white font-medium">{industry.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 text-blue-300">
              <TaxIcon name={industry.icon} className="h-7 w-7" />
            </span>
            <div>
              <h1 className="text-3xl font-bold text-white md:text-4xl">{industry.name}</h1>
              {industry.description && (
                <p className="mt-2 max-w-2xl text-slate-300">{industry.description}</p>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/marketplace?industry=${industry.slug}`}>
              <Button className="bg-white text-slate-900 font-bold hover:bg-slate-100">
                <Search className="mr-2 h-4 w-4" /> Browse Suppliers
              </Button>
            </Link>
            <Link href={`/marketplace?type=buyers&industry=${industry.slug}`}>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                View Buyer Requirements
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* Main */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Procurement in {industry.name}
            </h2>
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="text-slate-600 leading-relaxed">
                MetalHub connects buyers and verified suppliers in the <strong>{industry.name}</strong> sector.
                Find manufacturers with proven capabilities, request quotes, and manage procurement workflows
                through our enterprise-grade platform.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <div className="text-sm font-bold text-slate-900 mb-1">Post a Requirement</div>
                  <p className="text-xs text-slate-500">Describe what you need and receive competitive quotes from verified suppliers.</p>
                  <Link href="/post-requirement" className="mt-2 inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800">
                    Get Started <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <div className="text-sm font-bold text-slate-900 mb-1">Become a Supplier</div>
                  <p className="text-xs text-slate-500">List your manufacturing capabilities and reach buyers across India.</p>
                  <Link href="/register" className="mt-2 inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800">
                    Register <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar — Other Industries */}
          <aside>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
              Other Industries
            </h3>
            <div className="space-y-1">
              {related.map((ind) => (
                <Link
                  key={ind.id}
                  href={`/industries/${ind.slug}`}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-white hover:shadow-sm"
                >
                  <TaxIcon name={ind.icon} className="h-4 w-4 text-slate-400" />
                  {ind.name}
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
