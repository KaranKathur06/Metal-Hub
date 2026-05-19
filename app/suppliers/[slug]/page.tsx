import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SupplierPublicProfile } from "@/components/marketplace/public/SupplierPublicProfile";
import { buildSeoMetadata, buildSupplierSchema } from "@/lib/marketplace/seo";
import {
    computeProfileCompleteness,
    loadRelatedSuppliers,
    loadSupplierPublicProfile,
} from "@/lib/marketplace/public-entities";

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
    const supplier = await loadSupplierPublicProfile(slug);
    if (!supplier) notFound();

    const relatedSuppliers = await loadRelatedSuppliers(supplier);
    const profileStrength = computeProfileCompleteness(supplier);

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
            />
        </>
    );
}
