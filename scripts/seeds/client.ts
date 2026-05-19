// scripts/seeds/client.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
}

export const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
});

export const SEED_VERSION = "v1-industrial-foundation";

export function slugify(value: string) {
    return value
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
}

export async function upsertBySlug<T extends { slug: string }>(
    table: string,
    rows: T[],
    select = "id, slug",
) {
    const { data, error } = await supabase
        .from(table)
        .upsert(rows, { onConflict: "slug" })
        .select(select);

    if (error) throw new Error(`${table} seed failed: ${error.message}`);

    return new Map((data ?? []).map((row: any) => [row.slug, row.id]));
}

export async function upsertRows<T extends Record<string, unknown>>(
    table: string,
    rows: T[],
    onConflict: string,
) {
    if (!rows.length) return [];

    const { data, error } = await supabase
        .from(table)
        .upsert(rows, { onConflict })
        .select();

    if (error) throw new Error(`${table} seed failed: ${error.message}`);
    return data ?? [];
}

export async function refreshSupplierSearchDocuments(supplierIds: string[]) {
    for (const id of supplierIds) {
        const { error } = await supabase.rpc("refresh_supplier_search_document", {
            target_supplier_id: id,
        });

        if (error) throw new Error(`supplier search refresh failed: ${error.message}`);
    }
}

export async function refreshRfqSearchDocuments(rfqIds: string[]) {
    for (const id of rfqIds) {
        const { error } = await supabase.rpc("refresh_rfq_search_document", {
            target_rfq_id: id,
        });

        if (error) throw new Error(`rfq search refresh failed: ${error.message}`);
    }
}