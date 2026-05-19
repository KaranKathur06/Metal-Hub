import { redirect } from "next/navigation";
import { loadRfqPublicDetail } from "@/lib/marketplace/public-entities";

type Props = { params: Promise<{ id: string }> };

/** Legacy route — resolves slug and redirects to canonical /rfq/[slug]. */
export default async function InquiryLegacyRedirect({ params }: Props) {
    const { id } = await params;
    const rfq = await loadRfqPublicDetail(id);

    if (!rfq) {
        redirect("/marketplace?type=buyers");
    }

    redirect(`/rfq/${rfq.slug}`);
}
