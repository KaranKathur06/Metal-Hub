import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hydrateAuthState } from "@/lib/auth/profile-role";

type RankingSnapshot = {
    id: string;
    settings_version_id: string | null;
    supplier_count: number;
    rfq_count: number;
    notes: string | null;
    snapshot_data_json: {
        suppliers?: Array<{
            id: string;
            company_name: string;
            slug: string;
            city: string;
            verification_status: string;
            is_seeded: boolean;
            supplier_rank_score: number;
            profile_completeness: number;
            interaction_count: number;
            activity_score: number;
        }>;
    };
    created_at: string;
};

type SettingsVersion = {
    id: string;
    version_name: string;
    status: string;
    is_active: boolean;
    exact_phrase_boost: number;
    capability_weight: number;
    product_weight: number;
    certification_weight: number;
    verification_weight: number;
    activity_weight: number;
    profile_completeness_weight: number;
    interaction_weight: number;
    seeded_supplier_weight: number;
    real_supplier_boost: number;
};

export default async function RankingPreviewPage() {
    const supabase = createClient();
    if (!supabase) redirect("/login");
    const auth = await hydrateAuthState(supabase);

    if (auth.status === "unauthenticated") redirect("/login");
    if (auth.role !== "super_admin") redirect("/buyer/dashboard");

    const [settingsResult, snapshotsResult] = await Promise.all([
        supabase
            .from("marketplace_settings_versions")
            .select("*")
            .order("created_at", { ascending: false }),
        supabase
            .from("marketplace_ranking_snapshots")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10),
    ]);

    if (settingsResult.error) {
        throw new Error(`Settings load failed: ${settingsResult.error.message}`);
    }

    if (snapshotsResult.error) {
        throw new Error(`Snapshots load failed: ${snapshotsResult.error.message}`);
    }

    const versions = (settingsResult.data ?? []) as SettingsVersion[];
    const snapshots = (snapshotsResult.data ?? []) as RankingSnapshot[];
    const latestSnapshot = snapshots[0] ?? null;

    return (
        <main className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-8">
            <div className="flex flex-col gap-4 border-b border-zinc-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-zinc-950">
                        Ranking Preview
                    </h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
                        Capture frozen supplier snapshots and preview marketplace ranking
                        behavior against deterministic data before activating a settings version.
                    </p>
                </div>

                <form action={createRankingSnapshot}>
                    <button className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800">
                        Create Snapshot
                    </button>
                </form>
            </div>

            <section className="grid gap-4 lg:grid-cols-[320px_1fr]">
                <aside className="rounded-lg border border-zinc-200 bg-white p-4">
                    <h2 className="text-sm font-semibold text-zinc-950">Snapshots</h2>
                    <div className="mt-3 grid gap-2">
                        {snapshots.map((snapshot) => (
                            <div
                                key={snapshot.id}
                                className="rounded-md border border-zinc-200 p-3 text-sm"
                            >
                                <div className="font-medium text-zinc-950">
                                    {formatDate(snapshot.created_at)}
                                </div>
                                <div className="mt-1 text-xs text-zinc-500">
                                    {snapshot.supplier_count} suppliers • {snapshot.rfq_count} RFQs
                                </div>
                                {snapshot.notes ? (
                                    <div className="mt-2 text-xs text-zinc-600">{snapshot.notes}</div>
                                ) : null}
                            </div>
                        ))}

                        {!snapshots.length ? (
                            <p className="text-sm text-zinc-500">No ranking snapshots yet.</p>
                        ) : null}
                    </div>
                </aside>

                <section className="grid gap-4">
                    {versions.map((version) => {
                        const simulated = latestSnapshot
                            ? simulateSnapshotRanking(latestSnapshot, version)
                            : [];

                        return (
                            <article
                                key={version.id}
                                className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
                            >
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="font-semibold text-zinc-950">
                                            {version.version_name}
                                        </h2>
                                        <p className="text-sm text-zinc-500">
                                            {version.status}
                                            {version.is_active ? " • active" : ""}
                                        </p>
                                    </div>
                                    <div className="text-sm text-zinc-500">
                                        Previewing {simulated.length} suppliers
                                    </div>
                                </div>

                                <div className="mt-4 overflow-hidden rounded-md border border-zinc-200">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-zinc-50 text-xs uppercase tracking-normal text-zinc-500">
                                            <tr>
                                                <th className="px-3 py-2">Rank</th>
                                                <th className="px-3 py-2">Supplier</th>
                                                <th className="px-3 py-2">Location</th>
                                                <th className="px-3 py-2">Trust</th>
                                                <th className="px-3 py-2">Seeded</th>
                                                <th className="px-3 py-2 text-right">Score</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {simulated.slice(0, 12).map((supplier, index) => (
                                                <tr key={supplier.id} className="border-t border-zinc-100">
                                                    <td className="px-3 py-2 font-medium text-zinc-950">
                                                        #{index + 1}
                                                    </td>
                                                    <td className="px-3 py-2">{supplier.company_name}</td>
                                                    <td className="px-3 py-2 text-zinc-600">{supplier.city}</td>
                                                    <td className="px-3 py-2 capitalize text-zinc-600">
                                                        {supplier.verification_status}
                                                    </td>
                                                    <td className="px-3 py-2 text-zinc-600">
                                                        {supplier.is_seeded ? "Yes" : "No"}
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-medium">
                                                        {supplier.preview_score.toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}

                                            {!simulated.length ? (
                                                <tr>
                                                    <td colSpan={6} className="px-3 py-8 text-center text-sm text-zinc-500">
                                                        Create a snapshot to preview ranking behavior.
                                                    </td>
                                                </tr>
                                            ) : null}
                                        </tbody>
                                    </table>
                                </div>
                            </article>
                        );
                    })}
                </section>
            </section>
        </main>
    );
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

function simulateSnapshotRanking(snapshot: RankingSnapshot, version: SettingsVersion) {
    const suppliers = snapshot.snapshot_data_json.suppliers ?? [];

    return suppliers
        .map((supplier) => {
            const verificationBoost =
                supplier.verification_status === "verified"
                    ? version.verification_weight
                    : 0;
            const preview_score =
                supplier.supplier_rank_score +
                verificationBoost +
                (supplier.profile_completeness / 100) * version.profile_completeness_weight +
                Math.log1p(supplier.interaction_count) * version.interaction_weight +
                supplier.activity_score * version.activity_weight;

            return { ...supplier, preview_score };
        })
        .sort((a, b) => b.preview_score - a.preview_score);
}

async function requireSuperadmin() {
    "use server";

    const supabase = createClient();
    if (!supabase) redirect("/login");
    const auth = await hydrateAuthState(supabase);

    if (auth.status === "unauthenticated") redirect("/login");
    if (auth.role !== "super_admin") redirect("/buyer/dashboard");

    return { supabase, auth };
}

async function createRankingSnapshot() {
    "use server";

    const { supabase, auth } = await requireSuperadmin();

    const { data: suppliers, error: suppliersError } = await supabase
        .from("suppliers")
        .select(
            "id, company_name, slug, city, verification_status, is_seeded, supplier_rank_score, profile_completeness, interaction_count, activity_score",
        )
        .eq("is_published", true)
        .order("supplier_rank_score", { ascending: false })
        .limit(100);

    if (suppliersError) {
        throw new Error(`Supplier snapshot load failed: ${suppliersError.message}`);
    }

    const { count: rfqCount, error: rfqError } = await supabase
        .from("rfqs")
        .select("id", { count: "exact", head: true });

    if (rfqError) {
        throw new Error(`RFQ snapshot count failed: ${rfqError.message}`);
    }

    const { data: activeSettings } = await supabase
        .from("marketplace_settings_versions")
        .select("id")
        .eq("is_active", true)
        .maybeSingle();

    const { error } = await supabase.from("marketplace_ranking_snapshots").insert({
        settings_version_id: activeSettings?.id ?? null,
        snapshot_data_json: { suppliers: suppliers ?? [] },
        supplier_count: suppliers?.length ?? 0,
        rfq_count: rfqCount ?? 0,
        notes: "Manual ranking preview snapshot",
        created_by: auth.user.id,
    });

    if (error) {
        throw new Error(`Snapshot creation failed: ${error.message}`);
    }

    revalidatePath("/admin/ranking-preview");
}