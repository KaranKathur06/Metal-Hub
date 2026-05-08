export type TaxonomyType = "industry" | "category" | "subcategory" | "process" | "material" | "capability";

export type TaxonomyNode = {
  id: string;
  name: string;
  slug: string;
  type: TaxonomyType;
  parentId: string | null;
  industryCode?: string | null;
  icon?: string | null;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  sortOrder: number;
  isActive: boolean;
  children?: TaxonomyNode[];
};

export function buildTaxonomyTree(nodes: TaxonomyNode[]) {
  const byId = new Map<string, TaxonomyNode>();
  const roots: TaxonomyNode[] = [];

  for (const node of nodes) {
    byId.set(node.id, {
      ...node,
      children: [],
    });
  }

  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)?.children?.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (items: TaxonomyNode[]) => {
    items.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    for (const item of items) {
      sortNodes(item.children ?? []);
    }
  };

  sortNodes(roots);

  return roots;
}

export function filterActiveTaxonomy(nodes: TaxonomyNode[]) {
  return nodes.filter((node) => node.isActive);
}

export function getIndustryNodes(nodes: TaxonomyNode[]) {
  return filterActiveTaxonomy(nodes)
    .filter((node) => node.type === "industry")
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export function getTaxonomyHref(node: Pick<TaxonomyNode, "type" | "slug">) {
  if (node.type === "industry") {
    return `/industries/${node.slug}`;
  }

  return `/marketplace?taxonomy=${encodeURIComponent(node.slug)}`;
}
