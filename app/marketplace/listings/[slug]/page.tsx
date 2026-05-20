import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

/** Canonical product URLs live at /products/[slug] */
export default async function MarketplaceListingRedirect({ params }: Props) {
  const { slug } = await params;
  redirect(`/products/${slug}`);
}
