'use client';
import { KPICard } from '@/components/ops/shared/KPICard';
import { Headphones, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function SupportPage() {
  return (
    <div>
      <div className="ops-section-header">
        <div>
          <h1 className="ops-section-title">Support Center</h1>
          <p className="ops-section-subtitle">Tickets, escalations, and SLA tracking</p>
        </div>
      </div>
      <div className="ops-kpi-grid">
        <KPICard title="Open Tickets" value="12" icon={Headphones} variant="warning" />
        <KPICard title="Avg Resolution" value="4.2 hrs" icon={Clock} variant="info" change={-18} changeLabel="improving" />
        <KPICard title="Resolved (Week)" value="48" icon={CheckCircle2} variant="success" />
        <KPICard title="Escalations" value="3" icon={AlertTriangle} variant="danger" />
      </div>
      <div className="ops-panel">
        <div className="ops-panel-header"><div className="ops-panel-title">Support ticket queue — Phase 2</div></div>
        <div className="ops-panel-body" style={{ padding: 40, textAlign: 'center', color: 'var(--ops-text-muted)' }}>
          <Headphones className="w-12 h-12" style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p>Ticket management, live chat monitoring, SLA timers</p>
        </div>
      </div>
    </div>
  );
}
