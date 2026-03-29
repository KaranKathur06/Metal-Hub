import type { Metadata } from 'next';
import MarketplaceTabs from '@/components/marketplace/MarketplaceTabs';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Marketplace | Buyers and Suppliers | MetalHub',
  description:
    'Discover buyer inquiries and supplier listings in one unified B2B industrial marketplace with smart filters.',
};

export default function MarketplacePage() {
  return <MarketplaceTabs />;
}
