"use client"

import { Heart, MessageSquare, Eye, Package } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"

// Mock data
const savedListings = [
  {
    id: "1",
    title: "MS Steel Plates - Grade A",
    metalType: "Steel",
    price: 45000,
    location: "Mumbai, Maharashtra",
    savedAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Aluminium Ingots 99.7% Pure",
    metalType: "Aluminium",
    price: 185000,
    location: "Delhi, NCR",
    savedAt: "2024-01-14",
  },
]

const recentViews = [
  {
    id: "3",
    title: "Copper Wire Scrap",
    metalType: "Copper",
    price: 650000,
    location: "Bangalore, Karnataka",
    viewedAt: "2024-01-13",
  },
]

export default function BuyerDashboardPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Buyer Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your saved listings and inquiries
        </p>
      </div>

      {/* Quick Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Listings</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{savedListings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recently Viewed</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentViews.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="saved" className="space-y-4">
        <TabsList>
          <TabsTrigger value="saved">Saved Listings</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="recent">Recently Viewed</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Listings</CardTitle>
              <CardDescription>
                Your favorite metal products
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savedListings.length > 0 ? (
                <div className="space-y-4">
                  {savedListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex-1">
                        <Link
                          href={`/listings/${listing.id}`}
                          className="font-semibold hover:text-primary"
                        >
                          {listing.title}
                        </Link>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="secondary">{listing.metalType}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(listing.price)} / MT
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {listing.location}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/listings/${listing.id}`}>
                          <Button variant="outline">View</Button>
                        </Link>
                        <Button variant="outline" size="icon">
                          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Heart className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No saved listings yet</p>
                  <Link href="/listings">
                    <Button variant="outline" className="mt-4">
                      Browse Listings
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>
                Your conversations with sellers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No messages yet</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recently Viewed</CardTitle>
              <CardDescription>
                Products you&apos;ve recently checked out
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentViews.length > 0 ? (
                <div className="space-y-4">
                  {recentViews.map((listing) => (
                    <Link
                      key={listing.id}
                      href={`/listings/${listing.id}`}
                      className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted"
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded bg-muted">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{listing.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(listing.price)} • {listing.location}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Eye className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No recent views</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Profile settings form coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

