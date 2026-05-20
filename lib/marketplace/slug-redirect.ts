import type { SupabaseClient } from "@supabase/supabase-js";
import type { MarketplaceEntityType } from "./slug";

export type SlugRedirect = {
  entityType: MarketplaceEntityType;
  entityId: string;
  oldSlug: string;
  newSlug: string;
  redirectPath: string;
};

export async function resolveSlugRedirect(
  supabase: SupabaseClient,
  entityType: MarketplaceEntityType,
  slug: string,
): Promise<SlugRedirect | null> {
  const { data, error } = await supabase
    .from("entity_slug_redirects")
    .select("entity_type, entity_id, old_slug, new_slug, redirect_path")
    .eq("entity_type", entityType)
    .eq("old_slug", slug)
    .maybeSingle();

  if (error || !data) return null;

  return {
    entityType: data.entity_type as MarketplaceEntityType,
    entityId: data.entity_id,
    oldSlug: data.old_slug,
    newSlug: data.new_slug,
    redirectPath: data.redirect_path,
  };
}

export async function recordSlugChange(
  supabase: SupabaseClient,
  input: {
    entityType: MarketplaceEntityType;
    entityId: string;
    oldSlug: string | null;
    newSlug: string;
    canonicalPath: string;
  },
): Promise<void> {
  if (input.oldSlug && input.oldSlug !== input.newSlug) {
    await supabase.from("entity_slug_history").upsert(
      {
        entity_type: input.entityType,
        entity_id: input.entityId,
        slug: input.oldSlug,
        canonical_path: input.canonicalPath,
      },
      { onConflict: "entity_type,slug" },
    );

    await supabase.from("entity_slug_redirects").upsert(
      {
        entity_type: input.entityType,
        entity_id: input.entityId,
        old_slug: input.oldSlug,
        new_slug: input.newSlug,
        redirect_path: input.canonicalPath,
      },
      { onConflict: "entity_type,old_slug" },
    );
  }
}
