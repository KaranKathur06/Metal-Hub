import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildCanonicalPath,
  ensureUniqueSlug,
  slugify,
  type MarketplaceEntityType,
} from "./slug";
import { recordSlugChange } from "./slug-redirect";

export const PROFILE_MIGRATION_DEFAULTS = {
  profile_status: "incomplete" as const,
  trust_level: 0,
  onboarding_step: 1,
  verification_status: "pending" as const,
};

export type ProfileMigrationStats = {
  profilesNormalized: number;
  companiesCreated: number;
  slugsGenerated: number;
  sellerProfilesCreated: number;
  buyerProfilesCreated: number;
  marketplaceSuppliersSynced: number;
  slugRedirectsRecorded: number;
  errors: string[];
};

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
  profile_status?: string | null;
  trust_level?: number | null;
  onboarding_step?: number | null;
  verification_status?: string | null;
};

type CompanyRow = {
  id: string;
  owner_id: string;
  name: string;
  slug: string | null;
  marketplace_supplier_id?: string | null;
  description?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  years_in_business?: number | null;
  export_capability?: boolean | null;
  verification_status?: string | null;
  trust_level?: number | null;
};

function isSellerRole(role: string | null | undefined) {
  return role === "seller" || role === "both" || role === "manufacturer";
}

function isBuyerRole(role: string | null | undefined) {
  return role === "buyer" || role === "both";
}

function mapVerificationToMarketplace(
  status: string | null | undefined,
): "unverified" | "pending" | "verified" | "rejected" | "suspended" {
  if (status === "approved") return "verified";
  if (status === "rejected") return "rejected";
  if (status === "in_review" || status === "pending") return "pending";
  return "unverified";
}

async function slugExistsForCompany(
  supabase: SupabaseClient,
  slug: string,
  excludeCompanyId?: string,
) {
  let query = supabase.from("companies").select("id").eq("slug", slug).limit(1);
  if (excludeCompanyId) query = query.neq("id", excludeCompanyId);
  const { data } = await query.maybeSingle();
  return Boolean(data);
}

async function slugExistsForSupplier(
  supabase: SupabaseClient,
  slug: string,
  excludeSupplierId?: string,
) {
  let query = supabase.from("suppliers").select("id").eq("slug", slug).limit(1);
  if (excludeSupplierId) query = query.neq("id", excludeSupplierId);
  const { data } = await query.maybeSingle();
  return Boolean(data);
}

export async function normalizeUserProfile(
  supabase: SupabaseClient,
  userId: string,
  stats?: ProfileMigrationStats,
): Promise<void> {
  const log = stats ?? createEmptyStats();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, role, profile_status, trust_level, onboarding_step, verification_status",
    )
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profile) {
    log.errors.push(`Profile ${userId}: ${profileError?.message ?? "not found"}`);
    return;
  }

  const row = profile as ProfileRow;
  const patch: Record<string, unknown> = {};

  if (!row.profile_status) patch.profile_status = PROFILE_MIGRATION_DEFAULTS.profile_status;
  if (row.trust_level == null) patch.trust_level = PROFILE_MIGRATION_DEFAULTS.trust_level;
  if (row.onboarding_step == null) patch.onboarding_step = PROFILE_MIGRATION_DEFAULTS.onboarding_step;
  if (!row.verification_status) {
    patch.verification_status = PROFILE_MIGRATION_DEFAULTS.verification_status;
  }

  if (Object.keys(patch).length) {
    const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
    if (error) log.errors.push(`Profile patch ${userId}: ${error.message}`);
    else log.profilesNormalized += 1;
  }

  if (isSellerRole(row.role)) {
    await ensureSellerIdentity(supabase, row, log);
  }

  if (isBuyerRole(row.role)) {
    await ensureBuyerIdentity(supabase, row, log);
  }
}

