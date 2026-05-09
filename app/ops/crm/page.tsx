'use client';

import { KPICard } from '@/components/ops/shared/KPICard';
import { StatusBadge } from '@/components/ops/shared/StatusBadge';
import {
  Target, DollarSign, TrendingUp, UserCheck,
  ArrowRight, Phone, Mail, Calendar,
} from 'lucide-react';

const pipelineStages = [
  { stage: 'New', count: 12, value: '₹8.4L', color: 'var(--ops-info)' },
  { stage: 'Contacted', count: 8, value: '₹5.2L', color: '#8b5cf6' },
  { stage: 'Qualified', count: 5, value: '₹12.1L', color: 'var(--ops-warning)' },
  { stage: 'Negotiation', count: 3, value: '₹18.5L', color: '#f97316' },
  { stage: 'Converted', count: 7, value: '₹22.3L', color: 'var(--ops-success)' },
];

const topLeads = [
  { company: 'Tata Steel', contact: 'Rajesh Kumar', value: '₹12.5L', stage: 'Negotiation', nextAction: 'Follow-up call', dueIn: '2 hrs' },
  { company: 'Hindalco', contact: 'Priya Sharma', value: '₹8.2L', stage: 'Qualified', nextAction: 'Send proposal', dueIn: '4 hrs' },
  { company: 'JSW Group', contact: 'Amit Patel', value: '₹15.0L', stage: 'Contacted', nextAction: 'Schedule meeting', dueIn: 'Tomorrow' },
  { company: 'Vedanta Metals', contact: 'Neha Gupta', value: '₹6.8L', stage: 'New', nextAction: 'Initial outreach', dueIn: 'Today' },
];

const upcomingTasks = [
  { task: 'Call Tata Steel — contract renewal discussion', time: '2:00 PM', type: 'call' },
  { task: 'Send pricing proposal to Hindalco', time: '3:30 PM', type: 'email' },
  { task: 'Meeting with JSW Group — onboarding', time: '4:00 PM', type: 'meeting' },
];

export default function CRMCommandCenter() {
  return (
    <div>
      {/* KPI Grid */}
      <div className="ops-kpi-grid">
        <KPICard title="Pipeline Value" value="₹66.5L" change={18.3} changeLabel="vs last month" icon={Target} variant="info"
          sparkline={[4, 6, 5, 8, 7, 9, 10, 8, 12, 14]} />
        <KPICard title="MRR" value="₹3.2L" change={12.5} changeLabel="vs last month" icon={DollarSign} variant="success"
          sparkline={[3, 4, 5, 4, 6, 7, 6, 8, 9, 10]} />
        <KPICard title="Conversion Rate" value="28.5%" change={3.2} changeLabel="vs last month" icon={TrendingUp} variant="success" />
        <KPICard title="Active Customers" value="342" change={8.7} changeLabel="vs last month" icon={UserCheck} variant="info"
          sparkline={[5, 6, 7, 6, 8, 7, 9, 10, 11, 12]} />
      </div>

      {/* Pipeline Visual */}
      <div className="ops-panel" style={{ marginBottom: 16 }}>
        <div className="ops-panel-header">
          <div className="ops-panel-title">Sales Pipeline</div>
          <a href="/ops/crm/pipeline" className="ops-text-btn" style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
            Open Kanban <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
        <div className="ops-panel-body">
          <div style={{ display: 'flex', gap: 8 }}>
            {pipelineStages.map((s) => (
              <div key={s.stage} style={{
                flex: 1,
                padding: '14px 16px',
                borderRadius: 'var(--ops-radius-sm)',
                background: 'var(--ops-surface-2)',
                border: '1px solid var(--ops-border)',
                textAlign: 'center',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, margin: '0 auto 8px' }} />
                <p style={{ fontSize: 12, color: 'var(--ops-text-secondary)', marginBottom: 4 }}>{s.stage}</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--ops-text)', lineHeight: 1.2 }}>{s.count}</p>
                <p style={{ fontSize: 12, color: 'var(--ops-text-muted)', marginTop: 4 }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Columns */}
      <div className="ops-grid-2">
        {/* Top Leads */}
        <div className="ops-panel">
          <div className="ops-panel-header">
            <div className="ops-panel-title">Hot Leads</div>
            <a href="/ops/crm/pipeline" className="ops-text-btn" style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
              All Leads <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="ops-panel-body" style={{ padding: 0 }}>
            {topLeads.map((lead, i) => (
              <div key={i} style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--ops-border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ops-text)' }}>{lead.company}</span>
                    <StatusBadge status={lead.stage} />
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--ops-text-secondary)', margin: 0 }}>
                    {lead.contact} · {lead.value}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--ops-text-muted)', marginTop: 2 }}>
                    Next: {lead.nextAction} · Due: {lead.dueIn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="ops-panel">
          <div className="ops-panel-header">
            <div className="ops-panel-title">Today&apos;s Schedule</div>
            <a href="/ops/crm/tasks" className="ops-text-btn" style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
              All Tasks <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="ops-panel-body">
            <div className="ops-activity-list">
              {upcomingTasks.map((task, i) => {
                const Icon = task.type === 'call' ? Phone : task.type === 'email' ? Mail : Calendar;
                return (
                  <div key={i} className="ops-activity-item">
                    <div className="ops-activity-icon" style={{
                      background: 'rgba(16,185,129,0.12)',
                      color: 'var(--ops-accent-crm)',
                    }}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="ops-activity-content">
                      <p className="ops-activity-text">{task.task}</p>
                      <p className="ops-activity-time">{task.time}</p>
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
