import { pool, upsertRows } from "./client";

const industries = [
    ["Aerospace", "aerospace"],
    ["Defense", "defense"],
    ["Energy", "energy"],
    ["Infrastructure", "infrastructure"],
    ["Automotive", "automotive"],
    ["Medical", "medical"],
    ["Oil & Gas", "oil-and-gas"],
    ["Marine", "marine"],
    ["Consumer Goods", "consumer-goods"],
    ["Electronics", "electronics"],
];

const capabilities = [
    ["Casting", "casting"],
    ["Forging", "forging"],
    ["Machining", "machining"],
    ["CNC Machining", "cnc-machining"],
    ["Fabrication", "fabrication"],
    ["Laser Cutting", "laser-cutting"],
    ["Extrusion", "extrusion"],
    ["Die Casting", "die-casting"],
    ["Heat Treatment", "heat-treatment"],
    ["Sheet Metal", "sheet-metal"],
];

const products = [
    ["Steel", "steel", "Ferrous"],
    ["Stainless Steel", "stainless-steel", "Ferrous"],
    ["Aluminum", "aluminum", "Non-Ferrous"],
    ["Copper", "copper", "Non-Ferrous"],
    ["Brass", "brass", "Non-Ferrous"],
    ["Titanium", "titanium", "Specialty"],
    ["Carbon Steel", "carbon-steel", "Ferrous"],
    ["Alloy Steel", "alloy-steel", "Ferrous"],
    ["Nickel Alloys", "nickel-alloys", "Specialty"],
];

const certifications = [
    ["ISO 9001", "iso-9001", 90, 80],
    ["IATF 16949", "iatf-16949", 85, 75],
    ["AS9100", "as9100", 95, 90],
    ["ISO 14001", "iso-14001", 70, 65],
    ["PED", "ped", 80, 70],
    ["RoHS", "rohs", 60, 55],
    ["CE", "ce", 65, 60],
    ["IEC", "iec", 55, 50],
];

export async function seedTaxonomy() {
    await pool.query(`
    create extension if not exists pgcrypto;
  `);

    const industryRows = industries.map(([name, slug], index) => ({
        name,
        slug,
        is_active: true,
        sort_order: (index + 1) * 10,
    }));

    const capabilityRows = capabilities.map(([name, slug], index) => ({
        name,
        slug,
        is_active: true,
        sort_order: (index + 1) * 10,
    }));

    const productRows = products.map(([name, slug, family], index) => ({
        name,
        slug,
        product_family: family,
        is_active: true,
        sort_order: (index + 1) * 10,
    }));

    const certificationRows = certifications.map(
        ([name, slug, business_priority, global_recognition_level]) => ({
            name,
            slug,
            business_priority,
            global_recognition_level,
            is_active: true,
        }),
    );

    const [insertedIndustries, insertedCapabilities, insertedProducts, insertedCertifications] =
        await Promise.all([
            upsertRows("industries", industryRows, "slug"),
            upsertRows("capabilities", capabilityRows, "slug"),
            upsertRows("products", productRows, "slug"),
            upsertRows("certifications", certificationRows, "slug"),
        ]);

    return {
        industryMap: new Map(insertedIndustries.map((row) => [row.slug as string, row.id as string])),
        capabilityMap: new Map(
            insertedCapabilities.map((row) => [row.slug as string, row.id as string]),
        ),
        productMap: new Map(insertedProducts.map((row) => [row.slug as string, row.id as string])),
        certificationMap: new Map(
            insertedCertifications.map((row) => [row.slug as string, row.id as string]),
        ),
    };
}
