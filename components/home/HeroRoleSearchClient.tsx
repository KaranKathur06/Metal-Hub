"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function HeroRoleSearchClient() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [role, setRole] = useState<"suppliers" | "buyers">("suppliers")

  const encoded = useMemo(() => {
    const v = search.trim()
    return v.length > 0 ? encodeURIComponent(v) : ""
  }, [search])

  function go(target: "suppliers" | "buyers") {
    const qs = encoded ? `?search=${encoded}` : ""
    router.push(`/${target}${qs}`)
  }

  return (
    <div className="mx-auto w-full max-w-[720px]">
      <div className="flex flex-col gap-4">
        <div className="mx-auto inline-flex w-full max-w-[420px] items-center rounded-md border bg-white p-1">
          <button
            type="button"
            onClick={() => setRole("suppliers")}
            className={
              role === "suppliers"
                ? "flex-1 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                : "flex-1 rounded-md px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            }
          >
            Find Suppliers
          </button>
          <button
            type="button"
            onClick={() => setRole("buyers")}
            className={
              role === "buyers"
                ? "flex-1 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                : "flex-1 rounded-md px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            }
          >
            Find Buyers
          </button>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <Input
            type="search"
            placeholder="Search products, capabilities, industries..."
            className="h-12 flex-1 rounded-md border-slate-200 text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") go(role)
            }}
          />
          <Button
            size="lg"
            className="h-12 rounded-md bg-slate-900 px-7 text-white hover:bg-slate-800"
            onClick={() => go(role)}
          >
            Search
          </Button>
        </div>
      </div>
    </div>
  )
}
