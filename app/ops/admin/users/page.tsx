'use client';

import { useState } from 'react';
import { StatusBadge } from '@/components/ops/shared/StatusBadge';
import {
  Search, Filter, MoreVertical, ChevronLeft, ChevronRight,
  UserPlus, Download, Shield, Ban, Eye, Mail,
} from 'lucide-react';

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  kyc: string;
  company: string;
  joined: string;
  lastLogin: string;
};

const mockUsers: UserRow[] = [
  { id: 'U-001', name: 'Rajesh Kumar', email: 'rajesh@tatasteel.com', role: 'SELLER', status: 'Active', kyc: 'Verified', company: 'Tata Steel Traders', joined: '2025-12-10', lastLogin: '2 hrs ago' },
  { id: 'U-002', name: 'Priya Sharma', email: 'priya@hindalco.com', role: 'BUYER', status: 'Active', kyc: 'Verified', company: 'Hindalco Exports', joined: '2026-01-05', lastLogin: '30 min ago' },
  { id: 'U-003', name: 'Amit Patel', email: 'amit@jswsteel.in', role: 'SELLER', status: 'Suspended', kyc: 'Pending', company: 'JSW Steel Group', joined: '2026-02-15', lastLogin: '3 days ago' },
  { id: 'U-004', name: 'Neha Gupta', email: 'neha@vedanta.com', role: 'BUYER', status: 'Active', kyc: 'Rejected', company: 'Vedanta Metals', joined: '2026-03-01', lastLogin: '1 day ago' },
  { id: 'U-005', name: 'Vikram Singh', email: 'vikram@sailsteel.com', role: 'SELLER', status: 'Active', kyc: 'Verified', company: 'SAIL Distributors', joined: '2026-03-20', lastLogin: '5 hrs ago' },
  { id: 'U-006', name: 'Anita Desai', email: 'anita@birlacopper.com', role: 'BUYER', status: 'Banned', kyc: 'Verified', company: 'Birla Copper', joined: '2025-11-08', lastLogin: '2 weeks ago' },
  { id: 'U-007', name: 'Suresh Menon', email: 'suresh@nalco.in', role: 'SELLER', status: 'Active', kyc: 'Pending', company: 'NALCO Trading', joined: '2026-04-10', lastLogin: '1 hr ago' },
  { id: 'U-008', name: 'Kavita Reddy', email: 'kavita@essar.com', role: 'BUYER', status: 'Active', kyc: 'Verified', company: 'Essar Steel', joined: '2026-04-22', lastLogin: '45 min ago' },
];

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = mockUsers.filter(u => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter !== 'all' && u.status.toLowerCase() !== statusFilter) return false;
    return true;
  });

  return (
    <div>
      <div className="ops-section-header">
        <div>
          <h1 className="ops-section-title">User Management</h1>
          <p className="ops-section-subtitle">Manage platform users, verification, and access control</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="ops-icon-btn" title="Export"><Download className="w-4 h-4" /></button>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
            borderRadius: 8, border: 'none', background: 'var(--ops-accent-admin)',
            color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            <UserPlus className="w-4 h-4" /> Invite User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
          <Search className="w-4 h-4" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ops-text-muted)' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            style={{
              width: '100%', padding: '9px 12px 9px 36px', borderRadius: 8,
              border: '1px solid var(--ops-border)', background: 'var(--ops-surface)',
              color: 'var(--ops-text)', fontSize: 13, outline: 'none',
            }}
          />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{
          padding: '9px 12px', borderRadius: 8, border: '1px solid var(--ops-border)',
          background: 'var(--ops-surface)', color: 'var(--ops-text)', fontSize: 13,
        }}>
          <option value="all">All Roles</option>
          <option value="BUYER">Buyer</option>
          <option value="SELLER">Seller</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{
          padding: '9px 12px', borderRadius: 8, border: '1px solid var(--ops-border)',
          background: 'var(--ops-surface)', color: 'var(--ops-text)', fontSize: 13,
        }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {/* Table */}
      <div className="ops-panel">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--ops-border)' }}>
                {['User', 'Role', 'Status', 'KYC', 'Company', 'Last Login', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left', fontWeight: 600,
                    color: 'var(--ops-text-secondary)', fontSize: 11, textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--ops-border)', transition: 'background 150ms' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--ops-surface-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: 'linear-gradient(135deg, var(--ops-accent-admin), #7c3aed)',
                        color: 'white', display: 'grid', placeItems: 'center',
                        fontSize: 12, fontWeight: 700,
                      }}>{user.name[0]}</div>
                      <div>
                        <p style={{ fontWeight: 600, color: 'var(--ops-text)', margin: 0 }}>{user.name}</p>
                        <p style={{ fontSize: 12, color: 'var(--ops-text-muted)', margin: 0 }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                      background: 'var(--ops-surface-2)', color: 'var(--ops-text-secondary)',
                    }}>{user.role}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge status={user.status} /></td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge status={user.kyc} /></td>
                  <td style={{ padding: '12px 16px', color: 'var(--ops-text-secondary)' }}>{user.company}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--ops-text-muted)', fontSize: 12 }}>{user.lastLogin}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="ops-icon-btn" title="View Profile" style={{ width: 30, height: 30 }}>
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button className="ops-icon-btn" title="Email" style={{ width: 30, height: 30 }}>
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                      <button className="ops-icon-btn" title="Suspend" style={{ width: 30, height: 30 }}>
                        <Shield className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div style={{
          padding: '12px 16px', borderTop: '1px solid var(--ops-border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 12, color: 'var(--ops-text-muted)',
        }}>
          <span>Showing {filtered.length} of {mockUsers.length} users</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="ops-icon-btn" style={{ width: 30, height: 30 }}><ChevronLeft className="w-4 h-4" /></button>
            <button className="ops-icon-btn" style={{ width: 30, height: 30, background: 'var(--ops-accent-admin)', color: 'white', borderColor: 'var(--ops-accent-admin)' }}>1</button>
            <button className="ops-icon-btn" style={{ width: 30, height: 30 }}>2</button>
            <button className="ops-icon-btn" style={{ width: 30, height: 30 }}>3</button>
            <button className="ops-icon-btn" style={{ width: 30, height: 30 }}><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
