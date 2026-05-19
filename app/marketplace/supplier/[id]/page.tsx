import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type Props = { params: Promise<{ id: string }> };

/** Legacy route — redirects to canonical /suppliers/[slug]. */
export default async function LegacySupplierRedirect({ params }: Props) {
    const { id } = await params;
    const supabase = createSupabaseServerClient();

    if (supabase) {
        const { data } = await supabase
            .from("suppliers")
            .select("slug")
            .eq("id", id)
            .maybeSingle();

        if (data?.slug) {
            redirect(`/suppliers/${data.slug}`);
        }
    }

    redirect("/marketplace?type=suppliers");
}
