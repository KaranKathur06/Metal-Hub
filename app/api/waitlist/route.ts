import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, feature } = body
    
    if (!email || !feature) {
      return NextResponse.json({ error: "Missing required fields: email and feature" }, { status: 400 })
    }

    // Example logging placeholder.
    // In production, insert this data to Postgres using Prisma:
    // await prisma.waitlist.create({ data: { email, featureName: feature } })
    
    console.log(`[WAITLIST SYSTEM] Successful registration => Email: ${email} | Feature: ${feature}`)
    
    // Simulating slight network latency for realistic frontend UX
    await new Promise(resolve => setTimeout(resolve, 800))

    return NextResponse.json({ success: true, message: "Added to waitlist pipeline" })
  } catch (err) {
    console.error(`[WAITLIST SYSTEM] Handled exception:`, err)
    return NextResponse.json({ error: "Internal server error connecting to waitlist provider" }, { status: 500 })
  }
}
