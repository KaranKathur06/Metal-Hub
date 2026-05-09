'use client';

import { useState } from 'react';
import { StatusBadge } from '@/components/ops/shared/StatusBadge';
import { Search, Building2, Phone, Mail, TrendingUp, Eye } from 'lucide-react';

const mockCustomers = [
  { id: 'C-001', company: 'Tata Steel', contact: 'Rajesh Kumar', email: 'rajesh@tatasteel.com', phone: '+91 98765 43210', totalOrders: 24, ltv: '₹45.2L', lastOrder: '3 days ago', status: 'Active', engagementScore: 92 },
  { id: 'C-002', company: 'Hindalco Industries', contact: 'Priya Sharma', email: 'priya@hindalco.com', phone: '+91 87654 32109', totalOrders: 18, ltv: '₹32.8L', lastOrder: '1 week ago', status: 'Active', engagementScore: 85 },
  { id: 'C-003', company: 'JSW Steel', contact: 'Amit Patel', email: 'amit@jswsteel.in', phone: '+91 76543 21098', totalOrders: 12, ltv: '₹28.5L', lastOrder: '2 weeks ago', status: 'Active', engagementScore: 68 },
  { id: 'C-004', company: 'Vedanta', contact: 'Neha Gupta', email: 'neha@vedanta.com', phone: '+91 65432 10987', totalOrders: 6, ltv: '₹8.1L', lastOrder: '1 month ago', status: 'At Risk', engagementScore: 35 },
  { id: 'C-005', company: 'SAIL', contact: 'Vikram Singh', email: 'vikram@sail.in', phone: '+91 54321 09876', totalOrders: 31, ltv: '₹52.0L', lastOrder: '2 days ago', status: 'Active', engagementScore: 95 },
  { id: 'C-006', company: 'Essar Steel', contact: 'Kavita Reddy', email: 'kavita@essar.com', phone: '+91 43210 98765', totalOrders: 3, ltv: '₹4.2L', lastOrder: '2 months ago', status: 'Churned', engagementScore: 12 },
];

function EngagementBar({ score }: { score: number }) {
  const color = score >= 70 ? 'var(--ops-success)' : score >= 40 ? 'var(--ops-warning)' : 'var(--ops-danger)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 60, height: 6, borderRadius: 3, background: 'var(--ops-surface-2)', overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', borderRadius: 3, background: color, transition: 'width 300ms' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color }}>{score}</span>
    </div>
  );
}

export default function CustomersPage() {
  const [search, setSearch] = useState('');

  const filtered = mockCustomers.filter(c =>
    !search || c.company.toLowerCase().includes(search.toLowerCase()) || c.contact.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="ops-section-header">
        <div>
          <h1 className="ops-section-title">Customer Intelligence</h1>
          <p className="ops-section-subtitle">{mockCustomers.length} companies · Track engagement, LTV, and churn risk</p>
        </div>
      </div>

      <div style={{ marginBottom: 16, position: 'relative', maxWidth: 400 }}>
        <Search className="w-4 h-4" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ops-text-muted)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies…"
          style={{
            width: '100%', padding: '9px 12px 9px 36px', borderRadius: 8,
            border: '1px solid var(--ops-border)', background: 'var(--ops-surface)',
            color: 'var(--ops-text)', fontSize: 13, outline: 'none',
          }} />
      </div>

      <div className="ops-panel">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--ops-border)' }}>
                {['Company', 'Contact', 'Orders', 'LTV', 'Last Order', 'Engagement', 'Status', ''].map(h => (
                  <th key={h} style={{
                    padding: '10px 16px', textAlign: 'left', fontWeight: 600,
                    color: 'var(--ops-text-secondary)', fontSize: 11,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--ops-border)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--ops-surface-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 8,
                        background: 'linear-gradient(135deg, var(--ops-accent-crm), #059669)',
                        color: 'white', display: 'grid', placeItems: 'center',
                        fontSize: 13, fontWeight: 700,
                      }}>{c.company[0]}</div>
                      <div>
                        <p style={{ fontWeight: 600, color: 'var(--ops-text)', margin: 0 }}>{c.company}</p>
                        <p style={{ fontSize: 11, color: 'var(--ops-text-muted)', margin: 0 }}>{c.id}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <p style={{ color: 'var(--ops-text)', margin: 0 }}>{c.contact}</p>
                    <p style={{ fontSize: 11, color: 'var(--ops-text-muted)', margin: 0 }}>{c.email}</p>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--ops-text)' }}>{c.totalOrders}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--ops-accent-crm)' }}>{c.ltv}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--ops-text-muted)', fontSize: 12 }}>{c.lastOrder}</td>
                  <td style={{ padding: '12px 16px' }}><EngagementBar score={c.engagementScore} /></td>
                  <td style={{ padding: '12px 16px' }}>
                    <StatusBadge status={c.status} variant={c.status === 'Active' ? 'success' : c.status === 'At Risk' ? 'warning' : 'danger'} />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button className="ops-icon-btn" style={{ width: 30, height: 30 }}><Eye className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
