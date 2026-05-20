import type { SupabaseClient } from "@supabase/supabase-js";
import { calculateProfileCompletion, SELLER_PROFILE_COMPLETION_SECTIONS } from "./profile-completion";
import {
  applySellerOnboardingPatch,
  type OnboardingSession,
  toOnboardingSessionUpsert,
} from "./onboarding-session";
import { ensureUniqueSlug, slugify } from "./slug";
import { syncMarketplaceSupplierFromCompany } from "./profile-migration";

export type SellerOnboardingCommitResult = {
  companyId: string;
  sellerProfileId: string;
  marketplaceSupplierId: string | null;
  publicSlug: string | null;
  profileCompletionPercent: number;
};

function draftString(payload: Record<string, unknown>, key: string): string | null {
  const value = payload[key];
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function draftStringArray(payload: Record<string, unknown>, key: string): string[] {
  const value = payload[key];
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export async function commitSellerOnboardingSession(
  supabase: SupabaseClient,
  userId: string,
  session: OnboardingSession,
): Promise<SellerOnboardingCommitResult> {
  const payload = session.draftPayload;
  const companyName = draftString(payload, "companyName");

  if (!companyName) {
    throw new Error("Company name is required before committing onboarding.");
  }

  const completion = calculateProfileCompletion(
    {
      companyName,
      businessType: draftString(payload, "businessType"),
      industryId: draftString(payload, "industryId"),
      businessAddress: draftString(payload, "factoryAddress"),
      website: draftString(payload, "website"),
      linkedinUrl: draftString(payload, "linkedinUrl"),
      companySize: draftString(payload, "companySize"),
      yearsInBusiness: draftString(payload, "yearsInBusiness"),
      emailVerified: true,
      countryId: draftString(payload, "countryId"),
      stateId: draftString(payload, "stateId"),
      cityId: draftString(payload, "cityId"),
      factoryAddress: draftString(payload, "factoryAddress"),
      annualProductionCapacity: draftString(payload, "productionCapacity"),
      exportCapability: Boolean(payload.exportCapability),
      certifications: draftString(payload, "certifications"),
      profileImageUrl: draftString(payload, "profileImageUrl"),
      bannerUrl: draftString(payload, "bannerUrl"),
      listingCount: draftString(payload, "listingTitle") ? 1 : 0,
    },
    SELLER_PROFILE_COMPLETION_SECTIONS,
  );

  const slug = await ensureUniqueSlug(companyName, async (candidate) => {
    const { data } = await supabase
      .from("companies")
      .select("id")
      .eq("slug", candidate)
      .limit(1)
      .maybeSingle();
    return Boolean(data);
  });

  const { data: existingCompany } = await supabase
    .from("companies")
    .select("id, slug, marketplace_supplier_id")
    .eq("owner_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const companyPatch = {
    owner_id: userId,
    profile_id: userId,
    name: companyName,
    slug: existingCompany?.slug ?? slug,
    business_type: draftString(payload, "businessType"),
    website: draftString(payload, "website"),
    linkedin_url: draftString(payload, "linkedinUrl"),
    company_size: draftString(payload, "companySize"),
    years_in_business: draftString(payload, "yearsInBusiness")
      ? parseInt(draftString(payload, "yearsInBusiness")!, 10)
      : null,
    annual_production_capacity: draftString(payload, "productionCapacity"),
    export_capability: Boolean(payload.exportCapability),
    country_id: draftString(payload, "countryId"),
    state_id: draftString(payload, "stateId"),
    city_id: draftString(payload, "cityId"),
    factory_address: draftString(payload, "factoryAddress"),
    trust_level: 0,
    verification_status: "pending",
  };

  let companyId = existingCompany?.id ?? null;

  if (companyId) {
    const { error } = await supabase.from("companies").update(companyPatch).eq("id", companyId);
    if (error) throw new Error(`Failed to update company: ${error.message}`);
  } else {
    const { data: created, error } = await supabase
      .from("companies")
      .insert(companyPatch)
      .select("id, slug")
      .single();
    if (error) throw new Error(`Failed to create company: ${error.message}`);
    companyId = created.id;
  }

  const { data: existingSeller } = await supabase
    .from("seller_profiles")
    .select("id")
    .eq("profile_id", userId)
    .maybeSingle();

  const sellerPatch = {
    profile_id: userId,
    company_id: companyId,
    primary_industry_id: draftString(payload, "industryId"),
    production_capacity: draftString(payload, "productionCapacity"),
    certifications: draftString(payload, "certifications")
      ? draftString(payload, "certifications")!.split(",").map((s) => s.trim())
      : [],
    profile_completion_percent: completion.overallPercent,
    verification_status: "pending" as const,
    trust_level: 0,
  };

  let sellerProfileId = existingSeller?.id ?? null;

  if (sellerProfileId) {
    const { error } = await supabase
      .from("seller_profiles")
      .update(sellerPatch)
      .eq("id", sellerProfileId);
    if (error) throw new Error(`Failed to update seller profile: ${error.message}`);
  } else {
    const { data: created, error } = await supabase
      .from("seller_profiles")
      .insert(sellerPatch)
      .select("id")
      .single();
    if (error) throw new Error(`Failed to create seller profile: ${error.message}`);
    sellerProfileId = created.id;
  }

  const capabilityIds = draftStringArray(payload, "manufacturingProcesses");
  if (capabilityIds.length) {
    await supabase.from("company_capabilities").delete().eq("company_id", companyId);
    await supabase.from("company_capabilities").insert(
      capabilityIds.map((taxonomy_id) => ({ company_id: companyId, taxonomy_id })),
    );
  }

  const industryId = draftString(payload, "industryId");
  if (industryId) {
    await supabase.from("company_industries").delete().eq("company_id", companyId);
    await supabase.from("company_industries").insert({ company_id: companyId, taxonomy_id: industryId });
  }

  const listingTitle = draftString(payload, "listingTitle");
  const listingCategoryId = draftString(payload, "listingCategoryId");

  if (listingTitle && listingCategoryId && sellerProfileId) {
    const listingSlug = await ensureUniqueSlug(listingTitle, async (candidate) => {
      const { data } = await supabase
        .from("listings")
        .select("id")
        .eq("slug", candidate)
        .maybeSingle();
      return Boolean(data);
    });

    const { data: existingListing } = await supabase
      .from("listings")
      .select("id")
      .eq("seller_profile_id", sellerProfileId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    const listingPatch = {
      seller_profile_id: sellerProfileId,
      company_id: companyId,
      title: listingTitle,
      slug: listingSlug,
      description: draftString(payload, "specifications") ?? listingTitle,
      moq: draftString(payload, "moq"),
      lead_time: draftString(payload, "leadTime"),
      taxonomy_id: listingCategoryId,
      is_active: true,
    };

    if (existingListing?.id) {
      await supabase.from("listings").update(listingPatch).eq("id", existingListing.id);
    } else {
      await supabase.from("listings").insert(listingPatch);
    }
  }

  await supabase
    .from("profiles")
    .update({
      full_name: draftString(payload, "fullName"),
      phone: draftString(payload, "phone"),
      profile_status: session.isCompleted ? "complete" : "in_progress",
      onboarding_step: 6,
    })
    .eq("id", userId);

  const marketplaceSupplierId = await syncMarketplaceSupplierFromCompany(supabase, companyId);

  const completedSession = {
    ...session,
    isCompleted: true,
    status: "completed" as const,
    completionPercentage: Math.max(session.completionPercentage, completion.overallPercent),
  };

  const upsert = toOnboardingSessionUpsert(completedSession);

  const { data: activeSession } = await supabase
    .from("onboarding_sessions")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "seller")
    .eq("flow_key", "seller_onboarding")
    .eq("status", "active")
    .maybeSingle();

  const sessionId = session.id ?? activeSession?.id;

  if (sessionId) {
    await supabase.from("onboarding_sessions").update(upsert).eq("id", sessionId);
  } else {
    await supabase.from("onboarding_sessions").insert(upsert);
  }

  const { data: company } = await supabase
    .from("companies")
    .select("slug")
    .eq("id", companyId)
    .single();

  return {
    companyId,
    sellerProfileId: sellerProfileId!,
    marketplaceSupplierId,
    publicSlug: company?.slug ?? slugify(companyName),
    profileCompletionPercent: completion.overallPercent,
  };
}

export function buildCommitSessionFromDraft(input: {
  userId: string;
  draftPayload: Record<string, unknown>;
  sessionId?: string;
  skippedSteps?: string[];
}): OnboardingSession {
  const base: OnboardingSession = {
    id: input.sessionId,
    userId: input.userId,
    role: "seller",
    flowKey: "seller_onboarding",
    flowVersion: 1,
    currentStep: "profile_enhancement",
    draftPayload: input.draftPayload,
    completionPercentage: 100,
    lastCompletedStep: "profile_enhancement",
    skippedSteps: input.skippedSteps ?? [],
    skippedStepDetails: {},
    isCompleted: true,
    status: "completed",
  };

  return applySellerOnboardingPatch(base, {
    stepKey: "profile_enhancement",
    values: input.draftPayload,
    markComplete: true,
    developmentTrustMode: true,
  });
}
