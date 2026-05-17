export type MarketplaceRole = "buyer" | "seller" | "both" | "admin" | "super_admin" | "moderator" | "supplier_success" | "support_agent" | "finance" | "marketing" | "manufacturer" | "distributor" | "logistics";

export type MarketplaceNavItem = {
  label: string;
  href: string;
  roles?: MarketplaceRole[];
  requiresAuthenticated?: boolean;
};

export const publicAuthNavItems: MarketplaceNavItem[] = [
  {
    label: "Login",
    href: "/login",
  },
  {
    label: "Register",
    href: "/register",
  },
];

export const sharedAuthenticatedNavItems: MarketplaceNavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    requiresAuthenticated: true,
  },
  {
    label: "Settings",
    href: "/settings",
    requiresAuthenticated: true,
  },
  {
    label: "Membership",
    href: "/membership",
    requiresAuthenticated: true,
  },
];

export const sellerNavItems: MarketplaceNavItem[] = [
  {
    label: "Seller Dashboard",
    href: "/seller/dashboard",
    roles: ["seller", "both", "admin"],
    requiresAuthenticated: true,
  },
  {
    label: "Listings",
    href: "/seller/listings",
    roles: ["seller", "both", "admin"],
    requiresAuthenticated: true,
  },
  {
    label: "RFQs",
    href: "/seller/rfqs",
    roles: ["seller", "both", "admin"],
    requiresAuthenticated: true,
  },
  {
    label: "Quotes",
    href: "/seller/quotes",
    roles: ["seller", "both", "admin"],
    requiresAuthenticated: true,
  },
  {
    label: "Analytics",
    href: "/seller/analytics",
    roles: ["seller", "both", "admin"],
    requiresAuthenticated: true,
  },
];

export const buyerNavItems: MarketplaceNavItem[] = [
  {
    label: "Buyer Dashboard",
    href: "/buyer/dashboard",
    roles: ["buyer", "both", "admin"],
    requiresAuthenticated: true,
  },
  {
    label: "Requirements",
    href: "/buyer/requirements",
    roles: ["buyer", "both", "admin"],
    requiresAuthenticated: true,
  },
  {
    label: "Saved Suppliers",
    href: "/buyer/saved-suppliers",
    roles: ["buyer", "both", "admin"],
    requiresAuthenticated: true,
  },
  {
    label: "Orders",
    href: "/buyer/orders",
    roles: ["buyer", "both", "admin"],
    requiresAuthenticated: true,
  },
];

export const supplierSuccessNavItems: MarketplaceNavItem[] = [
  {
    label: "Supplier Operations",
    href: "/ops/suppliers",
    roles: ["supplier_success", "admin"],
    requiresAuthenticated: true,
  },
  {
    label: "Verification Queue",
    href: "/ops/verification",
    roles: ["supplier_success", "admin"],
    requiresAuthenticated: true,
  },
  {
    label: "Onboarding Reviews",
    href: "/ops/onboarding",
    roles: ["supplier_success", "admin"],
    requiresAuthenticated: true,
  },
];

export function getDashboardHref(role: MarketplaceRole | null | undefined) {
  switch (role) {
    case "seller":
    case "manufacturer":
    case "distributor":
    case "logistics":
      return "/seller/dashboard";
    case "buyer":
      return "/buyer/dashboard";
    case "admin":
    case "super_admin":
    case "finance":
    case "marketing":
      return "/admin";
    case "moderator":
    case "support_agent":
      return "/ops";
    case "supplier_success":
      return "/ops/verification";
    case "both":
    default:
      return "/dashboard";
  }
}

export function getAuthenticatedNavItems(role: MarketplaceRole | null | undefined) {
  const normalizedRole = role ?? "buyer";
  if (normalizedRole === "supplier_success") {
    return [
      {
        label: "Verification Queue",
        href: "/ops/verification",
        requiresAuthenticated: true,
      },
      ...sharedAuthenticatedNavItems.filter((item) => item.label !== "Dashboard"),
    ];
  }

  const roleItems = [
    ...sellerNavItems,
    ...buyerNavItems,
    ...supplierSuccessNavItems,
  ].filter((item) => !item.roles || item.roles.includes(normalizedRole));

  return [
    {
      label: "Dashboard",
      href: getDashboardHref(role),
      requiresAuthenticated: true,
    },
    ...roleItems,
    ...sharedAuthenticatedNavItems.filter((item) => item.label !== "Dashboard"),
  ];
}

export function getOnboardingHref(role: MarketplaceRole | null | undefined) {
  switch (role) {
    case "seller":
    case "manufacturer":
    case "distributor":
    case "logistics":
      return "/onboarding/seller";
    case "buyer":
      return "/onboarding/buyer";
    case "both":
      return "/onboarding";
    case "supplier_success":
    case "support_agent":
    case "moderator":
      return "/ops/suppliers";
    case "admin":
    case "super_admin":
    case "finance":
    case "marketing":
      return "/admin";
    default:
      return "/onboarding";
  }
}
