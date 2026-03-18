import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Industries | Metal Hub",
  description: "Industries we serve with structured discovery and verified marketplace profiles.",
}

const Industries = [
  { title: "Automotive OEM", slug: "automotive-oem" },
  { title: "Aerospace & Defense", slug: "aerospace-defense" },
  { title: "Electronics Manufacturing", slug: "electronics-manufacturing" },
  { title: "Robotics & Automation", slug: "robotics-automation" },
  { title: "Oil & Gas", slug: "oil-gas" },
  { title: "Renewable Energy", slug: "renewable-energy" },
  { title: "Marine & Shipbuilding", slug: "marine-shipbuilding" },
  { title: "Medical Devices", slug: "medical-devices" },
] as const

export default function IndustriesPage() {
  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Industries</h1>
        <p className="mt-2 text-muted-foreground">Industries We Serve</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Industries.map((s) => (
          <Link key={s.slug} href={`/listings?industry=${s.slug}`}>
            <Card className="transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-base">{s.title}</CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
