import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { SupplierPublicProfile } from "@/components/marketplace/public/SupplierPublicProfile";
import { buildSeoMetadata, buildSupplierSchema } from "@/lib/marketplace/seo";
import {
    computeProfileCompleteness,
    loadRelatedSuppliers,
    loadSupplierPublicProfile,
} from "@/lib/marketplace/public-entities";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { resolveSlugRedirect } from "@/lib/marketplace/slug-redirect";
import { enrichSupplierWithIdentityTrust } from "@/lib/marketplace/supplier-identity";
import { loadSupplierListings } from "@/lib/marketplace/listing-detail";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const supplier = await loadSupplierPublicProfile(slug);
    if (!supplier) return { title: "Supplier Not Found | MetalHub" };

    const location = [supplier.city, supplier.state, supplier.country].filter(Boolean).join(", ");

    return buildSeoMetadata({
        title: `${supplier.company_name} | Industrial Supplier | MetalHub`,
        description: supplier.short_description ?? `${supplier.company_name} on MetalHub marketplace.`,
        canonicalPath: `/suppliers/${supplier.slug}`,
        imageUrl: supplier.logo_url,
    });
}

export default async function SupplierProfilePage({ params }: Props) {
    const { slug } = await params;
    const supabase = createSupabaseServerClient();

    if (supabase) {
        const redirectInfo = await resolveSlugRedirect(supabase, "supplier", slug);
        if (redirectInfo) {
            redirect(redirectInfo.redirectPath);
        }
    }

    const baseSupplier = await loadSupplierPublicProfile(slug);
    if (!baseSupplier) notFound();

    const supplier =
        supabase != null
            ? await enrichSupplierWithIdentityTrust(supabase, baseSupplier)
            : baseSupplier;

    const relatedSuppliers = await loadRelatedSuppliers(supplier);
    const profileStrength = computeProfileCompleteness(supplier);

    let supplierListings: Awaited<ReturnType<typeof loadSupplierListings>> = [];
    if (supabase) {
        const { data: bridge } = await supabase
            .from("suppliers")
            .select("company_id, seller_profile_id")
            .eq("id", supplier.id)
            .maybeSingle();

        supplierListings = await loadSupplierListings({
            companyId: bridge?.company_id,
            sellerProfileId: bridge?.seller_profile_id,
            limit: 8,
        });
    }

    const location = [supplier.city, supplier.state, supplier.country].filter(Boolean).join(", ");
    const schema = buildSupplierSchema({
        name: supplier.company_name,
        description: supplier.short_description,
        url: `/suppliers/${supplier.slug}`,
        imageUrl: supplier.logo_url,
        locationLabel: location,
        certifications: supplier.certifications.map((cert) => cert.name),
    });

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
            <SupplierPublicProfile
                supplier={supplier}
                relatedSuppliers={relatedSuppliers}
                profileStrength={profileStrength}
                listings={supplierListings}
            />
        </>
    );
}
