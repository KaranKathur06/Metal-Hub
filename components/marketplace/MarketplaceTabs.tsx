'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw, Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import FilterDropdown from './FilterDropdown';
import ListingCard from './ListingCard';

type CapabilityOption = {
  id: string;
  name: string;
  slug: string;
};

type MarketplaceResponse = {
  type: 'buyers' | 'suppliers';
  inquiries?: any[];
  suppliers?: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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
];

const VERIFIED_OPTIONS = [
  { label: 'Verified only', value: 'true' },
];

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
  { label: 'Price Low to High', value: 'price' },
  { label: 'Rating', value: 'rating' },
  { label: 'Verified', value: 'verified' },
];

function parseCsv(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
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
    locations.forEach((value) => chips.push({ label: 'Location', value, key: `location:${value}` }));
    categories.forEach((value) => chips.push({ label: 'Category', value, key: `category:${value}` }));
    if (verified.length > 0) chips.push({ label: 'Verified', value: 'Only', key: 'verified:true' });
    if (moqRange.length > 0) chips.push({ label: 'MOQ', value: moqRange[0], key: `moqRange:${moqRange[0]}` });
    if (date.length > 0) chips.push({ label: 'Date', value: date[0], key: `date:${date[0]}` });
    if (sort[0] && sort[0] !== 'latest') chips.push({ label: 'Sort', value: sort[0], key: `sort:${sort[0]}` });

    return chips;
  }, [search, locations, categories, verified, moqRange, date, sort]);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const next = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (!value) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });

      if (!Object.prototype.hasOwnProperty.call(updates, 'page')) {
        next.delete('page');
      }

      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams();
    params.set('type', activeType);
    params.set('page', String(page));
    params.set('limit', '10');

    if (search) params.set('search', search);
    if (locations.length > 0) params.set('location', locations.join(','));
    if (categories.length > 0) params.set('category', categories.join(','));
    if (verified.length > 0) params.set('verified', 'true');
    if (activeType === 'suppliers' && moqRange.length > 0) params.set('moqRange', moqRange[0]);
    if (date.length > 0) params.set('date', date[0]);
    if (sort.length > 0) params.set('sort', sort[0]);

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/marketplace?${params.toString()}`, {
        cache: 'no-store',
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.message || 'Unable to load marketplace data.');
      }

      setResponse(json);
    } catch (err: any) {
      setError(err?.message || 'Unable to load marketplace data.');
      setResponse(null);
    } finally {
      setLoading(false);
    }
  }, [activeType, page, search, locations, categories, verified, moqRange, date, sort]);

  useEffect(() => {
    const loadCapabilities = async () => {
      try {
        const res = await fetch('/api/capabilities', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        setCapabilities(Array.isArray(data) ? data : []);
      } catch {
        setCapabilities([]);
      }
    };

    loadCapabilities();
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      fetchData();
    }, 280);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [fetchData]);

  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Marketplace</h1>
          <p className="mt-2 max-w-3xl text-slate-600">
            Unified buyer requirements and supplier catalogs with investor-demo grade filtering and detail flows.
          </p>
        </div>

        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => updateParams({ type: 'buyers', moqRange: '' })}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeType === 'buyers' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Buyers
          </button>
          <button
            type="button"
            onClick={() => updateParams({ type: 'suppliers' })}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeType === 'suppliers' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Suppliers
          </button>
        </div>
      </div>

      <div className="sticky top-20 z-30 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[230px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => updateParams({ search: event.target.value })}
              placeholder={activeType === 'buyers' ? 'Search product requirements...' : 'Search suppliers and products...'}
              className="h-10 pl-9"
            />
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
            <FilterDropdown
              label="Location"
              options={LOCATION_OPTIONS}
              value={locations}
              onChange={(next) => updateParams({ location: next.join(',') })}
            />
            <FilterDropdown
              label="Category"
              options={capabilities.map((capability) => ({ label: capability.name, value: capability.slug }))}
              value={categories}
              onChange={(next) => updateParams({ category: next.join(',') })}
            />
            <FilterDropdown
              label="Verified"
              options={VERIFIED_OPTIONS}
              value={verified}
              multiple={false}
              onChange={(next) => updateParams({ verified: next.length > 0 ? 'true' : '' })}
            />
            {activeType === 'suppliers' ? (
              <FilterDropdown
                label="MOQ"
                options={MOQ_OPTIONS}
                value={moqRange}
                multiple={false}
                onChange={(next) => updateParams({ moqRange: next[0] || '' })}
              />
            ) : null}
            <FilterDropdown
              label="Date"
              options={DATE_OPTIONS}
              value={date}
              multiple={false}
              onChange={(next) => updateParams({ date: next[0] || '' })}
            />
            <FilterDropdown
              label="Sort"
              options={SORT_OPTIONS}
              value={sort}
              multiple={false}
              onChange={(next) => updateParams({ sort: next[0] || 'latest' })}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.replace(`/marketplace?type=${activeType}`, { scroll: false })}
              className="h-10"
            >
              Clear All
            </Button>
          </div>
        </div>

        {activeChips.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => {
                  if (chip.key === 'search') {
                    updateParams({ search: '' });
                    return;
                  }

                  if (chip.key.startsWith('location:')) {
                    const next = locations.filter((item) => item !== chip.value);
                    updateParams({ location: next.join(',') });
                    return;
                  }

                  if (chip.key.startsWith('category:')) {
                    const next = categories.filter((item) => item !== chip.value);
                    updateParams({ category: next.join(',') });
                    return;
                  }

                  if (chip.key === 'verified:true') {
                    updateParams({ verified: '' });
                    return;
                  }

                  if (chip.key.startsWith('moqRange:')) {
                    updateParams({ moqRange: '' });
                    return;
                  }

                  if (chip.key.startsWith('date:')) {
                    updateParams({ date: '' });
                    return;
                  }

                  if (chip.key.startsWith('sort:')) {
                    updateParams({ sort: 'latest' });
                  }
                }}
                className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
              >
                {chip.label}: {chip.value}
                <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <section className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {loading ? 'Loading marketplace records...' : `${response?.pagination?.total || 0} results`}
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
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-[280px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
                ))
              : rows.map((item) => <ListingCard key={item.id} tab={activeType} item={item} />)}
          </div>
        ) : null}

        {!loading && !error && rows.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-lg font-semibold text-slate-900">No results found</p>
            <p className="mt-2 text-sm text-slate-500">Try broadening filters or switching marketplace type.</p>
          </div>
        ) : null}

        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => updateParams({ page: String(Math.max(page - 1, 1)) })}
          >
            Previous
          </Button>

          <p className="text-sm text-slate-500">
            Page {response?.pagination?.page || page} of {response?.pagination?.totalPages || 1}
          </p>

          <Button
            variant="outline"
            disabled={!response || page >= response.pagination.totalPages}
            onClick={() => updateParams({ page: String(page + 1) })}
          >
            Next
          </Button>
        </div>
      </section>
    </div>
  );
}


