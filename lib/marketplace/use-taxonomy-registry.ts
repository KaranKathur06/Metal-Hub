"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "../supabase/browser-client";
import type { TaxonomyNode } from "./taxonomy";

export type TaxonomyGroup = {
  nodes: TaxonomyNode[];
  industries: TaxonomyNode[];
  capabilities: TaxonomyNode[];
  categories: TaxonomyNode[];
  subcategories: TaxonomyNode[];
  processes: TaxonomyNode[];
  materials: TaxonomyNode[];
};

let taxonomyCache: TaxonomyGroup | null = null;

function groupByType(nodes: TaxonomyNode[]): TaxonomyGroup {
  return {
    nodes,
    industries: nodes.filter((n) => n.type === "industry"),
    capabilities: nodes.filter((n) => n.type === "capability"),
    categories: nodes.filter((n) => n.type === "category"),
    subcategories: nodes.filter((n) => n.type === "subcategory"),
    processes: nodes.filter((n) => n.type === "process"),
    materials: nodes.filter((n) => n.type === "material"),
  };
}

export function useTaxonomyRegistry() {
  const [data, setData] = useState<TaxonomyGroup | null>(taxonomyCache);
  const [loading, setLoading] = useState(!taxonomyCache);

  useEffect(() => {
    if (taxonomyCache) {
      setData(taxonomyCache);
      setLoading(false);
      return;
    }

    let mounted = true;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase
      .from("taxonomy")
      .select(
        "id,name,slug,type,parent_id,industry_code,icon,description,seo_title,seo_description,sort_order,is_active"
      )
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
      .then(({ data: records }) => {
        if (!mounted) return;
        const nodes: TaxonomyNode[] = (records ?? []).map((r: any) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          type: r.type,
          parentId: r.parent_id,
          industryCode: r.industry_code,
          icon: r.icon,
          description: r.description,
          seoTitle: r.seo_title,
          seoDescription: r.seo_description,
          sortOrder: r.sort_order,
          isActive: r.is_active,
        }));

        const grouped = groupByType(nodes);
        taxonomyCache = grouped;
        setData(grouped);
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading };
}
