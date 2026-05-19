import { pool } from "./seeds/client";
import { seedActivity } from "./seeds/activity.seed";
import { seedRankingSettings } from "./seeds/ranking.seed";
import { seedRfqs } from "./seeds/rfqs.seed";
import { seedSuppliers } from "./seeds/suppliers.seed";
import { seedTaxonomy } from "./seeds/taxonomy.seed";

async function main() {
    console.info("Seeding MetalHub marketplace...");

    const taxonomyMaps = await seedTaxonomy();
    console.info("Taxonomy seeded.");

    await seedRankingSettings();
    console.info("Ranking settings seeded.");

    const supplierResult = await seedSuppliers(taxonomyMaps);
    console.info(`Suppliers seeded: ${supplierResult.supplierMap.size}`);

    const rfqResult = await seedRfqs(taxonomyMaps);
    console.info(`RFQs seeded: ${rfqResult.rfqMap.size}`);

    await seedActivity({
        supplierMap: supplierResult.supplierMap,
        rfqMap: rfqResult.rfqMap,
    });
    console.info("Marketplace activity seeded.");

    console.info("MetalHub marketplace seed completed.");
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await pool.end();
    });
