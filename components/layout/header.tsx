"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { User, LogOut, ChevronDown, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

const DropdownRoot = DropdownMenu.Root
const DropdownTrigger = DropdownMenu.Trigger
const DropdownPortal = DropdownMenu.Portal
const DropdownContent = DropdownMenu.Content
const DropdownItem = DropdownMenu.Item
const DropdownSeparator = DropdownMenu.Separator
const DropdownLabel = DropdownMenu.Label

const SERVICES = [
  { label: "Automotive OEM", value: "automotive-oem" },
  { label: "Aerospace & Defense", value: "aerospace-defense" },
  { label: "Electronics Manufacturing", value: "electronics-manufacturing" },
  { label: "Robotics & Automation", value: "robotics-automation" },
  { label: "Oil & Gas", value: "oil-gas" },
  { label: "Renewable Energy", value: "renewable-energy" },
  { label: "Marine & Shipbuilding", value: "marine-shipbuilding" },
  { label: "Medical Devices", value: "medical-devices" },
] as const

const PRODUCTS = [
  { label: "Steel", value: "steel" },
  { label: "Iron", value: "iron" },
  { label: "Aluminium", value: "aluminium" },
  { label: "Copper", value: "copper" },
  { label: "Brass", value: "brass" },
  { label: "Stainless Steel", value: "stainless-steel" },
] as const

const NAV_LINK_CLASS =
  "relative text-[15px] font-semibold text-slate-700 transition-colors hover:text-slate-900 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-slate-900 after:transition-transform hover:after:scale-x-100"

