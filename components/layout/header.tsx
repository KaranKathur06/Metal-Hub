"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Search, User, LogOut, ChevronDown, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

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
              href="/"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                mounted && pathname === "/" ? "text-primary" : "text-muted-foreground"
              )}
            >
              Home
            </Link>

            <Link
              href="/about"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                mounted && pathname === "/about" ? "text-primary" : "text-muted-foreground"
              )}
            >
              About Company
            </Link>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
                    "text-muted-foreground"
                  )}
                >
                  Capabilities
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  sideOffset={8}
                  align="start"
                  className="z-50 w-[520px] rounded-md border bg-popover p-4 text-popover-foreground shadow-md"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-muted-foreground">CAPABILITIES</div>
                      <div className="grid gap-1">
                        {[
                          { label: "Casting", value: "casting" },
                          { label: "Forging", value: "forging" },
                          { label: "Fabrication", value: "fabrication" },
                          { label: "Machining", value: "machining" },
                        ].map((item) => (
                          <DropdownMenu.Item key={item.value} asChild>
                            <Link
                              href={`/listings?capability=${item.value}`}
                              className="block rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent"
                            >
                              {item.label}
                            </Link>
                          </DropdownMenu.Item>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-muted-foreground">QUICK ACCESS</div>
                      <div className="grid gap-1">
                        <DropdownMenu.Item asChild>
                          <Link
                            href="/services"
                            className="block rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent"
                          >
                            Services
                          </Link>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item asChild>
                          <Link
                            href="/products"
                            className="block rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent"
                          >
                            Products
                          </Link>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item asChild>
                          <Link
                            href="/suppliers"
                            className="block rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent"
                          >
                            Find Suppliers
                          </Link>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item asChild>
                          <Link
                            href="/buyers"
                            className="block rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent"
                          >
                            Find Buyers
                          </Link>
                        </DropdownMenu.Item>
                      </div>
                    </div>
                  </div>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            <Link
              href="/services"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                mounted && pathname === "/services" ? "text-primary" : "text-muted-foreground"
              )}
            >
              Services
            </Link>

            <Link
              href="/products"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                mounted && pathname === "/products" ? "text-primary" : "text-muted-foreground"
              )}
            >
              Products
            </Link>

            <Link
              href="/suppliers"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                mounted && pathname === "/suppliers" ? "text-primary" : "text-muted-foreground"
              )}
            >
              Find Suppliers
            </Link>

            <Link
              href="/buyers"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                mounted && pathname === "/buyers" ? "text-primary" : "text-muted-foreground"
              )}
            >
              Find Buyers
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  sideOffset={8}
                  className="z-50 min-w-[240px] rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
                >
                  {[
                    { href: "/", label: "Home" },
                    { href: "/about", label: "About Company" },
                    { href: "/services", label: "Services" },
                    { href: "/products", label: "Products" },
                    { href: "/suppliers", label: "Find Suppliers" },
                    { href: "/buyers", label: "Find Buyers" },
                    { href: "/login", label: "Login" },
                    { href: "/register", label: "Register" },
                    { href: "/post-requirement", label: "Post Requirement" },
                  ].map((item) => (
                    <DropdownMenu.Item key={item.href} asChild>
                      <Link
                        href={item.href}
                        className="block rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent"
                      >
                        {item.label}
                      </Link>
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>

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
                <Button variant="outline" size="sm">Register</Button>
              </Link>
              <Link href="/post-requirement">
                <Button size="sm">Post Requirement</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

