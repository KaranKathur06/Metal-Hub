'use client';

import { useState } from 'react';
import { StatusBadge } from '@/components/ops/shared/StatusBadge';
import {
  CheckCircle2, XCircle, Eye, Clock, AlertTriangle,
  Filter, Search, ArrowRight,
} from 'lucide-react';

type ListingRow = {
  id: string;
  title: string;
  seller: string;
  metalType: string;
  price: string;
  quantity: string;
  status: string;
  submitted: string;
  riskScore: number;
};

const mockListings: ListingRow[] = [
  { id: 'L-4823', title: 'Hot Rolled Steel Coils — IS 2062 E350', seller: 'JSW Steel Traders', metalType: 'STEEL', price: '₹52,000/MT', quantity: '200 MT', status: 'Pending', submitted: '5 min ago', riskScore: 12 },
  { id: 'L-4822', title: 'Aluminium Billets 6063 T6', seller: 'Hindalco Exports', metalType: 'ALUMINIUM', price: '₹2,10,000/MT', quantity: '500 MT', status: 'Pending', submitted: '22 min ago', riskScore: 5 },
  { id: 'L-4821', title: 'Copper Cathode Grade A — LME', seller: 'Birla Copper', metalType: 'COPPER', price: '₹7,80,000/MT', quantity: '50 MT', status: 'Approved', submitted: '1 hr ago', riskScore: 3 },
  { id: 'L-4820', title: 'SS 304 Cold Rolled Sheets', seller: 'SAIL Distributors', metalType: 'STAINLESS_STEEL', price: '₹1,85,000/MT', quantity: '100 MT', status: 'Pending', submitted: '2 hrs ago', riskScore: 28 },
  { id: 'L-4819', title: 'Brass Rods CuZn39Pb3', seller: 'Rajasthan Metals', metalType: 'BRASS', price: '₹4,50,000/MT', quantity: '25 MT', status: 'Rejected', submitted: '3 hrs ago', riskScore: 65 },
  { id: 'L-4818', title: 'Iron Ore Pellets — Fe 65%', seller: 'Tata Metaliks', metalType: 'IRON', price: '₹8,500/MT', quantity: '1000 MT', status: 'Pending', submitted: '4 hrs ago', riskScore: 8 },
];

export default function ListingsPage() {
  const [tab, setTab] = useState<'pending' | 'all'>('pending');

  const filtered = tab === 'pending'
    ? mockListings.filter(l => l.status === 'Pending')
    : mockListings;

  return (
    <div>
      <div className="ops-section-header">
        <div>
          <h1 className="ops-section-title">Listing Moderation</h1>
          <p className="ops-section-subtitle">Review, approve, and moderate marketplace listings</p>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid var(--ops-border)', paddingBottom: 0 }}>
        {(['pending', 'all'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 16px', fontSize: 13, fontWeight: 600,
            background: 'none', border: 'none', cursor: 'pointer',
            color: tab === t ? 'var(--ops-accent-admin)' : 'var(--ops-text-muted)',
            borderBottom: tab === t ? '2px solid var(--ops-accent-admin)' : '2px solid transparent',
            textTransform: 'capitalize', transition: 'all 150ms',
          }}>
            {t === 'pending' ? `Pending (${mockListings.filter(l => l.status === 'Pending').length})` : 'All Listings'}
          </button>
        ))}
      </div>

      {/* Listing cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(listing => (
          <div key={listing.id} className="ops-panel" style={{ padding: 0 }}>
            <div style={{
              padding: '16px 20px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
              flexWrap: 'wrap',
            }}>
              <div style={{ flex: 1, minWidth: 280 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--ops-text-muted)', fontFamily: 'monospace' }}>{listing.id}</span>
                  <StatusBadge status={listing.metalType} variant="neutral" dot={false} />
                  <StatusBadge status={listing.status} />
                  {listing.riskScore > 20 && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                      padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                      background: 'rgba(239,68,68,0.1)', color: 'var(--ops-danger)',
                    }}>
                      <AlertTriangle className="w-3 h-3" /> Risk {listing.riskScore}%
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ops-text)', margin: 0 }}>{listing.title}</p>
                <p style={{ fontSize: 12, color: 'var(--ops-text-secondary)', margin: '4px 0 0' }}>
                  {listing.seller} · {listing.price} · {listing.quantity}
                </p>
                <p style={{ fontSize: 11, color: 'var(--ops-text-muted)', margin: '2px 0 0' }}>
                  <Clock className="w-3 h-3" style={{ display: 'inline', verticalAlign: '-2px' }} /> Submitted {listing.submitted}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {listing.status === 'Pending' && (
                  <>
                    <button style={{
                      display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px',
                      borderRadius: 6, border: '1px solid rgba(34,197,94,0.3)',
                      background: 'rgba(34,197,94,0.08)', color: 'var(--ops-success)',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button style={{
                      display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px',
                      borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)',
                      background: 'rgba(239,68,68,0.08)', color: 'var(--ops-danger)',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}>
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </>
                )}
                <button className="ops-icon-btn" title="View Details">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
