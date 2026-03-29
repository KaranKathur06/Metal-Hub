"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
    <div className="mt-[28px] flex flex-col gap-[14px] w-full">
      {/* Toggle */}
      <div className="flex w-fit bg-[#0f172a]/40 backdrop-blur-md rounded-[12px] p-1 border border-white/10 shadow-lg">
        <button
          type="button"
          onClick={() => setRole("suppliers")}
          className={
            role === "suppliers"
              ? "rounded-[10px] bg-white text-slate-900 px-5 py-2 text-sm font-bold shadow-sm"
              : "rounded-[10px] px-5 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          }
        >
          Find Suppliers
        </button>
        <button
          type="button"
          onClick={() => setRole("buyers")}
          className={
            role === "buyers"
              ? "rounded-[10px] bg-white text-slate-900 px-5 py-2 text-sm font-bold shadow-sm"
              : "rounded-[10px] px-5 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          }
        >
          Find Buyers
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-[10px] w-full">
        <Input
          type="search"
          placeholder="Search products, capabilities, industries..."
          className="h-[48px] flex-1 rounded-[12px] border-none bg-white text-slate-900 text-[15px] px-4 shadow-[0_10px_30px_rgba(0,0,0,0.1)] focus-visible:ring-2 focus-visible:ring-[#3b82f6]/50 placeholder:text-slate-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") go(role)
          }}
        />
        <Button
          className="h-[48px] rounded-[12px] bg-[#0f172a] px-6 text-white font-bold hover:bg-black shadow-lg transition-all"
          onClick={() => go(role)}
        >
          Search
        </Button>
      </div>

      {/* CTA Buttons */}
      <div className="flex gap-[12px]">
        <Link href="/post-requirement">
          <Button className="h-[48px] rounded-[12px] bg-[#3b82f6] hover:bg-[#2563eb] text-white px-[20px] font-bold shadow-lg hover:-translate-y-0.5 transition-transform w-full sm:w-auto">
            Post Requirement
          </Button>
        </Link>
        <Link href="/marketplace">
          <Button variant="outline" className="h-[48px] rounded-[12px] bg-transparent text-white border-[#475569] hover:bg-[#475569]/20 hover:border-[#94a3b8] backdrop-blur-md px-[20px] font-bold shadow-lg hover:-translate-y-0.5 transition-transform w-full sm:w-auto">
            Explore Listings
          </Button>
        </Link>
      </div>
    </div>
  )
}

