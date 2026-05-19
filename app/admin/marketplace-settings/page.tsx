import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hydrateAuthState } from "@/lib/auth/profile-role";

type MarketplaceSettingsVersion = {
    id: string;
    version_name: string;
    status: "draft" | "scheduled" | "active" | "expired" | "rolled_back" | "archived";
    is_active: boolean;
    is_scheduled: boolean;
    activation_start_at: string | null;
    activation_end_at: string | null;
    activated_at: string | null;
    notes: string | null;
    seeded_supplier_weight: number;
    seeded_rfq_weight: number;
    real_supplier_boost: number;
    real_rfq_boost: number;
    exact_phrase_boost: number;
    capability_weight: number;
    product_weight: number;
    certification_weight: number;
    verification_weight: number;
    activity_weight: number;
    profile_completeness_weight: number;
    interaction_weight: number;
    seed_decay_threshold: number;
    seed_visibility_decay_rate: number;
    minimum_real_threshold: number;
    created_at: string;
};

export default async function MarketplaceSettingsPage() {
    const supabase = createClient();
    if (!supabase) redirect("/login");
    const auth = await hydrateAuthState(supabase);

    if (auth.status === "unauthenticated") redirect("/login");
    if (auth.role !== "super_admin") redirect("/buyer/dashboard");

    const { data, error } = await supabase
        .from("marketplace_settings_versions")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(`Marketplace settings load failed: ${error.message}`);
    }

    const versions = (data ?? []) as MarketplaceSettingsVersion[];

    return (
        <main className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-8">
            <div className="flex flex-col gap-4 border-b border-zinc-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-zinc-950">
                        Marketplace Ranking Settings
                    </h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
                        Manage versioned supplier discovery logic, seeded marketplace tapering,
                        search weights, activation windows, and rollback-safe ranking operations.
                    </p>
                </div>

                <form action={createDraftVersion}>
                    <button className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800">
                        Create Draft Config
                    </button>
                </form>
            </div>

            <section className="grid gap-4">
                {versions.map((version) => (
                    <article
                        key={version.id}
                        className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
                    >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-base font-semibold text-zinc-950">
                                        {version.version_name}
                                    </h2>
                                    <StatusBadge status={version.status} isActive={version.is_active} />
                                </div>

                                <p className="mt-1 text-sm text-zinc-500">
                                    Created {formatDate(version.created_at)}
                                    {version.activated_at ? ` • Activated ${formatDate(version.activated_at)}` : ""}
                                </p>

                                {version.notes ? (
                                    <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
                                        {version.notes}
                                    </p>
                                ) : null}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {version.status === "draft" || version.status === "scheduled" ? (
                                    <form action={activateVersion}>
                                        <input type="hidden" name="id" value={version.id} />
                                        <button className="h-9 rounded-md bg-emerald-700 px-3 text-sm font-medium text-white hover:bg-emerald-800">
                                            Activate Now
                                        </button>
                                    </form>
                                ) : null}

                                {version.is_active ? null : (
                                    <form action={archiveVersion}>
                                        <input type="hidden" name="id" value={version.id} />
                                        <button className="h-9 rounded-md border border-zinc-300 px-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50">
                                            Archive
                                        </button>
                                    </form>
                                )}

                                {version.is_active ? (
                                    <form action={rollbackToPreviousVersion}>
                                        <input type="hidden" name="id" value={version.id} />
                                        <button className="h-9 rounded-md border border-red-300 px-3 text-sm font-medium text-red-700 hover:bg-red-50">
                                            Rollback
                                        </button>
                                    </form>
                                ) : null}
                            </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <SettingMetric label="Exact phrase" value={version.exact_phrase_boost} />
                            <SettingMetric label="Capability" value={version.capability_weight} />
                            <SettingMetric label="Product" value={version.product_weight} />
                            <SettingMetric label="Certification" value={version.certification_weight} />
                            <SettingMetric label="Real supplier boost" value={version.real_supplier_boost} />
                            <SettingMetric label="Seeded supplier weight" value={version.seeded_supplier_weight} />
                            <SettingMetric label="Seed threshold" value={version.seed_decay_threshold} />
                            <SettingMetric label="Decay rate" value={version.seed_visibility_decay_rate} />
                        </div>

                        {version.status === "draft" ? (
                            <form action={scheduleVersion} className="mt-5 grid gap-3 border-t border-zinc-100 pt-5 lg:grid-cols-[1fr_1fr_auto]">
                                <input type="hidden" name="id" value={version.id} />
                                <label className="grid gap-1 text-sm">
                                    <span className="font-medium text-zinc-700">Activation start</span>
                                    <input
                                        name="activation_start_at"
                                        type="datetime-local"
                                        className="h-10 rounded-md border border-zinc-300 px-3 text-sm"
                                        required
                                    />
                                </label>
                                <label className="grid gap-1 text-sm">
                                    <span className="font-medium text-zinc-700">Activation end</span>
                                    <input
                                        name="activation_end_at"
                                        type="datetime-local"
                                        className="h-10 rounded-md border border-zinc-300 px-3 text-sm"
                                    />
                                </label>
                                <button className="self-end rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50">
                                    Schedule Activation
                                </button>
                            </form>
                        ) : null}
                    </article>
                ))}
            </section>
        </main>
    );
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

