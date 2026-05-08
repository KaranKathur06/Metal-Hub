"use client";

import { type ReactNode } from "react";
import { MarketplaceAuthShell } from "../auth/MarketplaceAuthShell";

export function MarketplaceProviders({ children }: { children: ReactNode }) {
  return <MarketplaceAuthShell>{children}</MarketplaceAuthShell>;
}
