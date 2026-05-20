/**
 * POST /api/admin/otp/send — Send admin 2FA OTP
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role-client";
import { canRequestAdminOtp, resolveEffectiveRole } from "@/lib/auth/rbac";
import { authLog } from "@/lib/auth/auth-logger";
import { checkRateLimit, RATE_LIMITS } from "@/lib/auth/rate-limiter";
import { generateOTP, hashOTP, getOTPExpiry } from "@/lib/auth/otp";
import { sendEmail, otpEmailTemplate } from "@/lib/services/email";
import type { SupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RESEND_COOLDOWN_SECONDS = 60;
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || "5", 10);
const HAS_RESEND = Boolean(process.env.RESEND_API_KEY);

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
    local.length <= 3 ? `${local[0]}***` : `${local.slice(0, 2)}***${local.slice(-1)}`;
  return `${masked}@${domain}`;
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
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
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

    authLog("admin_otp_send", "role check", {
      userId: user.id,
      role,
      rawProfileRole: profile?.role,
    });

    if (!canRequestAdminOtp(role)) {
      await logAuditEvent(supabase, {
        userId: user.id,
        action: "ADMIN_OTP_UNAUTHORIZED_ATTEMPT",
        details: { role, rawProfileRole: profile?.role, email: user.email },
        ip: getClientIp(req),
        userAgent: req.headers.get("user-agent") || undefined,
        severity: "warning",
      });

      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Writes: service role (bypasses RLS) after RBAC, else user client (needs RLS policies)
    const db = createSupabaseServiceRoleClient() ?? supabase;

    const rateLimitResult = await checkRateLimit(
      db,
      `otp_send:${user.id}`,
      RATE_LIMITS.OTP_SEND.action,
      RATE_LIMITS.OTP_SEND.maxAttempts,
      RATE_LIMITS.OTP_SEND.windowMinutes,
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: `Too many requests. Try again in ${rateLimitResult.retryAfterSeconds ?? 60} seconds.`,
        },
        { status: 429 },
      );
    }

    const { data: recentOtp } = await db
      .from("otp_verifications")
      .select("created_at")
      .eq("user_id", user.id)
      .eq("purpose", "admin_2fa")
      .eq("is_used", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentOtp) {
      const cooldownEnd =
        new Date(recentOtp.created_at).getTime() + RESEND_COOLDOWN_SECONDS * 1000;
      if (Date.now() < cooldownEnd) {
        const remainingSeconds = Math.ceil((cooldownEnd - Date.now()) / 1000);
        return NextResponse.json(
          {
            error: `Please wait ${remainingSeconds} seconds before requesting a new code`,
            cooldownRemaining: remainingSeconds,
          },
          { status: 429 },
        );
      }
    }

    await db
      .from("otp_verifications")
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("purpose", "admin_2fa")
      .eq("is_used", false);

    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    const expiresAt = getOTPExpiry();

    const { error: insertError } = await db.from("otp_verifications").insert({
      user_id: user.id,
      email: user.email,
      otp_hash: otpHash,
      purpose: "admin_2fa",
      attempts: 0,
      max_attempts: 5,
      is_used: false,
      expires_at: expiresAt.toISOString(),
      ip_address: getClientIp(req),
      user_agent: req.headers.get("user-agent") || null,
    });

    if (insertError) {
      console.error("[Admin OTP] Insert error:", insertError.code, insertError.message);
      return NextResponse.json(
        {
          error: "Failed to generate verification code",
          ...(process.env.NODE_ENV === "development"
            ? { details: insertError.message }
            : {}),
        },
        { status: 500 },
      );
    }

    const template = otpEmailTemplate(otp, OTP_EXPIRY_MINUTES);
    const emailResult = await sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    const deliveryMode = HAS_RESEND ? "resend" : "console";

    if (HAS_RESEND && !emailResult.success) {
      console.error("[Admin OTP] Email delivery failed:", emailResult.error);
      await logAuditEvent(db, {
        userId: user.id,
        action: "ADMIN_OTP_EMAIL_FAILED",
        details: { email: user.email, error: emailResult.error },
        ip: getClientIp(req),
        userAgent: req.headers.get("user-agent") || undefined,
        severity: "warning",
      });

      return NextResponse.json(
        {
          error:
            "Could not send verification email. Check that your Resend domain is verified and RESEND_API_KEY is valid.",
          details: process.env.NODE_ENV === "development" ? emailResult.error : undefined,
        },
        { status: 502 },
      );
    }

    await logAuditEvent(db, {
      userId: user.id,
      action: "ADMIN_OTP_SENT",
      details: {
        email: user.email,
        emailDelivered: emailResult.success,
        deliveryMode,
        messageId: emailResult.messageId,
      },
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent") || undefined,
      severity: "info",
    });

    return NextResponse.json({
      success: true,
      message: emailResult.success
        ? "Verification code sent to your email"
        : "Code generated — email provider not configured on server",
      expiresIn: OTP_EXPIRY_MINUTES * 60,
      email: maskEmail(user.email),
      emailDelivered: HAS_RESEND && emailResult.success,
      deliveryMode,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Admin OTP] Send error:", message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
