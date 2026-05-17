'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bell, Building2, CreditCard, Key, Loader2, LogOut,
  Mail, Phone, Save, Shield, ShieldAlert, User, Eye, EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';
import { isAdminRole, isSellerRole, requires2FA } from '@/lib/constants/roles';

type SettingsTab = 'profile' | 'security' | 'notifications' | 'privacy' | 'billing';

export default function SettingsPage() {
  const { isAuthenticated, profile, loading: authLoading, supabase, signOut, role } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    bio: '',
  });

  // Notification prefs stored via settings API
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>({
    inquiry_responses: true,
    quote_updates: true,
    verification_status: true,
    platform_announcements: true,
    marketing_emails: false,
    weekly_digest: true,
  });

  const [privacyPrefs, setPrivacyPrefs] = useState<Record<string, boolean>>({
    show_phone: true,
    show_email: false,
    show_company: true,
    allow_messages: true,
    analytics_tracking: true,
  });

  // Load profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || '',
        phone: profile.phone || '',
        bio: (profile as any).bio || '',
      });
    }
  }, [profile]);

  // Load settings from API
  useEffect(() => {
    if (!isAuthenticated) return;
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/settings/user', { credentials: 'include' });
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.notifications) {
            setNotifPrefs(prev => ({ ...prev, ...json.data.notifications }));
          }
          if (json.data.privacy) {
            setPrivacyPrefs(prev => ({ ...prev, ...json.data.privacy }));
          }
        }
      } catch { /* first time — use defaults */ }
    };
    loadSettings();
  }, [isAuthenticated]);

  const showSuccess = useCallback(() => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }, []);

  const handleSaveProfile = async () => {
    if (!supabase || !profile) return;
    setSaving(true);
    setError(null);
    try {
      const { error: updateError } = await supabase.from('profiles').update({
        full_name: formData.fullName,
        phone: formData.phone,
      }).eq('id', profile.id);
      if (updateError) throw updateError;
      showSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/settings/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications: notifPrefs }),
        credentials: 'include',
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      showSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrivacy = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/settings/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ privacy: privacyPrefs }),
        credentials: 'include',
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);
      showSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!supabase || !profile?.email) return;
    setSaving(true);
    await supabase.auth.resetPasswordForEmail(profile.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSaving(false);
    alert('Password reset link sent to your email.');
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-6">
        <h1 className="text-xl font-bold text-slate-900 mb-2">Login Required</h1>
        <Link href="/login?redirect=/settings"><Button>Login</Button></Link>
      </div>
    );
  }

  const TABS: { key: SettingsTab; label: string; icon: any }[] = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'privacy', label: 'Privacy', icon: Eye },
    { key: 'billing', label: 'Billing', icon: CreditCard },
  ];

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200',
        checked ? 'bg-blue-600' : 'bg-slate-200'
      )}
    >
      <span className={cn(
        'inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200',
        checked ? 'translate-x-[18px]' : 'translate-x-[2px]'
      )} />
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <h1 className="text-lg font-bold text-slate-900">Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage your account preferences and security</p>
        </div>
      </div>

      {error && (
        <div className="mx-auto max-w-4xl px-6 pt-4">
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          {/* Sidebar */}
          <nav className="space-y-1">
            {TABS.map((tab) => (
              <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
                className={cn('flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  activeTab === tab.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900')}>
                <tab.icon className="h-4 w-4" /> {tab.label}
              </button>
            ))}

            {isSellerRole(role) && (
              <>
                <div className="my-3 border-t border-slate-200" />
                <Link href="/seller/settings/store" className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-900">
                  <Building2 className="h-4 w-4" /> Store Settings
                </Link>
              </>
            )}

            <div className="my-3 border-t border-slate-200" />
            <button type="button" onClick={() => void signOut()} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </nav>

          {/* Content */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            {/* ── Profile Tab ── */}
            {activeTab === 'profile' && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-slate-900">Profile Information</h2>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Email</label>
                  <Input value={profile?.email || ''} disabled className="bg-slate-50" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Full Name</label>
                  <Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Phone</label>
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91..." />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Role</label>
                  <Input value={role || 'buyer'} disabled className="bg-slate-50 capitalize" />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Button onClick={handleSaveProfile} disabled={saving} className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white font-bold">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Changes
                  </Button>
                  {saved && <span className="text-xs font-semibold text-emerald-600">✓ Saved</span>}
                </div>
              </div>
            )}

            {/* ── Security Tab ── */}
            {activeTab === 'security' && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-slate-900">Security</h2>

                {/* Password */}
                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Password</div>
                      <p className="text-xs text-slate-500">Change your account password via email link</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handlePasswordChange} disabled={saving}>
                      <Key className="mr-2 h-3.5 w-3.5" /> Change Password
                    </Button>
                  </div>
                </div>

                {/* 2FA Status (admin only) */}
                {requires2FA(role) && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-amber-600" />
                      <div className="text-sm font-semibold text-amber-900">Admin 2FA Required</div>
                    </div>
                    <p className="mt-1 text-xs text-amber-700">
                      As a {role}, you must verify your identity via email OTP before accessing admin panels.
                      This happens automatically when you navigate to /admin.
                    </p>
                  </div>
                )}

                {/* Active Sessions */}
                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="text-sm font-semibold text-slate-900">Active Sessions</div>
                  <p className="mt-1 text-xs text-slate-500">Current session: <span className="font-mono text-slate-700">{navigator.userAgent.slice(0, 50)}...</span></p>
                </div>

                {/* Danger Zone */}
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="text-sm font-semibold text-red-900">Danger Zone</div>
                  <p className="mt-1 text-xs text-red-600 mb-3">Permanently delete your account and all associated data.</p>
                  <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-100" disabled>Delete Account</Button>
                </div>
              </div>
            )}

            {/* ── Notifications Tab ── */}
            {activeTab === 'notifications' && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-slate-900">Notification Preferences</h2>
                {[
                  { key: 'inquiry_responses', label: 'New inquiry responses', desc: 'When a supplier responds to your requirement' },
                  { key: 'quote_updates', label: 'Quote updates', desc: 'When you receive new quotes or price updates' },
                  { key: 'verification_status', label: 'Verification status', desc: 'Updates on your verification progress' },
                  { key: 'platform_announcements', label: 'Platform announcements', desc: 'New features and marketplace updates' },
                  { key: 'marketing_emails', label: 'Marketing emails', desc: 'Promotional offers and partner updates' },
                  { key: 'weekly_digest', label: 'Weekly digest', desc: 'Summary of marketplace activity' },
                ].map((pref) => (
                  <div key={pref.key} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{pref.label}</div>
                      <p className="text-xs text-slate-500">{pref.desc}</p>
                    </div>
                    <Toggle checked={notifPrefs[pref.key] ?? true} onChange={(v) => setNotifPrefs({ ...notifPrefs, [pref.key]: v })} />
                  </div>
                ))}
                <div className="flex items-center gap-3 pt-2">
                  <Button onClick={handleSaveNotifications} disabled={saving} className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white font-bold">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Preferences
                  </Button>
                  {saved && <span className="text-xs font-semibold text-emerald-600">✓ Saved</span>}
                </div>
              </div>
            )}

            {/* ── Privacy Tab ── */}
            {activeTab === 'privacy' && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-slate-900">Privacy Settings</h2>
                {[
                  { key: 'show_phone', label: 'Show phone number', desc: 'Allow other users to see your phone number on your profile' },
                  { key: 'show_email', label: 'Show email address', desc: 'Display your email publicly on marketplace listings' },
                  { key: 'show_company', label: 'Show company info', desc: 'Display your company details on your profile' },
                  { key: 'allow_messages', label: 'Allow direct messages', desc: 'Let other users contact you via the platform' },
                  { key: 'analytics_tracking', label: 'Analytics tracking', desc: 'Help us improve by allowing anonymous usage analytics' },
                ].map((pref) => (
                  <div key={pref.key} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{pref.label}</div>
                      <p className="text-xs text-slate-500">{pref.desc}</p>
                    </div>
                    <Toggle checked={privacyPrefs[pref.key] ?? true} onChange={(v) => setPrivacyPrefs({ ...privacyPrefs, [pref.key]: v })} />
                  </div>
                ))}
                <div className="flex items-center gap-3 pt-2">
                  <Button onClick={handleSavePrivacy} disabled={saving} className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white font-bold">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Privacy
                  </Button>
                  {saved && <span className="text-xs font-semibold text-emerald-600">✓ Saved</span>}
                </div>
              </div>
            )}

            {/* ── Billing Tab ── */}
            {activeTab === 'billing' && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-slate-900">Billing & Subscription</h2>
                <div className="rounded-lg border border-slate-200 p-6 text-center">
                  <CreditCard className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                  <div className="text-sm font-semibold text-slate-900">Free Plan</div>
                  <p className="text-xs text-slate-500 mt-1">You&apos;re on the free tier. Upgrade for premium features.</p>
                  <Button variant="outline" size="sm" className="mt-4" disabled>
                    Upgrade Coming Soon
                  </Button>
                </div>
                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="text-sm font-semibold text-slate-900">Payment History</div>
                  <p className="mt-1 text-xs text-slate-500">No payments recorded yet.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
