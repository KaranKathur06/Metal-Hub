import type { AppRole } from "./profile-role";

export const ROLE_HOME_PATH: Record<AppRole, string> = {
    super_admin: "/admin",
    admin: "/admin",
    seller: "/seller/dashboard",
    buyer: "/buyer/dashboard",
};

export const PROTECTED_ROUTE_PREFIXES = [
    "/admin",
    "/dashboard/admin",
    "/dashboard/seller",
    "/dashboard/buyer",
] as const;

export function getHomePathForRole(role: AppRole) {
    return ROLE_HOME_PATH[role];
}

export function getRequiredRoleForPath(pathname: string): AppRole | null {
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
        return "super_admin";
    }

    if (
        pathname === "/dashboard/admin" ||
        pathname.startsWith("/dashboard/admin/")
    ) {
        return "admin";
    }

    if (
        pathname === "/seller" ||
        pathname.startsWith("/seller/") ||
        pathname === "/dashboard/seller" ||
        pathname.startsWith("/dashboard/seller/")
    ) {
        return "seller";
    }

    if (
        pathname === "/buyer" ||
        pathname.startsWith("/buyer/") ||
        pathname === "/dashboard/buyer" ||
        pathname.startsWith("/dashboard/buyer/")
    ) {
        return "buyer";
    }

    return null;
}

const ROLE_LEVEL: Record<AppRole, number> = {
    buyer: 10,
    seller: 20,
    admin: 80,
    super_admin: 100,
};

export function canAccessPath(role: AppRole | null, pathname: string) {
    const requiredRole = getRequiredRoleForPath(pathname);
    if (!requiredRole) return true;
    if (!role) return false;

    return ROLE_LEVEL[role] >= ROLE_LEVEL[requiredRole];
}

export function getSafeRedirectForRole(params: {
    role: AppRole;
    requestedPath?: string | null;
}) {
    const requestedPath = params.requestedPath;

    if (requestedPath && canAccessPath(params.role, requestedPath)) {
        return requestedPath;
    }

    return getHomePathForRole(params.role);
}

export function shouldRedirectAuthenticatedUserFromAuthPage(pathname: string) {
    return (
        pathname === "/login" ||
        pathname === "/signup" ||
        pathname === "/auth/login" ||
        pathname === "/auth/signup"
    );
}   