async function ensureSellerIdentity(
  supabase: SupabaseClient,
  profile: ProfileRow,
  log: ProfileMigrationStats,
) {
  const { data: existingSeller } = await supabase
    .from("seller_profiles")
    .select("id, company_id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  let companyId = existingSeller?.company_id ?? null;

  if (!companyId) {
    const { data: ownedCompany } = await supabase
      .from("companies")
      .select("id, name, slug, marketplace_supplier_id")
      .eq("owner_id", profile.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (ownedCompany) {
      companyId = ownedCompany.id;
    } else {
      const companyName =
        profile.full_name?.trim() || profile.email?.split("@")[0] || "My Company";
      const slug = await ensureUniqueSlug(companyName, (candidate) =>
        slugExistsForCompany(supabase, candidate),
      );

      const { data: created, error } = await supabase
        .from("companies")
        .insert({
          owner_id: profile.id,
          profile_id: profile.id,
          name: companyName,
          slug,
          verification_status: PROFILE_MIGRATION_DEFAULTS.verification_status,
          trust_level: PROFILE_MIGRATION_DEFAULTS.trust_level,
        })
        .select("id, slug")
        .single();

      if (error) {
        log.errors.push(`Company create ${profile.id}: ${error.message}`);
        return;
      }

      companyId = created.id;
      log.companiesCreated += 1;
      log.slugsGenerated += 1;
    }
  }

  if (!existingSeller && companyId) {
    const { error } = await supabase.from("seller_profiles").insert({
      profile_id: profile.id,
      company_id: companyId,
      verification_status: PROFILE_MIGRATION_DEFAULTS.verification_status,
      trust_level: PROFILE_MIGRATION_DEFAULTS.trust_level,
      profile_completion_percent: 0,
    });

    if (error) log.errors.push(`Seller profile ${profile.id}: ${error.message}`);
    else log.sellerProfilesCreated += 1;
  }

  if (companyId) {
    await ensureCompanySlug(supabase, companyId, log);
    await syncMarketplaceSupplierFromCompany(supabase, companyId, log);
  }
}

async function ensureBuyerIdentity(
  supabase: SupabaseClient,
  profile: ProfileRow,
  log: ProfileMigrationStats,
) {
  const { data: existing } = await supabase
    .from("buyer_profiles")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (existing) return;

  const { error } = await supabase.from("buyer_profiles").insert({
    profile_id: profile.id,
    verification_status: PROFILE_MIGRATION_DEFAULTS.verification_status,
    trust_level: PROFILE_MIGRATION_DEFAULTS.trust_level,
    profile_completion_percent: 0,
  });

  if (error) log.errors.push(`Buyer profile ${profile.id}: ${error.message}`);
  else log.buyerProfilesCreated += 1;
}

export async function ensureCompanySlug(
  supabase: SupabaseClient,
  companyId: string,
  log?: ProfileMigrationStats,
): Promise<string | null> {
  const { data: company, error } = await supabase
    .from("companies")
    .select("id, name, slug")
    .eq("id", companyId)
    .maybeSingle();

  if (error || !company) return null;

  if (company.slug) return company.slug;

  const slug = await ensureUniqueSlug(company.name, (candidate) =>
    slugExistsForCompany(supabase, candidate, companyId),
  );

  const { error: updateError } = await supabase
    .from("companies")
    .update({ slug })
    .eq("id", companyId);

  if (updateError) {
    log?.errors.push(`Company slug ${companyId}: ${updateError.message}`);
    return null;
  }

  log && (log.slugsGenerated += 1);
  return slug;
}

export async function syncMarketplaceSupplierFromCompany(
  supabase: SupabaseClient,
  companyId: string,
  log?: ProfileMigrationStats,
): Promise<string | null> {
  const { data: company, error } = await supabase
    .from("companies")
    .select(
      `
      id,
      owner_id,
      name,
      slug,
      description,
      logo_url,
      banner_url,
      years_in_business,
      export_capability,
      verification_status,
      trust_level,
      marketplace_supplier_id,
      response_rate,
      avg_response_hours,
      completion_rate,
      established_year,
      seller_profiles(id)
    `,
    )
    .eq("id", companyId)
    .maybeSingle();

  if (error || !company) {
    log?.errors.push(`Sync supplier ${companyId}: ${error?.message ?? "company missing"}`);
    return null;
  }

  const row = company as CompanyRow & {
    owner_id: string;
    seller_profiles?: Array<{ id: string }> | { id: string } | null;
    response_rate?: number | null;
    avg_response_hours?: number | null;
    completion_rate?: number | null;
    established_year?: number | null;
  };

  const slug =
    row.slug ??
    (await ensureCompanySlug(supabase, companyId, log)) ??
    slugify(row.name);

  const sellerProfiles = Array.isArray(row.seller_profiles)
    ? row.seller_profiles
    : row.seller_profiles
      ? [row.seller_profiles]
      : [];
  const sellerProfileId = sellerProfiles[0]?.id ?? null;

  const years =
    row.years_in_business ??
    (row.established_year
      ? Math.max(0, new Date().getFullYear() - row.established_year)
      : 0);

  const supplierPayload = {
    owner_user_id: row.owner_id,
    company_id: row.id,
    seller_profile_id: sellerProfileId,
    company_name: row.name,
    slug,
    short_description:
      row.description?.trim() ||
      `${row.name} is an industrial supplier on MetalHub.`,
    logo_url: row.logo_url,
    banner_url: row.banner_url,
    city: "India",
    state: "India",
    country: "India",
    verification_status: mapVerificationToMarketplace(row.verification_status),
    response_rate: row.response_rate ?? 85,
    completion_rate: row.completion_rate ?? 90,
    years_in_business: years,
    avg_response_time: row.avg_response_hours
      ? `${row.avg_response_hours} hours`
      : "same day",
    export_capability: row.export_capability ?? false,
    is_seeded: false,
    is_published: true,
  };

  let supplierId = row.marketplace_supplier_id ?? null;

  if (supplierId) {
    const { data: existing } = await supabase
      .from("suppliers")
      .select("id, slug")
      .eq("id", supplierId)
      .maybeSingle();

    if (existing?.slug && existing.slug !== slug) {
      await recordSlugChange(supabase, {
        entityType: "supplier",
        entityId: supplierId,
        oldSlug: existing.slug,
        newSlug: slug,
        canonicalPath: buildCanonicalPath("supplier", slug),
      });
      log && (log.slugRedirectsRecorded += 1);
    }

    const { error: updateError } = await supabase
      .from("suppliers")
      .update(supplierPayload)
      .eq("id", supplierId);

    if (updateError) {
      log?.errors.push(`Supplier update ${supplierId}: ${updateError.message}`);
      return null;
    }
  } else {
    const taken = await slugExistsForSupplier(supabase, slug);
    const finalSlug = taken
      ? await ensureUniqueSlug(row.name, (candidate) =>
          slugExistsForSupplier(supabase, candidate),
        )
      : slug;

    const { data: created, error: insertError } = await supabase
      .from("suppliers")
      .insert({ ...supplierPayload, slug: finalSlug })
      .select("id")
      .single();

    if (insertError) {
      log?.errors.push(`Supplier insert ${companyId}: ${insertError.message}`);
      return null;
    }

    supplierId = created.id;
    log && (log.marketplaceSuppliersSynced += 1);

    await supabase
      .from("companies")
      .update({ marketplace_supplier_id: supplierId })
      .eq("id", companyId);
  }

  return supplierId;
}

export async function runProfileMigration(
  supabase: SupabaseClient,
  options?: { userIds?: string[]; limit?: number },
): Promise<ProfileMigrationStats> {
  const stats = createEmptyStats();

  let query = supabase
    .from("profiles")
    .select("id")
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (options?.userIds?.length) {
    query = query.in("id", options.userIds);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data: profiles, error } = await query;

  if (error) {
    stats.errors.push(error.message);
    return stats;
  }

  for (const profile of profiles ?? []) {
    await normalizeUserProfile(supabase, profile.id, stats);
  }

  return stats;
}

export function createEmptyStats(): ProfileMigrationStats {
  return {
    profilesNormalized: 0,
    companiesCreated: 0,
    slugsGenerated: 0,
    sellerProfilesCreated: 0,
    buyerProfilesCreated: 0,
    marketplaceSuppliersSynced: 0,
    slugRedirectsRecorded: 0,
    errors: [],
  };
}

export async function assignSlugWithHistory(
  supabase: SupabaseClient,
  input: {
    entityType: MarketplaceEntityType;
    entityId: string;
    table: "companies" | "suppliers" | "rfqs";
    name: string;
    currentSlug?: string | null;
  },
): Promise<string> {
  const isTaken = async (candidate: string) => {
    if (input.table === "companies") {
      return slugExistsForCompany(supabase, candidate, input.entityId);
    }
    if (input.table === "suppliers") {
      return slugExistsForSupplier(supabase, candidate, input.entityId);
    }
    const { data } = await supabase
      .from("rfqs")
      .select("id")
      .eq("slug", candidate)
      .neq("id", input.entityId)
      .maybeSingle();
    return Boolean(data);
  };

  const newSlug = await ensureUniqueSlug(input.name, isTaken);
  const canonicalPath = buildCanonicalPath(
    input.entityType === "company" ? "supplier" : input.entityType,
    newSlug,
  );

  if (input.currentSlug && input.currentSlug !== newSlug) {
    await recordSlugChange(supabase, {
      entityType: input.entityType,
      entityId: input.entityId,
      oldSlug: input.currentSlug,
      newSlug,
      canonicalPath,
    });
  }

  await supabase.from(input.table).update({ slug: newSlug }).eq("id", input.entityId);

  return newSlug;
}
