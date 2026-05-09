"use client";

import Link from "next/link";
import { Bell, LayoutDashboard, LogOut, Settings, ShieldCheck, UserRound } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { getAuthenticatedNavItems, getOnboardingHref } from "../../lib/marketplace/auth-navigation";

function getInitials(name?: string | null, email?: string | null) {
  const source = name || email || "User";
  const parts = source.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase()).join("") || "U";
}

export function AuthNavbarActions() {
  const {
    loading,
    isAuthenticated,
    profile,
    role,
    dashboardHref,
    onboardingIncomplete,
    signOut,
  } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) {
    return <div className="h-9 w-36 animate-pulse rounded-md bg-white/10" aria-label="Loading account" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Link className="rounded-md px-3 py-2 text-sm font-medium hover:bg-white/10" href="/login">
          Login
        </Link>
        <Link className="rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400" href="/register">
          Register
        </Link>
      </div>
    );
  }

  const navItems = getAuthenticatedNavItems(role);

  return (
    <div className="flex items-center gap-2">
      {onboardingIncomplete ? (
        <Link
          className="hidden items-center gap-2 rounded-md border border-amber-400/40 px-3 py-2 text-sm font-medium text-amber-200 hover:bg-amber-400/10 md:flex"
          href={getOnboardingHref(role)}
        >
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Complete Profile
        </Link>
      ) : null}

      <Link
        className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/10"
        href="/notifications"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
      </Link>

      <Link
        className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/10"
        href={dashboardHref}
        aria-label="Dashboard"
      >
        <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
      </Link>

      {/* Radix Dropdown — portaled, keyboard-accessible, click-outside-closes */}
      <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className="flex h-9 cursor-pointer items-center gap-2 rounded-md px-2 hover:bg-white/10"
            aria-label="Account menu"
          >
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="h-7 w-7 rounded-full object-cover" src={profile.avatar_url} alt="" />
            ) : (
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-950">
                {getInitials(profile?.full_name, profile?.email)}
              </span>
            )}
            <UserRound className="h-4 w-4 md:hidden" aria-hidden="true" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            sideOffset={8}
            align="end"
            className="z-[9999] min-w-[240px] overflow-hidden rounded-xl border border-white/10 bg-zinc-950 text-white shadow-[0_16px_48px_rgba(0,0,0,0.4)] animate-in fade-in-0 zoom-in-95"
          >
            <div className="border-b border-white/10 px-4 py-3">
              <div className="truncate text-sm font-semibold">{profile?.full_name || "MetalHub User"}</div>
              <div className="truncate text-xs text-zinc-400">{profile?.email}</div>
              {role && (
                <span className="mt-1 inline-block rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-300">
                  {role}
                </span>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto py-1">
              {navItems.map((item) => (
                <DropdownMenu.Item key={`${item.label}-${item.href}`} asChild>
                  <Link
                    className="block px-4 py-2 text-sm outline-none hover:bg-white/10 focus:bg-white/10"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </DropdownMenu.Item>
              ))}
            </div>

            <div className="border-t border-white/10 py-1">
              <DropdownMenu.Item asChild>
                <Link className="flex items-center gap-2 px-4 py-2 text-sm outline-none hover:bg-white/10 focus:bg-white/10" href="/settings">
                  <Settings className="h-4 w-4" aria-hidden="true" />
                  Settings
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <button
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-400 outline-none hover:bg-red-500/10 focus:bg-red-500/10"
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    void signOut();
                  }}
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Logout
                </button>
              </DropdownMenu.Item>
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
