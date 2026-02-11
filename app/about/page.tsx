import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Company | Metal Hub",
  description: "Learn about Metal Hub and our mission to connect industrial buyers and suppliers.",
}

export default function AboutPage() {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold">About Company</h1>
      <p className="mt-4 text-muted-foreground">
        Metal Hub connects verified buyers and suppliers with structured discovery and premium B2B workflows.
      </p>
    </div>
  )
}
