import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [
      totalInquiries, openInquiries, closedInquiries,
      totalSuppliers, verifiedSuppliers,
      totalOffers, acceptedOffers, totalPayments,
    ] = await Promise.all([
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: 'OPEN' } }),
      prisma.inquiry.count({ where: { status: 'CLOSED' } }),
      prisma.supplier.count(),
      prisma.supplier.count({ where: { isVerified: true } }),
      prisma.offer.count(),
      prisma.offer.count({ where: { status: 'ACCEPTED' } }),
      prisma.payment.count({ where: { status: 'SUCCESS' } }),
    ]);

    const conversionRate = totalInquiries > 0
      ? Math.round((closedInquiries / totalInquiries) * 100 * 10) / 10
      : 0;

    return NextResponse.json({
      pipelineValue: totalInquiries, openLeads: openInquiries,
      convertedLeads: closedInquiries, conversionRate,
      totalSuppliers, verifiedSuppliers,
      totalOffers, acceptedOffers, totalPayments,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[OPS] CRM dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
