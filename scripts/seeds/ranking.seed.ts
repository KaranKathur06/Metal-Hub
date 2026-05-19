// scripts/seeds/ranking.seed.ts
import { supabase } from "./client";

export async function seedRankingSettings() {
    const { error } = await supabase
        .from("marketplace_settings_versions")
        .upsert(
            {
                version_name: "Industrial Discovery Ranking v1",
                status: "active",
                is_active: true,
                is_scheduled: false,
                activated_at: new Date().toISOString(),
                notes: "Default seeded marketplace ranking for industrial supplier discovery.",
                seeded_supplier_weight: 0.7,
                seeded_rfq_weight: 0.7,
                real_supplier_boost: 1.5,
                real_rfq_boost: 1.5,
                exact_phrase_boost: 15,
                capability_weight: 10,
                product_weight: 9,
                certification_weight: 6,
                verification_weight: 5,
                activity_weight: 4,
                profile_completeness_weight: 3,
                interaction_weight: 3,
                location_weight: 2,
                supplier_name_weight: 1.5,
                seed_decay_threshold: 100,
                seed_visibility_decay_rate: 0.015,
                minimum_real_threshold: 25,
                maximum_seed_visibility: 100,
            },
            { onConflict: "version_name" },
        );

    if (error) throw new Error(`ranking settings seed failed: ${error.message}`);
}