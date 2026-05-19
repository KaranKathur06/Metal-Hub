"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  type Session,
  type SupabaseClient,
  type User,
} from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { getPublicDevelopmentTrustMode } from "../../lib/marketplace/platform-settings";
import { getSupabaseBrowserClient } from "../../lib/supabase/browser-client";

export type MarketplaceRole = "buyer" | "seller" | "both" | "admin" | "super_admin" | "moderator" | "supplier_success" | "support_agent" | "finance" | "marketing" | "manufacturer" | "distributor" | "logistics";
export type ProfileStatus = "incomplete" | "in_progress" | "complete";
export type VerificationStatus = "draft" | "pending" | "in_review" | "approved" | "rejected" | "expired";

export type MarketplaceProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: MarketplaceRole;
  profile_status: ProfileStatus;
  trust_level: number;
  onboarding_step: number;
  verification_status: VerificationStatus;
  avatar_url: string | null;
};

export type MarketplaceCompany = {
  id: string;
  owner_id: string;
  profile_id: string | null;
  name: string;
  slug: string | null;
  logo_url: string | null;
  verification_status: VerificationStatus;
  trust_level: number;
};

export type MarketplaceSellerProfile = {
  id: string;
  profile_id: string;
  company_id: string;
  profile_completion_percent: number;
  verification_status: VerificationStatus;
  trust_level: number;
};

export type MarketplaceBuyerProfile = {
  id: string;
  profile_id: string;
  company_id: string | null;
  profile_completion_percent: number;
  verification_status: VerificationStatus;
  trust_level: number;
};

type MarketplaceIdentity = {
  profile: MarketplaceProfile | null;
  company: MarketplaceCompany | null;
  sellerProfile: MarketplaceSellerProfile | null;
  buyerProfile: MarketplaceBuyerProfile | null;
};

type AuthContextValue = MarketplaceIdentity & {
  supabase: SupabaseClient | null;
  session: Session | null;
  user: User | null;
  loading: boolean;
  roleLoading: boolean; // NEW: Specifically track role hydration
  isAuthenticated: boolean;
  role: MarketplaceRole | null;
  onboardingIncomplete: boolean;
  developmentTrustMode: boolean;
  dashboardHref: string;
  refreshIdentity: () => Promise<void>;
  signOut: () => Promise<void>;
};

