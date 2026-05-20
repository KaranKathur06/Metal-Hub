import type { SupabaseClient } from "@supabase/supabase-js";
import type { MarketplaceSupplier } from "./supplier-query";

export type SupplierIdentityTrust = {
  trustLevel: 0 | 1 | 2 | 3 | 4;
  trustScore: number;
  verificationStatus: string | null;
  responseTimeHours: number | null;
  certificationLabels: string[];
};

const DEFAULT_TRUST: SupplierIdentityTrust = {
  trustLevel: 0,
  trustScore: 0,
  verificationStatus: null,
  responseTimeHours: null,
  certificationLabels: [],
};

export async function enrichSupplierWithIdentityTrust(
  supabase: SupabaseClient,
  supplier: MarketplaceSupplier,
): Promise<MarketplaceSupplier & SupplierIdentityTrust> {
  const { data: row, error } = await supabase
    .from("suppliers")
    .select(
      `
      company_id,
      seller_profile_id,
      seller_profiles(
        trust_level,
        response_time_hours,
        verification_status,
        certifications
      ),
      companies(
        trust_level,
        verification_status,
        avg_response_hours
      )
    `,
    )
    .eq("id", supplier.id)
    .maybeSingle();

  if (error || !row) {
    return {
      ...supplier,
      ...DEFAULT_TRUST,
      certificationLabels: supplier.certifications.map((cert) => cert.name),
    };
  }

  const sellerProfile = Array.isArray(row?.seller_profiles)
    ? row?.seller_profiles[0]
    : row?.seller_profiles;
  const company = Array.isArray(row?.companies) ? row?.companies[0] : row?.companies;

  const trustLevel = Math.min(
    4,
    Math.max(
      0,
      (sellerProfile?.trust_level ?? company?.trust_level ?? 0) as number,
    ),
  ) as 0 | 1 | 2 | 3 | 4;

  const trustScore = trustLevel * 20;
  const verificationStatus =
    sellerProfile?.verification_status ?? company?.verification_status ?? null;

  const responseTimeHours =
    sellerProfile?.response_time_hours ?? company?.avg_response_hours ?? null;

  const certificationLabels = Array.isArray(sellerProfile?.certifications)
    ? sellerProfile.certifications.filter((item): item is string => typeof item === "string")
    : supplier.certifications.map((cert) => cert.name);

  return {
    ...supplier,
    trustLevel,
    trustScore,
    verificationStatus,
    responseTimeHours,
    certificationLabels,
  };
}
