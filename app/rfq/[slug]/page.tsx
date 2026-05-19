import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RfqPublicDetailView } from "@/components/marketplace/public/RfqPublicDetail";
import { buildSeoMetadata } from "@/lib/marketplace/seo";
import { loadRfqPublicDetail } from "@/lib/marketplace/public-entities";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const rfq = await loadRfqPublicDetail(slug);
    if (!rfq) return { title: "RFQ Not Found | MetalHub" };

    return buildSeoMetadata({
        title: `${rfq.title} | RFQ | MetalHub`,
        description: rfq.description,
        canonicalPath: `/rfq/${rfq.slug}`,
    });
}

export default async function RfqDetailPage({ params }: Props) {
    const { slug } = await params;
    const rfq = await loadRfqPublicDetail(slug);
    if (!rfq) notFound();

    return <RfqPublicDetailView rfq={rfq} />;
}
