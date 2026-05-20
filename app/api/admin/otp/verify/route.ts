/**
 * POST /api/admin/otp/verify — Verify admin 2FA OTP and create elevated session
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";
import { canRequestAdminOtp, resolveEffectiveRole } from "@/lib/auth/rbac";
import { hashOTP, verifyOTPHash } from "@/lib/auth/otp";
import type { SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_OTP_ATTEMPTS = 5;
const ADMIN_SESSION_DURATION_HOURS = 4;

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

async function logAuditEvent(
  db: SupabaseClient,
  event: {
    userId: string;
    action: string;
    details?: Record<string, unknown>;
    ip?: string;
    userAgent?: string;
    severity?: string;
  },
) {
  try {
    await db.from("admin_audit_logs").insert({
      user_id: event.userId,
      action: event.action,
      details: event.details ?? {},
      ip_address: event.ip ?? "unknown",
      user_agent: event.userAgent ?? null,
      severity: event.severity ?? "info",
    });
  } catch (err) {
    console.error("[Audit] Failed to log event:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 503 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = resolveEffectiveRole({
      profileRole: profile?.role,
      appMetadataRole: user.app_metadata?.role,
      userMetadataRole: user.user_metadata?.role,
    });

    if (!canRequestAdminOtp(role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { otp } = body as { otp?: string };

    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: "Invalid verification code format" }, { status: 400 });
    }

    const db = createSupabaseServiceRoleClient() ?? supabase;

    const { data: otpRecord } = await db
      .from("otp_verifications")
      .select("*")
      .eq("user_id", user.id)
      .eq("purpose", "admin_2fa")
      .eq("is_used", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!otpRecord) {
      await logAuditEvent(db, {
        userId: user.id,
        action: "ADMIN_OTP_VERIFY_NO_RECORD",
        details: { email: user.email },
        ip: getClientIp(req),
        userAgent: req.headers.get("user-agent") || undefined,
        severity: "warning",
      });

      return NextResponse.json(
        { error: "No active verification code found. Please request a new one." },
        { status: 400 },
      );
    }

    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      await db
        .from("otp_verifications")
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq("id", otpRecord.id);

      return NextResponse.json(
        { error: "Maximum attempts exceeded. Please request a new code." },
        { status: 429 },
      );
    }

    // Support legacy rows hashed without salt (pre-refactor)
    const isValid =
      verifyOTPHash(otp, otpRecord.otp_hash) ||
      crypto.createHash("sha256").update(otp).digest("hex") === otpRecord.otp_hash;

    await db
      .from("otp_verifications")
      .update({ attempts: otpRecord.attempts + 1 })
      .eq("id", otpRecord.id);

    if (!isValid) {
      const remainingAttempts = MAX_OTP_ATTEMPTS - otpRecord.attempts - 1;
      return NextResponse.json(
        { error: "Invalid verification code", remainingAttempts },
        { status: 401 },
      );
    }

    await db
      .from("otp_verifications")
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq("id", otpRecord.id);

    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + ADMIN_SESSION_DURATION_HOURS * 60 * 60 * 1000);

    const { error: sessionError } = await db.from("admin_sessions").insert({
      user_id: user.id,
      session_token: sessionToken,
      ip_address: getClientIp(req),
      user_agent: req.headers.get("user-agent") || null,
      device_info: {
        platform: req.headers.get("sec-ch-ua-platform") || "unknown",
        mobile: req.headers.get("sec-ch-ua-mobile") || "unknown",
      },
      expires_at: expiresAt.toISOString(),
    });

    if (sessionError) {
      console.error("[Admin OTP] Session insert error:", sessionError.message);
      return NextResponse.json({ error: "Failed to create admin session" }, { status: 500 });
    }

    const response = NextResponse.json({
      success: true,
      message: "Admin access verified",
      expiresAt: expiresAt.toISOString(),
    });

    response.cookies.set(
      "admin_verified",
      JSON.stringify({
        token: sessionToken,
        userId: user.id,
        expires: expiresAt.getTime(),
        verified: true,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: ADMIN_SESSION_DURATION_HOURS * 60 * 60,
      },
    );

    await logAuditEvent(db, {
      userId: user.id,
      action: "ADMIN_2FA_VERIFIED",
      details: { email: user.email, expiresAt: expiresAt.toISOString() },
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent") || undefined,
      severity: "info",
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Admin OTP] Verify error:", message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
