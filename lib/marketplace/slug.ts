/**
 * Canonical slug utilities for marketplace entities.
 */

export type MarketplaceEntityType =
  | "supplier"
  | "company"
  | "rfq"
  | "listing"
  | "product"
  | "service";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120);
}

export function buildCanonicalPath(
  entityType: MarketplaceEntityType,
  slug: string,
): string {
  switch (entityType) {
    case "supplier":
      return `/suppliers/${slug}`;
    case "company":
      return `/suppliers/${slug}`;
    case "rfq":
      return `/rfq/${slug}`;
    case "listing":
    case "product":
    case "service":
      return `/marketplace/listings/${slug}`;
    default:
      return `/${slug}`;
  }
}

export async function ensureUniqueSlug(
  base: string,
  isTaken: (candidate: string) => Promise<boolean>,
): Promise<string> {
  const root = slugify(base) || "entity";
  let candidate = root;
  let suffix = 2;

  while (await isTaken(candidate)) {
    candidate = `${root}-${suffix}`;
    suffix += 1;
    if (suffix > 200) {
      candidate = `${root}-${Date.now()}`;
      break;
    }
  }

  return candidate;
}
