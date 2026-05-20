import type { SupabaseClient } from "@supabase/supabase-js";
import { ensureUniqueSlug } from "./slug";

export type CreateRfqInput = {
  buyerProfileId: string;
  buyerUserId: string;
  title: string;
  description?: string | null;
  quantity?: string | null;
  unit?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  deliveryLocation?: string | null;
  deliveryTimeline?: string | null;
  qualitySpecs?: string | null;
  taxonomyId?: string | null;
  companyId?: string | null;
  industryId?: string | null;
};

function formatBudgetRange(min?: number | null, max?: number | null, currency = "INR") {
  if (min != null && max != null) {
    return `${currency} ${min.toLocaleString("en-IN")} – ${max.toLocaleString("en-IN")}`;
  }
  if (min != null) return `${currency} ${min.toLocaleString("en-IN")}+`;
  if (max != null) return `Up to ${currency} ${max.toLocaleString("en-IN")}`;
  return null;
}

function buildDescription(input: CreateRfqInput) {
  const parts = [input.description?.trim()].filter(Boolean) as string[];

  if (input.qualitySpecs?.trim()) {
    parts.push(`Technical specs: ${input.qualitySpecs.trim()}`);
  }

  if (input.unit && input.quantity) {
    parts.push(`Unit: ${input.unit}`);
  }

  return parts.join("\n\n") || input.title;
}

export async function createMarketplaceRfq(
  supabase: SupabaseClient,
  input: CreateRfqInput,
) {
  const slug = await ensureUniqueSlug(input.title, async (candidate) => {
    const { data } = await supabase
      .from("rfqs")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    return Boolean(data);
  });

  const quantityLabel =
    input.quantity && input.unit
      ? `${input.quantity} ${input.unit}`
      : input.quantity ?? null;

  const locationParts = (input.deliveryLocation ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const payload: Record<string, unknown> = {
    buyer_profile_id: input.buyerProfileId,
    buyer_user_id: input.buyerUserId,
    title: input.title.trim(),
    slug,
    description: buildDescription(input),
    quantity: quantityLabel,
    budget_range: formatBudgetRange(input.budgetMin, input.budgetMax),
    delivery_timeline: input.deliveryTimeline ?? null,
    city: locationParts[0] ?? input.deliveryLocation ?? null,
    state: locationParts[1] ?? null,
    country: "India",
    status: "open",
    visibility_level: "standard",
    created_by_real_user: true,
    is_seeded: false,
    taxonomy_id: input.taxonomyId ?? null,
    company_id: input.companyId ?? null,
  };

  const { data, error } = await supabase
    .from("rfqs")
    .insert(payload)
    .select("id, title, slug, status, created_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (input.industryId) {
    const { data: industry } = await supabase
      .from("industries")
      .select("id")
      .eq("id", input.industryId)
      .maybeSingle();

    if (industry?.id) {
      await supabase.from("rfq_industries").insert({
        rfq_id: data.id,
        industry_id: industry.id,
      });
    }
  }

  return data;
}
