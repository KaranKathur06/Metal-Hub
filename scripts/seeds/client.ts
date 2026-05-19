import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { Pool } from "pg";

function loadEnvFile(filename: string) {
    const path = resolve(process.cwd(), filename);
    if (!existsSync(path)) return;

    const content = readFileSync(path, "utf8");
    for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq <= 0) continue;
        const key = trimmed.slice(0, eq).trim();
        let value = trimmed.slice(eq + 1).trim();
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = value;
    }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error(
        "DATABASE_URL is missing. Add it to .env (Supabase → Settings → Database → connection string).",
    );
}

export const pool = new Pool({ connectionString: databaseUrl });

export const SEED_VERSION = "metalhub-marketplace-v1";

export function slugify(value: string) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export async function upsertRows<T extends Record<string, unknown>>(
    table: string,
    rows: T[],
    conflictTarget: string,
): Promise<Array<Record<string, unknown>>> {
    if (!rows.length) return [];

    const columns = Object.keys(rows[0]);
    const values: unknown[] = [];
    const placeholders = rows
        .map((row, rowIndex) => {
            const tuple = columns.map((column, columnIndex) => {
                values.push(row[column]);
                return `$${rowIndex * columns.length + columnIndex + 1}`;
            });
            return `(${tuple.join(", ")})`;
        })
        .join(", ");

    const conflictColumns = conflictTarget.split(",").map((column) => column.trim());
    const updateSet = columns
        .filter((column) => !conflictColumns.includes(column))
        .map((column) => `${column} = excluded.${column}`)
        .join(", ");

    const onConflictClause = updateSet
        ? `do update set ${updateSet}`
        : "do nothing";

    const sql = `
    insert into public.${table} (${columns.join(", ")})
    values ${placeholders}
    on conflict (${conflictTarget}) ${onConflictClause}
    returning *`;

    const { rows: inserted } = await pool.query(sql, values);
    return inserted;
}

export async function refreshSupplierSearchDocuments(supplierIds: string[]) {
    for (const supplierId of supplierIds) {
        await pool.query("select public.refresh_supplier_search_document($1)", [supplierId]);
    }
}
