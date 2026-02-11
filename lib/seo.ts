import type { Metadata } from "next"

type SearchParams = Record<string, string | string[] | undefined>

type Mode = "buyers" | "suppliers" | "directory"

function getFirst(value: string | string[] | undefined) {
  if (!value) return ""
  return Array.isArray(value) ? value[0] || "" : value
}

function parseCsv(value: string) {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
}

function buildQueryString(searchParams: SearchParams) {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(searchParams)) {
    if (typeof v === "undefined") continue
    if (Array.isArray(v)) {
      for (const item of v) {
        if (item) qs.append(k, item)
      }
    } else if (v) {
      qs.set(k, v)
    }
  }
  const s = qs.toString()
  return s ? `?${s}` : ""
}

export function buildListingsMetadata(args: {
  mode: Mode
  searchParams: SearchParams
  pathname: string
}): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  const search = getFirst(args.searchParams.search)
  const countryRaw = getFirst(args.searchParams.country)
  const countries = countryRaw ? parseCsv(countryRaw) : []
  const metal = getFirst(args.searchParams.metal)
  const industry = getFirst(args.searchParams.industry)
  const capability = getFirst(args.searchParams.capability)

  const roleLabel =
    args.mode === "buyers" ? "Buyers" : args.mode === "suppliers" ? "Suppliers" : "Listings"

  const parts: string[] = []
  if (metal) parts.push(`${metal} ${roleLabel}`)
  else if (capability) parts.push(`${capability} ${roleLabel}`)
  else if (industry) parts.push(`${industry} ${roleLabel}`)
  else parts.push(roleLabel)

  if (countries.length > 0) parts.push(`in ${countries.join(", ")}`)
  if (search) parts.push(`for ${search}`)

  const title = `${parts.join(" ")} | Metal Hub`
  const description = `Browse ${roleLabel.toLowerCase()} with structured filters and verified marketplace profiles.`

  const canonical = new URL(args.pathname + buildQueryString(args.searchParams), siteUrl).toString()

  return {
    title,
    description,
    alternates: {
      canonical,
    },
  }
}
