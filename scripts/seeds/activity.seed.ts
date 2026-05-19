import { pool } from "./client";

export async function seedActivity(params: {
    supplierMap: Map<string, string>;
    rfqMap: Map<string, string>;
}) {
    for (const [index, supplierId] of [...params.supplierMap.values()].slice(0, 12).entries()) {
        await pool.query(
            `insert into public.supplier_activity (supplier_id, activity_type, title, is_seeded, occurred_at)
       values ($1, $2, $3, true, $4)`,
            [
                supplierId,
                index % 2 === 0 ? "rfq_response" : "profile_view",
                index % 2 === 0 ? "Responded to buyer RFQ" : "Profile viewed by procurement team",
                new Date(Date.now() - index * 3600_000),
            ],
        );
    }

    for (const [index, rfqId] of [...params.rfqMap.values()].entries()) {
        await pool.query(
            `insert into public.rfq_activity (rfq_id, activity_type, title, is_seeded, occurred_at)
       values ($1, $2, $3, true, $4)`,
            [
                rfqId,
                "quote_received",
                "Supplier quote received on open RFQ",
                new Date(Date.now() - index * 7200_000),
            ],
        );
    }
}
