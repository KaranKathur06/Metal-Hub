// scripts/seeds/rfqs.seed.ts
import { refreshRfqSearchDocuments, SEED_VERSION, slugify, upsertRows } from "./client";

const rfqs = [
    ["titanium-cnc-aerospace-brackets", "Titanium CNC Aerospace Brackets", "Buyer requires precision titanium brackets with CMM reports for aerospace fixture assemblies.", "Bengaluru", "Karnataka", "50 pcs", "₹3L-₹8L", ["aerospace"], ["cnc-machining"], ["titanium"]],
    ["forged-alloy-crankshafts", "Forged Alloy Steel Crankshafts", "Automotive buyer sourcing forged and heat-treated crankshafts with machining allowance.", "Rajkot", "Gujarat", "500 pcs", "₹12L-₹28L", ["automotive"], ["forging", "heat-treatment"], ["alloy-steel"]],
    ["ss-316-process-tanks", "SS 316 Process Tanks", "Chemical processing unit requires stainless steel fabricated process tanks with inspection documentation.", "Surat", "Gujarat", "6 units", "₹18L-₹35L", ["infrastructure", "oil-and-gas"], ["fabrication", "sheet-metal"], ["stainless-steel"]],
    ["copper-busbar-assemblies", "Tin-Plated Copper Busbar Assemblies", "Electrical panel OEM needs copper busbar assemblies with RoHS-compliant finish.", "Mumbai", "Maharashtra", "2,000 pcs", "₹6L-₹14L", ["energy", "electronics"], ["sheet-metal", "machining"], ["copper"]],
    ["nickel-alloy-pressure-nozzles", "Nickel Alloy Pressure Nozzles", "Refinery maintenance team sourcing nickel alloy pressure nozzles for severe service.", "Vadodara", "Gujarat", "80 pcs", "₹10L-₹22L", ["oil-and-gas"], ["machining", "fabrication"], ["nickel-alloys"]],
    ["aluminum-ev-diecast-housings", "Aluminum EV Die Cast Housings", "EV drivetrain supplier requires aluminum pressure die cast housings with machining support.", "Pune", "Maharashtra", "3,000 pcs", "₹20L-₹45L", ["automotive", "electronics"], ["die-casting", "machining"], ["aluminum"]],
    ["marine-stainless-railing-assemblies", "Marine Stainless Railing Assemblies", "Shipyard requires SS 316 welded railing assemblies for offshore vessel retrofit.", "Chennai", "Tamil Nadu", "1 lot", "₹9L-₹18L", ["marine"], ["fabrication", "sheet-metal"], ["stainless-steel"]],
    ["custom-aluminum-heatsink-profiles", "Custom Aluminum Heatsink Profiles", "Electronics manufacturer requires extruded and machined aluminum heatsinks.", "Coimbatore", "Tamil Nadu", "5,000 pcs", "₹7L-₹16L", ["electronics"], ["extrusion", "machining"], ["aluminum"]],
    ["defense-alloy-machined-blocks", "Defense Alloy Machined Blocks", "Defense supplier requires alloy steel CNC machined blocks with heat treatment traceability.", "Faridabad", "Haryana", "300 pcs", "₹15L-₹32L", ["defense"], ["cnc-machining", "heat-treatment"], ["alloy-steel"]],
    ["bridge-gusset-plates-laser-cut", "Laser-Cut Bridge Gusset Plates", "Infrastructure contractor sourcing laser-cut carbon steel gusset plates for bridge fabrication.", "Ahmedabad", "Gujarat", "40 tons", "₹30L-₹60L", ["infrastructure"], ["laser-cutting", "fabrication"], ["carbon-steel"]],
];

export async function seedRfqs(maps: {
    industryMap: Map<string, string>;
    capabilityMap: Map<string, string>;
    productMap: Map<string, string>;
}) {
    const rfqRows = rfqs.map(([seed_reference_slug, title, description, city, state, quantity, budget_range]) => ({
        seed_reference_slug,
        title,
        slug: slugify(String(title)),
        description,
        buyer_company_name: "Seeded Industrial Buyer",
        city,
        state,
        country: "India",
        quantity,
        budget_range,
        required_by: "2026-09-30",
        status: "open",
        verification_status: "verified",
        is_seeded: true,
        seed_version: SEED_VERSION,
        created_by_real_user: false,
        activity_score: 70,
        interaction_count: 12,
        rfq_rank_score: 70,
    }));

    const inserted = await upsertRows("rfqs", rfqRows, "seed_reference_slug");
    const rfqMap = new Map(inserted.map((row: any) => [row.seed_reference_slug, row.id]));

    const rfqIndustries = [];
    const rfqCapabilities = [];
    const rfqProducts = [];

    for (const rfq of rfqs) {
        const [seedReferenceSlug, , , , , , , industrySlugs, capabilitySlugs, productSlugs] = rfq as any[];
        const rfqId = rfqMap.get(seedReferenceSlug);
        if (!rfqId) continue;

        for (const slug of industrySlugs) {
            rfqIndustries.push({ rfq_id: rfqId, industry_id: maps.industryMap.get(slug) });
        }

        for (const slug of capabilitySlugs) {
            rfqCapabilities.push({ rfq_id: rfqId, capability_id: maps.capabilityMap.get(slug) });
        }

        for (const slug of productSlugs) {
            rfqProducts.push({ rfq_id: rfqId, product_id: maps.productMap.get(slug) });
        }
    }

    await upsertRows("rfq_industries", rfqIndustries.filter((x) => x.industry_id), "rfq_id,industry_id");
    await upsertRows("rfq_capabilities", rfqCapabilities.filter((x) => x.capability_id), "rfq_id,capability_id");
    await upsertRows("rfq_products", rfqProducts.filter((x) => x.product_id), "rfq_id,product_id");

    await refreshRfqSearchDocuments([...rfqMap.values()]);

    return { rfqMap };
}