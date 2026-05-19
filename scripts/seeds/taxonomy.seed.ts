// scripts/seeds/taxonomy.seed.ts
import { upsertBySlug } from "./client";

export const industries = [
    ["Aerospace", "aerospace", "Aircraft, space, precision flight and mission-critical component procurement.", 10],
    ["Defense", "defense", "Defense manufacturing, armored systems, naval platforms and certified strategic supply.", 20],
    ["Energy", "energy", "Power generation, renewables, electrical infrastructure and industrial energy assets.", 30],
    ["Infrastructure", "infrastructure", "Bridge, rail, metro, construction, water, and heavy civil fabrication supply.", 40],
    ["Automotive", "automotive", "OEM, Tier-1, EV, drivetrain, chassis and precision automotive components.", 50],
    ["Medical", "medical", "Medical devices, surgical equipment, implant-adjacent manufacturing and clean precision work.", 60],
    ["Oil & Gas", "oil-and-gas", "Upstream, refinery, pipeline, pressure systems and corrosion-resistant supply.", 70],
    ["Marine", "marine", "Shipbuilding, offshore structures, propulsion and corrosion-resistant fabrication.", 80],
    ["Consumer Goods", "consumer-goods", "Durable goods, appliances, hardware and finished metal components.", 90],
    ["Electronics", "electronics", "Electrical, enclosure, copper, busbar, thermal and precision electronic components.", 100],
];

export const capabilities = [
    ["Casting", "casting", "Sand, investment and industrial casting for metal components.", 10],
    ["Forging", "forging", "Closed-die, open-die and upset forging for high-strength components.", 20],
    ["Machining", "machining", "General turning, milling and precision machining operations.", 30],
    ["Fabrication", "fabrication", "Welded assemblies, structural fabrication and industrial build-to-print work.", 40],
    ["Laser Cutting", "laser-cutting", "Fiber laser cutting for sheets, plates and precision blanks.", 50],
    ["CNC Machining", "cnc-machining", "VMC, HMC, turning centers and multi-axis CNC production.", 60],
    ["Extrusion", "extrusion", "Aluminum, copper and custom profile extrusion.", 70],
    ["Die Casting", "die-casting", "Aluminum and zinc pressure die casting for repeatable components.", 80],
    ["Heat Treatment", "heat-treatment", "Hardening, tempering, annealing, nitriding and stress relieving.", 90],
    ["Sheet Metal", "sheet-metal", "Bending, punching, forming, welding and enclosure manufacturing.", 100],
];

export const products = [
    ["Steel", "steel", "General-purpose steel products and components.", "ferrous", 10],
    ["Stainless Steel", "stainless-steel", "SS 304, SS 316, duplex and corrosion-resistant stainless products.", "ferrous", 20],
    ["Aluminum", "aluminum", "Aluminum billets, profiles, sheets and machined components.", "non-ferrous", 30],
    ["Copper", "copper", "Copper bars, busbars, terminals, coils and electrical components.", "non-ferrous", 40],
    ["Brass", "brass", "Brass rods, turned parts, fittings and electrical hardware.", "non-ferrous", 50],
    ["Titanium", "titanium", "Titanium stock and precision components for aerospace and medical supply.", "specialty", 60],
    ["Carbon Steel", "carbon-steel", "Carbon steel plates, forgings, shafts and structural components.", "ferrous", 70],
    ["Alloy Steel", "alloy-steel", "EN-series, 4140, 4340 and custom alloy steel components.", "ferrous", 80],
    ["Nickel Alloys", "nickel-alloys", "Inconel, Monel and nickel alloy components for severe service.", "specialty", 90],
];

export const certifications = [
    ["ISO 9001", "iso-9001", "quality", "Quality management system certification.", 95, 85],
    ["IATF 16949", "iatf-16949", "automotive", "Automotive quality management certification.", 92, 95],
    ["AS9100", "as9100", "aerospace", "Aerospace quality management certification.", 98, 100],
    ["ISO 14001", "iso-14001", "environment", "Environmental management system certification.", 80, 65],
    ["PED", "ped", "pressure-equipment", "Pressure Equipment Directive compliance.", 78, 70],
    ["CE", "ce", "product-compliance", "European conformity marking.", 75, 60],
    ["RoHS", "rohs", "electronics", "Restriction of hazardous substances compliance.", 72, 58],
    ["IEC", "iec", "export", "Importer Exporter Code for export readiness.", 70, 55],
    ["BIS", "bis", "india-compliance", "Bureau of Indian Standards registration.", 74, 62],
];

export async function seedTaxonomy() {
    const industryMap = await upsertBySlug(
        "industries",
        industries.map(([name, slug, description, sort_order]) => ({
            name,
            slug,
            description,
            sort_order,
            is_active: true,
        })),
    );

    const capabilityMap = await upsertBySlug(
        "capabilities",
        capabilities.map(([name, slug, description, sort_order]) => ({
            name,
            slug,
            description,
            sort_order,
            is_active: true,
        })),
    );

    const productMap = await upsertBySlug(
        "products",
        products.map(([name, slug, description, product_family, sort_order]) => ({
            name,
            slug,
            description,
            product_family,
            sort_order,
            is_active: true,
        })),
    );

    const certificationMap = await upsertBySlug(
        "certifications",
        certifications.map(([name, slug, category, description, global_recognition_level, business_priority]) => ({
            name,
            slug,
            category,
            description,
            global_recognition_level,
            business_priority,
            is_active: true,
        })),
    );

    return { industryMap, capabilityMap, productMap, certificationMap };
}