'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bell, Building2, ChevronDown, Cog, Factory, FlaskConical,
  GitBranch, LayoutDashboard, LogOut, Menu, Package, Search,
  Settings, ShieldCheck, Truck, Wrench, X, Zap,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';
import { ProfileDropdown } from '@/components/layout/ProfileDropdown';
import { resolveAuthRole, type AppRole } from '@/lib/auth/profile-role';
import { getAuthenticatedNavItems, getOnboardingHref } from '@/lib/marketplace/auth-navigation';
import { NavbarNotificationBell } from '@/components/marketplace/NavbarNotificationBell';
import { useTaxonomyRegistry } from '@/lib/marketplace/use-taxonomy-registry';
import type { TaxonomyNode } from '@/lib/marketplace/taxonomy';

// ─── Icon Registry ───
const ICON_MAP: Record<string, LucideIcon> = {
  Building2, Cog, Factory, FlaskConical, GitBranch,
  Package, ShieldCheck, Truck, Wrench, Zap,
};

function TaxIcon({ name, className }: { name?: string | null; className?: string }) {
  const Icon = (name && ICON_MAP[name]) || Factory;
  return <Icon className={className || 'h-4 w-4'} aria-hidden="true" />;
}

function getInitials(name?: string | null, email?: string | null) {
  const source = name || email || 'U';
  return source.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || 'U';
}

// ─── Menu Key Type ───
type MenuKey = 'capabilities' | 'industries' | 'products' | null;

// ─── Hover intent timing ───
const CLOSE_DELAY_MS = 300;
const OPEN_DELAY_MS = 0; // instant open

