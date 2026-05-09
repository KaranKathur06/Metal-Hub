'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

export type OpsMode = 'admin' | 'crm';

export interface OpsUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
}

interface OpsContextType {
  mode: OpsMode;
  setMode: (mode: OpsMode) => void;
  toggleMode: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (v: boolean) => void;
  user: OpsUser | null;
  setUser: (user: OpsUser | null) => void;
}

const OpsContext = createContext<OpsContextType | null>(null);

export function OpsProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<OpsMode>('admin');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [user, setUser] = useState<OpsUser | null>(null);

  const setMode = useCallback((m: OpsMode) => {
    setModeState(m);
    if (typeof window !== 'undefined') localStorage.setItem('ops-mode', m);
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === 'admin' ? 'crm' : 'admin');
  }, [mode, setMode]);

  const toggleSidebar = useCallback(() => setSidebarCollapsed(p => !p), []);

  useEffect(() => {
    const saved = localStorage.getItem('ops-mode');
    if (saved === 'admin' || saved === 'crm') setModeState(saved);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(p => !p);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        toggleMode();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleMode]);

  return (
    <OpsContext.Provider value={{
      mode, setMode, toggleMode,
      sidebarCollapsed, setSidebarCollapsed, toggleSidebar,
      commandPaletteOpen, setCommandPaletteOpen,
      user, setUser,
    }}>
      {children}
    </OpsContext.Provider>
  );
}

export function useOps() {
  const ctx = useContext(OpsContext);
  if (!ctx) throw new Error('useOps must be used within OpsProvider');
  return ctx;
}
