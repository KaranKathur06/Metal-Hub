"use client";

import { type ReactNode } from "react";
import { MarketplaceAuthShell } from "../auth/MarketplaceAuthShell";
import type { ServerAuthBootstrap } from "@/lib/auth/bootstrap-server-auth";

type MarketplaceProvidersProps = {
  children: ReactNode;
  initialAuth?: ServerAuthBootstrap | null;
};

export function MarketplaceProviders({ children, initialAuth = null }: MarketplaceProvidersProps) {
  return <MarketplaceAuthShell initialAuth={initialAuth}>{children}</MarketplaceAuthShell>;
}
