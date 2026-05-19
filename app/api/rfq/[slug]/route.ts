import { NextResponse } from "next/server";
import { loadRfqPublicDetail } from "@/lib/marketplace/public-entities";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
    const { slug } = await context.params;
    const rfq = await loadRfqPublicDetail(slug);

    if (!rfq) {
        return NextResponse.json({ error: "RFQ not found" }, { status: 404 });
    }

    return NextResponse.json({ rfq });
}
