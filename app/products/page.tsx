import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Products | Metal Hub",
  description: "Metals we handle with structured filters and verified marketplace listings.",
}

const products = [
  { title: "Steel", slug: "steel" },
  { title: "Iron", slug: "iron" },
  { title: "Aluminium", slug: "aluminium" },
  { title: "Copper", slug: "copper" },
  { title: "Brass", slug: "brass" },
  { title: "Stainless Steel", slug: "stainless-steel" },
] as const

export default function ProductsPage() {
  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Products</h1>
        <p className="mt-2 text-muted-foreground">Metals We Handle</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <Link key={p.slug} href={`/listings?metal=${p.slug}`}>
            <Card className="transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-base">{p.title}</CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
