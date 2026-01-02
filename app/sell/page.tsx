import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

export default function SellPage() {
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold">Sell Your Metal Products</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Reach thousands of buyers and grow your metal business
        </p>
        <div className="mt-8">
          <Link href="/register">
            <Button size="lg">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Easy Listing</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Create professional listings in minutes with our step-by-step wizard.
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reach More Buyers</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Connect with verified buyers across India and expand your customer base.
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Secure Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Built-in messaging and secure payment options for safe trading.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

