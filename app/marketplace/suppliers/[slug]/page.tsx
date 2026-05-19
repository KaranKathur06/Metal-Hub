import { redirect } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export default async function MarketplaceSupplierRedirect({ params }: Props) {
    const { slug } = await params;
    redirect(`/suppliers/${slug}`);
}
