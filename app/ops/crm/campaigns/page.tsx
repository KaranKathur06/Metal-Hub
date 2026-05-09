'use client';
import { Mail, Zap } from 'lucide-react';

export default function CampaignsPage() {
  return (
    <div>
      <div className="ops-section-header">
        <div>
          <h1 className="ops-section-title">Campaign Management</h1>
          <p className="ops-section-subtitle">Email, WhatsApp, and automated campaign workflows</p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
          borderRadius: 8, border: 'none', background: 'var(--ops-accent-crm)',
          color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}><Zap className="w-4 h-4" /> New Campaign</button>
      </div>
      <div className="ops-panel">
        <div className="ops-panel-body" style={{ padding: 40, textAlign: 'center', color: 'var(--ops-text-muted)' }}>
          <Mail className="w-12 h-12" style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p>Campaign builder with templates, scheduling, and analytics — Phase 3</p>
        </div>
      </div>
    </div>
  );
}
