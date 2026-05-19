import { slugify, upsertRows } from "./client";

const rfqTemplates = [
    {
        title: "SS 316L flanges for process skid",
        city: "Mumbai",
        state: "Maharashtra",
        quantity: "120 pcs",
        budget_range: "₹8-12 lakh",
        industries: ["oil-and-gas"],
        capabilities: ["machining"],
        products: ["stainless-steel"],
    },
    {
        title: "Forged crankshaft blanks for automotive program",
        city: "Pune",
        state: "Maharashtra",
        quantity: "500 pcs",
        budget_range: "₹25-40 lakh",
        industries: ["automotive"],
        capabilities: ["forging"],
        products: ["alloy-steel"],
    },
    {
        title: "Aluminum heatsink housings for EV inverter",
        city: "Bengaluru",
        state: "Karnataka",
        quantity: "2,000 pcs",
        budget_range: "₹15-22 lakh",
        industries: ["automotive", "electronics"],
        capabilities: ["die-casting", "cnc-machining"],
        products: ["aluminum"],
    },
];

export async function seedRfqs(maps: {
    industryMap: Map<string, string>;
    capabilityMap: Map<string, string>;
    productMap: Map<string, string>;
}) {
    const rfqRows = rfqTemplates.map((rfq, index) => ({
        title: rfq.title,
        slug: slugify(`${rfq.title}-${index + 1}`),
        description: `Open buyer requirement for ${rfq.title} with delivery to ${rfq.city}.`,
        buyer_company_name: `${rfq.city} Industrial Buyers Pvt Ltd`,
        city: rfq.city,
        state: rfq.state,
        country: "India",
        quantity: rfq.quantity,
        budget_range: rfq.budget_range,
        status: "open",
        verification_status: "verified",
        is_seeded: true,
        created_by_real_user: false,
        activity_score: 40 + index * 5,
        interaction_count: 3 + index,
        rfq_rank_score: 45 + index * 4,
    }));

    const inserted = await upsertRows("rfqs", rfqRows, "slug");
    const rfqMap = new Map(inserted.map((row) => [row.slug as string, row.id as string]));

    const rfqIndustries: Array<{ rfq_id: string; industry_id: string }> = [];
    const rfqCapabilities: Array<{ rfq_id: string; capability_id: string }> = [];
    const rfqProducts: Array<{ rfq_id: string; product_id: string }> = [];

    rfqTemplates.forEach((rfq, index) => {
        const rfqId = [...rfqMap.values()][index];
        if (!rfqId) return;

        for (const slug of rfq.industries) {
            const industryId = maps.industryMap.get(slug);
            if (industryId) rfqIndustries.push({ rfq_id: rfqId, industry_id: industryId });
        }
        for (const slug of rfq.capabilities) {
            const capabilityId = maps.capabilityMap.get(slug);
            if (capabilityId) rfqCapabilities.push({ rfq_id: rfqId, capability_id: capabilityId });
        }
        for (const slug of rfq.products) {
            const productId = maps.productMap.get(slug);
            if (productId) rfqProducts.push({ rfq_id: rfqId, product_id: productId });
        }
    });

    await upsertRows("rfq_industries", rfqIndustries, "rfq_id,industry_id");
    await upsertRows("rfq_capabilities", rfqCapabilities, "rfq_id,capability_id");
    await upsertRows("rfq_products", rfqProducts, "rfq_id,product_id");

    return { rfqMap };
}
