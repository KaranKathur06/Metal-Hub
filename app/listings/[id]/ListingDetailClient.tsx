"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { MapPin, User, MessageCircle, Heart, Share2, CheckCircle } from "lucide-react"
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
            <CardContent className="p-0">
              <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Image {selectedImage + 1} Placeholder
                </div>
              </div>
              <div className="flex gap-2 p-4">
                {listing.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-video w-20 overflow-hidden rounded border-2 transition-all ${
                      selectedImage === index
                        ? "border-primary"
                        : "border-transparent hover:border-muted-foreground"
                    }`}
                  >
                    <div className="flex h-full items-center justify-center bg-muted text-xs text-muted-foreground">
                      {index + 1}
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
                  <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>⭐ {listing.seller.rating}</span>
                    <span>{listing.seller.totalListings} Listings</span>
                    <span>Member since {formatDate(listing.seller.joinedDate)}</span>
                  </div>
                  <Link href={`/seller/${listing.seller.id}`}>
                    <Button variant="outline" className="mt-4">
                      View Seller Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky lg:top-20 lg:h-fit">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Interested?</CardTitle>
              <CardDescription>Connect with the seller to discuss details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" size="lg">
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat with Seller
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                Make an Offer
              </Button>
              <div className="pt-4 text-center text-sm text-muted-foreground">
                <p>{listing.views} views</p>
                <p>{listing.inquiries} inquiries</p>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Safety Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="space-y-2">
                <li>• Verify seller credentials before payment</li>
                <li>• Use secure payment methods</li>
                <li>• Inspect products before finalizing</li>
                <li>• Report suspicious listings</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
