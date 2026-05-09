'use client';

import { KPICard } from '@/components/ops/shared/KPICard';
import { StatusBadge } from '@/components/ops/shared/StatusBadge';
import {
  Users, Package, ShieldAlert, DollarSign,
  AlertTriangle, UserPlus, FileCheck, Eye,
  ArrowRight, Clock, CheckCircle2, XCircle,
} from 'lucide-react';

// Demo data — will be replaced with API calls
const recentActivity = [
  { icon: UserPlus, text: '<strong>Tata Metaliks</strong> registered as new supplier', time: '3 min ago', variant: 'info' },
  { icon: FileCheck, text: 'Listing <strong>#L-4821</strong> approved by moderator', time: '12 min ago', variant: 'success' },
  { icon: ShieldAlert, text: 'Fraud alert: duplicate account from <strong>103.x.x.x</strong>', time: '18 min ago', variant: 'danger' },
  { icon: DollarSign, text: 'Payment of <strong>₹45,000</strong> received — Gold membership', time: '32 min ago', variant: 'success' },
  { icon: XCircle, text: 'Listing <strong>#L-4819</strong> rejected — policy violation', time: '1 hr ago', variant: 'danger' },
];

const pendingListings = [
  { id: 'L-4823', title: 'Hot Rolled Steel Coils — IS 2062 E350', seller: 'JSW Steel Traders', time: '5 min ago', type: 'STEEL' },
  { id: 'L-4822', title: 'Aluminium Billets 6063 T6 — 500MT', seller: 'Hindalco Exports', time: '22 min ago', type: 'ALUMINIUM' },
  { id: 'L-4820', title: 'Copper Cathode Grade A — LME Spec', seller: 'Birla Copper', time: '1 hr ago', type: 'COPPER' },
];

export default function AdminCommandCenter() {
  return (
    <div>
      {/* Priority Alert */}
      <div className="ops-alert danger">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <span>3 fraud alerts require immediate review — <a href="/ops/admin/security" style={{ textDecoration: 'underline' }}>View Security Center</a></span>
      </div>

      {/* KPI Grid */}
      <div className="ops-kpi-grid">
        <KPICard
          title="Total Users"
          value="2,847"
          change={12.5}
          changeLabel="vs last month"
          icon={Users}
          variant="info"
          sparkline={[3, 5, 4, 7, 6, 8, 9, 7, 10, 12]}
        />
        <KPICard
          title="Active Listings"
          value="1,234"
          change={8.3}
          changeLabel="vs last month"
          icon={Package}
          variant="success"
          sparkline={[6, 4, 7, 5, 8, 6, 9, 7, 10, 8]}
        />
        <KPICard
          title="Pending Moderation"
          value="23"
          change={-15}
          changeLabel="vs yesterday"
          icon={ShieldAlert}
          variant="warning"
        />
        <KPICard
          title="Revenue Today"
          value="₹4.2L"
          change={22.1}
          changeLabel="vs yesterday"
          icon={DollarSign}
          variant="success"
          sparkline={[2, 4, 3, 6, 5, 8, 7, 9, 11, 14]}
        />
      </div>

      {/* Two Column Layout */}
      <div className="ops-grid-2">
        {/* Moderation Queue */}
        <div className="ops-panel">
          <div className="ops-panel-header">
            <div>
              <div className="ops-panel-title">Moderation Queue</div>
            </div>
            <a href="/ops/admin/listings" className="ops-text-btn" style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
              View All <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="ops-panel-body" style={{ padding: 0 }}>
            {pendingListings.map((item) => (
              <div key={item.id} style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--ops-border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--ops-text-muted)', fontFamily: 'monospace' }}>{item.id}</span>
                    <StatusBadge status={item.type} variant="neutral" dot={false} />
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--ops-text)', margin: 0 }}>{item.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--ops-text-muted)', margin: '2px 0 0' }}>
                    {item.seller} · <Clock className="w-3 h-3" style={{ display: 'inline', verticalAlign: '-2px' }} /> {item.time}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="ops-icon-btn" title="Approve" style={{ color: 'var(--ops-success)', borderColor: 'rgba(34,197,94,0.3)' }}>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button className="ops-icon-btn" title="Reject" style={{ color: 'var(--ops-danger)', borderColor: 'rgba(239,68,68,0.3)' }}>
                    <XCircle className="w-4 h-4" />
                  </button>
                  <button className="ops-icon-btn" title="Review">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="ops-panel">
          <div className="ops-panel-header">
            <div className="ops-panel-title">Recent Activity</div>
            <a href="/ops/admin/audit" className="ops-text-btn" style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
              Audit Logs <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="ops-panel-body">
            <div className="ops-activity-list">
              {recentActivity.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="ops-activity-item">
                    <div className="ops-activity-icon" style={{
                      background: item.variant === 'danger' ? 'rgba(239,68,68,0.12)' :
                                  item.variant === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(59,130,246,0.12)',
                      color: item.variant === 'danger' ? 'var(--ops-danger)' :
                             item.variant === 'success' ? 'var(--ops-success)' : 'var(--ops-info)',
                    }}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="ops-activity-content">
                      <p className="ops-activity-text" dangerouslySetInnerHTML={{ __html: item.text }} />
                      <p className="ops-activity-time">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
