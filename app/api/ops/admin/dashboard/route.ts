import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getPrisma() {
  // Lazy-load Prisma only when handler runs (not at module scope)
  const { PrismaClient } = require('@prisma/client');
  const g = globalThis as any;
  if (!g.__opsPrisma) g.__opsPrisma = new PrismaClient();
  return g.__opsPrisma;
}

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const cookieStore = cookies();
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrisma();

    const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [
      totalUsers, activeUsers, totalListings, pendingListings,
      approvedListings, totalSuppliers, pendingSuppliers, totalPayments, recentUsers,
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
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),
    ]);

    return NextResponse.json({
      totalUsers, activeUsers, totalListings, pendingListings,
      approvedListings, totalSuppliers, pendingSuppliers, totalPayments,
      recentUsers, timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[OPS] Admin dashboard error:', error?.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
