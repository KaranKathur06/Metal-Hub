'use client';

import { useState } from 'react';
import { StatusBadge } from '@/components/ops/shared/StatusBadge';
import { Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const mockLogs = [
  { id: 'AL-901', user: 'admin@metalhub.io', action: 'user.suspend', resource: 'users', resourceId: 'U-003', detail: 'Suspended user Amit Patel — policy violation', ip: '122.162.x.x', time: '10 min ago' },
  { id: 'AL-900', user: 'admin@metalhub.io', action: 'listing.approve', resource: 'listings', resourceId: 'L-4821', detail: 'Approved listing: Copper Cathode Grade A', ip: '122.162.x.x', time: '1 hr ago' },
  { id: 'AL-899', user: 'moderator@metalhub.io', action: 'listing.reject', resource: 'listings', resourceId: 'L-4819', detail: 'Rejected listing: Brass Rods — suspicious pricing', ip: '49.36.x.x', time: '3 hrs ago' },
  { id: 'AL-898', user: 'admin@metalhub.io', action: 'role.assign', resource: 'ops_roles', resourceId: 'R-005', detail: 'Assigned moderator role to support@metalhub.io', ip: '122.162.x.x', time: '5 hrs ago' },
  { id: 'AL-897', user: 'finance@metalhub.io', action: 'payment.refund', resource: 'payments', resourceId: 'P-342', detail: 'Refund ₹15,000 for order cancellation', ip: '103.21.x.x', time: '8 hrs ago' },
  { id: 'AL-896', user: 'admin@metalhub.io', action: 'supplier.verify', resource: 'suppliers', resourceId: 'S-089', detail: 'Verified supplier: SAIL Distributors', ip: '122.162.x.x', time: '1 day ago' },
];

const actionColors: Record<string, string> = {
  'user.suspend': 'danger', 'listing.approve': 'success', 'listing.reject': 'danger',
  'role.assign': 'info', 'payment.refund': 'warning', 'supplier.verify': 'success',
};

export default function AuditPage() {
  const [search, setSearch] = useState('');

  return (
    <div>
      <div className="ops-section-header">
        <div>
          <h1 className="ops-section-title">Audit Logs</h1>
          <p className="ops-section-subtitle">Complete trail of administrative actions across the platform</p>
        </div>
        <button className="ops-icon-btn" title="Export Logs"><Download className="w-4 h-4" /></button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search className="w-4 h-4" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ops-text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by user, action, or resource…"
            style={{
              width: '100%', padding: '9px 12px 9px 36px', borderRadius: 8,
              border: '1px solid var(--ops-border)', background: 'var(--ops-surface)',
              color: 'var(--ops-text)', fontSize: 13, outline: 'none',
            }}
          />
        </div>
      </div>

      <div className="ops-panel">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--ops-border)' }}>
                {['ID', 'User', 'Action', 'Detail', 'IP', 'Time'].map(h => (
                  <th key={h} style={{
                    padding: '10px 16px', textAlign: 'left', fontWeight: 600,
                    color: 'var(--ops-text-secondary)', fontSize: 11,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockLogs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--ops-border)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--ops-surface-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: 11, color: 'var(--ops-text-muted)' }}>{log.id}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--ops-text)' }}>{log.user}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <StatusBadge status={log.action} variant={actionColors[log.action] as any || 'neutral'} dot={false} />
                  </td>
                  <td style={{ padding: '10px 16px', color: 'var(--ops-text-secondary)', maxWidth: 300 }}>{log.detail}</td>
                  <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: 12, color: 'var(--ops-text-muted)' }}>{log.ip}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--ops-text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
