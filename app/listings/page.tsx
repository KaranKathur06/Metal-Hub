"use client"

import { useState } from "react"
import Link from "next/link"
import { Grid, List, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"

type ViewMode = "grid" | "list"

// Mock data
const mockListings = [
  {
    id: "1",
    title: "MS Steel Plates - Grade A",
    metalType: "Steel",
    price: 45000,
    quantity: 50,
    unit: "MT",
    location: "Mumbai, Maharashtra",
    image: "/placeholder-metal.jpg",
    seller: { verified: true, premium: true },
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Aluminium Ingots 99.7% Pure",
    metalType: "Aluminium",
    price: 185000,
    quantity: 25,
    unit: "MT",
    location: "Delhi, NCR",
    image: "/placeholder-metal.jpg",
    seller: { verified: true, premium: false },
    createdAt: "2024-01-14",
  },
  {
    id: "3",
    title: "Copper Wire Scrap",
    metalType: "Copper",
    price: 650000,
    quantity: 10,
    unit: "MT",
    location: "Bangalore, Karnataka",
    image: "/placeholder-metal.jpg",
    seller: { verified: false, premium: false },
    createdAt: "2024-01-13",
  },
  {
    id: "4",
    title: "Stainless Steel Sheets 304",
    metalType: "Stainless Steel",
    price: 125000,
    quantity: 30,
    unit: "MT",
    location: "Chennai, Tamil Nadu",
    image: "/placeholder-metal.jpg",
    seller: { verified: true, premium: true },
    createdAt: "2024-01-12",
  },
  {
    id: "5",
    title: "Iron Rods TMT Grade",
    metalType: "Iron",
    price: 52000,
    quantity: 100,
    unit: "MT",
    location: "Kolkata, West Bengal",
    image: "/placeholder-metal.jpg",
    seller: { verified: true, premium: false },
    createdAt: "2024-01-11",
  },
  {
    id: "6",
    title: "Brass Sheets Commercial Grade",
    metalType: "Brass",
    price: 380000,
    quantity: 15,
    unit: "MT",
    location: "Pune, Maharashtra",
    image: "/placeholder-metal.jpg",
    seller: { verified: false, premium: false },
    createdAt: "2024-01-10",
  },
]

const metalTypes = ["All", "Steel", "Iron", "Aluminium", "Copper", "Brass", "Stainless Steel"]

export default function ListingsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    metalType: "All",
    minPrice: "",
    maxPrice: "",
    location: "",
    sortBy: "newest",
  })

  const filteredListings = mockListings.filter((listing) => {
    if (filters.metalType !== "All" && listing.metalType !== filters.metalType) {
      return false
    }
    if (filters.minPrice && listing.price < Number(filters.minPrice)) {
      return false
    }
    if (filters.maxPrice && listing.price > Number(filters.maxPrice)) {
      return false
    }
    if (filters.location && !listing.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false
    }
    return true
  })

  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (filters.sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "newest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Browse Metal Listings</h1>
        <p className="mt-2 text-muted-foreground">
          Find the perfect metal products for your business
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Filters Sidebar */}
        <aside className={`lg:w-64 ${showFilters ? "block" : "hidden lg:block"}`}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Filters</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Metal Type</label>
                <Select
                  value={filters.metalType}
                  onValueChange={(value) =>
                    setFilters({ ...filters, metalType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {metalTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Price Range</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) =>
                      setFilters({ ...filters, minPrice: e.target.value })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters({ ...filters, maxPrice: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  type="text"
                  placeholder="City, State"
                  value={filters.location}
                  onChange={(e) =>
                    setFilters({ ...filters, location: e.target.value })
                  }
                />
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  setFilters({
                    metalType: "All",
                    minPrice: "",
                    maxPrice: "",
                    location: "",
                    sortBy: "newest",
                  })
                }
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden"
                onClick={() => setShowFilters(true)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <p className="text-sm text-muted-foreground">
                {sortedListings.length} listings found
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Select
                value={filters.sortBy}
                onValueChange={(value) =>
                  setFilters({ ...filters, sortBy: value })
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Listings Grid/List */}
          {viewMode === "grid" ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedListings.map((listing) => (
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
                      <CardTitle className="line-clamp-2 text-lg">
                        {listing.title}
                      </CardTitle>
                      <CardDescription>
                        <Badge variant="secondary" className="mb-2">
                          {listing.metalType}
                        </Badge>
                        <div className="mt-2 text-base font-semibold text-foreground">
                          {formatCurrency(listing.price)} / {listing.unit}
                        </div>
                        <div className="mt-1 text-sm">
                          Qty: {listing.quantity} {listing.unit}
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
          ) : (
            <div className="space-y-4">
              {sortedListings.map((listing) => (
                <Link key={listing.id} href={`/listings/${listing.id}`}>
                  <Card className="group transition-all hover:shadow-lg">
                    <div className="flex flex-col gap-4 p-6 sm:flex-row">
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted sm:w-48">
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          Image
                        </div>
                        {listing.seller.premium && (
                          <Badge className="absolute right-2 top-2" variant="warning">
                            Premium
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="mb-2 flex items-start justify-between">
                          <CardTitle className="text-xl">{listing.title}</CardTitle>
                          <div className="text-right">
                            <div className="text-lg font-semibold">
                              {formatCurrency(listing.price)} / {listing.unit}
                            </div>
                          </div>
                        </div>
                        <div className="mb-2 flex flex-wrap gap-2">
                          <Badge variant="secondary">{listing.metalType}</Badge>
                          {listing.seller.verified && (
                            <Badge variant="success">Verified Seller</Badge>
                          )}
                        </div>
                        <CardDescription className="mt-2">
                          <div>Quantity: {listing.quantity} {listing.unit}</div>
                          <div>{listing.location}</div>
                        </CardDescription>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-8 flex justify-center">
            <div className="flex gap-2">
              <Button variant="outline" disabled>
                Previous
              </Button>
              <Button variant="default">1</Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
              <Button variant="outline">Next</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

