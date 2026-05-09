'use client';

import { useOps } from '@/lib/ops/ops-context';
import { ModeSwitch } from './ModeSwitch';
import {
  Search, Bell, ChevronDown, Menu, Command,
  LogOut, Settings, User,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function TopBar() {
  const { toggleSidebar, sidebarCollapsed, mode, setCommandPaletteOpen } = useOps();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="ops-topbar">
      <div className="ops-topbar-left">
        <button className="ops-icon-btn" onClick={toggleSidebar} title="Toggle Sidebar">
          <Menu className="w-5 h-5" />
        </button>
        <div className="ops-logo">
          <div className={`ops-logo-icon ${mode}`}>M</div>
          <span className="ops-logo-text">MetalHub<span className="ops-logo-suffix">Ops</span></span>
        </div>
        <ModeSwitch />
      </div>

      <div className="ops-topbar-center">
        <button className="ops-search-trigger" onClick={() => setCommandPaletteOpen(true)}>
          <Search className="w-4 h-4" />
          <span>Search users, listings, leads…</span>
          <kbd className="ops-kbd"><Command className="w-3 h-3" />K</kbd>
        </button>
      </div>

      <div className="ops-topbar-right">
        <div className="ops-notif-wrapper" ref={notifRef}>
          <button className="ops-icon-btn" onClick={() => setNotifOpen(!notifOpen)}>
            <Bell className="w-5 h-5" />
            <span className="ops-notif-dot" />
          </button>
          {notifOpen && (
            <div className="ops-dropdown ops-notif-dropdown">
              <div className="ops-dropdown-header">
                <span>Notifications</span>
                <button className="ops-text-btn">Mark all read</button>
              </div>
              <div className="ops-dropdown-body">
                <div className="ops-notif-item unread">
                  <div className="ops-notif-dot-inline critical" />
                  <div>
                    <p className="ops-notif-title">Fraud alert detected</p>
                    <p className="ops-notif-desc">Suspicious multi-account activity from IP 103.x.x.x</p>
                    <p className="ops-notif-time">2 min ago</p>
                  </div>
                </div>
                <div className="ops-notif-item unread">
                  <div className="ops-notif-dot-inline high" />
                  <div>
                    <p className="ops-notif-title">3 listings pending review</p>
                    <p className="ops-notif-desc">Steel coils, aluminum sheets, copper wire</p>
                    <p className="ops-notif-time">15 min ago</p>
                  </div>
                </div>
                <div className="ops-notif-item">
                  <div className="ops-notif-dot-inline normal" />
                  <div>
                    <p className="ops-notif-title">New supplier registration</p>
                    <p className="ops-notif-desc">Tata Steel Industries joined the platform</p>
                    <p className="ops-notif-time">1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="ops-profile-wrapper" ref={profileRef}>
          <button className="ops-profile-btn" onClick={() => setProfileOpen(!profileOpen)}>
            <div className="ops-avatar">A</div>
            <span className="ops-profile-name">Admin</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {profileOpen && (
            <div className="ops-dropdown ops-profile-dropdown">
              <div className="ops-dropdown-profile-header">
                <div className="ops-avatar lg">A</div>
                <div>
                  <p className="ops-profile-fullname">Super Admin</p>
                  <p className="ops-profile-email">admin@metalhub.io</p>
                </div>
              </div>
              <div className="ops-dropdown-divider" />
              <a className="ops-dropdown-item" href="/ops/admin/settings">
                <Settings className="w-4 h-4" /> Platform Settings
              </a>
              <a className="ops-dropdown-item" href="/settings">
                <User className="w-4 h-4" /> My Account
              </a>
              <div className="ops-dropdown-divider" />
              <button className="ops-dropdown-item danger">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
