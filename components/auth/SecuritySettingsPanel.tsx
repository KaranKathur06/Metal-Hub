"use client";

import { Shield, ShieldAlert, Smartphone, Trash2 } from "lucide-react";
import { getSecurityStrength, getSessionRecencyLabel, type AccountSession } from "../../lib/marketplace/security-status";

type SecuritySettingsPanelProps = {
  emailVerified: boolean;
  phoneVerified?: boolean;
  mfaEnabled?: boolean;
  sessions: AccountSession[];
  onRevokeSession?: (sessionId: string) => void;
};

export function SecuritySettingsPanel({
  emailVerified,
  phoneVerified,
  mfaEnabled,
  sessions,
  onRevokeSession,
}: SecuritySettingsPanelProps) {
  const security = getSecurityStrength({
    emailVerified,
    phoneVerified,
    mfaEnabled,
    activeSessionCount: sessions.length,
  });

  return (
    <section className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-950 text-white">
            {security.label === "Needs attention" ? <ShieldAlert className="h-5 w-5" aria-hidden="true" /> : <Shield className="h-5 w-5" aria-hidden="true" />}
          </span>
          <div>
            <h2 className="text-sm font-semibold text-zinc-950">Account security</h2>
            <p className="mt-1 text-sm text-zinc-600">Review verification status, MFA coverage, and active sessions.</p>
          </div>
        </div>

        <div className="rounded-md border border-zinc-200 px-3 py-2 text-right">
          <div className="text-xs text-zinc-500">Security</div>
          <div className="text-sm font-semibold text-zinc-900">{security.label}</div>
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-3">
        <div className="rounded-md border border-zinc-200 px-3 py-3 text-sm">
          <div className="text-zinc-500">Email</div>
          <div className="mt-1 font-medium text-zinc-900">{emailVerified ? "Verified" : "Pending verification"}</div>
        </div>
        <div className="rounded-md border border-zinc-200 px-3 py-3 text-sm">
          <div className="text-zinc-500">Phone</div>
          <div className="mt-1 font-medium text-zinc-900">{phoneVerified ? "Verified" : "Not verified"}</div>
        </div>
        <div className="rounded-md border border-zinc-200 px-3 py-3 text-sm">
          <div className="text-zinc-500">MFA</div>
          <div className="mt-1 font-medium text-zinc-900">{mfaEnabled ? "Enabled" : "Disabled"}</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-sm font-semibold text-zinc-900">Active sessions</div>
        <div className="mt-2 space-y-2">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 px-3 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-900">
                  <Smartphone className="h-4 w-4" aria-hidden="true" />
                  <span className="truncate">{session.deviceLabel}</span>
                  {session.current ? <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-700">Current</span> : null}
                </div>
                <div className="mt-1 text-xs text-zinc-500">
                  {[session.locationLabel, session.ipAddress, getSessionRecencyLabel(session.lastActiveAt)].filter(Boolean).join(" - ")}
                </div>
              </div>

              {!session.current && onRevokeSession ? (
                <button
                  className="inline-flex items-center gap-1 rounded-md border border-zinc-200 px-2 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                  type="button"
                  onClick={() => onRevokeSession(session.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Revoke
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

