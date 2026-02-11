import Link from "next/link"
import { TrendingUp, Shield, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import HeroRoleSearchClient from "@/components/home/HeroRoleSearchClient"

// Mock data - replace with API calls
const featuredCategories = [
  { id: 1, name: "Steel", count: 1245, icon: "🔩" },
  { id: 2, name: "Iron", count: 892, icon: "⚙️" },
  { id: 3, name: "Aluminium", count: 654, icon: "🔧" },
  { id: 4, name: "Copper", count: 432, icon: "⚡" },
  { id: 5, name: "Brass", count: 321, icon: "🔨" },
  { id: 6, name: "Stainless Steel", count: 567, icon: "🛠️" },
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
      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            India&apos;s Dedicated Marketplace for
            <span className="text-primary"> Metal Buyers & Sellers</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Connect with verified suppliers and buyers. Trade steel, iron, aluminium, copper, and more with confidence.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/listings">
              <Button size="lg" className="w-full sm:w-auto">
                Browse Listings
              </Button>
            </Link>
            <Link href="/sell">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Post Your Metal Product
              </Button>
            </Link>
          </div>
        </div>

        <HeroRoleSearchClient />
      </section>

      {/* Featured Categories */}
      <section className="border-t bg-muted/50 py-12">
        <div className="container">
          <h2 className="mb-8 text-3xl font-bold">Browse by Metal Type</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {featuredCategories.map((category) => (
              <Link
                key={category.id}
                href={`/listings?metal=${metalSlugMap[category.name] || category.name.toLowerCase()}`}
                className="group"
              >
                <Card className="transition-all hover:shadow-lg">
                  <CardHeader className="text-center">
                    <div className="text-4xl mb-2">{category.icon}</div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription>{category.count} listings</CardDescription>
                  </CardHeader>
                </Card>
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
            <Link key={listing.id} href={`/listings/${listing.id}`}>
              <Card className="group transition-all hover:shadow-lg">
                <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    Image Placeholder
                  </div>
                  {listing.seller.premium && (
                    <Badge className="absolute right-2 top-2" variant="warning">
                      Premium
                    </Badge>
                  )}
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="line-clamp-2 text-lg">
                      {listing.title}
                    </CardTitle>
                  </div>
                  <CardDescription>
                    <Badge variant="secondary" className="mb-2">
                      {listing.metalType}
                    </Badge>
                    <div className="mt-2 text-base font-semibold text-foreground">
                      {formatCurrency(listing.price)} / MT
                    </div>
                    <div className="mt-1 text-sm">{listing.location}</div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {listing.seller.verified && (
                      <Badge variant="success" className="text-xs">
                        Verified Seller
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t bg-muted/50 py-12">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>1. Create Listing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Post your metal products with detailed specifications, pricing, and images.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>2. Connect with Buyers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Receive inquiries and negotiate directly with verified buyers on the platform.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>3. Secure Transaction</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Complete transactions with our secure payment system and verified seller protection.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Membership Preview */}
      <section className="container py-12">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Unlock More Opportunities</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Upgrade to premium membership for better visibility, priority support, and exclusive features.
          </p>
          <Link href="/pricing">
            <Button size="lg">View Membership Plans</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

