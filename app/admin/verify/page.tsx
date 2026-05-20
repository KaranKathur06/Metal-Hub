'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, Loader2, Lock, Mail, RefreshCw, Shield, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';
import { canRequestAdminOtp } from '@/lib/auth/rbac';

export default function AdminVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      }
    >
      <AdminVerifyForm />
    </Suspense>
  );
}

type VerifyStep = 'request' | 'verify' | 'verified';

function AdminVerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    isAuthenticated,
    loading: authLoading,
    profile,
    role,
    signOut,
    isSigningOut,
    sessionStatus,
  } = useAuth();

  const [step, setStep] = useState<VerifyStep>('request');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [expiresIn, setExpiresIn] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [deliveryNotice, setDeliveryNotice] = useState<string | null>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);

  const redirectPath = searchParams.get('redirect') || '/admin';

  // ── Cooldown Timer ──
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // ── Expiry Timer ──
  useEffect(() => {
    if (expiresIn <= 0) return;
    const timer = setInterval(() => {
      setExpiresIn((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresIn]);

  // ── Auth guard: hard redirect avoids middleware ↔ client redirect loop ──
  useEffect(() => {
    if (isSigningOut) return;
    if (sessionStatus === "unknown" || authLoading) return;
    if (!isAuthenticated) {
      window.location.replace("/login?signedOut=1");
    }
  }, [authLoading, isAuthenticated, isSigningOut, sessionStatus]);

  const isAdmin = canRequestAdminOtp(role ?? '');

  // ── Send OTP ──
  const handleSendOtp = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/otp/send', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.cooldownRemaining) {
          setCooldown(data.cooldownRemaining);
        }
        setError(data.error || 'Failed to send verification code');
        return;
      }

      setMaskedEmail(data.email || '');
      setExpiresIn(data.expiresIn || 300);
      setCooldown(60);
      setStep('verify');
      setOtp('');

      if (data.deliveryMode === 'console' || data.emailDelivered === false) {
        setDeliveryNotice(
          'No email was sent from the server. Add RESEND_API_KEY in Vercel environment variables, verify your domain in Resend, then redeploy. Until then, check Vercel → Deployments → Functions logs for "ADMIN 2FA" or your verification code.',
        );
      } else {
        setDeliveryNotice(
          'Check your inbox and spam/promotions folders. The subject line includes your 6-digit code.',
        );
      }

      // Auto-focus OTP input
      setTimeout(() => otpInputRef.current?.focus(), 100);
    } catch (err: any) {
      setError(err?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Verify OTP ──
  const handleVerifyOtp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (otp.length !== 6) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/admin/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otp }),
          credentials: 'include',
        });

        const data = await res.json();

        if (!res.ok) {
          if (data.remainingAttempts !== undefined) {
            setRemainingAttempts(data.remainingAttempts);
          }
          setError(data.error || 'Verification failed');
          return;
        }

        // ═══ VERIFIED — Redirect to admin dashboard ═══
        setStep('verified');
        setTimeout(() => {
          router.push(redirectPath);
          router.refresh();
        }, 1500);
      } catch (err: any) {
        setError(err?.message || 'Network error');
      } finally {
        setLoading(false);
      }
    },
    [otp, redirectPath, router]
  );

  // ── Loading state ──
  if (authLoading || isSigningOut || sessionStatus === "unknown") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        {isSigningOut ? (
          <p className="text-sm text-slate-500">Signing out…</p>
        ) : null}
      </div>
    );
  }

  // ── Non-admin role ──
  if (!authLoading && isAuthenticated && !isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <Lock className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Access Denied</h1>
          <p className="mt-2 text-sm text-slate-500">
            You do not have administrator privileges. This incident has been logged.
          </p>
          <Link href="/">
            <Button variant="outline" className="mt-6">
              <ArrowLeft className="mr-2 h-4 w-4" /> Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] shadow-lg shadow-blue-500/20">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Admin Verification
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Enhanced security verification required
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_40px_rgba(0,0,0,0.06)]">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Step 1: Request OTP ── */}
          {step === 'request' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-blue-50/50 p-4">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Email Verification
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      A 6-digit verification code will be sent to your registered email address.
                      This code expires in 5 minutes.
                    </p>
                  </div>
                </div>
              </div>

              {isAuthenticated && profile ? (
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
                  <div className="text-xs font-semibold text-slate-400">SIGNED IN AS</div>
                  <div className="mt-0.5 text-sm font-bold text-slate-900">
                    {profile.full_name || 'Admin User'}
                  </div>
                  <div className="text-xs text-slate-500">{profile.email}</div>
                </div>
              ) : null}

              <Button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full h-[44px] text-sm font-bold text-white rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] shadow-md hover:-translate-y-[1px] transition-transform"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Send Verification Code
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm text-slate-600"
                onClick={() => void signOut()}
              >
                Sign out and use a different account
              </Button>
            </div>
          )}

          {/* ── Step 2: Enter OTP ── */}
          {step === 'verify' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div
                className={cn(
                  'rounded-xl p-4',
                  deliveryNotice?.includes('No email was sent')
                    ? 'border border-amber-200 bg-amber-50'
                    : 'bg-emerald-50/50',
                )}
              >
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    className={cn(
                      'mt-0.5 h-5 w-5',
                      deliveryNotice?.includes('No email was sent')
                        ? 'text-amber-600'
                        : 'text-emerald-600',
                    )}
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {deliveryNotice?.includes('No email was sent')
                        ? 'Code generated (email not configured)'
                        : 'Code sent'}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Enter the 6-digit code for{' '}
                      <span className="font-semibold text-slate-700">{maskedEmail}</span>
                    </p>
                    {deliveryNotice ? (
                      <p className="mt-2 text-xs leading-relaxed text-slate-600">
                        {deliveryNotice}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div>
                <Input
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(val);
                    setError(null);
                  }}
                  className="h-14 rounded-xl border-slate-200 text-center text-2xl font-mono tracking-[0.4em] focus:border-blue-500 focus:ring-blue-500/20"
                  autoFocus
                  disabled={loading}
                />
              </div>

              {/* Timer and attempts */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  {expiresIn > 0 ? (
                    <>
                      Expires in{' '}
                      <span className={cn('font-mono font-bold', expiresIn <= 60 && 'text-red-500')}>
                        {Math.floor(expiresIn / 60)}:{String(expiresIn % 60).padStart(2, '0')}
                      </span>
                    </>
                  ) : (
                    <span className="text-red-500 font-semibold">Code expired</span>
                  )}
                </span>
                <span>
                  {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} left
                </span>
              </div>

              <Button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full h-[44px] text-sm font-bold text-white rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] shadow-md hover:-translate-y-[1px] transition-transform disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="mr-2 h-4 w-4" />
                )}
                Verify & Access Admin
              </Button>

              {/* Resend */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={cooldown > 0 || loading}
                  className={cn(
                    'inline-flex items-center gap-1.5 text-xs font-semibold transition-colors',
                    cooldown > 0
                      ? 'cursor-not-allowed text-slate-300'
                      : 'text-blue-600 hover:text-blue-800'
                  )}
                >
                  <RefreshCw className="h-3 w-3" />
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                </button>
              </div>
            </form>
          )}

          {/* ── Step 3: Verified ── */}
          {step === 'verified' && (
            <div className="space-y-4 text-center py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <ShieldCheck className="h-8 w-8 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Verified</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Admin access granted. Redirecting...
                </p>
              </div>
              <Loader2 className="mx-auto h-5 w-5 animate-spin text-blue-500" />
            </div>
          )}
        </div>

        {/* Security notice */}
        <div className="mt-4 text-center text-[11px] text-slate-400">
          <Lock className="mr-1 inline h-3 w-3" />
          Protected by MetalHub Security · Session expires in 4 hours
        </div>
      </div>
    </div>
  );
}
