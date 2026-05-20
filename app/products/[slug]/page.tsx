import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingPublicDetail } from "@/components/marketplace/public/ListingPublicDetail";
import { loadListingBySlug, loadListingCompany } from "@/lib/marketplace/listing-detail";
import { buildSeoMetadata } from "@/lib/marketplace/seo";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await loadListingBySlug(slug);
  if (!listing) return { title: "Product Not Found | MetalHub" };

  return buildSeoMetadata({
    title: listing.seo_title || `${listing.title} | MetalHub`,
    description: listing.seo_description || listing.description || "Industrial product listing on MetalHub.",
    canonicalPath: `/products/${listing.slug}`,
  });
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const listing = await loadListingBySlug(slug);
  if (!listing) notFound();

  const company = await loadListingCompany(listing.company_id);

  return (
    <ListingPublicDetail
      listing={listing}
      company={company}
      backHref="/marketplace"
      backLabel="Marketplace"
    />
  );
}
