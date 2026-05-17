import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ═══════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════
const MAX_OTP_ATTEMPTS = 5;
const ADMIN_SESSION_DURATION_HOURS = 4;

function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// ═══════════════════════════════════════════════════════
// POST /api/admin/otp/verify — Verify OTP and create admin session
// ═══════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      );
    }

    const cookieStore = cookies();
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // ── RBAC Check ──
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role || user.user_metadata?.role;
    if (role !== "admin" && role !== "super_admin") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // ── Parse request body ──
    const body = await req.json().catch(() => ({}));
    const { otp } = body as { otp?: string };

    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: "Invalid verification code format" },
        { status: 400 }
      );
    }

    // ── Find the latest valid OTP for this user ──
    const { data: otpRecord, error: otpError } = await supabase
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
      await logAuditEvent(supabase, {
        userId: user.id,
        action: "ADMIN_OTP_VERIFY_NO_RECORD",
        details: { email: user.email },
        ip: getClientIp(req),
        userAgent: req.headers.get("user-agent") || undefined,
        severity: "warning",
      });

      return NextResponse.json(
        { error: "No active verification code found. Please request a new one." },
        { status: 400 }
      );
    }

    // ── Check max attempts ──
    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      // Invalidate the OTP
      await supabase
        .from("otp_verifications")
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq("id", otpRecord.id);

      await logAuditEvent(supabase, {
        userId: user.id,
        action: "ADMIN_OTP_MAX_ATTEMPTS",
        details: { attempts: otpRecord.attempts, email: user.email },
        ip: getClientIp(req),
        userAgent: req.headers.get("user-agent") || undefined,
        severity: "critical",
      });

      return NextResponse.json(
        { error: "Maximum attempts exceeded. Please request a new code." },
        { status: 429 }
      );
    }

    // ── Verify OTP hash ──
    const otpHash = hashOtp(otp);
    const isValid = otpHash === otpRecord.otp_hash;

    // Increment attempt counter
    await supabase
      .from("otp_verifications")
      .update({ attempts: otpRecord.attempts + 1 })
      .eq("id", otpRecord.id);

    if (!isValid) {
      const remainingAttempts = MAX_OTP_ATTEMPTS - otpRecord.attempts - 1;

      await logAuditEvent(supabase, {
        userId: user.id,
        action: "ADMIN_OTP_VERIFY_FAILED",
        details: {
          email: user.email,
          attempts: otpRecord.attempts + 1,
          remaining: remainingAttempts,
        },
        ip: getClientIp(req),
        userAgent: req.headers.get("user-agent") || undefined,
        severity: "warning",
      });

      return NextResponse.json(
        {
          error: "Invalid verification code",
          remainingAttempts,
        },
        { status: 401 }
      );
    }

    // ═══ OTP VERIFIED — Create Admin Session ═══

    // Mark OTP as used
    await supabase
      .from("otp_verifications")
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq("id", otpRecord.id);

    // Create admin session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(
      Date.now() + ADMIN_SESSION_DURATION_HOURS * 60 * 60 * 1000
    );

    await supabase.from("admin_sessions").insert({
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

    // ── Set admin_verified cookie ──
    const response = NextResponse.json({
      success: true,
      message: "Admin access verified",
      expiresAt: expiresAt.toISOString(),
    });

    // Cookie contains session metadata for middleware to validate
    const cookieValue = JSON.stringify({
      token: sessionToken,
      userId: user.id,
      expires: expiresAt.getTime(),
      verified: true,
    });

    response.cookies.set("admin_verified", cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_SESSION_DURATION_HOURS * 60 * 60,
    });

    // Audit log
    await logAuditEvent(supabase, {
      userId: user.id,
      action: "ADMIN_2FA_VERIFIED",
      details: {
        email: user.email,
        sessionDuration: `${ADMIN_SESSION_DURATION_HOURS}h`,
        expiresAt: expiresAt.toISOString(),
      },
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent") || undefined,
      severity: "info",
    });

    return response;
  } catch (error: any) {
    console.error("[Admin OTP] Verify error:", error?.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

async function logAuditEvent(
  supabase: any,
  event: {
    userId: string;
    action: string;
    details?: any;
    ip?: string;
    userAgent?: string;
    severity?: string;
  }
) {
  try {
    await supabase.from("admin_audit_logs").insert({
      user_id: event.userId,
      action: event.action,
      details: event.details || {},
      ip_address: event.ip || "unknown",
      user_agent: event.userAgent || null,
      severity: event.severity || "info",
    });
  } catch (err) {
    console.error("[Audit] Failed to log event:", err);
  }
}