export function Header() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const isAuthenticated = false // TODO: Replace with actual auth check

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">
        <div className="flex items-center gap-9">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-slate-900">MetalHub</span>
          </Link>
          <nav className="hidden lg:flex max-w-[720px] items-center gap-9 overflow-x-auto whitespace-nowrap">
            <Link
              href="/"
              className={cn(
                NAV_LINK_CLASS,
                mounted && pathname === "/" ? "text-slate-900" : "text-slate-700"
              )}
            >
              Home
            </Link>

            <Link
              href="/about"
              className={cn(
                NAV_LINK_CLASS,
                mounted && pathname === "/about" ? "text-slate-900" : "text-slate-700"
              )}
            >
              About
            </Link>

            <DropdownRoot>
              <DropdownTrigger asChild>
                <button
                  type="button"
                  className={cn(NAV_LINK_CLASS, "inline-flex items-center gap-2")}
                >
                  Capabilities
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownTrigger>
              <DropdownPortal>
                <DropdownContent
                  sideOffset={10}
                  align="center"
                  className="z-50 w-[520px] rounded-md border bg-white p-5 text-slate-900 shadow-md data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                >
                  <div className="space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Capabilities
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      {[
                        { label: "Casting", value: "casting" },
                        { label: "Forging", value: "forging" },
                        { label: "Fabrication", value: "fabrication" },
                        { label: "Machining", value: "machining" },
                      ].map((item) => (
                        <DropdownItem key={item.value} asChild>
                          <Link
                            href={`/listings?capability=${item.value}`}
                            className="block rounded-md px-3 py-2 text-sm outline-none hover:bg-slate-50"
                          >
                            {item.label}
                          </Link>
                        </DropdownItem>
                      ))}
                    </div>
                  </div>
                </DropdownContent>
              </DropdownPortal>
            </DropdownRoot>

            <DropdownRoot>
              <DropdownTrigger asChild>
                <button
                  type="button"
                  className={cn(NAV_LINK_CLASS, "inline-flex items-center gap-2")}
                >
                  Services
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownTrigger>
              <DropdownPortal>
                <DropdownContent
                  sideOffset={10}
                  align="center"
                  className="z-50 w-[560px] rounded-md border bg-white p-5 text-slate-900 shadow-md data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                >
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Industries We Serve
                  </div>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {SERVICES.map((s) => (
                      <DropdownItem key={s.value} asChild>
                        <Link
                          href={`/listings?industry=${s.value}`}
                          className="block rounded-md px-3 py-2 text-sm outline-none hover:bg-slate-50"
                        >
                          {s.label}
                        </Link>
                      </DropdownItem>
                    ))}
                  </div>
                </DropdownContent>
              </DropdownPortal>
            </DropdownRoot>

            <DropdownRoot>
              <DropdownTrigger asChild>
                <button
                  type="button"
                  className={cn(NAV_LINK_CLASS, "inline-flex items-center gap-2")}
                >
                  Products
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownTrigger>
              <DropdownPortal>
                <DropdownContent
                  sideOffset={10}
                  align="center"
                  className="z-50 w-[420px] rounded-md border bg-white p-5 text-slate-900 shadow-md data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                >
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Metals
                  </div>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {PRODUCTS.map((p) => (
                      <DropdownItem key={p.value} asChild>
                        <Link
                          href={`/suppliers?metal=${p.value}`}
                          className="block rounded-md px-3 py-2 text-sm outline-none hover:bg-slate-50"
                        >
                          {p.label}
                        </Link>
                      </DropdownItem>
                    ))}
                  </div>
                </DropdownContent>
              </DropdownPortal>
            </DropdownRoot>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <DropdownRoot>
              <DropdownTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownTrigger>
              <DropdownPortal>
                <DropdownContent
                  sideOffset={8}
                  className="z-50 min-w-[260px] rounded-md border bg-white p-1 text-slate-900 shadow-md"
                >
                  <DropdownItem asChild>
                    <Link href="/" className="block rounded-md px-3 py-2 text-sm outline-none hover:bg-slate-50">
                      Home
                    </Link>
                  </DropdownItem>
                  <DropdownItem asChild>
                    <Link href="/about" className="block rounded-md px-3 py-2 text-sm outline-none hover:bg-slate-50">
                      About
                    </Link>
                  </DropdownItem>

                  <DropdownSeparator className="my-1 h-px bg-slate-100" />
                  <DropdownLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Services
                  </DropdownLabel>
                  {SERVICES.map((s) => (
                    <DropdownItem key={`m-services-${s.value}`} asChild>
                      <Link
                        href={`/listings?industry=${s.value}`}
                        className="block rounded-md px-3 py-2 text-sm outline-none hover:bg-slate-50"
                      >
                        {s.label}
                      </Link>
                    </DropdownItem>
                  ))}

                  <DropdownSeparator className="my-1 h-px bg-slate-100" />
                  <DropdownLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Products
                  </DropdownLabel>
                  {PRODUCTS.map((p) => (
                    <DropdownItem key={`m-products-${p.value}`} asChild>
                      <Link
                        href={`/suppliers?metal=${p.value}`}
                        className="block rounded-md px-3 py-2 text-sm outline-none hover:bg-slate-50"
                      >
                        {p.label}
                      </Link>
                    </DropdownItem>
                  ))}

                  <DropdownSeparator className="my-1 h-px bg-slate-100" />
                  <DropdownItem asChild>
                    <Link href="/suppliers" className="block rounded-md px-3 py-2 text-sm outline-none hover:bg-slate-50">
                      Find Suppliers
                    </Link>
                  </DropdownItem>
                  <DropdownItem asChild>
                    <Link href="/buyers" className="block rounded-md px-3 py-2 text-sm outline-none hover:bg-slate-50">
                      Find Buyers
                    </Link>
                  </DropdownItem>
                  <DropdownSeparator className="my-1 h-px bg-slate-100" />
                  <DropdownItem asChild>
                    <Link href="/login" className="block rounded-md px-3 py-2 text-sm outline-none hover:bg-slate-50">
                      Login
                    </Link>
                  </DropdownItem>
                  <DropdownItem asChild>
                    <Link href="/register" className="block rounded-md px-3 py-2 text-sm outline-none hover:bg-slate-50">
                      Register
                    </Link>
                  </DropdownItem>
                  <DropdownItem asChild>
                    <Link href="/post-requirement" className="block rounded-md px-3 py-2 text-sm outline-none hover:bg-slate-50">
                      Post Requirement
                    </Link>
                  </DropdownItem>
                </DropdownContent>
              </DropdownPortal>
            </DropdownRoot>
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
                <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800">
                  Post Requirement
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

