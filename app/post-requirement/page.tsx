import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Post Requirement | Metal Hub",
  description: "Post your requirement to reach verified suppliers and buyers.",
}

export default function PostRequirementPage() {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold">Post Requirement</h1>
      <p className="mt-4 text-muted-foreground">
        Create a structured requirement and reach verified marketplace members.
      </p>

      <div className="mt-8">
        <Link href="/register">
          <Button>Get Started</Button>
        </Link>
      </div>
    </div>
  )
}
