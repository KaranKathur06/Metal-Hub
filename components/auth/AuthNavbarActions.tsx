"use client";

import Link from "next/link";
import { Bell, LayoutDashboard, LogOut, Settings, ShieldCheck, UserRound } from "lucide-react";
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

      <details className="relative">
        <summary className="flex h-9 cursor-pointer list-none items-center gap-2 rounded-md px-2 hover:bg-white/10">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="h-7 w-7 rounded-full object-cover" src={profile.avatar_url} alt="" />
          ) : (
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-950">
              {getInitials(profile?.full_name, profile?.email)}
            </span>
          )}
          <UserRound className="h-4 w-4 md:hidden" aria-hidden="true" />
        </summary>

        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-md border border-white/10 bg-zinc-950 shadow-xl">
          <div className="border-b border-white/10 px-3 py-3">
            <div className="truncate text-sm font-semibold">{profile?.full_name || "MetalHub User"}</div>
            <div className="truncate text-xs text-zinc-400">{profile?.email}</div>
          </div>

          <div className="max-h-80 overflow-y-auto py-1">
            {navItems.map((item) => (
              <Link key={`${item.label}-${item.href}`} className="block px-3 py-2 text-sm hover:bg-white/10" href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-white/10 py-1">
            <Link className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/10" href="/settings">
              <Settings className="h-4 w-4" aria-hidden="true" />
              Settings
            </Link>
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-white/10"
              type="button"
              onClick={() => void signOut()}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Logout
            </button>
          </div>
        </div>
      </details>
    </div>
  );
}

