import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { MarketplaceProviders } from "@/components/providers/MarketplaceProviders"
import { getServerAuthBootstrap } from "@/lib/auth/bootstrap-server-auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MetalHub - India's Industrial Procurement Network",
  description: "India's verified B2B marketplace for metal buyers, sellers, and industrial procurement. Source from trusted suppliers with enterprise-grade verification.",
  keywords: "metal marketplace, B2B industrial procurement, metal suppliers India, steel buyers, industrial sourcing",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const initialAuth = await getServerAuthBootstrap()

  return (
    <html lang="en">
      <body className={inter.className}>
        <MarketplaceProviders initialAuth={initialAuth}>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </MarketplaceProviders>
      </body>
    </html>
  )
}
