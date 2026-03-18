import Link from "next/link"
import { TrendingUp, Shield, Users, ArrowRight, CheckCircle, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import HeroRoleSearchClient from "@/components/home/HeroRoleSearchClient"
import { cn } from "@/lib/utils"

import Image from "next/image"

// Mock data - replace with API calls
const featuredCategories = [
  { id: 1, name: "Steel", count: "1,245", image: "/steel.avif" },
  { id: 2, name: "Iron", count: "892", image: "/iron.jpg" },
  { id: 3, name: "Aluminium", count: "654", image: "/Aluminium.jpg" },
  { id: 4, name: "Copper", count: "432", image: "/Copper.jpg" },
  { id: 5, name: "Brass", count: "321", image: "/Brass.webp" },
  { id: 6, name: "Stainless Steel", count: "567", image: "/Stainless Steel.webp" },
]

const metalSlugMap: Record<string, string> = {
  Steel: "steel",
  Iron: "iron",
  Aluminium: "aluminium",
  Copper: "copper",
  Brass: "brass",
  "Stainless Steel": "stainless-steel",
}

const featuredListings = [
  {
    id: "1",
    title: "MS Steel Plates - Grade A",
    metalType: "Steel",
    price: 45000,
    location: "Mumbai, Maharashtra",
    image: "/placeholder-metal.jpg",
    seller: { verified: true, premium: true },
  },
  {
    id: "2",
    title: "Aluminium Ingots 99.7% Pure",
    metalType: "Aluminium",
    price: 185000,
    location: "Delhi, NCR",
    image: "/placeholder-metal.jpg",
    seller: { verified: true, premium: false },
  },
  {
    id: "3",
    title: "Copper Wire Scrap",
    metalType: "Copper",
    price: 650000,
    location: "Bangalore, Karnataka",
    image: "/placeholder-metal.jpg",
    seller: { verified: false, premium: false },
  },
  {
    id: "4",
    title: "Stainless Steel Sheets 304",
    metalType: "Stainless Steel",
    price: 125000,
    location: "Chennai, Tamil Nadu",
    image: "/placeholder-metal.jpg",
    seller: { verified: true, premium: true },
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section
        className="relative w-full flex items-center overflow-hidden border-b border-border/50"
        style={{ minHeight: "89vh" }}
      >
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero.webp')" }}
        />
        <div
          className="absolute inset-0 z-10"
          style={{
            background: "linear-gradient(to right, rgba(10,15,30,0.85) 35%, rgba(10,15,30,0.4))"
          }}
        />

        <div className="container relative z-20 mx-auto px-6 max-w-[1200px]">
          <div className="max-w-[620px] flex flex-col items-start text-left animate-in fade-in slide-in-from-bottom-6 duration-1000 zoom-in-95">

            {/* Tagline Badge */}
            <div className="mb-6 inline-flex items-center rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-sm font-semibold text-blue-200 backdrop-blur-md shrink-0">
              <span className="flex h-2 w-2 rounded-full bg-blue-400 mr-2 animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.8)]"></span>
              India&apos;s Smart Metal Marketplace
            </div>

            {/* Headline */}
            <h1 className="text-[52px] font-bold tracking-tight text-white leading-[1.2]">
              Connect with Verified <br className="hidden sm:block" />
              <span className="text-[#3b82f6]">Metal Buyers & Suppliers</span>
            </h1>

            {/* Subtext */}
            <p className="mt-[16px] text-[16px] text-[#cbd5e1] max-w-[520px] leading-relaxed">
              Source high-quality steel, aluminium, copper and more from trusted suppliers across India — fast, secure and transparent.
            </p>

            {/* Role Search Component */}
            <div className="w-full">
              <HeroRoleSearchClient />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 mt-10">
        <div className="container">
          <div className="flex flex-col items-center justify-center text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-3">Browse by Metal Type</h2>
            <p className="text-muted-foreground w-full max-w-2xl">
              Explore our comprehensive range of high-quality metals from verified suppliers across India.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4` lg:grid-cols-6 gap-6">
            {featuredCategories.map((category) => (
              <Link
                key={category.id}
                href={`/listings?metal=${metalSlugMap[category.name] || category.name.toLowerCase()}`}
                className="group block"
              >
                <div className="bg-white rounded-[16px] overflow-hidden border border-[#e5e7eb] transition-all duration-300 hover:-translate-y-[6px] hover:shadow-[0_15px_35px_rgba(0,0,0,0.08)] flex flex-col h-full">
                  {/* Top Image Strip */}
                  <div className="relative h-[170px] w-full bg-slate-200">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover opacity-140 mix-blend-multiply"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>

                    <p className="text-sm text-slate-500 font-medium mb-4">
                      {category.count} Listings
                    </p>

                    <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-primary">
                      Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="container py-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Featured Listings</h2>
          <Link href="/listings">
            <Button variant="outline">View All</Button>
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featuredListings.map((listing) => (
            <Link key={listing.id} href={`/listings/${listing.id}`} className="group relative rounded-2xl bg-card overflow-hidden border border-border/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] flex flex-col h-full bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">

              {/* Image Section */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted rounded-t-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10" />
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground transition-transform duration-500 ease-out group-hover:scale-105 bg-slate-200 dark:bg-slate-800">
                  Image Placeholder
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-20">
                  <Badge variant="secondary" className="bg-white/90 text-black hover:bg-white backdrop-blur-sm border-none shadow-sm font-semibold">
                    {listing.metalType}
                  </Badge>
                  <div className="flex flex-col gap-2 items-end">
                    {listing.seller.premium && (
                      <div className="px-2 py-1 rounded bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs font-bold shadow-md">
                        Premium
                      </div>
                    )}
                    {listing.seller.verified && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/90 text-white text-[10px] uppercase tracking-wider font-bold shadow-md backdrop-blur-sm flex-row">
                        <CheckCircle className="h-3 w-3" /> VERIFIED
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions (Hover) */}
                <div className="absolute inset-0 flex items-center justify-center gap-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-primary shadow-lg backdrop-blur-sm">
                    <ArrowRight className="h-4 w-4 transform -rotate-45" />
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="line-clamp-2 text-lg font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                  {listing.title}
                </h3>

                <div className="mt-auto pt-2">
                  <div className="text-xl font-bold text-foreground mb-3 flex items-baseline gap-1">
                    {formatCurrency(listing.price)}
                    <span className="text-sm font-medium text-muted-foreground">/ MT</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border/50">
                    <span className="flex items-center gap-1.5 truncate max-w-[150px]">
                      <MapPin className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                      <span className="truncate">{listing.location}</span>
                    </span>
                    <span className="text-xs font-semibold text-primary/80 group-hover:text-primary transition-colors cursor-pointer relative z-20">
                      View Details
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Your journey from requirement to delivery in three simple steps.</p>
          </div>

          <div className="relative grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-[45px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-primary/10 via-primary/50 to-primary/10 z-0">
              <div className="absolute top-0 left-0 h-full w-1/3 bg-primary animate-pulse blur-[2px]" />
            </div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 mb-6 rounded-2xl bg-white dark:bg-slate-800 shadow-[0_10px_30px_rgba(59,130,246,0.15)] flex items-center justify-center border border-border/50 group-hover:-translate-y-2 transition-transform duration-300">
                <TrendingUp className="h-10 w-10 text-primary" />
              </div>
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold mb-4 shadow-md">1</div>
              <h3 className="text-xl font-bold mb-2">Post Requirement</h3>
              <p className="text-muted-foreground">Share your specific metal needs, dimensions, and quantity parameters.</p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 mb-6 rounded-2xl bg-white dark:bg-slate-800 shadow-[0_10px_30px_rgba(59,130,246,0.15)] flex items-center justify-center border border-border/50 group-hover:-translate-y-2 transition-transform duration-300">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold mb-4 shadow-md">2</div>
              <h3 className="text-xl font-bold mb-2">Receive Quotes</h3>
              <p className="text-muted-foreground">Get competitive bids instantly from verified suppliers across India.</p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 mb-6 rounded-2xl bg-white dark:bg-slate-800 shadow-[0_10px_30px_rgba(59,130,246,0.15)] flex items-center justify-center border border-border/50 group-hover:-translate-y-2 transition-transform duration-300">
                <Shield className="h-10 w-10 text-primary" />
              </div>
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold mb-4 shadow-md">3</div>
              <h3 className="text-xl font-bold mb-2">Finalize Deal</h3>
              <p className="text-muted-foreground">Negotiate directly and secure your transaction via our protected platform.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

