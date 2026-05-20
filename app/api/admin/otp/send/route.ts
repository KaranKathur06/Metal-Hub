import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import crypto from "crypto";
import { canRequestAdminOtp, resolveEffectiveRole } from "@/lib/auth/rbac";
import { authLog } from "@/lib/auth/auth-logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ═══════════════════════════════════════════════════════
// OTP Configuration
// ═══════════════════════════════════════════════════════
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;
const RATE_LIMIT_WINDOW_MINUTES = 15;
const MAX_REQUESTS_PER_WINDOW = 5;

function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

function generateOtp(): string {
  // Cryptographically secure 6-digit OTP
  return crypto.randomInt(100000, 999999).toString();
}

function getPrisma() {
  const { PrismaClient } = require("@prisma/client");
  const g = globalThis as any;
  if (!g.__adminPrisma) g.__adminPrisma = new PrismaClient();
  return g.__adminPrisma;
}

function getSupabase(request?: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieStore = cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {},
    },
  });
}

// ═══════════════════════════════════════════════════════
// POST /api/admin/otp/send — Send OTP to admin's email
// ═══════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase(req);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // ── RBAC Check: Only admin/super_admin can request admin OTP ──
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

    authLog("admin_otp_send", "role check", { userId: user.id, role, rawProfileRole: profile?.role });

    if (!canRequestAdminOtp(role)) {
      await logAuditEvent(supabase, {
        userId: user.id,
        action: "ADMIN_OTP_UNAUTHORIZED_ATTEMPT",
        details: { role, rawProfileRole: profile?.role, email: user.email },
        ip: getClientIp(req),
        userAgent: req.headers.get("user-agent") || undefined,
        severity: "warning",
      });

      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // ── Rate Limiting ──
    const rateLimitKey = `otp_send:${user.id}`;
    const isRateLimited = await checkRateLimit(
      supabase,
      rateLimitKey,
      MAX_REQUESTS_PER_WINDOW,
      RATE_LIMIT_WINDOW_MINUTES
    );

    if (isRateLimited) {
      return NextResponse.json(
        { error: "Too many requests. Please wait before trying again." },
        { status: 429 }
      );
    }

    // ── Cooldown Check ──
    const { data: recentOtp } = await supabase
      .from("otp_verifications")
      .select("created_at")
      .eq("user_id", user.id)
      .eq("purpose", "admin_2fa")
      .eq("is_used", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentOtp) {
      const createdAt = new Date(recentOtp.created_at).getTime();
      const cooldownEnd = createdAt + RESEND_COOLDOWN_SECONDS * 1000;
      if (Date.now() < cooldownEnd) {
        const remainingSeconds = Math.ceil((cooldownEnd - Date.now()) / 1000);
        return NextResponse.json(
          {
            error: `Please wait ${remainingSeconds} seconds before requesting a new code`,
            cooldownRemaining: remainingSeconds,
          },
          { status: 429 }
        );
      }
    }

    // ── Invalidate previous unused OTPs ──
    await supabase
      .from("otp_verifications")
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("purpose", "admin_2fa")
      .eq("is_used", false);

    // ── Generate and Store OTP ──
    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(
      Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
    ).toISOString();

    const { error: insertError } = await supabase
      .from("otp_verifications")
      .insert({
        user_id: user.id,
        email: user.email,
        otp_hash: otpHash,
        purpose: "admin_2fa",
        expires_at: expiresAt,
        ip_address: getClientIp(req),
        user_agent: req.headers.get("user-agent") || null,
      });

    if (insertError) {
      console.error("[Admin OTP] Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to generate verification code" },
        { status: 500 }
      );
    }

    // ── Send OTP via email ──
    // In production, use Resend/SendGrid/SES. For now, use Supabase Auth magic link
    // or console log for development.
    const emailSent = await sendOtpEmail(user.email, otp, user.user_metadata?.full_name);

    // Audit log
    await logAuditEvent(supabase, {
      userId: user.id,
      action: "ADMIN_OTP_SENT",
      details: { email: user.email, emailSent },
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent") || undefined,
      severity: "info",
    });

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email",
      expiresIn: OTP_EXPIRY_MINUTES * 60,
      email: maskEmail(user.email),
    });
  } catch (error: any) {
    console.error("[Admin OTP] Send error:", error?.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***@***";
  const masked =
    local.length <= 3
      ? local[0] + "***"
      : local.slice(0, 2) + "***" + local.slice(-1);
  return `${masked}@${domain}`;
}

async function sendOtpEmail(
  email: string,
  otp: string,
  name?: string
): Promise<boolean> {
  // TODO: Integrate with Resend/SendGrid/SES for production email delivery
  // For development, log to console
  console.log(`\n══════════════════════════════════════════`);
  console.log(`  ADMIN 2FA VERIFICATION CODE`);
  console.log(`  Email: ${email}`);
  console.log(`  Code:  ${otp}`);
  console.log(`  Expires in: ${OTP_EXPIRY_MINUTES} minutes`);
  console.log(`══════════════════════════════════════════\n`);

  // In production, uncomment and configure:
  // try {
  //   await resend.emails.send({
  //     from: 'MetalHub Security <security@metalhub.in>',
  //     to: email,
  //     subject: `MetalHub Admin Verification: ${otp}`,
  //     html: `<p>Hi ${name || 'Admin'},</p><p>Your admin verification code is: <strong>${otp}</strong></p><p>This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>`,
  //   });
  //   return true;
  // } catch { return false; }

  return true; // Development mode
}

async function checkRateLimit(
  supabase: any,
  identifier: string,
  maxAttempts: number,
  windowMinutes: number
): Promise<boolean> {
  const windowStart = new Date(
    Date.now() - windowMinutes * 60 * 1000
  ).toISOString();

  const { data: existing } = await supabase
    .from("rate_limits")
    .select("attempts")
    .eq("identifier", identifier)
    .eq("action", "otp_request")
    .gte("window_end", new Date().toISOString())
    .maybeSingle();

  if (existing && existing.attempts >= maxAttempts) {
    return true; // Rate limited
  }

  if (existing) {
    await supabase
      .from("rate_limits")
      .update({ attempts: existing.attempts + 1 })
      .eq("identifier", identifier)
      .eq("action", "otp_request")
      .gte("window_end", new Date().toISOString());
  } else {
    await supabase.from("rate_limits").insert({
      identifier,
      action: "otp_request",
      attempts: 1,
      window_end: new Date(
        Date.now() + windowMinutes * 60 * 1000
      ).toISOString(),
    });
  }

  return false;
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
