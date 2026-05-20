/**
 * Phase 2 profile normalization — run against Supabase via DATABASE_URL.
 *
 * Usage:
 *   npx tsx scripts/run-profile-migration.ts
 *   npx tsx scripts/run-profile-migration.ts --limit=50
 */

import { pool } from "./seeds/client";
import { createClient } from "@supabase/supabase-js";
import { runProfileMigration } from "../lib/marketplace/profile-migration";

function parseLimit(): number | undefined {
  const arg = process.argv.find((item) => item.startsWith("--limit="));
  if (!arg) return undefined;
  const value = parseInt(arg.split("=")[1] ?? "", 10);
  return Number.isFinite(value) ? value : undefined;
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.",
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const limit = parseLimit();
  console.log("Running Phase 2 profile migration...", limit ? `(limit ${limit})` : "");

  const stats = await runProfileMigration(supabase, { limit });

  console.log(JSON.stringify(stats, null, 2));

  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
