'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, Key, Loader2, LogOut, Mail, Phone, Save, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';

export default function SettingsPage() {
  const { isAuthenticated, profile, loading: authLoading, supabase, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    phone: profile?.phone || '',
  });

  const handleSave = async () => {
    if (!supabase || !profile) return;
    setSaving(true);
    try {
      await supabase.from('profiles').update({
        full_name: formData.fullName,
        phone: formData.phone,
      }).eq('id', profile.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ }
    finally { setSaving(false); }
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

  const TABS = [
    { key: 'profile' as const, label: 'Profile', icon: User },
    { key: 'security' as const, label: 'Security', icon: Shield },
    { key: 'notifications' as const, label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <h1 className="text-lg font-bold text-slate-900">Settings</h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          {/* Sidebar */}
          <nav className="space-y-1">
            {TABS.map((tab) => (
              <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
                className={cn('flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors', activeTab === tab.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900')}>
                <tab.icon className="h-4 w-4" /> {tab.label}
              </button>
            ))}
            <div className="my-3 border-t border-slate-200" />
            <button type="button" onClick={() => void signOut()} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </nav>

          {/* Content */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            {activeTab === 'profile' && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-slate-900">Profile Information</h2>
                <div><label className="mb-1 block text-xs font-semibold text-slate-500">Email</label><Input value={profile?.email || ''} disabled className="bg-slate-50" /></div>
                <div><label className="mb-1 block text-xs font-semibold text-slate-500">Full Name</label><Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} /></div>
                <div><label className="mb-1 block text-xs font-semibold text-slate-500">Phone</label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91..." /></div>
                <div><label className="mb-1 block text-xs font-semibold text-slate-500">Role</label><Input value={profile?.role || 'buyer'} disabled className="bg-slate-50 capitalize" /></div>
                <div className="flex items-center gap-3 pt-2">
                  <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white font-bold">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Changes
                  </Button>
                  {saved && <span className="text-xs font-semibold text-emerald-600">✓ Saved</span>}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-slate-900">Security</h2>
                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div><div className="text-sm font-semibold text-slate-900">Password</div><p className="text-xs text-slate-500">Change your account password</p></div>
                    <Button variant="outline" size="sm" onClick={handlePasswordChange} disabled={saving}><Key className="mr-2 h-3.5 w-3.5" /> Change Password</Button>
                  </div>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="text-sm font-semibold text-red-900">Danger Zone</div>
                  <p className="mt-1 text-xs text-red-600 mb-3">Permanently delete your account and all associated data.</p>
                  <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-100" disabled>Delete Account</Button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-slate-900">Notification Preferences</h2>
                {[
                  { label: 'New inquiry responses', desc: 'When a supplier responds to your requirement' },
                  { label: 'Quote updates', desc: 'When you receive new quotes or price updates' },
                  { label: 'Verification status', desc: 'Updates on your verification progress' },
                  { label: 'Platform announcements', desc: 'New features and marketplace updates' },
                ].map((pref) => (
                  <div key={pref.label} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                    <div><div className="text-sm font-semibold text-slate-900">{pref.label}</div><p className="text-xs text-slate-500">{pref.desc}</p></div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" defaultChecked className="peer sr-only" />
                      <div className="peer h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