async function createDraftVersion() {
    "use server";

    const { supabase, auth } = await requireSuperadmin();

    const { data: activeVersion } = await supabase
        .from("marketplace_settings_versions")
        .select("*")
        .eq("is_active", true)
        .single();

    const source = activeVersion ?? {
        seeded_supplier_weight: 0.7,
        seeded_rfq_weight: 0.7,
        real_supplier_boost: 1.5,
        real_rfq_boost: 1.5,
        exact_phrase_boost: 15,
        capability_weight: 10,
        product_weight: 9,
        certification_weight: 6,
        verification_weight: 5,
        activity_weight: 4,
        profile_completeness_weight: 3,
        interaction_weight: 3,
        seed_decay_threshold: 100,
        seed_visibility_decay_rate: 0.015,
        minimum_real_threshold: 25,
    };

    const { error } = await supabase.from("marketplace_settings_versions").insert({
        version_name: `Draft Ranking Config ${new Date().toISOString().slice(0, 10)}`,
        status: "draft",
        is_active: false,
        is_scheduled: false,
        created_by: auth.user.id,
        notes: "Draft cloned from current active marketplace ranking settings.",
        seeded_supplier_weight: source.seeded_supplier_weight,
        seeded_rfq_weight: source.seeded_rfq_weight,
        real_supplier_boost: source.real_supplier_boost,
        real_rfq_boost: source.real_rfq_boost,
        exact_phrase_boost: source.exact_phrase_boost,
        capability_weight: source.capability_weight,
        product_weight: source.product_weight,
        certification_weight: source.certification_weight,
        verification_weight: source.verification_weight,
        activity_weight: source.activity_weight,
        profile_completeness_weight: source.profile_completeness_weight,
        interaction_weight: source.interaction_weight,
        seed_decay_threshold: source.seed_decay_threshold,
        seed_visibility_decay_rate: source.seed_visibility_decay_rate,
        minimum_real_threshold: source.minimum_real_threshold,
    });

    if (error) throw new Error(`Draft creation failed: ${error.message}`);

    revalidatePath("/admin/marketplace-settings");
}

async function activateVersion(formData: FormData) {
    "use server";

    const { supabase, auth } = await requireSuperadmin();
    const id = String(formData.get("id"));

    const { error: deactivateError } = await supabase
        .from("marketplace_settings_versions")
        .update({
            is_active: false,
            status: "archived",
        })
        .eq("is_active", true);

    if (deactivateError) {
        throw new Error(`Deactivation failed: ${deactivateError.message}`);
    }

    const { error } = await supabase
        .from("marketplace_settings_versions")
        .update({
            is_active: true,
            status: "active",
            activated_by: auth.user.id,
            activated_at: new Date().toISOString(),
            is_scheduled: false,
        })
        .eq("id", id);

    if (error) throw new Error(`Activation failed: ${error.message}`);

    revalidatePath("/admin/marketplace-settings");
}

async function scheduleVersion(formData: FormData) {
    "use server";

    const { supabase } = await requireSuperadmin();
    const id = String(formData.get("id"));
    const activationStart = String(formData.get("activation_start_at"));
    const activationEnd = String(formData.get("activation_end_at") || "");

    const { error } = await supabase
        .from("marketplace_settings_versions")
        .update({
            status: "scheduled",
            is_scheduled: true,
            activation_start_at: new Date(activationStart).toISOString(),
            activation_end_at: activationEnd
                ? new Date(activationEnd).toISOString()
                : null,
        })
        .eq("id", id);

    if (error) throw new Error(`Schedule failed: ${error.message}`);

    revalidatePath("/admin/marketplace-settings");
}

async function rollbackToPreviousVersion(formData: FormData) {
    "use server";

    const { supabase, auth } = await requireSuperadmin();
    const currentId = String(formData.get("id"));

    const { data: previous, error: previousError } = await supabase
        .from("marketplace_settings_versions")
        .select("id")
        .neq("id", currentId)
        .in("status", ["archived", "rolled_back"])
        .order("activated_at", { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle();

    if (previousError) throw new Error(`Rollback lookup failed: ${previousError.message}`);
    if (!previous) throw new Error("No previous marketplace settings version found.");

    await supabase
        .from("marketplace_settings_versions")
        .update({
            is_active: false,
            status: "rolled_back",
            rollback_version_id: previous.id,
        })
        .eq("id", currentId);

    const { error } = await supabase
        .from("marketplace_settings_versions")
        .update({
            is_active: true,
            status: "active",
            activated_by: auth.user.id,
            activated_at: new Date().toISOString(),
        })
        .eq("id", previous.id);

    if (error) throw new Error(`Rollback activation failed: ${error.message}`);

    revalidatePath("/admin/marketplace-settings");
}

async function archiveVersion(formData: FormData) {
    "use server";

    const { supabase } = await requireSuperadmin();
    const id = String(formData.get("id"));

    const { error } = await supabase
        .from("marketplace_settings_versions")
        .update({
            status: "archived",
            is_active: false,
            is_scheduled: false,
        })
        .eq("id", id)
        .neq("is_active", true);

    if (error) throw new Error(`Archive failed: ${error.message}`);

    revalidatePath("/admin/marketplace-settings");
}

function StatusBadge({
    status,
    isActive,
}: {
    status: MarketplaceSettingsVersion["status"];
    isActive: boolean;
}) {
    const className = isActive
        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
        : status === "scheduled"
            ? "bg-blue-50 text-blue-700 ring-blue-200"
            : status === "draft"
                ? "bg-amber-50 text-amber-700 ring-amber-200"
                : "bg-zinc-100 text-zinc-600 ring-zinc-200";

    return (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${className}`}>
            {isActive ? "active" : status}
        </span>
    );
}

function SettingMetric({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
            <div className="text-xs font-medium text-zinc-500">{label}</div>
            <div className="mt-1 text-lg font-semibold text-zinc-950">{value}</div>
        </div>
    );
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}