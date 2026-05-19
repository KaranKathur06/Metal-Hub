import {
    pool,
    refreshSupplierSearchDocuments,
    slugify,
    upsertRows,
} from "./client";

type SeedSupplier = {
    company_name: string;
    city: string;
    state: string;
    short_description: string;
    full_description: string;
    established_year: number;
    employee_count: number;
    gst_like_identifier: string;
    website: string;
    verification_status: "verified" | "pending" | "unverified";
    response_rate: number;
    completion_rate: number;
    avg_response_time: string;
    export_capability: boolean;
    domestic_capability: boolean;
    featured_product: string;
    featured_material: string;
    moq: string;
    production_capacity: string;
    price_range: string;
    recent_activity: string;
    profile_completeness: number;
    activity_score: number;
    interaction_count: number;
    industries: string[];
    capabilities: string[];
    products: string[];
    certifications: string[];
};

const coreSuppliers: SeedSupplier[] = [
    {
        company_name: "Rajkot Precision Forgings Pvt Ltd",
        city: "Rajkot",
        state: "Gujarat",
        short_description:
            "Forged crankshafts and alloy steel components for heavy engineering and automotive OEMs.",
        full_description:
            "Closed-die forging supplier producing crankshafts, shafts, gear blanks and heat-treated alloy steel components for OEM sourcing teams.",
        established_year: 2009,
        employee_count: 85,
        gst_like_identifier: "24AAECR4109M1Z7",
        website: "https://rajkotprecisionforgings.example.com",
        verification_status: "verified",
        response_rate: 94,
        completion_rate: 91,
        avg_response_time: "4 hours",
        export_capability: true,
        domestic_capability: true,
        featured_product: "Forged crankshafts",
        featured_material: "Alloy Steel",
        moq: "250 pcs",
        production_capacity: "18,000 pcs/month",
        price_range: "₹450-₹4,800 per pc",
        recent_activity: "Responded to RFQ 2 hours ago",
        profile_completeness: 96,
        activity_score: 88,
        interaction_count: 42,
        industries: ["automotive", "infrastructure", "energy"],
        capabilities: ["forging", "heat-treatment", "machining"],
        products: ["alloy-steel", "carbon-steel"],
        certifications: ["iso-9001", "iatf-16949"],
    },
    {
        company_name: "Pune Axis CNC Systems",
        city: "Pune",
        state: "Maharashtra",
        short_description:
            "CNC-machined titanium, aluminum and stainless assemblies for aerospace and medical equipment.",
        full_description:
            "Multi-axis CNC shop with VMC/HMC capacity, CMM inspection and serialized part traceability for precision buyers.",
        established_year: 2015,
        employee_count: 76,
        gst_like_identifier: "27AAICP7715R1Z9",
        website: "https://puneaxiscnc.example.com",
        verification_status: "verified",
        response_rate: 96,
        completion_rate: 93,
        avg_response_time: "3 hours",
        export_capability: true,
        domestic_capability: true,
        featured_product: "Titanium aerospace brackets",
        featured_material: "Titanium",
        moq: "50 pcs",
        production_capacity: "12,000 machine hours/month",
        price_range: "₹900-₹18,000 per pc",
        recent_activity: "12 inquiries this month",
        profile_completeness: 97,
        activity_score: 91,
        interaction_count: 56,
        industries: ["aerospace", "medical", "defense"],
        capabilities: ["cnc-machining", "machining"],
        products: ["titanium", "aluminum", "stainless-steel"],
        certifications: ["iso-9001", "as9100"],
    },
    {
        company_name: "Chennai Marine Fabricators",
        city: "Chennai",
        state: "Tamil Nadu",
        short_description:
            "Stainless and carbon steel fabricated assemblies for marine and offshore infrastructure.",
        full_description:
            "Heavy fabrication facility producing skids, platforms, frames, ducts and corrosion-resistant structures for marine procurement.",
        established_year: 2006,
        employee_count: 210,
        gst_like_identifier: "33AAECC8206F1Z5",
        website: "https://chennaimarinefab.example.com",
        verification_status: "verified",
        response_rate: 88,
        completion_rate: 86,
        avg_response_time: "8 hours",
        export_capability: true,
        domestic_capability: true,
        featured_product: "Offshore skid structures",
        featured_material: "Stainless Steel",
        moq: "2 tons",
        production_capacity: "600 tons/month",
        price_range: "₹95-₹240 per kg",
        recent_activity: "Active this week",
        profile_completeness: 92,
        activity_score: 76,
        interaction_count: 28,
        industries: ["marine", "oil-and-gas", "infrastructure"],
        capabilities: ["fabrication", "sheet-metal", "laser-cutting"],
        products: ["stainless-steel", "carbon-steel"],
        certifications: ["iso-9001", "iso-14001", "ped"],
    },
    {
        company_name: "Bengaluru MicroMill Technologies",
        city: "Bengaluru",
        state: "Karnataka",
        short_description:
            "High-tolerance CNC milled aluminum and stainless parts for electronics and automation.",
        full_description:
            "Precision machining supplier for enclosures, heatsinks, fixtures and small batch production with fast engineering feedback.",
        established_year: 2018,
        employee_count: 52,
        gst_like_identifier: "29AAECB6818L1Z4",
        website: "https://micromillblr.example.com",
        verification_status: "verified",
        response_rate: 97,
        completion_rate: 92,
        avg_response_time: "2 hours",
        export_capability: true,
        domestic_capability: true,
        featured_product: "Aluminum heatsink housings",
        featured_material: "Aluminum",
        moq: "100 pcs",
        production_capacity: "8,500 pcs/month",
        price_range: "₹180-₹2,800 per pc",
        recent_activity: "Responded to RFQ 1 hour ago",
        profile_completeness: 93,
        activity_score: 87,
        interaction_count: 48,
        industries: ["electronics", "consumer-goods", "medical"],
        capabilities: ["cnc-machining", "machining", "sheet-metal"],
        products: ["aluminum", "stainless-steel"],
        certifications: ["iso-9001", "rohs"],
    },
];