// ═══════════════════════════════════════════════════════
// FULL-WIDTH MEGA MENU PANEL
// ═══════════════════════════════════════════════════════
function MegaPanel({
  items,
  loading,
  hrefPrefix,
  onClose,
}: {
  items: TaxonomyNode[];
  loading: boolean;
  hrefPrefix: string;
  onClose: () => void;
}) {
  if (loading) {
    return (
      <div className="mx-auto grid max-w-7xl grid-cols-3 gap-4 px-8 py-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg p-3">
            <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-8 py-8 text-center text-sm text-slate-400">
        No items available yet.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-8 py-5">
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`${hrefPrefix}${item.slug}`}
            className="group flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-slate-50"
            onClick={onClose}
          >
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
              <TaxIcon name={item.icon} className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-slate-800 group-hover:text-blue-700">
                {item.name}
              </div>
              {item.description && (
                <p className="mt-0.5 line-clamp-1 text-[11px] leading-snug text-slate-400 group-hover:text-slate-500">
                  {item.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MOBILE ACCORDION
// ═══════════════════════════════════════════════════════
function MobileAccordion({
  label,
  items,
  loading,
  hrefPrefix,
}: {
  label: string;
  items: TaxonomyNode[];
  loading: boolean;
  hrefPrefix: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-3 text-sm font-semibold text-slate-900"
        onClick={() => setOpen(!open)}
      >
        {label}
        <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="grid gap-0.5 px-3 pb-3">
          {loading && <div className="px-2 py-2 text-xs text-slate-400">Loading...</div>}
          {items.map((item) => (
            <Link key={item.id} href={`${hrefPrefix}${item.slug}`} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-slate-50">
              <TaxIcon name={item.icon} className="h-3.5 w-3.5 text-slate-400" />
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// HEADER
// ═══════════════════════════════════════════════════════
export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MenuKey>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  const { data: taxonomy, loading: taxLoading } = useTaxonomyRegistry();
  const {
    loading: authLoading, roleLoading, isAuthenticated, profile, role, user,
    dashboardHref, onboardingIncomplete, signOut, isSigningOut, sessionStatus,
  } = useAuth();

  const showGuestChrome = !isAuthenticated && !authLoading && !isSigningOut;
  const showAuthedChrome = isAuthenticated && !isSigningOut;
  const showAuthSkeleton =
    (authLoading || sessionStatus === "unknown" || isSigningOut) &&
    !isAuthenticated &&
    !user;

  const profileRole: AppRole = resolveAuthRole({
    profileRole: role,
    appMetadataRole: role,
    userMetadataRole: role,
  });

  const navItems = isAuthenticated ? getAuthenticatedNavItems(role) : [];

  useEffect(() => { setMobileOpen(false); setActiveMenu(null); }, [pathname]);

  // ── Enterprise hover intent system ──
  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openMenu = useCallback((key: MenuKey) => {
    clearCloseTimer();
    setActiveMenu(key);
  }, [clearCloseTimer]);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, CLOSE_DELAY_MS);
  }, [clearCloseTimer]);

  const closeMenu = useCallback(() => {
    clearCloseTimer();
    setActiveMenu(null);
  }, [clearCloseTimer]);

  // ── Keyboard support: ESC to close ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeMenu) {
        closeMenu();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeMenu, closeMenu]);

  // ── Click outside to close ──
  useEffect(() => {
    if (!activeMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenu, closeMenu]);

  // Cleanup timer on unmount
  useEffect(() => () => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current); }, []);

  const capabilities = taxonomy?.capabilities ?? [];
  const industries = taxonomy?.industries ?? [];
  const categories = taxonomy?.categories ?? [];

  // Menu config
  const MENUS: Record<Exclude<MenuKey, null>, { label: string; items: TaxonomyNode[]; prefix: string }> = {
    capabilities: { label: 'Capabilities', items: capabilities, prefix: '/capabilities/' },
    industries: { label: 'Industries', items: industries, prefix: '/industries/' },
    products: { label: 'Products', items: categories, prefix: '/marketplace?category=' },
  };

  const isMenuOpen = activeMenu !== null;

  return (
    <>
      {/* 
        ════════════════════════════════════════════════════════════
        HEADER — Sticky, isolated stacking context
        The entire header (navbar + mega panel) shares one hover container.
        Mouse-leaving the header schedules close; entering cancels it.
        ════════════════════════════════════════════════════════════ 
      */}
      <header
        ref={headerRef}
        className="sticky top-0 z-50 w-full bg-white"
        onMouseLeave={scheduleClose}
        onMouseEnter={clearCloseTimer}
        role="banner"
        style={{ isolation: 'isolate' }} // NEW: Create stacking context without affecting children
      >
        {/* ── Primary Nav Bar ── */}
        <div className="border-b border-slate-200 shadow-sm">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
            {/* Logo */}
            <Link href="/" className="shrink-0 text-xl font-bold text-slate-900 lg:text-2xl">
              MetalHub
            </Link>

            {/* Center Nav */}
            <nav className="hidden items-center lg:flex" role="navigation" aria-label="Main navigation">
              <Link
                href="/"
                className={cn(
                  'px-4 py-2 text-[15px] font-semibold transition-colors',
                  pathname === '/' ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900',
                )}
              >
                Home
              </Link>

              {/* Taxonomy Nav Triggers */}
              {(Object.keys(MENUS) as Exclude<MenuKey, null>[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={cn(
                    'inline-flex items-center gap-1 px-4 py-2 text-[15px] font-semibold transition-colors',
                    activeMenu === key
                      ? 'text-blue-700'
                      : 'text-slate-600 hover:text-slate-900',
                  )}
                  onMouseEnter={() => openMenu(key)}
                  onFocus={() => openMenu(key)}
                  onClick={() => setActiveMenu(activeMenu === key ? null : key)}
                  aria-expanded={activeMenu === key}
                  aria-haspopup="true"
                  aria-controls={`mega-panel-${key}`}
                >
                  {MENUS[key].label}
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 transition-transform duration-200',
                      activeMenu === key && 'rotate-180',
                    )}
                  />
                </button>
              ))}

              <Link
                href="/marketplace"
                className={cn(
                  'px-4 py-2 text-[15px] font-semibold transition-colors',
                  pathname?.startsWith('/marketplace') ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900',
                )}
                onMouseEnter={() => openMenu(null)}
              >
                Marketplace
              </Link>
            </nav>

            {/* Right: Auth */}
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-1.5 lg:flex">
                {showAuthSkeleton ? (
                  <div className="h-9 w-32 animate-pulse rounded-md bg-slate-100" aria-hidden="true" />
                ) : showAuthedChrome ? (
                  <>
                    {onboardingIncomplete && (
                      <Link href={getOnboardingHref(role)} className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100">
                        <ShieldCheck className="h-3.5 w-3.5" /> Complete Profile
                      </Link>
                    )}
                    <NavbarNotificationBell />
                    <Link href={dashboardHref} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Dashboard">
                      <LayoutDashboard className="h-4 w-4" />
                    </Link>
                    <Link href="/post-requirement">
                      <Button size="sm" className="ml-1 border-none bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] font-bold text-white shadow-[0_4px_14px_rgba(59,130,246,0.25)] hover:-translate-y-0.5">
                        Post Requirement
                      </Button>
                    </Link>

                    {roleLoading && !profile?.full_name ? (
                      <div className="h-9 w-9 animate-pulse rounded-full bg-slate-100" aria-hidden="true" />
                    ) : (
                      <ProfileDropdown
                        user={{
                          email: profile?.email ?? null,
                          fullName: profile?.full_name,
                          role: profileRole,
                        }}
                        onSignOut={signOut}
                      />
                    )}
                  </>
                ) : showGuestChrome ? (
                  <>
                    <Link href="/login"><Button variant="ghost" size="sm" className="font-semibold text-slate-600 hover:text-slate-900">Login</Button></Link>
                    <Link href="/register"><Button variant="outline" size="sm" className="bg-white font-semibold">Register</Button></Link>
                    <Link href="/post-requirement"><Button size="sm" className="ml-1 border-none bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] font-bold text-white shadow-[0_4px_14px_rgba(59,130,246,0.25)] hover:-translate-y-0.5">Post Requirement</Button></Link>
                  </>
                ) : (
                  <div className="h-9 w-24 animate-pulse rounded-md bg-slate-100" aria-hidden="true" />
                )}
              </div>

              <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            INVISIBLE BRIDGE ZONE
            This invisible div spans the gap between the navbar bottom
            and the mega panel top, preventing hover disconnect.
            Without this, diagonal mouse movement from trigger to panel
            crosses a "dead zone" that triggers onMouseLeave.
            ════════════════════════════════════════════════════════ */}
        <div
          className={cn(
            'absolute left-0 right-0 h-2 z-[59]',
            isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none',
          )}
          style={{ top: '100%' }}
          onMouseEnter={clearCloseTimer}
          aria-hidden="true"
        />

        {/* ════════════════════════════════════════════════════════
            FULL-WIDTH MEGA MENU BAND — ALWAYS MOUNTED
            Uses opacity/visibility/pointer-events for transitions
            instead of conditional rendering. This eliminates:
            - Mount/unmount flicker
            - Layout shift
            - Animation race conditions
            z-[60] ensures it renders ABOVE any overlay
            ════════════════════════════════════════════════════════ */}
        {(Object.keys(MENUS) as Exclude<MenuKey, null>[]).map((key) => (
          <div
            key={key}
            id={`mega-panel-${key}`}
            role="region"
            aria-label={`${MENUS[key].label} menu`}
            className={cn(
              'absolute left-0 right-0 z-[60] border-b border-slate-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]',
              'transition-[opacity,visibility] duration-200 ease-out',
              activeMenu === key
                ? 'visible opacity-100 pointer-events-auto'
                : 'invisible opacity-0 pointer-events-none',
            )}
            style={{ top: '100%' }}
            onMouseEnter={clearCloseTimer}
            onMouseLeave={scheduleClose}
          >
            <MegaPanel
              items={MENUS[key].items}
              loading={taxLoading}
              hrefPrefix={MENUS[key].prefix}
              onClose={closeMenu}
            />
          </div>
        ))}
      </header>

      {/* Backdrop overlay — click to dismiss mega menu */}
      <div
        className={cn(
          'fixed inset-0 z-[49] transition-opacity duration-200',
          isMenuOpen
            ? 'bg-black/5 opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none',
        )}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-[70] overflow-y-auto border-t bg-white lg:hidden">
          <div className="mx-auto max-w-lg px-4 py-4">
            <Link href="/" className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50">Home</Link>
            <Link href="/marketplace" className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50">Marketplace</Link>

            <MobileAccordion label="Capabilities" items={capabilities} loading={taxLoading} hrefPrefix="/capabilities/" />
            <MobileAccordion label="Industries" items={industries} loading={taxLoading} hrefPrefix="/industries/" />
            <MobileAccordion label="Products" items={categories} loading={taxLoading} hrefPrefix="/marketplace?category=" />

            <div className="my-3 border-t border-slate-100" />

            {authLoading || roleLoading ? (
              <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
            ) : isAuthenticated ? (
              <div className="space-y-1">
                <div className="mb-3 flex items-center gap-3 px-3">
                  {profile?.avatar_url ? (
                    <img className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-200" src={profile.avatar_url} alt="" />
                  ) : (
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] text-xs font-bold text-white">
                      {getInitials(profile?.full_name, profile?.email)}
                    </span>
                  )}
                  <div>
                    <div className="text-sm font-bold text-slate-900">{profile?.full_name || 'MetalHub User'}</div>
                    <div className="text-xs text-slate-500">{profile?.email}</div>
                  </div>
                </div>
                {navItems.map((item) => (
                  <Link key={`m-${item.label}`} href={item.href} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">{item.label}</Link>
                ))}
                <div className="my-2 border-t border-slate-100" />
                <Link href="/post-requirement" className="block rounded-lg px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50">Post Requirement</Link>
                <Link href="/settings" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <Settings className="h-4 w-4" /> Settings
                </Link>
                <button type="button" onClick={() => void signOut()} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"><LogOut className="h-4 w-4" /> Logout</button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link href="/post-requirement" className="block rounded-lg px-3 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50">Post Requirement</Link>
                <Link href="/register" className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Register</Link>
                <Link href="/login" className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Login</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
