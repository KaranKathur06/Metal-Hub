"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
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
  { value: "", label: "Any time" },
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
  const industry = searchParams.get("industry") || ""
  const capability = searchParams.get("capability") || ""
  const metal = searchParams.get("metal") || ""

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
    if (industry) chips.push({ key: "industry", label: "Industry", value: industry })
    if (capability) chips.push({ key: "capability", label: "Capability", value: capability })
    if (metal) chips.push({ key: "metal", label: "Metal", value: metal })

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

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Filters</CardTitle>
                <Button variant="outline" size="sm" onClick={clearAll}>
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
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
                <Select value={premium} onValueChange={(v) => setParam("premium", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
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
                <Select value={listingType} onValueChange={(v) => setParam("listingType", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
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
                <Select value={dateRange} onValueChange={(v) => setParam("dateRange", v)}>
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
                <Select value={industry} onValueChange={(v) => setParam("industry", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    {INDUSTRY_OPTIONS.map((i) => (
                      <SelectItem key={i.value} value={i.value}>
                        {i.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Capability (tag)</Label>
                <Select value={capability} onValueChange={(v) => setParam("capability", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    {CAPABILITY_OPTIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Metal (tag)</Label>
                <Select value={metal} onValueChange={(v) => setParam("metal", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    {METAL_OPTIONS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            </CardContent>
          </Card>
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
            <Card>
              <CardContent className="p-6">
                <div className="text-sm">No listings found</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Try removing some filters.
                </div>
                <div className="mt-4">
                  <Button variant="outline" onClick={clearAll}>
                    Clear filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Card key={`skeleton-${i}`}>
                    <CardHeader>
                      <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                      <div className="flex gap-2">
                        <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                        <div className="h-5 w-20 animate-pulse rounded bg-muted" />
                      </div>
                      <div className="h-9 w-32 animate-pulse rounded bg-muted" />
                    </CardContent>
                  </Card>
                ))
              : (results?.listings || []).map((l) => {
                  const CardInner = (
                    <Card className={mode === "directory" ? "transition-shadow hover:shadow-md" : undefined}>
                      <CardHeader>
                        <CardTitle className="text-base">{l.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          {l?.seller?.profile?.companyName || l?.seller?.profile?.fullName || "Company"}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {l.premiumStatus && l.premiumStatus !== "FREE" ? (
                            <Badge variant="warning">{l.premiumStatus}</Badge>
                          ) : null}
                          {l.country ? <Badge variant="secondary">{l.country}</Badge> : null}
                          {Array.isArray(l.metals) && l.metals.length > 0 ? (
                            <Badge variant="secondary">{l.metals[0]}</Badge>
                          ) : null}
                        </div>

                        <div className="pt-2">
                          <Button size="sm">
                            {mode === "buyers"
                              ? "Contact Buyer"
                              : mode === "suppliers"
                                ? "Contact Supplier"
                                : "View Details"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )

                  if (mode === "directory") {
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
