'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export type MarketplaceFilters = {
  search: string;
  location: string;
  category: string;
  sortBy: 'latest' | 'verified' | 'price';
};

type CapabilityOption = {
  id: string;
  name: string;
  slug: string;
};

type FiltersSidebarProps = {
  tab: 'buyers' | 'suppliers';
  filters: MarketplaceFilters;
  capabilities: CapabilityOption[];
  onChange: (key: keyof MarketplaceFilters, value: string) => void;
  onReset: () => void;
};

export default function FiltersSidebar({
  tab,
  filters,
  capabilities,
  onChange,
  onReset,
}: FiltersSidebarProps) {
  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:h-fit">
      <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="text-lg font-bold text-slate-900">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onReset} className="h-8 px-2 text-xs">
          Reset
        </Button>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder={tab === 'buyers' ? 'Search inquiries' : 'Search suppliers'}
            value={filters.search}
            onChange={(event) => onChange('search', event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="e.g., Mumbai"
            value={filters.location}
            onChange={(event) => onChange('location', event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={filters.category || 'all'}
            onValueChange={(value) => onChange('category', value === 'all' ? '' : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {capabilities.map((capability) => (
                <SelectItem key={capability.id} value={capability.slug}>
                  {capability.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Sort By</Label>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => onChange('sortBy', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="price">Price</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </aside>
  );
}
