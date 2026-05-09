import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    // Check admin role
    const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Aggregate dashboard KPIs
    const [
      totalUsers,
      activeUsers,
      totalListings,
      pendingListings,
      approvedListings,
      totalSuppliers,
      pendingSuppliers,
      totalPayments,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.listing.count(),
      prisma.listing.count({ where: { status: 'PENDING' } }),
      prisma.listing.count({ where: { status: 'APPROVED' } }),
      prisma.supplier.count(),
      prisma.supplier.count({ where: { isVerified: false } }),
      prisma.payment.count({ where: { status: 'SUCCESS' } }),
      prisma.user.count({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalListings,
      pendingListings,
      approvedListings,
      totalSuppliers,
      pendingSuppliers,
      totalPayments,
      recentUsers,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[OPS] Admin dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
