import ListingsSearchClient from "@/components/search/ListingsSearchClient"
import { buildListingsMetadata } from "@/lib/seo"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

export const generateMetadata = ({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) => {
  return buildListingsMetadata({
    mode: "buyers",
    searchParams,
    pathname: "/buyers",
  })
}

export default function BuyersPage() {
  return (
    <Suspense>
      <ListingsSearchClient mode="buyers" />
    </Suspense>
  )
}
