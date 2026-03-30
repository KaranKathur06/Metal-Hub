import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type Props = {
  params: {
    slug: string;
  };
};

/**
 * Capability detail pages now redirect to the marketplace with the
 * capability filter applied. This replaces the old static capability pages
 * to support the unified filter-based discovery flow.
 */
export default function CapabilityDetailPage({ params }: Props) {
  redirect(`/marketplace?type=suppliers&capability=${params.slug}`);
}
