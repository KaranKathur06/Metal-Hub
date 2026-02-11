"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function HeroRoleSearchClient() {
  const router = useRouter()
  const [search, setSearch] = useState("")

  const encoded = useMemo(() => {
    const v = search.trim()
    return v.length > 0 ? encodeURIComponent(v) : ""
  }, [search])

  function go(target: "suppliers" | "buyers") {
    const qs = encoded ? `?search=${encoded}` : ""
    router.push(`/${target}${qs}`)
  }

  return (
    <div className="mx-auto mt-12 max-w-2xl">
      <div className="flex flex-col gap-3">
        <Input
          type="search"
          placeholder="Search products, capabilities, industries..."
          className="h-12 text-base"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button size="lg" onClick={() => go("suppliers")}>
            Find Supplier
          </Button>
          <Button size="lg" variant="outline" onClick={() => go("buyers")}>
            Find Buyer
          </Button>
        </div>
      </div>
    </div>
  )
}
