import { NextRequest, NextResponse } from "next/server";
import { protectApiRoute } from "@/lib/auth/protect-route";
import { runProfileMigration } from "@/lib/marketplace/profile-migration";
import { isAdminRole } from "@/lib/constants/roles";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = await protectApiRoute(request, {
    requiredRoles: ["admin", "superadmin", "super_admin"],
  });

  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  if (!isAdminRole(auth.role)) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "Admin access required" } },
      { status: 403 },
    );
  }

  let body: { userIds?: string[]; limit?: number } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const stats = await runProfileMigration(auth.supabase, {
    userIds: body.userIds,
    limit: body.limit,
  });

  return NextResponse.json({ success: true, stats });
}
