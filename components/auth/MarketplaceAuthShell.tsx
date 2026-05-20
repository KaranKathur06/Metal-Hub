"use client";

import { type ReactNode } from "react";
import { AuthProvider } from "./AuthProvider";
import type { ServerAuthBootstrap } from "@/lib/auth/bootstrap-server-auth";

type MarketplaceAuthShellProps = {
  children: ReactNode;
  initialAuth?: ServerAuthBootstrap | null;
};

export function MarketplaceAuthShell({ children, initialAuth = null }: MarketplaceAuthShellProps) {
  return <AuthProvider initialAuth={initialAuth}>{children}</AuthProvider>;
}
