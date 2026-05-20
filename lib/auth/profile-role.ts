import type { SupabaseClient, User } from "@supabase/supabase-js";
import { normalizeStoredRole, resolveEffectiveRole } from "@/lib/auth/rbac";

export type AppRole = "buyer" | "seller" | "admin" | "super_admin";

export type AuthProfile = {
    id: string;
    email: string | null;
    full_name: string | null;
    role: AppRole;
};

export type HydratedAuthState =
    | {
        status: "unauthenticated";
        user: null;
        profile: null;
        role: null;
    }
    | {
        status: "authenticated";
        user: User;
        profile: AuthProfile;
        role: AppRole;
    };

const ROLE_PRIORITY: Record<AppRole, number> = {
    buyer: 10,
    seller: 20,
    admin: 80,
    super_admin: 100,
};

const VALID_ROLES = new Set<AppRole>(["buyer", "seller", "admin", "super_admin"]);

const ROLE_ALIASES: Record<string, AppRole> = {
    superadmin: "super_admin",
    super_admin: "super_admin",
    manufacturer: "seller",
    distributor: "seller",
    both: "seller",
};

export function normalizeRole(value: unknown): AppRole | null {
    if (typeof value !== "string") return null;
    const normalized = normalizeStoredRole(value);
    if (!VALID_ROLES.has(normalized as AppRole)) return null;
    return normalized as AppRole;
}

export function hasRoleAtLeast(role: AppRole | null, requiredRole: AppRole) {
    if (!role) return false;
    return ROLE_PRIORITY[role] >= ROLE_PRIORITY[requiredRole];
}

export async function getProfileForUser(
    supabase: SupabaseClient,
    userId: string,
): Promise<AuthProfile | null> {
    const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, role")
        .eq("id", userId)
        .single();

    if (error) {
        if (error.code === "PGRST116") return null;
        throw new Error(`Profile role lookup failed: ${error.message}`);
    }

    const role = normalizeRole(data.role) ?? "buyer";

    return {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        role,
    };
}

export async function hydrateAuthState(
    supabase: SupabaseClient,
): Promise<HydratedAuthState> {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
        throw new Error(`Auth user lookup failed: ${userError.message}`);
    }

    if (!user) {
        return {
            status: "unauthenticated",
            user: null,
            profile: null,
            role: null,
        };
    }

    const profile = await getProfileForUser(supabase, user.id);

    if (!profile) {
        const metadataRole =
            normalizeRole(user.app_metadata?.role) ??
            normalizeRole(user.user_metadata?.role) ??
            "buyer";

        return {
            status: "authenticated",
            user,
            profile: {
                id: user.id,
                email: user.email ?? null,
                full_name:
                    typeof user.user_metadata?.full_name === "string"
                        ? user.user_metadata.full_name
                        : null,
                role: metadataRole,
            },
            role: metadataRole,
        };
    }

    return {
        status: "authenticated",
        user,
        profile,
        role: profile.role,
    };
}

export function resolveAuthRole(params: {
    profileRole?: unknown;
    appMetadataRole?: unknown;
    userMetadataRole?: unknown;
}): AppRole {
    const resolved = resolveEffectiveRole(params);
    return normalizeRole(resolved) ?? "buyer";
}

export function getRoleFromJwtLikeClaims(claims: unknown): AppRole | null {
    if (!claims || typeof claims !== "object") return null;

    const record = claims as Record<string, unknown>;
    const appMetadata = record.app_metadata as Record<string, unknown> | undefined;
    const userMetadata = record.user_metadata as Record<string, unknown> | undefined;

    return (
        normalizeRole(appMetadata?.role) ??
        normalizeRole(userMetadata?.role) ??
        normalizeRole(record.role)
    );
}