const EMPTY_IDENTITY: MarketplaceIdentity = {
  profile: null,
  company: null,
  sellerProfile: null,
  buyerProfile: null,
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getDashboardHref(role: MarketplaceRole | null) {
  if (role === "seller") return "/seller/dashboard";
  if (role === "buyer") return "/buyer/dashboard";
  if (role === "admin" || role === "super_admin") return "/admin";
  if (role === "moderator") return "/ops";
  if (role === "both") return "/dashboard";
  return "/dashboard";
}

function fallbackProfileFromUser(user: User | null): MarketplaceProfile | null {
  if (!user) return null;

  const metadata = user.user_metadata ?? {};
  const appMeta = user.app_metadata ?? {};
  const VALID_ROLES: MarketplaceRole[] = [
    "buyer", "seller", "both", "admin", "super_admin", "moderator",
    "supplier_success", "support_agent", "finance", "marketing",
    "manufacturer", "distributor", "logistics",
  ];
  
  // Migration 0007 sets role in app_metadata for secure roles like super_admin
  const candidateRole = appMeta.role || metadata.role;
  const role: MarketplaceRole = VALID_ROLES.includes(candidateRole)
    ? candidateRole
    : "buyer";

  return {
    id: user.id,
    email: user.email ?? null,
    full_name: typeof metadata.full_name === "string" ? metadata.full_name : (typeof metadata.name === "string" ? metadata.name : null),
    phone: typeof metadata.phone === "string" ? metadata.phone : null,
    role,
    profile_status: "incomplete",
    trust_level: 0,
    onboarding_step: 1,
    verification_status: "pending",
    avatar_url: typeof metadata.avatar_url === "string" ? metadata.avatar_url : null,
  };
}

async function loadMarketplaceIdentity(
  supabase: SupabaseClient,
  user: User | null,
): Promise<MarketplaceIdentity> {
  if (!user) return EMPTY_IDENTITY;

  const [profileResult, sellerResult, buyerResult, companyResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,email,full_name,phone,role,profile_status,trust_level,onboarding_step,verification_status,avatar_url")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("seller_profiles")
      .select("id,profile_id,company_id,profile_completion_percent,verification_status,trust_level")
      .eq("profile_id", user.id)
      .maybeSingle(),
    supabase
      .from("buyer_profiles")
      .select("id,profile_id,company_id,profile_completion_percent,verification_status,trust_level")
      .eq("profile_id", user.id)
      .maybeSingle(),
    supabase
      .from("companies")
      .select("id,owner_id,profile_id,name,slug,logo_url,verification_status,trust_level")
      .or(`owner_id.eq.${user.id},profile_id.eq.${user.id}`)
      .is("deleted_at", null)
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    profile: (profileResult.data as MarketplaceProfile | null) ?? fallbackProfileFromUser(user),
    company: (companyResult.data as MarketplaceCompany | null) ?? null,
    sellerProfile: (sellerResult.data as MarketplaceSellerProfile | null) ?? null,
    buyerProfile: (buyerResult.data as MarketplaceBuyerProfile | null) ?? null,
  };
}

async function loadDevelopmentTrustMode(supabase: SupabaseClient | null) {
  if (!supabase) return getPublicDevelopmentTrustMode();

  const { data } = await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", "development_trust_mode")
    .maybeSingle();

  return getPublicDevelopmentTrustMode(data?.value);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [supabase] = useState(() => getSupabaseBrowserClient());
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [identity, setIdentity] = useState<MarketplaceIdentity>(EMPTY_IDENTITY);
  const [developmentTrustMode, setDevelopmentTrustMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false); // NEW: Track role hydration specifically
  const isSigningOut = useRef(false);

  const refreshIdentity = useCallback(async () => {
    if (!supabase) {
      setIdentity(EMPTY_IDENTITY);
      return;
    }

    // Use getUser() for server-validated session (not getSession() which reads from local cache)
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const { data: sessionData } = await supabase.auth.getSession();
    const currentSession = sessionData.session ?? null;

    setSession(currentSession);
    setUser(currentUser ?? null);
    const [nextIdentity, nextDevelopmentTrustMode] = await Promise.all([
      loadMarketplaceIdentity(supabase, currentUser ?? null),
      loadDevelopmentTrustMode(supabase),
    ]);
    setIdentity(nextIdentity);
    setDevelopmentTrustMode(nextDevelopmentTrustMode);
  }, [supabase]);

  // ── Initial hydration + auth state listener ──
  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      if (!supabase) {
        if (mounted) {
          setDevelopmentTrustMode(await loadDevelopmentTrustMode(null));
          setLoading(false);
        }
        return;
      }

      // Use getUser() for authoritative server validation instead of getSession()
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const { data: sessionData } = await supabase.auth.getSession();
      const currentSession = sessionData.session ?? null;
      const [nextIdentity, nextDevelopmentTrustMode] = await Promise.all([
        loadMarketplaceIdentity(supabase, currentUser ?? null),
        loadDevelopmentTrustMode(supabase),
      ]);

      if (mounted) {
        setSession(currentSession);
        setUser(currentUser ?? null);
        setIdentity(nextIdentity);
        setDevelopmentTrustMode(nextDevelopmentTrustMode);
        setLoading(false);
      }
    }

    hydrate();

    if (!supabase) {
      return () => { mounted = false; };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (!mounted) return;

      const nextUser = nextSession?.user ?? null;

      // Handle SIGNED_OUT event — clear everything instantly
      if (event === "SIGNED_OUT") {
        setSession(null);
        setUser(null);
        setIdentity(EMPTY_IDENTITY);
        setLoading(false);
        setRoleLoading(false); // NEW
        return;
      }

      // For SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED — reload identity
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        setSession(nextSession);
        setUser(nextUser);
        setLoading(true);
        setRoleLoading(true); // NEW: Set flag before async role fetch

        const [nextIdentity, nextDevelopmentTrustMode] = await Promise.all([
          loadMarketplaceIdentity(supabase, nextUser),
          loadDevelopmentTrustMode(supabase),
        ]);

        if (mounted) {
          setIdentity(nextIdentity);
          setDevelopmentTrustMode(nextDevelopmentTrustMode);
          setLoading(false);
          setRoleLoading(false); // NEW: Clear flag after role fetch
        }
        return;
      }

      // Fallback for any other event
      setSession(nextSession);
      setUser(nextUser);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // ── Sign out with full cleanup ──
  const signOut = useCallback(async () => {
    if (!supabase || isSigningOut.current) return;

    isSigningOut.current = true;

    try {
      // 1. Clear local state immediately for instant UI feedback
      setSession(null);
      setUser(null);
      setIdentity(EMPTY_IDENTITY);

      // 2. Sign out from Supabase (clears cookies + server session)
      await supabase.auth.signOut();

      // 3. Navigate to home page
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("[MetalHub] Sign out error:", err);
      // Still clear state even on error
      setSession(null);
      setUser(null);
      setIdentity(EMPTY_IDENTITY);
      router.push("/");
    } finally {
      isSigningOut.current = false;
    }
  }, [supabase, router]);

  const value = useMemo<AuthContextValue>(() => {
    const role = identity.profile?.role ?? null;
    const onboardingIncomplete = Boolean(
      identity.profile &&
        (identity.profile.profile_status !== "complete" || identity.profile.onboarding_step > 1),
    );

    return {
      supabase,
      session,
      user,
      loading,
      roleLoading, // NEW: Include roleLoading flag
      isAuthenticated: Boolean(session?.user),
      role,
      onboardingIncomplete,
      developmentTrustMode,
      dashboardHref: getDashboardHref(role),
      refreshIdentity,
      signOut,
      ...identity,
    };
  }, [developmentTrustMode, identity, loading, roleLoading, refreshIdentity, session, signOut, supabase, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
