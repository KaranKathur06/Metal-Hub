'use client';
import { KPICard } from '@/components/ops/shared/KPICard';
import { DollarSign, CreditCard, ArrowDownLeft, TrendingUp } from 'lucide-react';

export default function FinancePage() {
  return (
    <div>
      <div className="ops-section-header">
        <div>
          <h1 className="ops-section-title">Revenue Operations</h1>
          <p className="ops-section-subtitle">GMV, commissions, payouts, and transaction monitoring</p>
        </div>
      </div>
      <div className="ops-kpi-grid">
        <KPICard title="GMV (This Month)" value="₹28.4L" icon={DollarSign} variant="success" change={15.2} changeLabel="vs last month" sparkline={[3,5,4,7,8,6,9,11,10,14]} />
        <KPICard title="Commission Revenue" value="₹2.84L" icon={TrendingUp} variant="info" change={15.2} changeLabel="10% rate" />
        <KPICard title="Successful Payments" value="342" icon={CreditCard} variant="success" change={8.5} changeLabel="vs last month" />
        <KPICard title="Refunds" value="₹45K" icon={ArrowDownLeft} variant="warning" change={-12} changeLabel="vs last month" />
      </div>
      <div className="ops-panel">
        <div className="ops-panel-header"><div className="ops-panel-title">Transaction History</div></div>
        <div className="ops-panel-body" style={{ padding: 40, textAlign: 'center', color: 'var(--ops-text-muted)' }}>
          <DollarSign className="w-12 h-12" style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p>Transaction table, payout tracking, and tax calculations — Phase 2</p>
        </div>
      </div>
    </div>
  );
}
