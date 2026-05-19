// scripts/seeds/activity.seed.ts
import { SEED_VERSION, upsertRows } from "./client";

export async function seedActivity(params: {
    supplierMap: Map<string, string>;
    rfqMap: Map<string, string>;
}) {
    const supplierActivity = [...params.supplierMap.entries()].slice(0, 35).map(([slug, supplier_id], index) => ({
        supplier_id,
        activity_type: index % 3 === 0 ? "rfq_response" : index % 3 === 1 ? "profile_update" : "buyer_inquiry",
        title: index % 3 === 0 ? "Responded to a matched RFQ" : index % 3 === 1 ? "Updated supplier capability profile" : "Received buyer inquiry",
        metadata: { supplier_slug: slug, seed_version: SEED_VERSION },
        activity_score: 30 + (index % 20),
        is_seeded: true,
        seed_version: SEED_VERSION,
        occurred_at: new Date(Date.now() - index * 3_600_000).toISOString(),
    }));

    const rfqActivity = [...params.rfqMap.entries()].map(([slug, rfq_id], index) => ({
        rfq_id,
        activity_type: "supplier_match",
        title: `${4 + index} suppliers matched to RFQ`,
        metadata: { rfq_slug: slug, seed_version: SEED_VERSION },
        activity_score: 35 + index,
        is_seeded: true,
        seed_version: SEED_VERSION,
        occurred_at: new Date(Date.now() - index * 7_200_000).toISOString(),
    }));

    await upsertRows("supplier_activity", supplierActivity, "supplier_id,activity_type,title");
    await upsertRows("rfq_activity", rfqActivity, "rfq_id,activity_type,title");
}