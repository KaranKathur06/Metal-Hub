import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildTaxonomyTree,
  filterActiveTaxonomy,
  getIndustryNodes,
  getTaxonomyHref,
  type TaxonomyNode,
} from "./taxonomy";

type TaxonomyRecord = {
  id: string;
  name: string;
  slug: string;
  type: TaxonomyNode["type"];
  parent_id: string | null;
  industry_code: string | null;
  icon: string | null;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  sort_order: number;
  is_active: boolean;
};

function toTaxonomyNode(record: TaxonomyRecord): TaxonomyNode {
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    type: record.type,
    parentId: record.parent_id,
    industryCode: record.industry_code,
    icon: record.icon,
    description: record.description,
    seoTitle: record.seo_title,
    seoDescription: record.seo_description,
    sortOrder: record.sort_order,
    isActive: record.is_active,
  };
}

export async function fetchActiveTaxonomy(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("taxonomy")
    .select("id,name,slug,type,parent_id,industry_code,icon,description,seo_title,seo_description,sort_order,is_active")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as TaxonomyRecord[]).map(toTaxonomyNode);
}

export async function fetchIndustryRegistry(supabase: SupabaseClient) {
  const nodes = await fetchActiveTaxonomy(supabase);
  const activeNodes = filterActiveTaxonomy(nodes);
  const tree = buildTaxonomyTree(activeNodes);

  return {
    nodes: activeNodes,
    tree,
    industries: getIndustryNodes(activeNodes),
  };
}

export function searchTaxonomy(nodes: TaxonomyNode[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return getIndustryNodes(nodes);
  }

  return filterActiveTaxonomy(nodes)
    .filter((node) => {
      const haystack = [
        node.name,
        node.slug,
        node.industryCode,
        node.description,
        node.type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    })
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export function getIndustryHref(industry: Pick<TaxonomyNode, "type" | "slug">) {
  return getTaxonomyHref(industry);
}

