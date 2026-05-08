"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  ChevronDown,
  Cog,
  Factory,
  FlaskConical,
  GitBranch,
  Package,
  Search,
  ShieldCheck,
  Truck,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { fetchIndustryRegistry, getIndustryHref, searchTaxonomy } from "../../lib/marketplace/industry-registry";
import type { TaxonomyNode } from "../../lib/marketplace/taxonomy";
import { getSupabaseBrowserClient } from "../../lib/supabase/browser-client";

type IndustryRegistryMenuProps = {
  mode?: "desktop" | "mobile";
};

type IndustryRegistryCache = {
  nodes: TaxonomyNode[];
  industries: TaxonomyNode[];
  tree: TaxonomyNode[];
};

const iconMap: Record<string, LucideIcon> = {
  Building2,
  Cog,
  Factory,
  FlaskConical,
  GitBranch,
  Package,
  ShieldCheck,
  Truck,
  Wrench,
  Zap,
};

let registryCache: IndustryRegistryCache | null = null;

function getIcon(iconName?: string | null) {
  if (!iconName) {
    return Factory;
  }

  return iconMap[iconName] ?? Factory;
}

function IndustryIcon({ icon }: { icon?: string | null }) {
  const Icon = getIcon(icon);

  return <Icon className="h-4 w-4" aria-hidden="true" />;
}

export function IndustryRegistryMenu({ mode = "desktop" }: IndustryRegistryMenuProps) {
  const [registry, setRegistry] = useState<IndustryRegistryCache | null>(registryCache);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(!registryCache);

  useEffect(() => {
    let mounted = true;

    async function loadRegistry() {
      if (registryCache) {
        setRegistry(registryCache);
        setLoading(false);
        return;
      }

      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const nextRegistry = await fetchIndustryRegistry(supabase);

        registryCache = nextRegistry;

        if (mounted) {
          setRegistry(nextRegistry);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadRegistry();

    return () => {
      mounted = false;
    };
  }, []);

  const visibleItems = useMemo(() => {
    if (!registry) {
      return [];
    }

    return searchTaxonomy(registry.nodes, query).filter((node) => node.type === "industry");
  }, [query, registry]);

  if (mode === "mobile") {
    return (
      <details className="border-b border-zinc-800 py-2">
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
          Industries
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </summary>

        <div className="mt-3">
          <label className="flex items-center gap-2 rounded-md border border-zinc-800 px-3 py-2 text-sm">
            <Search className="h-4 w-4 text-zinc-500" aria-hidden="true" />
            <input
              className="min-w-0 flex-1 bg-transparent outline-none"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search industries"
            />
          </label>

          <div className="mt-2 grid gap-1">
            {loading ? (
              <div className="px-2 py-2 text-sm text-zinc-500">Loading industries</div>
            ) : null}
            {visibleItems.map((industry) => (
              <Link
                key={industry.id}
                className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-zinc-100"
                href={getIndustryHref(industry)}
              >
                <IndustryIcon icon={industry.icon} />
                {industry.name}
              </Link>
            ))}
          </div>
        </div>
      </details>
    );
  }

  return (
    <div className="group relative">
      <button className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium hover:bg-white/10" type="button">
        Industries
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </button>

      <div className="invisible absolute left-0 top-full z-50 w-[760px] translate-y-2 rounded-md border border-zinc-800 bg-zinc-950 p-4 text-zinc-100 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <label className="flex items-center gap-2 rounded-md border border-zinc-800 px-3 py-2 text-sm">
          <Search className="h-4 w-4 text-zinc-500" aria-hidden="true" />
          <input
            className="min-w-0 flex-1 bg-transparent outline-none"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search industries, materials, processes"
          />
        </label>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {loading ? (
            <div className="col-span-2 rounded-md border border-zinc-800 px-3 py-3 text-sm text-zinc-400">
              Loading industry registry
            </div>
          ) : null}

          {visibleItems.map((industry) => (
            <Link
              key={industry.id}
              className="group/item rounded-md border border-zinc-800 p-3 hover:border-amber-500/40 hover:bg-white/5"
              href={getIndustryHref(industry)}
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-amber-300">
                  <IndustryIcon icon={industry.icon} />
                </span>
                {industry.name}
              </div>
              {industry.description ? (
                <p className="mt-2 line-clamp-2 text-xs text-zinc-400">{industry.description}</p>
              ) : null}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

