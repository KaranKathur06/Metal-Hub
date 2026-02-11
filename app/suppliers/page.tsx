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
    mode: "suppliers",
    searchParams,
    pathname: "/suppliers",
  })
}

export default function SuppliersPage() {
  return (
    <Suspense>
      <ListingsSearchClient mode="suppliers" />
    </Suspense>
  )
}
