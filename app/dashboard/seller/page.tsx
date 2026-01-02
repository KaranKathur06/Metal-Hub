"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Edit, Trash2, Eye, MessageSquare, TrendingUp, Package, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"

// Mock data
const mockStats = {
  totalListings: 12,
  activeListings: 8,
  totalViews: 3456,
  totalInquiries: 89,
  membership: "silver" as const,
}

const mockListings = [
  {
    id: "1",
    title: "MS Steel Plates - Grade A",
    status: "active",
    views: 245,
    inquiries: 12,
    price: 45000,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Aluminium Ingots 99.7% Pure",
    status: "active",
    views: 189,
    inquiries: 8,
    price: 185000,
    createdAt: "2024-01-14",
  },
  {
    id: "3",
    title: "Copper Wire Scrap",
    status: "pending",
    views: 0,
    inquiries: 0,
    price: 650000,
    createdAt: "2024-01-13",
  },
]

export default function SellerDashboardPage() {
  const [listings] = useState(mockListings)

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Seller Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your listings and track performance
          </p>
        </div>
        <Link href="/dashboard/seller/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Listing
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalListings}</div>
            <p className="text-xs text-muted-foreground">
              {mockStats.activeListings} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="mr-1 inline h-3 w-3" />
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalInquiries}</div>
            <p className="text-xs text-muted-foreground">
              Across all listings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membership</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={mockStats.membership === "gold" ? "warning" : "secondary"}>
              {mockStats.membership.charAt(0).toUpperCase() + mockStats.membership.slice(1)}
            </Badge>
            {mockStats.membership !== "gold" && (
              <Link href="/pricing">
                <Button variant="link" className="mt-2 h-auto p-0 text-xs">
                  Upgrade →
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="listings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Listings</CardTitle>
              <CardDescription>
                Manage and track your product listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Link
                          href={`/listings/${listing.id}`}
                          className="font-semibold hover:text-primary"
                        >
                          {listing.title}
                        </Link>
                        <Badge
                          variant={
                            listing.status === "active"
                              ? "success"
                              : listing.status === "pending"
                              ? "warning"
                              : "secondary"
                          }
                        >
                          {listing.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>{formatCurrency(listing.price)}</span>
                        <span>{listing.views} views</span>
                        <span>{listing.inquiries} inquiries</span>
                        <span>Posted {new Date(listing.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/listings/${listing.id}`}>
                        <Button variant="outline" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>
                Communicate with potential buyers
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

        <TabsContent value="offers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Offers</CardTitle>
              <CardDescription>
                Review offers from buyers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <p>No offers yet</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Update your seller profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Settings form coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