const cityProfiles = [
    ["Rajkot", "Gujarat", "forging", "alloy-steel"],
    ["Ahmedabad", "Gujarat", "die-casting", "aluminum"],
    ["Pune", "Maharashtra", "cnc-machining", "stainless-steel"],
    ["Mumbai", "Maharashtra", "fabrication", "nickel-alloys"],
    ["Chennai", "Tamil Nadu", "casting", "carbon-steel"],
    ["Coimbatore", "Tamil Nadu", "machining", "alloy-steel"],
    ["Bengaluru", "Karnataka", "sheet-metal", "aluminum"],
    ["Vadodara", "Gujarat", "heat-treatment", "steel"],
    ["Faridabad", "Haryana", "laser-cutting", "carbon-steel"],
    ["Surat", "Gujarat", "extrusion", "brass"],
] as const;

const industryPool = [
    "automotive",
    "aerospace",
    "energy",
    "infrastructure",
    "oil-and-gas",
    "electronics",
    "defense",
    "medical",
];

function buildGeneratedSuppliers(): SeedSupplier[] {
    const generated: SeedSupplier[] = [];

    for (let index = 0; index < 46; index += 1) {
        const [city, state, capability, product] = cityProfiles[index % cityProfiles.length];
        const company_name = `${city} ${capability.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} Industries ${index + 1}`;
        const established_year = 1998 + (index % 22);

        generated.push({
            company_name,
            city,
            state,
            short_description: `${capability.replace(/-/g, " ")} and ${product.replace(/-/g, " ")} supply for industrial OEM procurement in ${city}.`,
            full_description: `Seeded ${city}-based supplier with relational taxonomy for MetalHub marketplace discovery and RFQ matching.`,
            established_year,
            employee_count: 40 + index * 3,
            gst_like_identifier: `MHSEED${String(index + 101).padStart(4, "0")}Z${index % 9}`,
            website: `https://${slugify(company_name)}.example.com`,
            verification_status: index % 7 === 0 ? "pending" : "verified",
            response_rate: 82 + (index % 16),
            completion_rate: 80 + (index % 15),
            avg_response_time: `${2 + (index % 7)} hours`,
            export_capability: index % 3 !== 0,
            domestic_capability: true,
            featured_product: `${product.replace(/-/g, " ")} components`,
            featured_material: product.replace(/-/g, " "),
            moq: index % 4 === 0 ? "1 ton" : "250 pcs",
            production_capacity: `${8 + index} tons/month`,
            price_range: "₹90-₹8,500 per unit",
            recent_activity:
                index % 3 === 0 ? "Responded to RFQ this week" : `${4 + (index % 12)} inquiries this month`,
            profile_completeness: 82 + (index % 16),
            activity_score: 55 + (index % 35),
            interaction_count: 8 + index,
            industries: [
                industryPool[index % industryPool.length],
                industryPool[(index + 2) % industryPool.length],
            ],
            capabilities: [capability, capability === "forging" ? "heat-treatment" : "machining"],
            products: [product, product === "steel" ? "carbon-steel" : "steel"],
            certifications: index % 2 === 0 ? ["iso-9001", "iatf-16949"] : ["iso-9001"],
        });
    }

    return generated;
}

