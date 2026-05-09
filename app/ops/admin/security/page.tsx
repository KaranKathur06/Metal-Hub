'use client';

import { KPICard } from '@/components/ops/shared/KPICard';
import { StatusBadge } from '@/components/ops/shared/StatusBadge';
import {
  ShieldAlert, Lock, Key, Globe, AlertTriangle,
  Ban, Eye, Clock,
} from 'lucide-react';

const fraudAlerts = [
  { id: 'FA-012', type: 'Multi-Account', desc: 'Same device fingerprint across 3 accounts', ip: '103.21.x.x', severity: 'critical', time: '18 min ago' },
  { id: 'FA-011', type: 'Brute Force', desc: '47 failed login attempts from single IP', ip: '185.43.x.x', severity: 'high', time: '1 hr ago' },
  { id: 'FA-010', type: 'Geo Anomaly', desc: 'Login from Russia after India login — 2 min gap', ip: '91.108.x.x', severity: 'high', time: '3 hrs ago' },
];

const recentLogins = [
  { user: 'admin@metalhub.io', ip: '122.162.x.x', location: 'Mumbai, IN', device: 'Chrome / Windows', time: '2 min ago', status: 'Success' },
  { user: 'rajesh@tatasteel.com', ip: '103.21.x.x', location: 'Delhi, IN', device: 'Safari / macOS', time: '15 min ago', status: 'Success' },
  { user: 'unknown@test.com', ip: '185.43.x.x', location: 'Unknown', device: 'curl/7.x', time: '1 hr ago', status: 'Failed' },
  { user: 'priya@hindalco.com', ip: '49.36.x.x', location: 'Bangalore, IN', device: 'Chrome / Android', time: '2 hrs ago', status: 'Success' },
];

export default function SecurityPage() {
  return (
    <div>
      <div className="ops-section-header">
        <div>
          <h1 className="ops-section-title">Security Center</h1>
          <p className="ops-section-subtitle">Monitor threats, authentication, and access controls</p>
        </div>
      </div>

      <div className="ops-kpi-grid">
        <KPICard title="Active Sessions" value="184" icon={Key} variant="info" />
        <KPICard title="Failed Logins (24h)" value="47" change={-23} changeLabel="vs yesterday" icon={Lock} variant="warning" />
        <KPICard title="Blocked IPs" value="12" icon={Ban} variant="danger" />
        <KPICard title="Fraud Alerts" value="3" icon={ShieldAlert} variant="danger" />
      </div>

      {/* Fraud Alerts */}
      <div className="ops-panel" style={{ marginBottom: 16 }}>
        <div className="ops-panel-header">
          <div className="ops-panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle className="w-4 h-4" style={{ color: 'var(--ops-danger)' }} />
            Active Fraud Alerts
          </div>
        </div>
        <div className="ops-panel-body" style={{ padding: 0 }}>
          {fraudAlerts.map(alert => (
            <div key={alert.id} style={{
              padding: '14px 20px', borderBottom: '1px solid var(--ops-border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
              background: alert.severity === 'critical' ? 'rgba(239,68,68,0.04)' : 'transparent',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--ops-text-muted)' }}>{alert.id}</span>
                  <StatusBadge status={alert.type} variant="danger" dot={false} />
                  <span style={{
                    padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                    textTransform: 'uppercase',
                    background: alert.severity === 'critical' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                    color: alert.severity === 'critical' ? 'var(--ops-danger)' : 'var(--ops-warning)',
                  }}>{alert.severity}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--ops-text)', margin: 0 }}>{alert.desc}</p>
                <p style={{ fontSize: 11, color: 'var(--ops-text-muted)', margin: '2px 0 0' }}>
                  <Globe className="w-3 h-3" style={{ display: 'inline', verticalAlign: '-2px' }} /> {alert.ip} · {alert.time}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="ops-icon-btn" title="Investigate"><Eye className="w-4 h-4" /></button>
                <button className="ops-icon-btn" title="Block IP" style={{ color: 'var(--ops-danger)', borderColor: 'rgba(239,68,68,0.3)' }}>
                  <Ban className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Login Activity */}
      <div className="ops-panel">
        <div className="ops-panel-header">
          <div className="ops-panel-title">Recent Login Activity</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--ops-border)' }}>
                {['User', 'IP Address', 'Location', 'Device', 'Time', 'Status'].map(h => (
                  <th key={h} style={{
                    padding: '10px 16px', textAlign: 'left', fontWeight: 600,
                    color: 'var(--ops-text-secondary)', fontSize: 11,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentLogins.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--ops-border)' }}>
                  <td style={{ padding: '10px 16px', color: 'var(--ops-text)' }}>{row.user}</td>
                  <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: 12, color: 'var(--ops-text-secondary)' }}>{row.ip}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--ops-text-secondary)' }}>{row.location}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--ops-text-muted)', fontSize: 12 }}>{row.device}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--ops-text-muted)', fontSize: 12 }}>{row.time}</td>
                  <td style={{ padding: '10px 16px' }}><StatusBadge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
