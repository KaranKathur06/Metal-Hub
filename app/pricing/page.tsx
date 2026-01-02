"use client"

import { Check } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "7-day trial",
    description: "Perfect for trying out the platform",
    features: [
      "Create up to 3 listings",
      "Basic seller profile",
      "Email support",
      "Standard listing visibility",
    ],
    recommended: false,
  },
  {
    id: "silver",
    name: "Silver",
    price: 999,
    period: "per month",
    description: "For growing businesses",
    features: [
      "Unlimited listings",
      "Verified seller badge",
      "Priority support",
      "Enhanced listing visibility",
      "Basic analytics",
      "Featured listing (1 per month)",
    ],
    recommended: true,
  },
  {
    id: "gold",
    name: "Gold",
    price: 2499,
    period: "per month",
    description: "For established sellers",
    features: [
      "Everything in Silver",
      "Premium seller badge",
      "24/7 priority support",
      "Maximum listing visibility",
      "Advanced analytics",
      "Unlimited featured listings",
      "Custom branding",
      "API access",
    ],
    recommended: false,
  },
]

export default function PricingPage() {
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold">Choose Your Plan</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Select the membership plan that best fits your business needs
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${plan.recommended ? "border-primary shadow-lg" : ""}`}
          >
            {plan.recommended && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary">Recommended</Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  {plan.price === 0 ? "Free" : `₹${plan.price.toLocaleString()}`}
                </span>
                {plan.price > 0 && (
                  <span className="text-muted-foreground"> / {plan.period}</span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`mt-8 w-full ${plan.recommended ? "" : "variant-outline"}`}
                variant={plan.recommended ? "default" : "outline"}
                size="lg"
              >
                {plan.price === 0 ? "Start Free Trial" : "Upgrade Now"}
              </Button>
              {plan.price > 0 && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Razorpay secure payment
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="mb-8 text-center text-3xl font-bold">Frequently Asked Questions</h2>
        <div className="mx-auto max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I change plans later?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected
                in your next billing cycle.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We accept all major credit cards, debit cards, UPI, and net banking through
                Razorpay.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Is there a setup fee?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                No, there are no setup fees. You only pay the monthly subscription fee.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