const allSuppliers = [...coreSuppliers, ...buildGeneratedSuppliers()].slice(0, 50);

export async function seedSuppliers(maps: {
    industryMap: Map<string, string>;
    capabilityMap: Map<string, string>;
    productMap: Map<string, string>;
    certificationMap: Map<string, string>;
}) {
    const supplierRows = allSuppliers.map((supplier) => ({
        company_name: supplier.company_name,
        slug: slugify(supplier.company_name),
        short_description: supplier.short_description,
        full_description: supplier.full_description,
        logo_url: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(supplier.company_name)}`,
        banner_url: null,
        website: supplier.website,
        established_year: supplier.established_year,
        employee_count: supplier.employee_count,
        gst_like_identifier: supplier.gst_like_identifier,
        city: supplier.city,
        state: supplier.state,
        country: "India",
        verification_status: supplier.verification_status,
        response_rate: supplier.response_rate,
        completion_rate: supplier.completion_rate,
        years_in_business: new Date().getFullYear() - supplier.established_year,
        avg_response_time: supplier.avg_response_time,
        export_capability: supplier.export_capability,
        domestic_capability: supplier.domestic_capability,
        featured_product: supplier.featured_product,
        featured_material: supplier.featured_material,
        moq: supplier.moq,
        production_capacity: supplier.production_capacity,
        price_range: supplier.price_range,
        recent_activity: supplier.recent_activity,
        activity_score: supplier.activity_score,
        profile_completeness: supplier.profile_completeness,
        interaction_count: supplier.interaction_count,
        real_interaction_count: 0,
        static_rank_score: supplier.activity_score,
        dynamic_rank_score: supplier.activity_score,
        supplier_rank_score: supplier.activity_score + supplier.profile_completeness / 10,
        is_seeded: true,
        is_published: true,
    }));

    const inserted = await upsertRows("suppliers", supplierRows, "slug");
    const supplierMap = new Map(inserted.map((row) => [row.slug as string, row.id as string]));

    const supplierIndustries: Array<{ supplier_id: string; industry_id: string }> = [];
    const supplierCapabilities: Array<{ supplier_id: string; capability_id: string }> = [];
    const supplierProducts: Array<{ supplier_id: string; product_id: string }> = [];
    const supplierCertifications: Array<Record<string, unknown>> = [];

    for (const supplier of allSuppliers) {
        const supplierId = supplierMap.get(slugify(supplier.company_name));
        if (!supplierId) continue;

        for (const slug of supplier.industries) {
            const industryId = maps.industryMap.get(slug);
            if (industryId) supplierIndustries.push({ supplier_id: supplierId, industry_id: industryId });
        }

        for (const slug of supplier.capabilities) {
            const capabilityId = maps.capabilityMap.get(slug);
            if (capabilityId) {
                supplierCapabilities.push({ supplier_id: supplierId, capability_id: capabilityId });
            }
        }

        for (const slug of supplier.products) {
            const productId = maps.productMap.get(slug);
            if (productId) supplierProducts.push({ supplier_id: supplierId, product_id: productId });
        }

        for (const slug of supplier.certifications) {
            const certificationId = maps.certificationMap.get(slug);
            if (!certificationId) continue;
            supplierCertifications.push({
                supplier_id: supplierId,
                certification_id: certificationId,
                certificate_number: `MH-${slug.toUpperCase()}-${String(supplierId).slice(0, 8)}`,
                issued_by: "Industrial Quality Registrar",
                issued_at: "2023-04-01",
                expires_at: "2027-04-01",
                verification_status: "active",
            });
        }
    }

    await upsertRows("supplier_industries", supplierIndustries, "supplier_id,industry_id");
    await upsertRows("supplier_capabilities", supplierCapabilities, "supplier_id,capability_id");
    await upsertRows("supplier_products", supplierProducts, "supplier_id,product_id");
    await upsertRows(
        "supplier_certifications",
        supplierCertifications,
        "supplier_id,certification_id,certificate_number",
    );

    await refreshSupplierSearchDocuments([...supplierMap.values()]);

    return { supplierMap };
}
