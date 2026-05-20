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
import { resolveAuthRole } from "@/lib/auth/profile-role";
import { getHomePathForRole } from "@/lib/auth/role-routing";
import { resolveEffectiveRole } from "@/lib/auth/rbac";
import { authLog } from "@/lib/auth/auth-logger";
import type {
  ServerAuthBootstrap,
  ServerAuthBootstrapPayload,
} from "@/lib/auth/bootstrap-server-auth";
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
  roleLoading: boolean;
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

function profileFromBootstrap(bootstrap: ServerAuthBootstrapPayload): MarketplaceProfile {
  return {
    id: bootstrap.userId,
    email: bootstrap.email,
    full_name: bootstrap.fullName,
    phone: null,
    role: bootstrap.role as MarketplaceRole,
    profile_status: "incomplete",
    trust_level: 0,
    onboarding_step: 1,
    verification_status: "pending",
    avatar_url: null,
  };
}

function getDashboardHref(role: MarketplaceRole | null) {
  const resolved = resolveAuthRole({
    profileRole: role,
    appMetadataRole: role,
    userMetadataRole: role,
  });
  return getHomePathForRole(resolved);
}

function fallbackProfileFromUser(user: User | null): MarketplaceProfile | null {
  if (!user) return null;

  const metadata = user.user_metadata ?? {};
  const appMeta = user.app_metadata ?? {};
  const role = resolveEffectiveRole({
    appMetadataRole: appMeta.role,
    userMetadataRole: metadata.role,
  }) as MarketplaceRole;

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

  const profileFromDb = profileResult.data as MarketplaceProfile | null;
  const fallback = fallbackProfileFromUser(user);
  const mergedProfile = profileFromDb
    ? {
        ...profileFromDb,
        role: resolveEffectiveRole({
          profileRole: profileFromDb.role,
          appMetadataRole: user.app_metadata?.role,
          userMetadataRole: user.user_metadata?.role,
        }) as MarketplaceRole,
      }
    : fallback;

  return {
    profile: mergedProfile,
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

type AuthProviderProps = {
  children: ReactNode;
  initialAuth?: ServerAuthBootstrap | null;
};

export function AuthProvider({ children, initialAuth = null }: AuthProviderProps) {
  const router = useRouter();
  const [supabase] = useState(() => getSupabaseBrowserClient());
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [identity, setIdentity] = useState<MarketplaceIdentity>(() =>
    initialAuth
      ? { ...EMPTY_IDENTITY, profile: profileFromBootstrap(initialAuth) }
      : EMPTY_IDENTITY,
  );
  const [developmentTrustMode, setDevelopmentTrustMode] = useState(true);
  const [loading, setLoading] = useState(() => !initialAuth);
  const [roleLoading, setRoleLoading] = useState(false);
  const isSigningOut = useRef(false);
  const identityRequestId = useRef(0);

  const loadFullIdentity = useCallback(
    async (nextUser: User | null, options?: { silent?: boolean }) => {
      if (!supabase) {
        setIdentity(EMPTY_IDENTITY);
        return;
      }

      if (!options?.silent) {
        setRoleLoading(true);
      }

      const requestId = ++identityRequestId.current;

      try {
        const [nextIdentity, nextDevelopmentTrustMode] = await Promise.all([
          loadMarketplaceIdentity(supabase, nextUser),
          loadDevelopmentTrustMode(supabase),
        ]);

        if (requestId !== identityRequestId.current) return;

        setIdentity(nextIdentity);
        setDevelopmentTrustMode(nextDevelopmentTrustMode);
      } finally {
        if (requestId === identityRequestId.current && !options?.silent) {
          setRoleLoading(false);
        }
      }
    },
    [supabase],
  );

  const refreshIdentity = useCallback(async () => {
    if (!supabase) {
      setIdentity(EMPTY_IDENTITY);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const cachedUser = sessionData.session?.user ?? null;
    setSession(sessionData.session ?? null);
    setUser(cachedUser);

    const { data: { user: validatedUser } } = await supabase.auth.getUser();
    const currentUser = validatedUser ?? cachedUser;
    setUser(currentUser);

    await loadFullIdentity(currentUser);
  }, [loadFullIdentity, supabase]);

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

      authLog("client_hydrate", "start", { hasBootstrap: Boolean(initialAuth) });

      // Fast path: local session (no network) for instant navbar
      const { data: sessionData } = await supabase.auth.getSession();
      const cachedSession = sessionData.session ?? null;
      const cachedUser = cachedSession?.user ?? null;

      if (mounted && cachedSession) {
        setSession(cachedSession);
        setUser(cachedUser);
        setLoading(false);

        setIdentity((prev) => ({
          ...prev,
          profile: prev.profile ?? fallbackProfileFromUser(cachedUser),
        }));
      }

      // Validate JWT in background
      const { data: { user: validatedUser } } = await supabase.auth.getUser();
      const currentUser = validatedUser ?? cachedUser;

      if (!mounted) return;

      if (!currentUser) {
        setSession(null);
        setUser(null);
        setIdentity(EMPTY_IDENTITY);
        setLoading(false);
        setRoleLoading(false);
        return;
      }

      setSession(cachedSession);
      setUser(currentUser);
      setLoading(false);

      await loadFullIdentity(currentUser, { silent: Boolean(initialAuth) });
      authLog("client_hydrate", "complete", { userId: currentUser.id });
    }

    hydrate();

    if (!supabase) {
      return () => {
        mounted = false;
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (!mounted) return;

      const nextUser = nextSession?.user ?? null;
      authLog("auth_event", event, { userId: nextUser?.id });

      if (event === "SIGNED_OUT") {
        setSession(null);
        setUser(null);
        setIdentity(EMPTY_IDENTITY);
        setLoading(false);
        setRoleLoading(false);
        return;
      }

      if (event === "TOKEN_REFRESHED") {
        setSession(nextSession);
        setUser(nextUser);
        return;
      }

      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        setSession(nextSession);
        setUser(nextUser);
        setLoading(false);

        if (nextUser) {
          setIdentity((prev) => ({
            ...prev,
            profile: prev.profile ?? fallbackProfileFromUser(nextUser),
          }));
        }

        await loadFullIdentity(nextUser);
        return;
      }

      setSession(nextSession);
      setUser(nextUser);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, initialAuth, loadFullIdentity]);

  const signOut = useCallback(async () => {
    if (!supabase || isSigningOut.current) return;

    isSigningOut.current = true;

    try {
      setSession(null);
      setUser(null);
      setIdentity(EMPTY_IDENTITY);
      setLoading(false);
      setRoleLoading(false);

      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("[MetalHub] Sign out error:", err);
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

    const authenticated = Boolean(user?.id ?? session?.user?.id);

    return {
      supabase,
      session,
      user,
      loading,
      roleLoading,
      isAuthenticated: authenticated,
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
