import Link from 'next/link';
import { ArrowRight, CheckCircle, MapPin, Shield, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import HeroCarousel from '@/components/home/HeroCarousel';
import CapabilitiesGrid from '@/components/home/CapabilitiesGrid';
import { getCapabilities, getHeroBanners } from '@/lib/server/content';

export const dynamic = 'force-dynamic';

const featuredListings = [
  {
    id: '1',
    title: 'MS Steel Plates - Grade A',
    metalType: 'Steel',
    price: 45000,
    location: 'Mumbai, Maharashtra',
    seller: { verified: true, premium: true },
  },
  {
    id: '2',
    title: 'Aluminium Ingots 99.7% Pure',
    metalType: 'Aluminium',
    price: 185000,
    location: 'Delhi, NCR',
    seller: { verified: true, premium: false },
  },
  {
    id: '3',
    title: 'Copper Wire Scrap',
    metalType: 'Copper',
    price: 650000,
    location: 'Bangalore, Karnataka',
    seller: { verified: false, premium: false },
  },
  {
    id: '4',
    title: 'Stainless Steel Sheets 304',
    metalType: 'Stainless Steel',
    price: 125000,
    location: 'Chennai, Tamil Nadu',
    seller: { verified: true, premium: true },
  },
];

export default async function HomePage() {
  const [banners, capabilities] = await Promise.all([getHeroBanners(), getCapabilities()]);

  return (
    <div className="flex flex-col">
      <HeroCarousel slides={banners} />

      <CapabilitiesGrid capabilities={capabilities} />

      <section className="container py-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Featured Listings</h2>
          <Link href="/marketplace">
            <Button variant="outline">View Marketplace</Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featuredListings.map((listing) => (
            <Link
              key={listing.id}
              href={`/marketplace?type=suppliers&search=${encodeURIComponent(listing.title)}` }
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-white to-slate-50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)]"
            >
              <div className="relative aspect-[4/3] w-full bg-slate-200">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                <div className="absolute left-3 right-3 top-3 flex items-start justify-between">
                  <Badge variant="secondary" className="bg-white/90 text-black backdrop-blur-sm">
                    {listing.metalType}
                  </Badge>
                  <div className="flex flex-col items-end gap-2">
                    {listing.seller.premium ? (
                      <div className="rounded bg-gradient-to-r from-yellow-500 to-amber-500 px-2 py-1 text-xs font-bold text-white">
                        Premium
                      </div>
                    ) : null}
                    {listing.seller.verified ? (
                      <div className="flex items-center gap-1 rounded bg-emerald-500/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                        <CheckCircle className="h-3 w-3" /> VERIFIED
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="mb-2 line-clamp-2 text-lg font-bold group-hover:text-primary">{listing.title}</h3>

                <div className="mt-auto pt-2">
                  <div className="mb-3 flex items-baseline gap-1 text-xl font-bold text-foreground">
                    {formatCurrency(listing.price)}
                    <span className="text-sm font-medium text-muted-foreground">/ MT</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/50 pt-4 text-sm text-muted-foreground">
                    <span className="flex max-w-[150px] items-center gap-1.5 truncate">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="truncate">{listing.location}</span>
                    </span>
                    <span className="text-xs font-semibold text-primary">View Details</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-24">
        <div className="container">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">How MetalHub Works</h2>
            <p className="text-lg text-muted-foreground">
              Launch sourcing and sales flows in one unified marketplace built for B2B industrial trade.
            </p>
          </div>

          <div className="relative mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-border/50 bg-white shadow-[0_10px_30px_rgba(59,130,246,0.15)]">
                <TrendingUp className="h-10 w-10 text-primary" />
              </div>
              <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-white">1</div>
              <h3 className="mb-2 text-xl font-bold">Post Requirement</h3>
              <p className="text-muted-foreground">Buyers post clear requirements with budget, quantity, and location.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-border/50 bg-white shadow-[0_10px_30px_rgba(59,130,246,0.15)]">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-white">2</div>
              <h3 className="mb-2 text-xl font-bold">Discover Verified Suppliers</h3>
              <p className="text-muted-foreground">Search by capability, compare suppliers, and shortlist verified partners.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-border/50 bg-white shadow-[0_10px_30px_rgba(59,130,246,0.15)]">
                <Shield className="h-10 w-10 text-primary" />
              </div>
              <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-white">3</div>
              <h3 className="mb-2 text-xl font-bold">Close Deals Faster</h3>
              <p className="text-muted-foreground">Engage instantly with trusted profiles and streamline industrial procurement.</p>
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <Link href="/marketplace">
              <Button className="h-11 rounded-xl bg-slate-900 px-6 text-white hover:bg-slate-800">
                Open Unified Marketplace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

