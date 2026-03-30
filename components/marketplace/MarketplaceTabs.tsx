'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Building2, Filter, Package, RefreshCw, Search, ShieldCheck, Sparkles, TrendingUp, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import FilterDropdown from './FilterDropdown';
import ListingCard from './ListingCard';

type CapabilityOption = { id: string; name: string; slug: string };

type MarketplaceResponse = {
  type: 'buyers' | 'suppliers';
  inquiries?: any[];
  suppliers?: any[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

const LOCATION_OPTIONS = [
  { label: 'India', value: 'india' },
  { label: 'United States', value: 'usa' },
  { label: 'UAE', value: 'uae' },
  { label: 'Germany', value: 'germany' },
  { label: 'United Kingdom', value: 'uk' },
  { label: 'Singapore', value: 'singapore' },
  { label: 'Vietnam', value: 'vietnam' },
  { label: 'Turkey', value: 'turkey' },
  { label: 'Japan', value: 'japan' },
  { label: 'China', value: 'china' },
  { label: 'Italy', value: 'italy' },
];

const INDUSTRY_OPTIONS = [
  { label: 'Automotive', value: 'automotive' },
  { label: 'Aerospace & Defense', value: 'aerospace-defense' },
  { label: 'Oil & Gas', value: 'oil-gas' },
  { label: 'Construction', value: 'construction' },
  { label: 'Power & Energy', value: 'power-energy' },
  { label: 'Industrial Machinery', value: 'industrial-machinery' },
  { label: 'Electronics Manufacturing', value: 'electronics-manufacturing' },
  { label: 'Robotics & Automation', value: 'robotics-automation' },
  { label: 'Marine & Shipbuilding', value: 'marine-shipbuilding' },
  { label: 'Medical Devices', value: 'medical-devices' },
  { label: 'Renewable Energy', value: 'renewable-energy' },
  { label: 'Agriculture Equipment', value: 'agriculture-equipment' },
];

const VERIFIED_OPTIONS = [{ label: 'Verified only', value: 'true' }];

const MOQ_OPTIONS = [
  { label: '< 100', value: 'lt-100' },
  { label: '100 - 1000', value: '100-1000' },
  { label: '1000+', value: 'gt-1000' },
];

const DATE_OPTIONS = [
  { label: 'Last 24h', value: 'last-24h' },
  { label: 'Last 7 days', value: 'last-7d' },
  { label: 'Last 30 days', value: 'last-30d' },
];

const SORT_OPTIONS = [
  { label: 'Latest', value: 'latest' },
  { label: 'Verified First', value: 'verified' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Price: Low â†’ High', value: 'price' },
  { label: 'Fastest Response', value: 'response' },
  { label: 'Best Completion', value: 'completion' },
];

function parseCsv(value: string | null): string[] {
  if (!value) return [];
  return value.split(',').map((e) => e.trim()).filter(Boolean);
}

export default function MarketplaceTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceRef = useRef<number | null>(null);

  const [capabilities, setCapabilities] = useState<CapabilityOption[]>([]);
  const [response, setResponse] = useState<MarketplaceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeType = searchParams.get('type') === 'suppliers' ? 'suppliers' : 'buyers';
  const page = Number(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const locations = useMemo(() => parseCsv(searchParams.get('location')), [searchParams]);
  const categories = useMemo(() => parseCsv(searchParams.get('category')), [searchParams]);
  const capabilitiesSelected = useMemo(() => parseCsv(searchParams.get('capability')), [searchParams]);
  const industries = useMemo(() => parseCsv(searchParams.get('industry')), [searchParams]);
  const verifiedParam = searchParams.get('verified');
  const moqParam = searchParams.get('moqRange');
  const dateParam = searchParams.get('date');
  const sortParam = searchParams.get('sort');
  const verified = useMemo(() => (verifiedParam === 'true' ? ['true'] : []), [verifiedParam]);
  const moqRange = useMemo(() => (moqParam ? [moqParam] : []), [moqParam]);
  const date = useMemo(() => (dateParam ? [dateParam] : []), [dateParam]);
  const sort = useMemo(() => (sortParam ? [sortParam] : ['latest']), [sortParam]);

  const rows = useMemo(() => {
    if (!response) return [];
    return activeType === 'buyers' ? response.inquiries || [] : response.suppliers || [];
  }, [response, activeType]);

  const activeChips = useMemo(() => {
    const chips: Array<{ label: string; value: string; key: string }> = [];
    if (search) chips.push({ label: 'Search', value: search, key: 'search' });
    locations.forEach((v) => chips.push({ label: 'Location', value: v, key: `location:${v}` }));
    capabilitiesSelected.forEach((v) => chips.push({ label: 'Capability', value: v, key: `capability:${v}` }));
    categories.forEach((v) => chips.push({ label: 'Category', value: v, key: `category:${v}` }));
    industries.forEach((v) => chips.push({ label: 'Industry', value: v, key: `industry:${v}` }));
    if (verified.length > 0) chips.push({ label: 'Verified', value: 'Only', key: 'verified:true' });
    if (moqRange.length > 0) chips.push({ label: 'MOQ', value: moqRange[0], key: `moqRange:${moqRange[0]}` });
    if (date.length > 0) chips.push({ label: 'Date', value: date[0], key: `date:${date[0]}` });
    if (sort[0] && sort[0] !== 'latest') chips.push({ label: 'Sort', value: sort[0], key: `sort:${sort[0]}` });
    return chips;
  }, [search, locations, capabilitiesSelected, categories, industries, verified, moqRange, date, sort]);

  const hasActiveFilters = activeChips.length > 0;

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (!value) { next.delete(key); } else { next.set(key, value); }
      });
      if (!Object.prototype.hasOwnProperty.call(updates, 'page')) { next.delete('page'); }
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams();
    params.set('type', activeType);
    params.set('page', String(page));
    params.set('limit', '20');
    if (search) params.set('search', search);
    if (locations.length > 0) params.set('location', locations.join(','));
    if (capabilitiesSelected.length > 0) params.set('capability', capabilitiesSelected.join(','));
    if (categories.length > 0) params.set('category', categories.join(','));
    if (industries.length > 0) params.set('industry', industries.join(','));
    if (verified.length > 0) params.set('verified', 'true');
    if (activeType === 'suppliers' && moqRange.length > 0) params.set('moqRange', moqRange[0]);
    if (date.length > 0) params.set('date', date[0]);
    if (sort.length > 0) params.set('sort', sort[0]);

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/marketplace?${params.toString()}`, { cache: 'no-store' });
      const raw = await res.text();
      let json: any = null;
      if (raw) {
        try {
          json = JSON.parse(raw);
        } catch {
          json = null;
        }
      }
      if (!res.ok) throw new Error(json?.message || `Marketplace API failed (${res.status}).`);
      if (!json || typeof json !== 'object') {
        throw new Error('Marketplace API returned an invalid response payload.');
      }
      setResponse(json);
    } catch (err: any) {
      setError(err?.message || 'Unable to load marketplace data.');
      setResponse(null);
    } finally {
      setLoading(false);
    }
  }, [activeType, page, search, locations, capabilitiesSelected, categories, industries, verified, moqRange, date, sort]);

  useEffect(() => {
    const loadCapabilities = async () => {
      try {
        const res = await fetch('/api/capabilities', { cache: 'no-store' });
        if (!res.ok) return setCapabilities([]);
        const raw = await res.text();
        const data = raw ? JSON.parse(raw) : [];
        setCapabilities(Array.isArray(data) ? data : []);
      } catch { setCapabilities([]); }
    };
    loadCapabilities();
  }, []);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => { fetchData(); }, 280);
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
  }, [fetchData]);

  const removeChip = (chipKey: string, chipValue: string) => {
    if (chipKey === 'search') return updateParams({ search: '' });
    if (chipKey.startsWith('location:')) return updateParams({ location: locations.filter((i) => i !== chipValue).join(',') });
    if (chipKey.startsWith('capability:')) return updateParams({ capability: capabilitiesSelected.filter((i) => i !== chipValue).join(',') });
    if (chipKey.startsWith('category:')) return updateParams({ category: categories.filter((i) => i !== chipValue).join(',') });
    if (chipKey.startsWith('industry:')) return updateParams({ industry: industries.filter((i) => i !== chipValue).join(',') });
    if (chipKey === 'verified:true') return updateParams({ verified: '' });
    if (chipKey.startsWith('moqRange:')) return updateParams({ moqRange: '' });
    if (chipKey.startsWith('date:')) return updateParams({ date: '' });
    if (chipKey.startsWith('sort:')) return updateParams({ sort: 'latest' });
  };

  const totalResults = response?.pagination?.total || 0;

  return (
    <div>
      {/* ========== MARKETPLACE HERO ========== */}
      <section className="border-b border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
        <div className="container py-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-300">
                <Sparkles className="h-3 w-3" /> B2B Industrial Marketplace
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                {activeType === 'buyers' ? 'Buyer Requirements' : 'Verified Suppliers'}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-slate-300">
                {activeType === 'buyers'
                  ? 'Explore active buyer requirements and submit competitive quotes to win orders.'
                  : 'Discover verified manufacturing suppliers with capability-based filtering and real product catalogs.'}
              </p>
            </div>

            {/* Stats banner */}
            <div className="flex items-center gap-6 text-sm text-slate-300">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{totalResults}</p>
                <p className="text-xs text-slate-400">{activeType === 'buyers' ? 'Active RFQs' : 'Suppliers'}</p>
              </div>
              <div className="h-8 w-px bg-slate-700" />
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400">50+</p>
                <p className="text-xs text-slate-400">Verified</p>
              </div>
              <div className="h-8 w-px bg-slate-700" />
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">200+</p>
                <p className="text-xs text-slate-400">Products</p>
              </div>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="mt-6 inline-flex rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur">
            <button
              type="button"
              onClick={() => updateParams({ type: 'buyers', moqRange: '' })}
              className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                activeType === 'buyers' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Package className="h-4 w-4" /> Buyer Requirements
            </button>
            <button
              type="button"
              onClick={() => updateParams({ type: 'suppliers' })}
              className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                activeType === 'suppliers' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Building2 className="h-4 w-4" /> Suppliers
            </button>
          </div>
        </div>
      </section>

      {/* ========== FILTER BAR ========== */}
      <div className="container py-6">
        <div className="sticky top-20 z-30 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[230px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => updateParams({ search: e.target.value })}
                placeholder={activeType === 'buyers' ? 'Search product requirements...' : 'Search suppliers, materials, products...'}
                className="h-10 pl-9"
              />
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <FilterDropdown label="Location" options={LOCATION_OPTIONS} value={locations} onChange={(next) => updateParams({ location: next.join(',') })} />
              <FilterDropdown
                label="Capability"
                options={capabilities.map((c) => ({ label: c.name, value: c.slug }))}
                value={capabilitiesSelected}
                onChange={(next) => updateParams({ capability: next.join(',') })}
              />
              <FilterDropdown label="Industry" options={INDUSTRY_OPTIONS} value={industries} onChange={(next) => updateParams({ industry: next.join(',') })} />
              <FilterDropdown label="Verified" options={VERIFIED_OPTIONS} value={verified} multiple={false} onChange={(next) => updateParams({ verified: next.length > 0 ? 'true' : '' })} />
              {activeType === 'suppliers' ? (
                <FilterDropdown label="MOQ" options={MOQ_OPTIONS} value={moqRange} multiple={false} onChange={(next) => updateParams({ moqRange: next[0] || '' })} />
              ) : null}
              <FilterDropdown label="Date" options={DATE_OPTIONS} value={date} multiple={false} onChange={(next) => updateParams({ date: next[0] || '' })} />
              <FilterDropdown label="Sort" options={SORT_OPTIONS} value={sort} multiple={false} onChange={(next) => updateParams({ sort: next[0] || 'latest' })} />
              {hasActiveFilters ? (
                <Button variant="ghost" size="sm" onClick={() => router.replace(`/marketplace?type=${activeType}`, { scroll: false })} className="h-10 text-red-600 hover:text-red-700">
                  <X className="mr-1 h-3.5 w-3.5" /> Clear All
                </Button>
              ) : null}
            </div>
          </div>

          {/* Active filter pills */}
          {activeChips.length > 0 ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => removeChip(chip.key, chip.value)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                >
                  {chip.label}: <span className="capitalize">{chip.value.replace(/-/g, ' ')}</span>
                  <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* ========== RESULTS ========== */}
        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              {loading ? (
                <span className="inline-flex items-center gap-2"><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Loading...</span>
              ) : (
                <span>{totalResults} results {hasActiveFilters ? '(filtered)' : ''}</span>
              )}
            </p>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="text-base font-semibold text-red-700">{error}</p>
              <p className="mt-2 text-sm text-red-600">Backend may be unavailable. Check API URL and retry.</p>
              <Button onClick={fetchData} className="mt-4 bg-red-600 text-white hover:bg-red-700">
                <RefreshCw className="mr-2 h-4 w-4" /> Retry
              </Button>
            </div>
          ) : null}

          {!error ? (
            <div className="grid gap-5 md:grid-cols-2">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-[360px] animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />
                  ))
                : rows.map((item) => <ListingCard key={item.id} tab={activeType} item={item} />)}
            </div>
          ) : null}

          {!loading && !error && rows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <Search className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-lg font-bold text-slate-900">No results found</p>
              <p className="mt-2 text-sm text-slate-500">Try broadening your filters or switching to {activeType === 'buyers' ? 'Suppliers' : 'Buyers'} tab.</p>
              <Button variant="outline" className="mt-4" onClick={() => router.replace(`/marketplace?type=${activeType}`, { scroll: false })}>
                Clear All Filters
              </Button>
            </div>
          ) : null}

          {/* Pagination */}
          <div className="mt-8 flex items-center justify-between">
            <Button variant="outline" disabled={page <= 1} onClick={() => updateParams({ page: String(Math.max(page - 1, 1)) })}>
              Previous
            </Button>
            <p className="text-sm text-slate-500">
              Page {response?.pagination?.page || page} of {response?.pagination?.totalPages || 1}
            </p>
            <Button variant="outline" disabled={!response || page >= response.pagination.totalPages} onClick={() => updateParams({ page: String(page + 1) })}>
              Next
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
