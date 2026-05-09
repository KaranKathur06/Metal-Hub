'use client';

import { useState } from 'react';
import { StatusBadge } from '@/components/ops/shared/StatusBadge';
import { Phone, Mail, Calendar, MoreVertical, Plus, DollarSign } from 'lucide-react';

type Lead = {
  id: string;
  company: string;
  contact: string;
  value: string;
  probability: number;
  source: string;
  nextAction: string;
  dueIn: string;
};

type Stage = { key: string; label: string; color: string; leads: Lead[] };

const initialStages: Stage[] = [
  { key: 'NEW', label: 'New', color: 'var(--ops-info)', leads: [
    { id: 'LD-101', company: 'Vedanta Metals', contact: 'Neha Gupta', value: '₹6.8L', probability: 15, source: 'Website', nextAction: 'Initial outreach', dueIn: 'Today' },
    { id: 'LD-102', company: 'NALCO Trading', contact: 'Suresh Menon', value: '₹3.2L', probability: 10, source: 'Referral', nextAction: 'Research company', dueIn: 'Tomorrow' },
    { id: 'LD-106', company: 'Adani Ports', contact: 'Deepak Verma', value: '₹9.5L', probability: 12, source: 'Import', nextAction: 'Verify contact', dueIn: 'Today' },
  ]},
  { key: 'CONTACTED', label: 'Contacted', color: '#8b5cf6', leads: [
    { id: 'LD-103', company: 'JSW Group', contact: 'Amit Patel', value: '₹15.0L', probability: 30, source: 'Website', nextAction: 'Schedule meeting', dueIn: 'Tomorrow' },
    { id: 'LD-107', company: 'Essar Steel', contact: 'Kavita Reddy', value: '₹4.5L', probability: 25, source: 'Manual', nextAction: 'Send brochure', dueIn: '2 days' },
  ]},
  { key: 'QUALIFIED', label: 'Qualified', color: 'var(--ops-warning)', leads: [
    { id: 'LD-104', company: 'Hindalco', contact: 'Priya Sharma', value: '₹8.2L', probability: 55, source: 'Referral', nextAction: 'Send proposal', dueIn: '4 hrs' },
  ]},
  { key: 'NEGOTIATION', label: 'Negotiation', color: '#f97316', leads: [
    { id: 'LD-105', company: 'Tata Steel', contact: 'Rajesh Kumar', value: '₹12.5L', probability: 75, source: 'Direct', nextAction: 'Follow-up call', dueIn: '2 hrs' },
  ]},
  { key: 'CONVERTED', label: 'Converted', color: 'var(--ops-success)', leads: [
    { id: 'LD-098', company: 'SAIL', contact: 'Vikram Singh', value: '₹22.3L', probability: 100, source: 'Website', nextAction: 'Onboarding', dueIn: 'Completed' },
  ]},
];

export default function PipelinePage() {
  const [stages] = useState(initialStages);

  const totalValue = stages.reduce((sum, s) => {
    return sum + s.leads.reduce((ls, l) => ls + parseFloat(l.value.replace(/[₹,L]/g, '')) * 100000, 0);
  }, 0);

  return (
    <div>
      <div className="ops-section-header">
        <div>
          <h1 className="ops-section-title">Lead Pipeline</h1>
          <p className="ops-section-subtitle">
            {stages.reduce((sum, s) => sum + s.leads.length, 0)} leads · Total value ₹{(totalValue / 100000).toFixed(1)}L
          </p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
          borderRadius: 8, border: 'none', background: 'var(--ops-accent-crm)',
          color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>
          <Plus className="w-4 h-4" /> Add Lead
        </button>
      </div>

      {/* Kanban Board */}
      <div style={{
        display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16,
        minHeight: 'calc(100vh - 220px)',
      }}>
        {stages.map(stage => (
          <div key={stage.key} style={{
            flex: '0 0 280px', display: 'flex', flexDirection: 'column',
          }}>
            {/* Stage Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 12px', marginBottom: 8,
              borderRadius: 'var(--ops-radius-sm)',
              background: 'var(--ops-surface)',
              border: '1px solid var(--ops-border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ops-text)' }}>{stage.label}</span>
                <span style={{
                  padding: '1px 7px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                  background: 'var(--ops-surface-2)', color: 'var(--ops-text-muted)',
                }}>{stage.leads.length}</span>
              </div>
            </div>

            {/* Lead Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              {stage.leads.map(lead => (
                <div key={lead.id} style={{
                  background: 'var(--ops-surface)',
                  border: '1px solid var(--ops-border)',
                  borderRadius: 'var(--ops-radius)',
                  padding: '14px',
                  cursor: 'pointer',
                  transition: 'all 150ms',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--ops-border-light)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--ops-border)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ops-text)', margin: 0 }}>{lead.company}</p>
                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--ops-text-muted)' }}>{lead.id}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--ops-text-secondary)', margin: '0 0 8px' }}>{lead.contact}</p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 700, color: 'var(--ops-accent-crm)' }}>
                      <DollarSign className="w-3.5 h-3.5" /> {lead.value}
                    </span>
                    <span style={{
                      padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                      background: lead.probability >= 70 ? 'rgba(34,197,94,0.12)' :
                                  lead.probability >= 40 ? 'rgba(245,158,11,0.12)' : 'rgba(59,130,246,0.12)',
                      color: lead.probability >= 70 ? 'var(--ops-success)' :
                             lead.probability >= 40 ? 'var(--ops-warning)' : 'var(--ops-info)',
                    }}>{lead.probability}%</span>
                  </div>

                  {/* Footer */}
                  <div style={{
                    paddingTop: 8, borderTop: '1px solid var(--ops-border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ fontSize: 11, color: 'var(--ops-text-muted)' }}>
                      {lead.nextAction} · {lead.dueIn}
                    </span>
                    <span style={{
                      padding: '1px 6px', borderRadius: 3, fontSize: 10,
                      background: 'var(--ops-surface-2)', color: 'var(--ops-text-muted)',
                    }}>{lead.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
