'use client';
import { KPICard } from '@/components/ops/shared/KPICard';
import { DollarSign, TrendingUp, Users, Target } from 'lucide-react';

export default function RevenuePage() {
  return (
    <div>
      <div className="ops-section-header">
        <div>
          <h1 className="ops-section-title">Revenue Analytics</h1>
          <p className="ops-section-subtitle">MRR, ARR, LTV/CAC, and revenue forecasting</p>
        </div>
      </div>
      <div className="ops-kpi-grid">
        <KPICard title="MRR" value="₹3.2L" icon={DollarSign} variant="success" change={12.5} changeLabel="vs last month" sparkline={[3,4,5,4,6,7,6,8,9,10]} />
        <KPICard title="ARR" value="₹38.4L" icon={TrendingUp} variant="info" change={12.5} changeLabel="projected" />
        <KPICard title="Avg LTV" value="₹2.8L" icon={Users} variant="success" />
        <KPICard title="CAC" value="₹4,200" icon={Target} variant="warning" change={-8} changeLabel="improving" />
      </div>
      <div className="ops-grid-2">
        <div className="ops-panel">
          <div className="ops-panel-header"><div className="ops-panel-title">Revenue Trend</div></div>
          <div className="ops-panel-body" style={{ height: 240, display: 'grid', placeItems: 'center', color: 'var(--ops-text-muted)' }}>
            Revenue chart visualization — Phase 3
          </div>
        </div>
        <div className="ops-panel">
          <div className="ops-panel-header"><div className="ops-panel-title">Revenue by Source</div></div>
          <div className="ops-panel-body" style={{ height: 240, display: 'grid', placeItems: 'center', color: 'var(--ops-text-muted)' }}>
            Pie chart — Memberships vs Commissions vs Ads
          </div>
        </div>
      </div>
    </div>
  );
}
