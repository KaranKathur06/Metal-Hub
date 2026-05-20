import type { SupabaseClient } from "@supabase/supabase-js";
import {
  BUYER_PROFILE_COMPLETION_SECTIONS,
  calculateProfileCompletion,
} from "./profile-completion";
import { ensureUniqueSlug } from "./slug";

export type BuyerOnboardingCommitResult = {
  companyId: string | null;
  buyerProfileId: string;
  profileCompletionPercent: number;
};

function draftString(payload: Record<string, unknown>, key: string): string | null {
  const value = payload[key];
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export async function commitBuyerOnboarding(
  supabase: SupabaseClient,
  userId: string,
  payload: Record<string, unknown>,
): Promise<BuyerOnboardingCommitResult> {
  const companyName = draftString(payload, "companyName");

  const completion = calculateProfileCompletion(
    {
      companyName: companyName ?? "Buyer",
      emailVerified: true,
      procurementCategoryId: draftString(payload, "procurementCategoryId"),
      annualProcurementVolume: draftString(payload, "annualProcurementVolume"),
      businessType: draftString(payload, "businessType"),
      countryId: draftString(payload, "countryId"),
      stateId: draftString(payload, "stateId"),
      cityId: draftString(payload, "cityId"),
    },
    BUYER_PROFILE_COMPLETION_SECTIONS,
  );

  let companyId: string | null = null;

  if (companyName) {
    const { data: existingCompany } = await supabase
      .from("companies")
      .select("id, slug")
      .eq("owner_id", userId)
      .is("deleted_at", null)
      .limit(1)
      .maybeSingle();

    const slug =
      existingCompany?.slug ??
      (await ensureUniqueSlug(companyName, async (candidate) => {
        const { data } = await supabase
          .from("companies")
          .select("id")
          .eq("slug", candidate)
          .maybeSingle();
        return Boolean(data);
      }));

    if (existingCompany?.id) {
      await supabase
        .from("companies")
        .update({
          name: companyName,
          business_type: draftString(payload, "businessType"),
          country_id: draftString(payload, "countryId"),
          state_id: draftString(payload, "stateId"),
          city_id: draftString(payload, "cityId"),
        })
        .eq("id", existingCompany.id);
      companyId = existingCompany.id;
    } else {
      const { data: created } = await supabase
        .from("companies")
        .insert({
          owner_id: userId,
          profile_id: userId,
          name: companyName,
          slug,
          business_type: draftString(payload, "businessType"),
          country_id: draftString(payload, "countryId"),
          state_id: draftString(payload, "stateId"),
          city_id: draftString(payload, "cityId"),
        })
        .select("id")
        .single();
      companyId = created?.id ?? null;
    }
  }

  const { data: existingBuyer } = await supabase
    .from("buyer_profiles")
    .select("id")
    .eq("profile_id", userId)
    .maybeSingle();

  const buyerPatch = {
    profile_id: userId,
    company_id: companyId,
    primary_procurement_category_id: draftString(payload, "procurementCategoryId"),
    annual_procurement_volume: draftString(payload, "annualProcurementVolume"),
    profile_completion_percent: completion.overallPercent,
    verification_status: "pending" as const,
    trust_level: 1,
  };

  let buyerProfileId = existingBuyer?.id ?? null;

  if (buyerProfileId) {
    await supabase.from("buyer_profiles").update(buyerPatch).eq("id", buyerProfileId);
  } else {
    const { data: created } = await supabase
      .from("buyer_profiles")
      .insert(buyerPatch)
      .select("id")
      .single();
    buyerProfileId = created?.id ?? null;
  }

  if (!buyerProfileId) {
    throw new Error("Failed to save buyer profile");
  }

  await supabase
    .from("profiles")
    .update({
      profile_status: completion.overallPercent >= 60 ? "in_progress" : "incomplete",
      trust_level: 1,
    })
    .eq("id", userId);

  return {
    companyId,
    buyerProfileId,
    profileCompletionPercent: completion.overallPercent,
  };
}
