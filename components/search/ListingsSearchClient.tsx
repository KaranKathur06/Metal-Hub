"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ChevronDown, MapPin, CheckCircle, Star, FilterX, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

type ListingRoleType = "buyers" | "suppliers"
type PageMode = "directory" | ListingRoleType

type ListingsResponse = {
  listings: any[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const COUNTRY_OPTIONS = [
  "India",
  "UAE",
  "USA",
  "Germany",
  "UK",
  "Singapore",
] as const

const PREMIUM_OPTIONS = ["FREE", "SILVER", "GOLD"] as const

const LISTING_TYPE_OPTIONS = [
  { value: "MEMBERS", label: "Members" },
  { value: "BUY_LEADS", label: "Buy Leads" },
] as const

const DATE_RANGE_OPTIONS = [
  { value: "any", label: "Any time" },
  { value: "3", label: "Last 3 days" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "60", label: "Last 60 days" },
] as const

const INDUSTRY_OPTIONS = [
  { value: "automotive-oem", label: "Automotive OEM" },
  { value: "aerospace-defense", label: "Aerospace & Defense" },
  { value: "electronics-manufacturing", label: "Electronics Manufacturing" },
  { value: "robotics-automation", label: "Robotics & Automation" },
  { value: "oil-gas", label: "Oil & Gas" },
  { value: "renewable-energy", label: "Renewable Energy" },
  { value: "marine-shipbuilding", label: "Marine & Shipbuilding" },
  { value: "medical-devices", label: "Medical Devices" },
] as const

const CAPABILITY_OPTIONS = [
  { value: "casting", label: "Casting" },
  { value: "forging", label: "Forging" },
  { value: "fabrication", label: "Fabrication" },
  { value: "machining", label: "Machining" },
] as const

const METAL_OPTIONS = [
  { value: "steel", label: "Steel" },
  { value: "iron", label: "Iron" },
  { value: "aluminium", label: "Aluminium" },
  { value: "copper", label: "Copper" },
  { value: "brass", label: "Brass" },
  { value: "stainless-steel", label: "Stainless Steel" },
] as const

function parseCsv(value: string | null): string[] {
  if (!value) return []
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
}

function toCsv(values: string[]): string {
  return values.join(",")
}

function buildTitle(mode: PageMode, search: string | null, countries: string[]) {
  const base =
    mode === "buyers"
      ? "Find Verified Buyers"
      : mode === "suppliers"
        ? "Find Verified Suppliers"
        : "Browse Listings"
  const parts: string[] = [base]
  if (search) parts.push(`for \"${search}\"`)
  if (countries.length > 0) parts.push(`in ${countries.join(", ")}`)
  return parts.join(" ")
}

export default function ListingsSearchClient({ mode }: { mode: PageMode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [results, setResults] = useState<ListingsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debounceRef = useRef<number | null>(null)

  const search = searchParams.get("search") || ""
  const country = useMemo(() => parseCsv(searchParams.get("country")), [searchParams])
  const premium = searchParams.get("premium") || ""
  const listingType = searchParams.get("listingType") || ""
  const dateRange = searchParams.get("dateRange") || ""
  const industry = useMemo(() => parseCsv(searchParams.get("industry")), [searchParams])
  const capability = useMemo(() => parseCsv(searchParams.get("capability")), [searchParams])
  const metal = useMemo(() => parseCsv(searchParams.get("metal")), [searchParams])

  const premiumSelectValue = premium || "any"
  const listingTypeSelectValue = listingType || "any"
  const dateRangeSelectValue = dateRange || "any"

  const sortBy = searchParams.get("sortBy") || "newest"

  const page = Number(searchParams.get("page") || "1")

  const title = useMemo(() => buildTitle(mode, search || null, country), [mode, search, country])

  const activeChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; value: string }> = []

    if (search) chips.push({ key: "search", label: "Search", value: search })
    if (country.length > 0) chips.push({ key: "country", label: "Country", value: country.join(", ") })
    if (premium) chips.push({ key: "premium", label: "Premium", value: premium })
    if (listingType) chips.push({ key: "listingType", label: "Type", value: listingType })
    if (dateRange) chips.push({ key: "dateRange", label: "Date", value: dateRange })
    if (industry.length > 0) chips.push({ key: "industry", label: "Industry", value: industry.join(", ") })
    if (capability.length > 0)
      chips.push({ key: "capability", label: "Capability", value: capability.join(", ") })
    if (metal.length > 0) chips.push({ key: "metal", label: "Metal", value: metal.join(", ") })

    return chips
  }, [search, country, premium, listingType, dateRange, industry, capability, metal])

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString())

    if (!value) {
      next.delete(key)
    } else {
      next.set(key, value)
    }

    if (key !== "page") {
      next.delete("page")
    }

    router.replace(`${pathname}?${next.toString()}`, { scroll: false })
  }

  function clearParam(key: string) {
    setParam(key, "")
  }

  function toggleCountry(value: string) {
    const nextCountries = new Set(country)
    if (nextCountries.has(value)) nextCountries.delete(value)
    else nextCountries.add(value)

    const next = Array.from(nextCountries)
    setParam("country", next.length > 0 ? toCsv(next) : "")
  }

  function toggleIndustry(value: string) {
    const nextValues = new Set(industry)
    if (nextValues.has(value)) nextValues.delete(value)
    else nextValues.add(value)
    const next = Array.from(nextValues)
    setParam("industry", next.length > 0 ? toCsv(next) : "")
  }

  function toggleCapability(value: string) {
    const nextValues = new Set(capability)
    if (nextValues.has(value)) nextValues.delete(value)
    else nextValues.add(value)
    const next = Array.from(nextValues)
    setParam("capability", next.length > 0 ? toCsv(next) : "")
  }

  function toggleMetal(value: string) {
    const nextValues = new Set(metal)
    if (nextValues.has(value)) nextValues.delete(value)
    else nextValues.add(value)
    const next = Array.from(nextValues)
    setParam("metal", next.length > 0 ? toCsv(next) : "")
  }

  function clearAll() {
    router.replace(pathname, { scroll: false })
  }

  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current)
    }

    debounceRef.current = window.setTimeout(async () => {
      const params = new URLSearchParams(searchParams.toString())

      if (mode === "buyers" || mode === "suppliers") {
        params.set("type", mode)
      } else {
        params.delete("type")
      }

      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/listings?${params.toString()}`, { cache: "no-store" })
        const json = await res.json()
        if (!res.ok) {
          throw new Error(json?.message || "Failed to load listings")
        }
        setResults(json)
      } catch (e: any) {
        setError(e?.message || "Failed to load listings")
        setResults(null)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current)
      }
    }
  }, [searchParams, mode])

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-muted-foreground">
          Use structured filters to narrow results without losing state.
        </p>
      </div>

      {activeChips.length > 0 ? (
        <div className="mb-6 flex flex-wrap gap-2">
          {activeChips.map((chip) => (
            <button
              key={`${chip.key}:${chip.value}`}
              type="button"
              onClick={() => clearParam(chip.key)}
              className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm hover:bg-accent"
            >
              <span className="text-muted-foreground">{chip.label}:</span>
              <span className="font-medium">{chip.value}</span>
              <span className="text-muted-foreground">×</span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="bg-white rounded-[16px] p-5 shadow-[0_10px_25px_rgba(0,0,0,0.05)] border border-slate-100">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Filters</h3>
              <button 
                type="button" 
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors" 
                onClick={clearAll}
              >
                Reset All
              </button>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Search</Label>
                <Input
                  value={search}
                  onChange={(e) => setParam("search", e.target.value)}
                  placeholder="e.g., steel screws"
                />
              </div>

              <div className="space-y-2">
                <Label>Countries</Label>
                <div className="space-y-2">
                  {COUNTRY_OPTIONS.map((c) => {
                    const checked = country.includes(c)
                    return (
                      <label key={c} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCountry(c)}
                        />
                        <span>{c}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Premium Members</Label>
                <Select
                  value={premiumSelectValue}
                  onValueChange={(v) => setParam("premium", v === "any" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    {PREMIUM_OPTIONS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Listing Type</Label>
                <Select
                  value={listingTypeSelectValue}
                  onValueChange={(v) => setParam("listingType", v === "any" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">All</SelectItem>
                    {LISTING_TYPE_OPTIONS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Select
                  value={dateRangeSelectValue}
                  onValueChange={(v) => setParam("dateRange", v === "any" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any time" />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_RANGE_OPTIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Industry (tag)</Label>
                <div className="space-y-2">
                  {INDUSTRY_OPTIONS.map((i) => {
                    const checked = industry.includes(i.value)
                    return (
                      <label key={i.value} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={checked} onChange={() => toggleIndustry(i.value)} />
                        <span>{i.label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Capability (tag)</Label>
                <div className="space-y-2">
                  {CAPABILITY_OPTIONS.map((c) => {
                    const checked = capability.includes(c.value)
                    return (
                      <label key={c.value} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={checked} onChange={() => toggleCapability(c.value)} />
                        <span>{c.label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Metal (tag)</Label>
                <div className="space-y-2">
                  {METAL_OPTIONS.map((m) => {
                    const checked = metal.includes(m.value)
                    return (
                      <label key={m.value} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={checked} onChange={() => toggleMetal(m.value)} />
                        <span>{m.label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sort</Label>
                <Select value={sortBy} onValueChange={(v) => setParam("sortBy", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </aside>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${results?.pagination?.total ?? 0} results`}
            </div>
          </div>

          {error ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-destructive">{error}</div>
              </CardContent>
            </Card>
          ) : null}

          {!loading && !error && results && results.listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="h-16 w-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-6 border border-slate-100 shadow-sm">
                <FilterX className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No results found</h3>
              <p className="text-slate-500 mb-8 max-w-sm">
                We couldn&apos;t find any matches for your current filter combination. Try adjusting them.
              </p>
              <Button onClick={clearAll} className="bg-slate-900 text-white rounded-xl h-11 px-6 hover:bg-slate-800">
                Reset Filters
              </Button>
            </div>
          ) : null}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={`skeleton-${i}`} className="bg-white rounded-[16px] p-4 border border-slate-100 shadow-sm">
                    <div className="aspect-[4/3] w-full bg-slate-100 rounded-xl mb-4 animate-pulse" />
                    <div className="h-5 w-3/4 animate-pulse rounded-md bg-slate-100 mb-3" />
                    <div className="h-4 w-1/2 animate-pulse rounded-md bg-slate-100 mb-6" />
                    <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
                  </div>
                ))
              : (results?.listings || []).map((l) => {
                  const companyName = l?.seller?.profile?.companyName || l?.seller?.profile?.fullName || "Verified Business"
                  
                  const CardInner = (
                    <div className="bg-white rounded-[16px] p-4 border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.08)] flex flex-col h-full group">
                      {/* Placeholder Image Header */}
                      {mode !== "suppliers" && (
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50 rounded-xl mb-4">
                          <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                            <ImageIcon className="h-10 w-10 opacity-50" />
                          </div>
                          {l.premiumStatus && l.premiumStatus !== "FREE" && (
                            <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-full shadow-sm z-10">
                              Premium
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex-1 flex flex-col">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                          {mode === "suppliers" ? companyName : l.title}
                        </h3>
                        
                        {mode === "suppliers" ? (
                          <div className="mb-4">
                            <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 mb-2">
                              <CheckCircle className="h-4 w-4" /> Verified Supplier
                            </div>
                            {l.country && (
                              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                <MapPin className="h-3.5 w-3.5" /> {l.country}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="mb-4">
                            <div className="text-sm font-medium text-slate-500 mb-1">{companyName}</div>
                            {l.country && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <MapPin className="h-3 w-3" /> {l.country}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                          {mode === "suppliers" ? (
                            <span className="flex items-center gap-1 text-sm font-bold text-slate-700">
                              <Star className="h-4 w-4 text-amber-400 fill-amber-400" /> 4.8
                            </span>
                          ) : (
                            <span className="font-extrabold text-slate-900">
                              Contact for Price
                            </span>
                          )}
                          <Button size="sm" className={cn("rounded-lg font-semibold", mode === "suppliers" ? "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-none" : "bg-slate-900 text-white hover:bg-slate-800")}>
                            {mode === "suppliers" ? "Contact" : "View Details"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )

                  if (mode === "directory" || mode === "buyers") {
                    return (
                      <Link key={l.id} href={`/listings/${l.id}`} className="block">
                        {CardInner}
                      </Link>
                    )
                  }

                  return <div key={l.id}>{CardInner}</div>
                })}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setParam("page", String(Math.max(1, page - 1)))}
            >
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {results?.pagination?.page ?? page} of {results?.pagination?.totalPages ?? 1}
            </div>
            <Button
              variant="outline"
              disabled={!!results && page >= results.pagination.totalPages}
              onClick={() => setParam("page", String(page + 1))}
            >
              Next
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
