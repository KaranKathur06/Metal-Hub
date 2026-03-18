"use client"

import { useState } from "react"
import { Check, ShieldCheck, CreditCard, Ban } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    priceYearly: 0,
    period: "Forever",
    description: "Perfect for trying out the platform",
    features: [
      "Create up to 3 listings",
      "Basic seller profile",
      "Email support",
      "Standard listing visibility",
    ],
    recommended: false,
    cta: "Start Free",
    href: "/register"
  },
  {
    id: "silver",
    name: "Silver",
    price: 999,
    priceYearly: 799,
    period: "per month",
    description: "For growing metal businesses",
    features: [
      "Unlimited listings",
      "Verified seller badge",
      "Priority lead access",
      "Enhanced listing visibility",
      "Basic analytics",
    ],
    recommended: true,
    cta: "Upgrade Now",
    href: "/register?plan=silver"
  },
  {
    id: "gold",
    name: "Gold",
    price: 2499,
    priceYearly: 1999,
    period: "per month",
    description: "For established enterprise sellers",
    features: [
      "Everything in Silver",
      "Premium seller badge",
      "24/7 dedicated support",
      "Maximum listing visibility",
      "API & ERP integrations",
    ],
    recommended: false,
    cta: "Contact Sales",
    href: "/contact"
  },
]

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-24">
      {/* HERO SECTION */}
      <div className="pt-24 pb-16 text-center px-4">
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
          Choose the right plan to grow your metal business
        </p>

        {/* Pricing Toggle */}
        <div className="flex items-center justify-center gap-3">
          <span className={cn("text-sm font-semibold", !isYearly ? "text-slate-900" : "text-slate-500")}>Monthly</span>
          <button 
            type="button" 
            onClick={() => setIsYearly(!isYearly)}
            className="w-14 h-8 rounded-full bg-slate-200 flex items-center p-1 transition-colors duration-300"
            style={{ backgroundColor: isYearly ? '#3b82f6' : '#cbd5e1' }}
          >
            <div 
              className={cn("w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300")}
              style={{ transform: isYearly ? 'translateX(24px)' : 'translateX(0)' }}
            />
          </button>
          <span className={cn("text-sm font-semibold flex items-center gap-1", isYearly ? "text-slate-900" : "text-slate-500")}>
            Yearly <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 ml-1">Save 20%</Badge>
          </span>
        </div>
      </div>

      {/* PRICING CARDS */}
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative bg-white rounded-2xl p-8 transition-all duration-300 flex flex-col h-full",
                plan.recommended 
                  ? "border-2 border-[#3b82f6] shadow-[0_20px_40px_rgba(59,130,246,0.15)] scale-100 md:scale-105 z-10" 
                  : "border border-slate-200 shadow-sm hover:shadow-md"
              )}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-blue-400 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-sm">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-slate-500 text-sm">{plan.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">
                    {plan.price === 0 ? "Free" : `₹${isYearly ? plan.priceYearly.toLocaleString() : plan.price.toLocaleString()}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-slate-500 font-medium">/{isYearly ? "mo, billed yearly" : "mo"}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 shrink-0 text-blue-500" />
                    <span className="text-slate-700 text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href={plan.href} className="w-full mt-auto">
                <Button
                  className={cn(
                    "w-full h-12 text-base font-bold transition-all",
                    plan.recommended
                      ? "bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white hover:shadow-[0_10px_20px_rgba(59,130,246,0.25)] hover:-translate-y-0.5"
                      : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                  )}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* TRUST ROW */}
        <div className="max-w-3xl mx-auto mt-16 pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-12 text-slate-600 font-medium">
          <div className="flex items-center gap-2"><Ban className="w-5 h-5 text-emerald-500" /> No setup fees</div>
          <div className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-500" /> Cancel anytime</div>
          <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-500" /> Secure payments (Razorpay)</div>
        </div>
      </div>

      {/* COMPARISON TABLE */}
      <div className="container px-4 md:px-6 mx-auto max-w-4xl mt-24">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Compare Plans in Detail</h2>
        
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 md:p-6 font-semibold text-slate-900 w-1/4">Feature</th>
                  <th className="p-4 md:p-6 font-semibold text-slate-900 w-1/4 text-center">Free</th>
                  <th className="p-4 md:p-6 font-bold text-blue-600 w-1/4 text-center bg-blue-50/50">Silver</th>
                  <th className="p-4 md:p-6 font-semibold text-slate-900 w-1/4 text-center">Gold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 md:p-6 text-sm font-medium text-slate-700">Listings</td>
                  <td className="p-4 md:p-6 text-sm text-center text-slate-600">3</td>
                  <td className="p-4 md:p-6 text-sm text-center font-bold text-slate-900 bg-blue-50/10">∞</td>
                  <td className="p-4 md:p-6 text-sm text-center text-slate-600">∞</td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 md:p-6 text-sm font-medium text-slate-700">Visibility</td>
                  <td className="p-4 md:p-6 text-sm text-center text-slate-600">Low</td>
                  <td className="p-4 md:p-6 text-sm text-center font-bold text-slate-900 bg-blue-50/10">High</td>
                  <td className="p-4 md:p-6 text-sm text-center text-slate-600">Max</td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 md:p-6 text-sm font-medium text-slate-700">Support</td>
                  <td className="p-4 md:p-6 text-sm text-center text-slate-600">Basic</td>
                  <td className="p-4 md:p-6 text-sm text-center font-bold text-slate-900 bg-blue-50/10">Priority</td>
                  <td className="p-4 md:p-6 text-sm text-center text-slate-600">24/7</td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 md:p-6 text-sm font-medium text-slate-700">Analytics</td>
                  <td className="p-4 md:p-6 text-sm text-center text-slate-600"><Ban className="w-4 h-4 mx-auto text-slate-300" /></td>
                  <td className="p-4 md:p-6 text-sm text-center font-bold text-slate-900 bg-blue-50/10">Basic</td>
                  <td className="p-4 md:p-6 text-sm text-center text-slate-600">Advanced</td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 md:p-6 text-sm font-medium text-slate-700">API Access</td>
                  <td className="p-4 md:p-6 text-sm text-center text-slate-600"><Ban className="w-4 h-4 mx-auto text-slate-300" /></td>
                  <td className="p-4 md:p-6 text-sm text-center text-slate-600 bg-blue-50/10"><Ban className="w-4 h-4 mx-auto text-slate-300" /></td>
                  <td className="p-4 md:p-6 text-sm text-center text-slate-600"><Check className="w-4 h-4 mx-auto text-emerald-500" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
