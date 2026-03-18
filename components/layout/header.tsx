"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { User, LogOut, ChevronDown, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

const Industries = [
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
      <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-8">
        <div className="flex items-center gap-9">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-slate-900">MetalHub</span>
          </Link>
          <nav className="hidden lg:flex items-center">
            <ul className="flex items-center gap-9">
              <li>
                <Link
                  href="/"
                  className={cn(
                    NAV_LINK_CLASS,
                    mounted && pathname === "/" ? "text-slate-900" : "text-slate-700"
                  )}
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="/listings"
                  className={cn(
                    NAV_LINK_CLASS,
                    mounted && pathname === "/listings" ? "text-slate-900" : "text-slate-700"
                  )}
                >
                  Listings
                </Link>
              </li>

              <li>
                <Link
                  href="/suppliers"
                  className={cn(
                    NAV_LINK_CLASS,
                    mounted && pathname === "/suppliers" ? "text-slate-900" : "text-slate-700"
                  )}
                >
                  Suppliers
                </Link>
              </li>

              <li className="group relative">
                <button
                  type="button"
                  className={cn(NAV_LINK_CLASS, "inline-flex items-center gap-2")}
                >
                  Capabilities
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="absolute left-0 right-0 top-full h-8 pointer-events-auto" />
                <div className="fixed left-0 right-0 top-20 z-50 border-b bg-white shadow-md opacity-0 invisible transition-opacity duration-200 pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto">
                  <div className="mx-auto max-w-7xl px-8 py-10">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Capabilities
                    </div>
                    <div className="mt-4 grid gap-2 md:grid-cols-4">
                      {[
                        { label: "Casting", value: "casting" },
                        { label: "Forging", value: "forging" },
                        { label: "Fabrication", value: "fabrication" },
                        { label: "Machining", value: "machining" },
                      ].map((item) => (
                        <Link
                          key={item.value}
                          href={`/listings?capability=${item.value}`}
                          className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </li>

              <li className="group relative">
                <button
                  type="button"
                  className={cn(NAV_LINK_CLASS, "inline-flex items-center gap-2")}
                >
                  Industries
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="absolute left-0 right-0 top-full h-8 pointer-events-auto" />
                <div className="fixed left-0 right-0 top-20 z-50 border-b bg-white shadow-md opacity-0 invisible transition-opacity duration-200 pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto">
                  <div className="mx-auto max-w-7xl px-8 py-10">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Industries We Serve
                    </div>
                    <div className="mt-4 grid gap-2 md:grid-cols-4">
                      {Industries.map((s) => (
                        <Link
                          key={s.value}
                          href={`/listings?industry=${s.value}`}
                          className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        >
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </li>

              <li className="group relative">
                <button
                  type="button"
                  className={cn(NAV_LINK_CLASS, "inline-flex items-center gap-2")}
                >
                  Products
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="absolute left-0 right-0 top-full h-8 pointer-events-auto" />
                <div className="fixed left-0 right-0 top-20 z-50 border-b bg-white shadow-md opacity-0 invisible transition-opacity duration-200 pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto">
                  <div className="mx-auto max-w-7xl px-8 py-10">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Metals</div>
                    <div className="mt-4 grid gap-2 md:grid-cols-4">
                      {PRODUCTS.map((p) => (
                        <Link
                          key={p.value}
                          href={`/suppliers?metal=${p.value}`}
                          className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        >
                          {p.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className={cn(
                    NAV_LINK_CLASS,
                    mounted && pathname === "/pricing" ? "text-slate-900" : "text-slate-700"
                  )}
                >
                  Pricing
                </Link>
              </li>
            </ul>
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
                  className="z-50 min-w-[260px] rounded-md border bg-white p-1 text-slate-900 shadow-md"
                >
                  <DropdownMenu.Item asChild>
                    <Link href="/" className="block rounded-md px-3 py-2 text-sm outline-none hover:bg-slate-50">
                      Home
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <Link href="/listings" className="block rounded-md px-3 py-2 text-sm outline-none hover:bg-slate-50">
                      Listings
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <Link href="/suppliers" className="block rounded-md px-3 py-2 text-sm outline-none hover:bg-slate-50">
                      Suppliers
                    </Link>
                  </DropdownMenu.Item>

                  <DropdownMenu.Separator className="my-1 h-px bg-slate-100" />
                  <DropdownMenu.Label className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Industries
                  </DropdownMenu.Label>
                  {Industries.map((s) => (
                    <DropdownMenu.Item key={`m-Industries-${s.value}`} asChild>
                      <Link
                        href={`/listings?industry=${s.value}`}
                        className="block rounded-md px-3 py-2 text-sm outline-none hover:bg-slate-50"
                      >
                        {s.label}
                      </Link>
                    </DropdownMenu.Item>
                  ))}

                  <DropdownMenu.Separator className="my-1 h-px bg-slate-100" />
                  <DropdownMenu.Label className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Products
                  </DropdownMenu.Label>
                  {PRODUCTS.map((p) => (
                    <DropdownMenu.Item key={`m-products-${p.value}`} asChild>
                      <Link
                        href={`/suppliers?metal=${p.value}`}
                        className="block rounded-md px-3 py-2 text-sm outline-none hover:bg-slate-50"
                      >
                        {p.label}
                      </Link>
                    </DropdownMenu.Item>
                  ))}

                  <DropdownMenu.Item asChild>
                    <Link href="/pricing" className="block rounded-md px-3 py-2 text-sm outline-none hover:bg-slate-50">
                      Pricing
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="my-1 h-px bg-slate-100" />
                  <DropdownMenu.Item asChild>
                    <Link href="/post-requirement" className="block rounded-md px-3 py-2 text-sm font-semibold text-primary outline-none hover:bg-slate-50">
                      Post Requirement
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <Link href="/register" className="block rounded-md px-3 py-2 text-sm outline-none hover:bg-slate-50">
                      Register
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <Link href="/login" className="block rounded-md px-3 py-2 text-sm outline-none hover:bg-slate-50">
                      Login
                    </Link>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
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
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-semibold text-slate-600 hover:text-slate-900">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" size="sm" className="font-semibold bg-white">
                    Register
                  </Button>
                </Link>
                <Link href="/post-requirement">
                  <Button size="sm" className="font-bold bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] text-white shadow-[0_4px_14px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 transition-all border-none ml-2">
                    Post Requirement
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

