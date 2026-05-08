'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, FileText, MessageSquare, Package, ShieldCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';

type Notification = {
  id: string;
  type: 'inquiry' | 'quote' | 'verification' | 'system' | 'listing';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  href?: string;
};

const ICON_MAP = {
  inquiry: MessageSquare,
  quote: FileText,
  verification: ShieldCheck,
  system: Bell,
  listing: Package,
};

export default function NotificationsPage() {
  const { isAuthenticated, loading } = useAuth();
  const [notifications] = useState<Notification[]>([
    { id: '1', type: 'system', title: 'Welcome to MetalHub', message: 'Complete your profile to start receiving inquiries from buyers.', read: false, createdAt: new Date().toISOString(), href: '/onboarding/seller' },
    { id: '2', type: 'verification', title: 'Profile Verification', message: 'Upload your GST certificate and company registration to get verified.', read: false, createdAt: new Date(Date.now() - 86400000).toISOString(), href: '/onboarding/seller' },
  ]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  if (!loading && !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-6">
        <Bell className="h-12 w-12 text-slate-300 mb-4" />
        <h1 className="text-xl font-bold text-slate-900 mb-2">Login Required</h1>
        <p className="text-sm text-slate-500 mb-6">Please login to view notifications.</p>
        <Link href="/login?redirect=/notifications"><Button>Login</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-bold text-slate-900">Notifications</h1>
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
            <button type="button" onClick={() => setFilter('all')} className={cn('rounded-md px-3 py-1 text-xs font-semibold', filter === 'all' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500')}>All</button>
            <button type="button" onClick={() => setFilter('unread')} className={cn('rounded-md px-3 py-1 text-xs font-semibold', filter === 'unread' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500')}>Unread</button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-6">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <CheckCheck className="mx-auto h-10 w-10 text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">You&apos;re all caught up!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((notif) => {
              const Icon = ICON_MAP[notif.type] || Bell;
              return (
                <Link key={notif.id} href={notif.href || '#'} className={cn('flex items-start gap-4 rounded-xl border bg-white px-5 py-4 transition-colors hover:bg-slate-50', !notif.read && 'border-blue-100 bg-blue-50/30')}>
                  <span className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', !notif.read ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400')}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{notif.title}</span>
                      {!notif.read && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{notif.message}</p>
                    <span className="mt-1 text-[10px] text-slate-400">{new Date(notif.createdAt).toLocaleDateString()}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
