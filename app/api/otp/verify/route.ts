/**
 * Metal Hub — OTP Verify API Route
 *
 * POST /api/otp/verify
 * Validates a submitted OTP against the stored hash.
 * Tracks attempts and auto-invalidates after max attempts.
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { verifyOTPHash, isValidOTPPurpose } from '@/lib/auth/otp';
import { logAdminAction } from '@/lib/auth/protect-route';

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVICE_UNAVAILABLE', message: 'Service unavailable' } },
      { status: 503 },
    );
  }

  // ── Auth check ──
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } },
      { status: 401 },
    );
  }

  // ── Parse body ──
  let body: { otp?: string; purpose?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request body' } },
      { status: 400 },
    );
  }

  const { otp, purpose = 'admin_2fa' } = body;

  if (!otp || typeof otp !== 'string' || otp.length !== 6) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'OTP must be a 6-digit code' } },
      { status: 400 },
    );
  }

  if (!isValidOTPPurpose(purpose)) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid OTP purpose' } },
      { status: 400 },
    );
  }

  // ── Find the latest unused, non-expired OTP for this user + purpose ──
  const { data: otpRecord, error: fetchError } = await supabase
    .from('otp_verifications')
    .select('*')
    .eq('user_id', user.id)
    .eq('purpose', purpose)
    .eq('is_used', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError || !otpRecord) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'No pending OTP found. Please request a new one.' } },
      { status: 400 },
    );
  }

  // ── Check if max attempts exceeded ──
  if (otpRecord.attempts >= otpRecord.max_attempts) {
    // Invalidate the OTP
    await supabase
      .from('otp_verifications')
      .update({ is_used: true })
      .eq('id', otpRecord.id);

    await logAdminAction(supabase, {
      userId: user.id,
      action: 'otp_max_attempts',
      resource: 'otp_verifications',
      resourceId: otpRecord.id,
      details: { purpose, attempts: otpRecord.attempts },
      severity: 'warning',
      request,
    });

    return NextResponse.json(
      { success: false, error: { code: 'RATE_LIMITED', message: 'Too many failed attempts. Please request a new OTP.' } },
      { status: 429 },
    );
  }

  // ── Verify the OTP hash ──
  const isValid = verifyOTPHash(otp, otpRecord.otp_hash);

  if (!isValid) {
    // Increment attempts
    await supabase
      .from('otp_verifications')
      .update({ attempts: otpRecord.attempts + 1 })
      .eq('id', otpRecord.id);

    const remaining = otpRecord.max_attempts - otpRecord.attempts - 1;

    await logAdminAction(supabase, {
      userId: user.id,
      action: 'otp_verify_failed',
      resource: 'otp_verifications',
      resourceId: otpRecord.id,
      details: { purpose, attemptsUsed: otpRecord.attempts + 1, remaining },
      severity: 'warning',
      request,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_OTP',
          message: `Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
        },
      },
      { status: 401 },
    );
  }

  // ── OTP is valid — mark as used ──
  await supabase
    .from('otp_verifications')
    .update({ is_used: true, used_at: new Date().toISOString() })
    .eq('id', otpRecord.id);

  // ── Purpose-specific post-verification actions ──
  const responseData: Record<string, any> = { verified: true, purpose };

  if (purpose === 'admin_2fa') {
    // Create an admin session (4 hours)
    const sessionExpiry = new Date();
    sessionExpiry.setHours(sessionExpiry.getHours() + 4);

    const sessionToken = crypto.randomUUID();

    await supabase.from('admin_sessions').insert({
      user_id: user.id,
      session_token: sessionToken,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
      user_agent: request.headers.get('user-agent') || null,
      is_active: true,
      expires_at: sessionExpiry.toISOString(),
    });

    responseData.sessionToken = sessionToken;
    responseData.expiresAt = sessionExpiry.toISOString();
  }

  // ── Audit log ──
  await logAdminAction(supabase, {
    userId: user.id,
    action: 'otp_verified',
    resource: 'otp_verifications',
    resourceId: otpRecord.id,
    details: { purpose },
    severity: 'info',
    request,
  });

  return NextResponse.json({ success: true, data: responseData });
}
