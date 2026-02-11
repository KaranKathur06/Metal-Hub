import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const upstreamBase = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
  const upstreamUrl = new URL("/api/listings", upstreamBase)

  url.searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.set(key, value)
  })

  const upstreamRes = await fetch(upstreamUrl.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  })

  const text = await upstreamRes.text()
  return new NextResponse(text, {
    status: upstreamRes.status,
    headers: {
      "Content-Type": upstreamRes.headers.get("content-type") || "application/json",
    },
  })
}
