"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Search, Menu, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function Header() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const isAuthenticated = false // TODO: Replace with actual auth check

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">MetalHub</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/listings"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                mounted && pathname === "/listings" ? "text-primary" : "text-muted-foreground"
              )}
            >
              Browse Listings
            </Link>
            <Link
              href="/sell"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                mounted && pathname === "/sell" ? "text-primary" : "text-muted-foreground"
              )}
            >
              Sell Metal
            </Link>
            <Link
              href="/pricing"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                mounted && pathname === "/pricing" ? "text-primary" : "text-muted-foreground"
              )}
            >
              Pricing
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search metals, location..."
                className="pl-9 w-full"
              />
            </div>
          </div>
          {isAuthenticated ? (
            <>
              <Link href="/dashboard/seller">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

