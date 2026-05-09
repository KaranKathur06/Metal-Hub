'use client';
import { KPICard } from '@/components/ops/shared/KPICard';
import { BarChart3, TrendingUp, Users, Award, Phone } from 'lucide-react';

const leaderboard = [
  { rank: 1, name: 'You', deals: 12, value: '₹22.3L', conversion: '32%' },
  { rank: 2, name: 'Priya Sharma', deals: 9, value: '₹18.1L', conversion: '28%' },
  { rank: 3, name: 'Amit Patel', deals: 7, value: '₹14.5L', conversion: '24%' },
  { rank: 4, name: 'Neha Gupta', deals: 5, value: '₹8.2L', conversion: '20%' },
];

export default function AnalyticsPage() {
  return (
    <div>
      <div className="ops-section-header">
        <div>
          <h1 className="ops-section-title">Sales Analytics</h1>
          <p className="ops-section-subtitle">Performance tracking, conversion funnels, and forecasting</p>
        </div>
      </div>
      <div className="ops-kpi-grid">
        <KPICard title="Deals Closed (Month)" value="33" icon={Award} variant="success" change={15} changeLabel="vs last month" />
        <KPICard title="Avg Deal Size" value="₹4.8L" icon={TrendingUp} variant="info" change={8} changeLabel="vs last month" />
        <KPICard title="Calls Made (Week)" value="87" icon={Phone} variant="info" />
        <KPICard title="Win Rate" value="28.5%" icon={BarChart3} variant="success" change={3.2} changeLabel="vs last month" />
      </div>

      <div className="ops-grid-2">
        {/* Leaderboard */}
        <div className="ops-panel">
          <div className="ops-panel-header"><div className="ops-panel-title">Sales Leaderboard</div></div>
          <div className="ops-panel-body" style={{ padding: 0 }}>
            {leaderboard.map(agent => (
              <div key={agent.rank} style={{
                padding: '12px 20px', borderBottom: '1px solid var(--ops-border)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <span style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center',
                  fontSize: 12, fontWeight: 700,
                  background: agent.rank === 1 ? 'linear-gradient(135deg, #f59e0b, #f97316)' :
                              agent.rank === 2 ? 'linear-gradient(135deg, #94a3b8, #64748b)' :
                              agent.rank === 3 ? 'linear-gradient(135deg, #b45309, #92400e)' : 'var(--ops-surface-2)',
                  color: agent.rank <= 3 ? 'white' : 'var(--ops-text-muted)',
                }}>{agent.rank}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ops-text)', margin: 0 }}>{agent.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--ops-text-muted)', margin: 0 }}>{agent.deals} deals · {agent.conversion} conv.</p>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ops-accent-crm)' }}>{agent.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="ops-panel">
          <div className="ops-panel-header"><div className="ops-panel-title">Conversion Funnel</div></div>
          <div className="ops-panel-body">
            {[
              { stage: 'Leads Generated', count: 120, pct: 100 },
              { stage: 'Contacted', count: 85, pct: 71 },
              { stage: 'Qualified', count: 42, pct: 35 },
              { stage: 'Negotiation', count: 18, pct: 15 },
              { stage: 'Won', count: 12, pct: 10 },
            ].map(s => (
              <div key={s.stage} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--ops-text-secondary)' }}>{s.stage}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ops-text)' }}>{s.count} ({s.pct}%)</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: 'var(--ops-surface-2)', overflow: 'hidden' }}>
                  <div style={{
                    width: `${s.pct}%`, height: '100%', borderRadius: 4,
                    background: 'linear-gradient(90deg, var(--ops-accent-crm), #059669)',
                    transition: 'width 500ms ease-out',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
