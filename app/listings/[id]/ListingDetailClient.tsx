"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { MapPin, User, MessageCircle, Heart, Share2, CheckCircle, Award, Zap, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency, formatDate } from "@/lib/utils"

type ListingDetailClientProps = {
  id: string
}

export default function ListingDetailClient({ id }: ListingDetailClientProps) {
  const [saved, setSaved] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  const listing = useMemo(
    () => ({
      id,
      title: "MS Steel Plates - Grade A",
      description: `High-quality MS Steel Plates Grade A, suitable for construction and manufacturing purposes. 

These plates are manufactured using premium raw materials and undergo strict quality control measures. Perfect for structural applications, fabrication, and industrial use.

Key Features:
- Grade A quality assurance
- Available in various thicknesses
- Competitive pricing
- Bulk quantity available
- Fast delivery across India`,
      metalType: "Steel",
      price: 45000,
      quantity: 50,
      unit: "MT",
      location: "Mumbai, Maharashtra",
      images: ["/placeholder-metal.jpg", "/placeholder-metal.jpg", "/placeholder-metal.jpg"],
      seller: {
        id: "seller-1",
        name: "Metal Industries Ltd.",
        verified: true,
        premium: true,
        rating: 4.8,
        totalListings: 45,
        joinedDate: "2020-01-15",
      },
      createdAt: "2024-01-15",
      views: 1245,
      inquiries: 23,
      specifications: {
        grade: "Grade A",
        thickness: "5mm - 50mm",
        width: "1000mm - 2000mm",
        length: "2000mm - 6000mm",
        standard: "IS 2062",
        finish: "Hot Rolled",
      },
      trustMetrics: {
        responseTime: "< 2 hours",
        successfulDeals: "200+",
      }
    }),
    [id]
  )

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link href="/listings" className="text-primary hover:underline">
          ← Back to Listings
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-0 border-b border-border/50">
              <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted group cursor-zoom-in">
                <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-110 flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900 text-muted-foreground">
                  View Full Image {selectedImage + 1}
                </div>
                {/* Gradient overlay on hover to hint interactivity */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
              <div className="flex gap-2 p-4 bg-background/50 rounded-b-lg overflow-x-auto">
                {listing.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-video w-24 shrink-0 overflow-hidden rounded-md border-2 transition-all duration-200 ${
                      selectedImage === index
                        ? "border-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                        : "border-transparent opacity-70 hover:opacity-100 hover:border-primary/50"
                    }`}
                  >
                    <div className="flex h-full items-center justify-center bg-muted text-xs font-medium text-muted-foreground">
                      Img {index + 1}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="secondary">{listing.metalType}</Badge>
                    {listing.seller.premium && (
                      <Badge variant="warning">Premium Listing</Badge>
                    )}
                  </div>
                  <CardTitle className="text-3xl">{listing.title}</CardTitle>
                  <CardDescription className="mt-2 flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {listing.location}
                    </span>
                    <span>Posted {formatDate(listing.createdAt)}</span>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSaved(!saved)}
                  >
                    <Heart className={`h-4 w-4 ${saved ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-baseline gap-4">
                <div className="text-4xl font-bold">{formatCurrency(listing.price)}</div>
                <div className="text-muted-foreground">per {listing.unit}</div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Available Quantity:{" "}
                <span className="font-semibold text-foreground">
                  {listing.quantity} {listing.unit}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="description">
                <TabsList>
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="specifications">Specifications</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="mt-4">
                  <p className="whitespace-pre-line text-muted-foreground">{listing.description}</p>
                </TabsContent>
                <TabsContent value="specifications" className="mt-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <tbody className="divide-y">
                        {Object.entries(listing.specifications).map(([key, value]) => (
                          <tr key={key}>
                            <td className="py-2 pr-8 font-medium capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}:
                            </td>
                            <td className="py-2 text-muted-foreground">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seller Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{listing.seller.name}</h3>
                    {listing.seller.verified && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium bg-secondary/30 px-2 py-1 rounded-md">
                       <Award className="h-4 w-4 text-metal-gold" /> ⭐ {listing.seller.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-success" />
                      {listing.trustMetrics.successfulDeals} successful deals
                    </span>
                    <span className="flex items-center gap-1 text-primary">
                       <Zap className="h-4 w-4" />
                       Response: {listing.trustMetrics.responseTime}
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/50">
                     <Link href={`/seller/${listing.seller.id}`}>
                       <Button variant="outline" className="w-full sm:w-auto">
                         View Full Profile
                       </Button>
                     </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky lg:top-20 lg:h-fit">
          <Card className="sticky top-20 border-primary/20 shadow-lg shadow-primary/5">
            <CardHeader className="bg-primary/5 text-center rounded-t-lg">
              <CardTitle className="text-xl">Interested in this Deal?</CardTitle>
              <CardDescription>Connect with the seller for immediate response</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <Button className="w-full text-base py-6 bg-gradient-to-r from-primary to-metal-blue-light hover:shadow-glow transition-all" size="lg">
                <MessageCircle className="mr-2 h-5 w-5" />
                Contact Seller
              </Button>
              <Button variant="outline" className="w-full text-base py-6 border-primary/50 hover:bg-primary/10 transition-colors" size="lg">
                Request Quote
              </Button>
              <div className="pt-6 pb-2 border-b border-border/50 flex items-center justify-around text-center text-sm text-muted-foreground">
                <div>
                  <div className="font-semibold text-foreground text-lg">{listing.views}</div>
                  <div>views</div>
                </div>
                <div>
                  <div className="font-semibold text-foreground text-lg">{listing.inquiries}</div>
                  <div>inquiries</div>
                </div>
              </div>
              <div className="pt-4 flex items-center justify-center gap-2 text-sm font-medium text-success">
                 <Shield className="h-4 w-4" />
                 Verified & Secure
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4 bg-muted/30 border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                 <Shield className="h-4 w-4" />
                 Safety Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="space-y-3">
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5" /> Verify seller credentials before payment</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5" /> Use secure payment methods via MetalHub</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5" /> Inspect products before finalizing</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
