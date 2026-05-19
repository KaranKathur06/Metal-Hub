// scripts/seeds/suppliers.seed.ts
import {
    refreshSupplierSearchDocuments,
    SEED_VERSION,
    slugify,
    supabase,
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

const suppliers: SeedSupplier[] = [
    ["Rajkot Precision Forgings Pvt Ltd", "Rajkot", "Gujarat", "Forged crankshafts and alloy steel components for heavy engineering and automotive OEMs.", "Closed-die forging supplier producing crankshafts, shafts, gear blanks and heat-treated alloy steel components for OEM sourcing teams.", 2009, 85, "24AAECR4109M1Z7", "https://rajkotprecisionforgings.example.com", "verified", 94, 91, "4 hours", true, true, "Forged crankshafts", "Alloy Steel", "250 pcs", "18,000 pcs/month", "₹450-₹4,800 per pc", "Responded to RFQ 2 hours ago", 96, 88, 42, ["automotive", "infrastructure", "energy"], ["forging", "heat-treatment", "machining"], ["alloy-steel", "carbon-steel"], ["iso-9001", "iatf-16949"]],
    ["Ahmedabad AeroCast Components", "Ahmedabad", "Gujarat", "Investment cast stainless and nickel alloy components for aerospace and defense programs.", "Precision foundry specializing in certified investment casting, machining support and batch traceability for aerospace procurement.", 2012, 120, "24AAGCA9120P1Z2", "https://ahmedabadaerocast.example.com", "verified", 91, 89, "6 hours", true, true, "Nickel alloy turbine brackets", "Nickel Alloys", "100 pcs", "9,000 pcs/month", "₹1,200-₹12,500 per pc", "Active this week", 94, 83, 31, ["aerospace", "defense", "energy"], ["casting", "cnc-machining", "heat-treatment"], ["nickel-alloys", "stainless-steel"], ["iso-9001", "as9100"]],
    ["Pune Axis CNC Systems", "Pune", "Maharashtra", "CNC-machined titanium, aluminum and stainless assemblies for aerospace and medical equipment.", "Multi-axis CNC shop with VMC/HMC capacity, CMM inspection and serialized part traceability for precision buyers.", 2015, 76, "27AAICP7715R1Z9", "https://puneaxiscnc.example.com", "verified", 96, 93, "3 hours", true, true, "Titanium aerospace brackets", "Titanium", "50 pcs", "12,000 machine hours/month", "₹900-₹18,000 per pc", "12 inquiries this month", 97, 91, 56, ["aerospace", "medical", "defense"], ["cnc-machining", "machining"], ["titanium", "aluminum", "stainless-steel"], ["iso-9001", "as9100"]],
    ["Chennai Marine Fabricators", "Chennai", "Tamil Nadu", "Stainless and carbon steel fabricated assemblies for marine and offshore infrastructure.", "Heavy fabrication facility producing skids, platforms, frames, ducts and corrosion-resistant structures for marine procurement.", 2006, 210, "33AAECC8206F1Z5", "https://chennaimarinefab.example.com", "verified", 88, 86, "8 hours", true, true, "Offshore skid structures", "Stainless Steel", "2 tons", "600 tons/month", "₹95-₹240 per kg", "Active this week", 92, 76, 28, ["marine", "oil-and-gas", "infrastructure"], ["fabrication", "sheet-metal", "laser-cutting"], ["stainless-steel", "carbon-steel"], ["iso-9001", "iso-14001", "ped"]],
    ["Coimbatore FlowForge Industries", "Coimbatore", "Tamil Nadu", "Forged valve bodies, pump shafts and machined alloy steel parts for process industries.", "Integrated forging and machining supplier serving pump, valve and rotating equipment buyers with heat treatment coordination.", 2004, 160, "33AAECF7304H1Z6", "https://flowforge.example.com", "verified", 90, 88, "5 hours", true, true, "Forged valve bodies", "Alloy Steel", "150 pcs", "22,000 pcs/month", "₹650-₹7,500 per pc", "Responded to RFQ yesterday", 95, 84, 39, ["oil-and-gas", "energy", "marine"], ["forging", "machining", "heat-treatment"], ["alloy-steel", "stainless-steel"], ["iso-9001", "ped"]],
    ["Bengaluru MicroMill Technologies", "Bengaluru", "Karnataka", "High-tolerance CNC milled aluminum and stainless parts for electronics and automation.", "Precision machining supplier for enclosures, heatsinks, fixtures and small batch production with fast engineering feedback.", 2018, 52, "29AAECB6818L1Z4", "https://micromillblr.example.com", "verified", 97, 92, "2 hours", true, true, "Aluminum heatsink housings", "Aluminum", "100 pcs", "8,500 pcs/month", "₹180-₹2,800 per pc", "Responded to RFQ 1 hour ago", 93, 87, 48, ["electronics", "consumer-goods", "medical"], ["cnc-machining", "machining", "sheet-metal"], ["aluminum", "stainless-steel"], ["iso-9001", "rohs"]],
    ["Surat Stainless Works", "Surat", "Gujarat", "Stainless steel sheet metal, tanks and sanitary fabrication for process and consumer industries.", "Fabrication partner for SS 304/316 tanks, panels, covers and assemblies with polishing, welding and inspection support.", 2010, 98, "24AAECS4110K1Z8", "https://suratstainless.example.com", "verified", 89, 87, "6 hours", false, true, "SS 316 process tanks", "Stainless Steel", "500 kg", "280 tons/month", "₹145-₹310 per kg", "7 inquiries this month", 91, 72, 24, ["consumer-goods", "medical", "infrastructure"], ["sheet-metal", "fabrication", "laser-cutting"], ["stainless-steel"], ["iso-9001", "ce"]],
    ["Vadodara Pressure Alloy Systems", "Vadodara", "Gujarat", "Pressure-rated stainless, carbon steel and nickel alloy components for oil, gas and chemical plants.", "Supplier of pressure parts, flanges, nozzles and fabricated assemblies with PED-oriented documentation workflows.", 2001, 240, "24AAECV6201N1Z3", "https://pressurealloy.example.com", "verified", 87, 90, "7 hours", true, true, "Nickel alloy pressure nozzles", "Nickel Alloys", "25 pcs", "14,000 pcs/month", "₹2,500-₹45,000 per pc", "Active this week", 96, 81, 34, ["oil-and-gas", "energy", "infrastructure"], ["fabrication", "machining", "heat-treatment"], ["nickel-alloys", "stainless-steel", "carbon-steel"], ["iso-9001", "ped", "iso-14001"]],
];

const generatedSpecialists: SeedSupplier[] = [
    ["Rajkot Alloy Gear Blanks", "Rajkot", "Gujarat", "Forged alloy steel gear blanks and shafts for transmission manufacturers.", ["automotive", "energy"], ["forging", "machining"], ["alloy-steel", "carbon-steel"], ["iso-9001", "iatf-16949"], "Forged gear blanks"],
    ["Rajkot Heavy Shaft Works", "Rajkot", "Gujarat", "Heat-treated carbon steel shafts for pumps, gearboxes and machinery.", ["automotive", "infrastructure"], ["forging", "heat-treatment"], ["carbon-steel", "alloy-steel"], ["iso-9001"], "Pump transmission shafts"],
    ["Ahmedabad DieCast Mobility", "Ahmedabad", "Gujarat", "Aluminum die cast housings for EV, automotive and appliance supply chains.", ["automotive", "consumer-goods", "electronics"], ["die-casting", "machining"], ["aluminum"], ["iso-9001", "iatf-16949"], "EV motor controller housings"],
    ["Ahmedabad LaserPlate Solutions", "Ahmedabad", "Gujarat", "Laser-cut steel and stainless blanks for fabrication buyers.", ["infrastructure", "consumer-goods"], ["laser-cutting", "sheet-metal"], ["steel", "stainless-steel"], ["iso-9001"], "Laser-cut SS 304 blanks"],
    ["Pune Titanium Motion Components", "Pune", "Maharashtra", "Titanium and stainless motion components for aerospace and robotic systems.", ["aerospace", "medical"], ["cnc-machining"], ["titanium", "stainless-steel"], ["iso-9001", "as9100"], "Titanium actuator clevises"],
    ["Pune AutoForm Sheet Metals", "Pune", "Maharashtra", "Sheet metal brackets, panels and welded assemblies for automotive OEM vendors.", ["automotive", "consumer-goods"], ["sheet-metal", "fabrication"], ["steel", "stainless-steel"], ["iso-9001", "iatf-16949"], "Automotive battery tray brackets"],
    ["Mumbai Nickel Marine Alloys", "Mumbai", "Maharashtra", "Nickel alloy and stainless machined parts for marine and offshore use.", ["marine", "oil-and-gas"], ["machining", "fabrication"], ["nickel-alloys", "stainless-steel"], ["iso-9001", "ped"], "Monel marine fastener sets"],
    ["Mumbai Copper Busbar Works", "Mumbai", "Maharashtra", "Copper busbars, terminals and electrical conductor assemblies.", ["energy", "electronics"], ["laser-cutting", "sheet-metal"], ["copper"], ["iso-9001", "rohs"], "Tin-plated copper busbars"],
    ["Chennai Aerospace Sheet Systems", "Chennai", "Tamil Nadu", "Precision sheet metal and machined aluminum assemblies for aerospace interiors.", ["aerospace", "defense"], ["sheet-metal", "cnc-machining"], ["aluminum", "stainless-steel"], ["iso-9001", "as9100"], "Aircraft seat frame brackets"],
    ["Chennai Valve Body Castings", "Chennai", "Tamil Nadu", "Stainless and carbon steel cast valve bodies for process equipment.", ["oil-and-gas", "energy"], ["casting", "machining"], ["stainless-steel", "carbon-steel"], ["iso-9001", "ped"], "Cast valve bodies"],
    ["Coimbatore Pump Rotor Machining", "Coimbatore", "Tamil Nadu", "Precision machined pump rotors, impellers and shafts.", ["energy", "oil-and-gas"], ["cnc-machining", "machining"], ["stainless-steel", "alloy-steel"], ["iso-9001"], "SS 316 pump impellers"],
    ["Coimbatore Aluminum Extrusion Tech", "Coimbatore", "Tamil Nadu", "Custom aluminum profiles and machined extrusion assemblies.", ["electronics", "consumer-goods"], ["extrusion", "machining"], ["aluminum"], ["iso-9001", "rohs"], "Custom aluminum heat sink profiles"],
    ["Bengaluru Defense Precision Works", "Bengaluru", "Karnataka", "Defense-grade CNC components with inspection and traceability workflows.", ["defense", "aerospace"], ["cnc-machining", "heat-treatment"], ["alloy-steel", "titanium"], ["iso-9001", "as9100"], "Defense optical mount housings"],
    ["Bengaluru Electronics Enclosure Fab", "Bengaluru", "Karnataka", "Sheet metal and aluminum enclosures for electronics and industrial controls.", ["electronics", "consumer-goods"], ["sheet-metal", "laser-cutting"], ["aluminum", "stainless-steel"], ["iso-9001", "rohs"], "IP-rated control enclosures"],
    ["Vadodara PetroFab Engineers", "Vadodara", "Gujarat", "Fabricated skids, pipe supports and pressure assemblies for petrochemical plants.", ["oil-and-gas", "infrastructure"], ["fabrication", "sheet-metal"], ["carbon-steel", "stainless-steel"], ["iso-9001", "ped"], "Process skid modules"],
    ["Vadodara Alloy HeatTreat Services", "Vadodara", "Gujarat", "Heat treatment and stress relieving for alloy steel industrial components.", ["automotive", "energy"], ["heat-treatment", "machining"], ["alloy-steel", "carbon-steel"], ["iso-9001"], "Hardened gear shafts"],
    ["Surat Brass Precision Parts", "Surat", "Gujarat", "Brass turned parts, fittings and small precision hardware.", ["electronics", "consumer-goods"], ["machining", "cnc-machining"], ["brass", "copper"], ["iso-9001", "rohs"], "Brass electrical terminals"],
    ["Surat Sheet Metal Appliances", "Surat", "Gujarat", "Sheet metal panels and stainless assemblies for appliance manufacturers.", ["consumer-goods"], ["sheet-metal", "laser-cutting"], ["stainless-steel", "steel"], ["iso-9001"], "Appliance stainless panels"],
    ["Faridabad Heavy Fabrication Cluster", "Faridabad", "Haryana", "Heavy welded frames and machine bases for industrial equipment.", ["infrastructure", "energy"], ["fabrication", "machining"], ["carbon-steel", "steel"], ["iso-9001"], "CNC machine base frames"],
    ["Faridabad Automotive Forgeline", "Faridabad", "Haryana", "Forged steering and suspension components for automotive Tier suppliers.", ["automotive"], ["forging", "heat-treatment", "machining"], ["alloy-steel"], ["iso-9001", "iatf-16949"], "Forged suspension knuckles"],
    ["Ahmedabad CopperTech Conductors", "Ahmedabad", "Gujarat", "Copper conductors, busbars and laminated electrical assemblies.", ["energy", "electronics"], ["sheet-metal", "machining"], ["copper"], ["iso-9001", "rohs"], "Laminated copper busbar stacks"],
    ["Pune Stainless Flange Makers", "Pune", "Maharashtra", "SS 304 and SS 316 flanges, rings and machined fittings.", ["oil-and-gas", "infrastructure"], ["cnc-machining", "machining"], ["stainless-steel"], ["iso-9001", "ped"], "SS 316 machined flanges"],
    ["Rajkot FoundryTech Castings", "Rajkot", "Gujarat", "Cast iron, carbon steel and alloy castings for industrial machinery.", ["infrastructure", "automotive"], ["casting", "machining"], ["steel", "carbon-steel"], ["iso-9001"], "Machined industrial cast housings"],
    ["Chennai Nickel Alloy Process Parts", "Chennai", "Tamil Nadu", "Nickel alloy process equipment parts for chemical and offshore buyers.", ["oil-and-gas", "marine"], ["machining", "fabrication"], ["nickel-alloys"], ["iso-9001", "ped"], "Inconel process sleeves"],
    ["Coimbatore Medical Micro CNC", "Coimbatore", "Tamil Nadu", "Small-format stainless and titanium CNC components for medical equipment.", ["medical"], ["cnc-machining"], ["titanium", "stainless-steel"], ["iso-9001"], "Titanium surgical instrument blanks"],
    ["Bengaluru Robotics Aluminum Works", "Bengaluru", "Karnataka", "Lightweight aluminum machined parts for robotics and automation.", ["electronics", "consumer-goods"], ["cnc-machining", "extrusion"], ["aluminum"], ["iso-9001", "rohs"], "Robotic arm aluminum links"],
    ["Mumbai Marine Stainless Fabricators", "Mumbai", "Maharashtra", "Marine-grade stainless ladders, brackets and welded assemblies.", ["marine", "infrastructure"], ["fabrication", "sheet-metal"], ["stainless-steel"], ["iso-9001", "ce"], "Marine SS railing assemblies"],
    ["Vadodara Carbon Steel Structures", "Vadodara", "Gujarat", "Carbon steel structural fabrication for energy and infrastructure projects.", ["energy", "infrastructure"], ["fabrication", "laser-cutting"], ["carbon-steel", "steel"], ["iso-9001"], "Power plant support structures"],
    ["Surat Titanium Dental Components", "Surat", "Gujarat", "Titanium precision components for dental and medical device supply chains.", ["medical"], ["cnc-machining", "machining"], ["titanium"], ["iso-9001"], "Titanium dental abutment blanks"],
    ["Pune EV Aluminum DieCast", "Pune", "Maharashtra", "Aluminum pressure die cast components for EV drivetrain and battery systems.", ["automotive", "electronics"], ["die-casting", "machining"], ["aluminum"], ["iso-9001", "iatf-16949"], "EV inverter housings"],
    ["Rajkot Crankshaft ForgeWorks", "Rajkot", "Gujarat", "Alloy steel crankshafts and connecting rod forgings.", ["automotive", "energy"], ["forging", "heat-treatment"], ["alloy-steel"], ["iso-9001", "iatf-16949"], "Forged connecting rods"],
    ["Ahmedabad Infrastructure Plate Fab", "Ahmedabad", "Gujarat", "Steel plate cutting and welded assemblies for metro and bridge contractors.", ["infrastructure"], ["laser-cutting", "fabrication"], ["steel", "carbon-steel"], ["iso-9001"], "Bridge gusset plates"],
    ["Chennai Defense Alloy Machining", "Chennai", "Tamil Nadu", "Defense alloy steel machined components and treated assemblies.", ["defense"], ["cnc-machining", "heat-treatment"], ["alloy-steel"], ["iso-9001"], "Armored vehicle hinge blocks"],
    ["Coimbatore Valve Stem Forge", "Coimbatore", "Tamil Nadu", "Forged and machined valve stems for process industries.", ["oil-and-gas", "energy"], ["forging", "machining"], ["stainless-steel", "alloy-steel"], ["iso-9001", "ped"], "Forged valve stems"],
    ["Bengaluru Aerospace Titanium Labs", "Bengaluru", "Karnataka", "Titanium prototype and production components for aerospace engineering teams.", ["aerospace", "defense"], ["cnc-machining", "machining"], ["titanium"], ["iso-9001", "as9100"], "Titanium avionics brackets"],
    ["Mumbai Alloy Steel Traders", "Mumbai", "Maharashtra", "Alloy steel, stainless and nickel alloy stock supply for industrial buyers.", ["energy", "oil-and-gas"], ["machining"], ["alloy-steel", "stainless-steel", "nickel-alloys"], ["iso-9001", "iec"], "4140 alloy steel rounds"],
    ["Faridabad SheetMetal Defense Systems", "Faridabad", "Haryana", "Sheet metal defense enclosures, brackets and tactical equipment housings.", ["defense", "electronics"], ["sheet-metal", "laser-cutting"], ["aluminum", "stainless-steel"], ["iso-9001"], "Rugged defense enclosures"],
    ["Surat Copper Brass Components", "Surat", "Gujarat", "Copper and brass fittings for electrical and consumer hardware buyers.", ["electronics", "consumer-goods"], ["machining"], ["copper", "brass"], ["iso-9001", "rohs"], "Brass cable gland bodies"],
    ["Vadodara Renewable Steel Systems", "Vadodara", "Gujarat", "Fabricated steel components for solar, wind and electrical infrastructure.", ["energy", "infrastructure"], ["fabrication", "laser-cutting"], ["steel", "aluminum"], ["iso-9001", "iso-14001"], "Solar mounting steel structures"],
    ["Pune Medical Stainless Assemblies", "Pune", "Maharashtra", "Stainless assemblies and precision parts for medical equipment builders.", ["medical"], ["sheet-metal", "cnc-machining"], ["stainless-steel"], ["iso-9001", "ce"], "Medical equipment SS frames"],
    ["Chennai Aluminum Extrusion Marine", "Chennai", "Tamil Nadu", "Aluminum profiles and fabricated parts for marine and transport applications.", ["marine", "infrastructure"], ["extrusion", "fabrication"], ["aluminum"], ["iso-9001"], "Marine aluminum channel profiles"],
    ["Coimbatore Industrial Pump Castings", "Coimbatore", "Tamil Nadu", "Pump casings and cast components for industrial fluid systems.", ["energy", "oil-and-gas"], ["casting", "machining"], ["stainless-steel", "carbon-steel"], ["iso-9001"], "Pump casing castings"],
].map(([company_name, city, state, short_description, industries, capabilities, products, certifications, featured_product], index) => ({
    company_name,
    city,
    state,
    short_description,
    full_description: `${short_description} Seeded with relational taxonomy, compliance metadata and industrial procurement signals for MetalHub supplier discovery.`,
    established_year: 2000 + (index % 20),
    employee_count: 42 + index * 4,
    gst_like_identifier: `MHSEED${String(index + 101).padStart(4, "0")}Z${index % 9}`,
    website: `https://${slugify(company_name)}.example.com`,
    verification_status: index % 5 === 0 ? "pending" : "verified",
    response_rate: 82 + (index % 16),
    completion_rate: 80 + (index % 15),
    avg_response_time: `${2 + (index % 7)} hours`,
    export_capability: index % 3 !== 0,
    domestic_capability: true,
    featured_product,
    featured_material: products[0],
    moq: index % 4 === 0 ? "1 ton" : index % 3 === 0 ? "100 pcs" : "250 pcs",
    production_capacity: index % 2 === 0 ? `${8 + index} tons/month` : `${4000 + index * 250} pcs/month`,
    price_range: index % 2 === 0 ? "₹90-₹320 per kg" : "₹250-₹8,500 per pc",
    recent_activity: index % 3 === 0 ? "Responded to RFQ this week" : `${4 + (index % 15)} inquiries this month`,
    profile_completeness: 82 + (index % 16),
    activity_score: 55 + (index % 35),
    interaction_count: 8 + index,
    industries,
    capabilities,
    products,
    certifications,
}));

const allSuppliers = [...suppliers, ...generatedSpecialists].slice(0, 50);

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
        static_rank_score: 0,
        dynamic_rank_score: supplier.activity_score,
        supplier_rank_score: supplier.activity_score,
        is_seeded: true,
        seed_version: SEED_VERSION,
        is_published: true,
    }));

    const inserted = await upsertRows("suppliers", supplierRows, "slug");
    const supplierMap = new Map(inserted.map((row: any) => [row.slug, row.id]));

    const supplierIndustries = [];
    const supplierCapabilities = [];
    const supplierProducts = [];
    const supplierCertifications = [];

    for (const supplier of allSuppliers) {
        const supplierId = supplierMap.get(slugify(supplier.company_name));
        if (!supplierId) continue;

        for (const slug of supplier.industries) {
            supplierIndustries.push({ supplier_id: supplierId, industry_id: maps.industryMap.get(slug) });
        }

        for (const slug of supplier.capabilities) {
            supplierCapabilities.push({ supplier_id: supplierId, capability_id: maps.capabilityMap.get(slug) });
        }

        for (const slug of supplier.products) {
            supplierProducts.push({ supplier_id: supplierId, product_id: maps.productMap.get(slug) });
        }

        for (const slug of supplier.certifications) {
            supplierCertifications.push({
                supplier_id: supplierId,
                certification_id: maps.certificationMap.get(slug),
                certificate_number: `MH-${slug.toUpperCase()}-${String(supplierId).slice(0, 8)}`,
                issued_by: slug === "as9100" ? "TUV Aerospace Certification" : "Industrial Quality Registrar",
                issued_at: "2023-04-01",
                expires_at: "2027-04-01",
                verification_status: "active",
                document_url: null,
            });
        }
    }

    await upsertRows("supplier_industries", supplierIndustries.filter((x) => x.industry_id), "supplier_id,industry_id");
    await upsertRows("supplier_capabilities", supplierCapabilities.filter((x) => x.capability_id), "supplier_id,capability_id");
    await upsertRows("supplier_products", supplierProducts.filter((x) => x.product_id), "supplier_id,product_id");
    await upsertRows("supplier_certifications", supplierCertifications.filter((x) => x.certification_id), "supplier_id,certification_id,certificate_number");

    await refreshSupplierSearchDocuments([...supplierMap.values()]);

