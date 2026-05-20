"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SellerTrustSection } from "@/components/dashboard/SellerTrustSection";
import { MessageInbox } from "@/components/marketplace/MessageInbox";
import { useAuth } from "@/components/auth/AuthProvider";
import { Plus, Edit, Eye, MessageSquare, Package, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";

type SellerListing = {
  id: string;
  title: string;
  slug: string;
  is_active: boolean | null;
  moderation_status: string | null;
  views_count: number | null;
  inquiry_count: number | null;
  price_min: number | null;
  created_at: string;
};

export default function SellerDashboardPage() {
  const { supabase, sellerProfile } = useAuth();
  const [listings, setListings] = useState<SellerListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase || !sellerProfile?.id) {
      setLoading(false);
      return;
    }

    void (async () => {
      const { data } = await supabase
        .from("listings")
        .select(
          "id, title, slug, is_active, moderation_status, views_count, inquiry_count, price_min, created_at",
        )
        .eq("seller_profile_id", sellerProfile.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(50);

      setListings(data ?? []);
      setLoading(false);
    })();
  }, [supabase, sellerProfile?.id]);

  const stats = useMemo(() => {
    const activeListings = listings.filter((item) => item.is_active).length;
    const totalViews = listings.reduce((sum, item) => sum + (item.views_count ?? 0), 0);
    const totalInquiries = listings.reduce((sum, item) => sum + (item.inquiry_count ?? 0), 0);

    return {
      totalListings: listings.length,
      activeListings,
      totalViews,
      totalInquiries,
    };
  }, [listings]);

  const membershipLabel =
    (sellerProfile?.trust_level ?? 0) >= 3 ? "gold" : (sellerProfile?.trust_level ?? 0) >= 1 ? "silver" : "starter";

  return (
    <div className="container py-8">
      <div className="mb-6">
        <SellerTrustSection hasListings={stats.totalListings > 0} />
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <Link href="/seller/rfqs">
          <Button variant="outline">Browse RFQs</Button>
        </Link>
        <Link href="/seller/quotes">
          <Button variant="outline">My Quotes</Button>
        </Link>
        <Link href="/onboarding/seller">
          <Button variant="outline">Improve Profile</Button>
        </Link>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Seller Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Manage your listings and track performance</p>
        </div>
        <Link href="/dashboard/seller/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Listing
          </Button>
        </Link>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalListings}</div>
            <p className="text-xs text-muted-foreground">{stats.activeListings} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across published listings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInquiries}</div>
            <p className="text-xs text-muted-foreground">Listing inquiry count</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trust tier</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={membershipLabel === "gold" ? "warning" : "secondary"}>
              {membershipLabel.charAt(0).toUpperCase() + membershipLabel.slice(1)}
            </Badge>
            {membershipLabel !== "gold" ? (
              <Link href="/onboarding/seller">
                <Button variant="link" className="mt-2 h-auto p-0 text-xs">
                  Improve trust →
                </Button>
              </Link>
            ) : null}
          </CardContent>
        </Card>
      </div>

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
              <CardDescription>Manage and track your product listings</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : listings.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No listings yet. Create your first product listing.
                </p>
              ) : (
                <div className="space-y-4">
                  {listings.map((listing) => {
                    const status = !listing.is_active
                      ? "inactive"
                      : listing.moderation_status === "approved"
                        ? "active"
                        : listing.moderation_status ?? "pending";

                    return (
                      <div
                        key={listing.id}
                        className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <Link
                              href={`/products/${listing.slug}`}
                              className="font-semibold hover:text-primary"
                            >
                              {listing.title}
                            </Link>
                            <Badge
                              variant={
                                status === "active"
                                  ? "success"
                                  : status === "pending"
                                    ? "warning"
                                    : "secondary"
                              }
                            >
                              {status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {listing.price_min != null ? (
                              <span>{formatCurrency(listing.price_min)}</span>
                            ) : null}
                            <span>{listing.views_count ?? 0} views</span>
                            <span>{listing.inquiry_count ?? 0} inquiries</span>
                            <span>
                              Posted {new Date(listing.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/products/${listing.slug}`}>
                            <Button variant="outline" size="icon" aria-label="View listing">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="outline" size="icon" disabled aria-label="Edit listing">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>Communicate with potential buyers</CardDescription>
            </CardHeader>
            <CardContent>
              <MessageInbox />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Offers</CardTitle>
              <CardDescription>Review offers from buyers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-12 text-center text-muted-foreground">
                <p>No offers yet</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Update your seller profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/onboarding/seller">
                <Button variant="outline">Open seller onboarding</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
