'use client';

import { useOps } from '@/lib/ops/ops-context';
import { Shield, TrendingUp } from 'lucide-react';

export function ModeSwitch() {
  const { mode, setMode } = useOps();

  return (
    <div className="ops-mode-switch">
      <button
        className={`ops-mode-btn ${mode === 'admin' ? 'active admin' : ''}`}
        onClick={() => setMode('admin')}
        title="Admin Mode (Ctrl+M)"
      >
        <Shield className="w-3.5 h-3.5" />
        <span>Admin</span>
      </button>
      <button
        className={`ops-mode-btn ${mode === 'crm' ? 'active crm' : ''}`}
        onClick={() => setMode('crm')}
        title="CRM Mode (Ctrl+M)"
      >
        <TrendingUp className="w-3.5 h-3.5" />
        <span>CRM</span>
      </button>
      <div className={`ops-mode-slider ${mode}`} />
    </div>
  );
}
