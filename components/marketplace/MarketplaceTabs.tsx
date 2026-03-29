'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import FiltersSidebar, { MarketplaceFilters } from './FiltersSidebar';
import ListingCard from './ListingCard';

type CapabilityOption = {
  id: string;
  name: string;
  slug: string;
};

type PaginatedResponse = {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  inquiries?: any[];
  suppliers?: any[];
};

export default function MarketplaceTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceRef = useRef<number | null>(null);

  const activeTab = searchParams.get('tab') === 'suppliers' ? 'suppliers' : 'buyers';
  const page = Number(searchParams.get('page') || '1');

  const filters: MarketplaceFilters = {
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    category: searchParams.get('category') || '',
    sortBy: (searchParams.get('sortBy') as MarketplaceFilters['sortBy']) || 'latest',
  };

  const [capabilities, setCapabilities] = useState<CapabilityOption[]>([]);
  const [response, setResponse] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const entries = useMemo(() => {
    if (!response) return [];
    return activeTab === 'buyers' ? response.inquiries || [] : response.suppliers || [];
  }, [response, activeTab]);

  const updateParams = (updates: Record<string, string>) => {
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
  };

  useEffect(() => {
    const loadCapabilities = async () => {
      try {
        const res = await fetch('/api/capabilities', { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        setCapabilities(Array.isArray(json) ? json : []);
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

    debounceRef.current = window.setTimeout(async () => {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.location) params.set('location', filters.location);
      if (filters.category) params.set('category', filters.category);
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      params.set('page', String(page));
      params.set('limit', '12');

      setLoading(true);
      setError(null);

      try {
        const endpoint = activeTab === 'buyers' ? '/api/inquiries' : '/api/suppliers';
        const res = await fetch(`${endpoint}?${params.toString()}`, { cache: 'no-store' });
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json?.message || 'Failed to load marketplace data');
        }

        setResponse(json);
      } catch (err: any) {
        setError(err?.message || 'Failed to load marketplace data');
        setResponse(null);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [activeTab, filters.search, filters.location, filters.category, filters.sortBy, page]);

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Unified Marketplace</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Switch between buyer inquiries and supplier listings with shared filters for location, category, search, and sorting.
        </p>
      </div>

      <div className="mb-8 inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => updateParams({ tab: 'buyers' })}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            activeTab === 'buyers' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Buyers
        </button>
        <button
          type="button"
          onClick={() => updateParams({ tab: 'suppliers' })}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            activeTab === 'suppliers' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Suppliers
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <FiltersSidebar
          tab={activeTab}
          filters={filters}
          capabilities={capabilities}
          onChange={(key, value) => updateParams({ [key]: value })}
          onReset={() => {
            router.replace(`${pathname}?tab=${activeTab}`, { scroll: false });
          }}
        />

        <section>
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {loading ? 'Loading...' : `${response?.pagination?.total || 0} results`}
            </p>
          </div>

          {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}

          {!loading && !error && entries.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
              <p className="text-lg font-semibold text-slate-900">No matching records</p>
              <p className="mt-2 text-sm text-slate-500">Adjust your filters to broaden results.</p>
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-[220px] animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
                ))
              : entries.map((item) => <ListingCard key={item.id} tab={activeTab} item={item} />)}
          </div>

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
    </div>
  );
}
