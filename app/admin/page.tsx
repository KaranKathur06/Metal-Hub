"use client"

import { Users, Package, Flag, Shield, TrendingUp, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

// Mock data
const mockStats = {
  totalUsers: 1245,
  totalListings: 3456,
  pendingApprovals: 23,
  flaggedItems: 8,
  activeMemberships: {
    free: 890,
    silver: 280,
    gold: 75,
  },
}

const pendingListings = [
  {
    id: "1",
    title: "MS Steel Plates - Grade A",
    seller: "Metal Industries Ltd.",
    submittedAt: "2024-01-15",
    status: "pending",
  },
  {
    id: "2",
    title: "Aluminium Ingots",
    seller: "ABC Metals",
    submittedAt: "2024-01-14",
    status: "pending",
  },
]

const flaggedItems = [
  {
    id: "1",
    type: "listing",
    title: "Suspicious Listing",
    reason: "Potential scam",
    reportedBy: "User123",
    reportedAt: "2024-01-15",
  },
]

export default function AdminDashboardPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Platform management and oversight
        </p>
      </div>

      {/* Stats Overview */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="mr-1 inline h-3 w-3" />
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalListings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {mockStats.pendingApprovals} pending approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Requires review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Items</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.flaggedItems}</div>
            <p className="text-xs text-muted-foreground">
              Needs attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Membership Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Membership Distribution</CardTitle>
          <CardDescription>Active membership breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-2xl font-bold">{mockStats.activeMemberships.free}</div>
              <div className="text-sm text-muted-foreground">Free Members</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{mockStats.activeMemberships.silver}</div>
              <div className="text-sm text-muted-foreground">Silver Members</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{mockStats.activeMemberships.gold}</div>
              <div className="text-sm text-muted-foreground">Gold Members</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="approvals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="approvals">Approval Queue</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="flags">Flagged Items</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Listing Approval Queue</CardTitle>
              <CardDescription>
                Review and approve pending listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="font-semibold">{listing.title}</h3>
                        <Badge variant="warning">Pending</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div>Seller: {listing.seller}</div>
                        <div>Submitted: {new Date(listing.submittedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="default" size="sm">
                        Approve
                      </Button>
                      <Button variant="destructive" size="sm">
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage platform users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input placeholder="Search users..." />
              </div>
              <div className="text-center py-12 text-muted-foreground">
                <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>User management table coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flags" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flagged Items</CardTitle>
              <CardDescription>
                Review reported content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {flaggedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                        <h3 className="font-semibold">{item.title}</h3>
                        <Badge variant="destructive">{item.type}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div>Reason: {item.reason}</div>
                        <div>Reported by: {item.reportedBy}</div>
                        <div>Reported: {new Date(item.reportedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Review
                      </Button>
                      <Button variant="destructive" size="sm">
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Reports</CardTitle>
              <CardDescription>
                Analytics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Reports dashboard coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>
                Platform activity logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <p>System logs viewer coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

