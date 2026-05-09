'use client';
import { Calendar, Video, Phone, MapPin, Clock, Plus } from 'lucide-react';

const meetings = [
  { id: 'M-01', title: 'JSW Group — Onboarding Kickoff', type: 'video', time: 'Today, 4:00 PM', duration: '45 min', attendees: ['Amit Patel', 'You'], status: 'upcoming' },
  { id: 'M-02', title: 'Tata Steel — Contract Renewal', type: 'call', time: 'Tomorrow, 11:00 AM', duration: '30 min', attendees: ['Rajesh Kumar', 'You'], status: 'upcoming' },
  { id: 'M-03', title: 'SAIL — Quarterly Review', type: 'in-person', time: 'May 12, 2:00 PM', duration: '1 hr', attendees: ['Vikram Singh', 'Finance Team', 'You'], status: 'scheduled' },
  { id: 'M-04', title: 'Hindalco — Proposal Discussion', type: 'video', time: 'Yesterday, 3:00 PM', duration: '30 min', attendees: ['Priya Sharma', 'You'], status: 'completed' },
];

const typeIcons: Record<string, any> = { video: Video, call: Phone, 'in-person': MapPin };
const typeColors: Record<string, string> = { video: 'var(--ops-info)', call: 'var(--ops-accent-crm)', 'in-person': 'var(--ops-warning)' };

export default function MeetingsPage() {
  return (
    <div>
      <div className="ops-section-header">
        <div>
          <h1 className="ops-section-title">Meetings</h1>
          <p className="ops-section-subtitle">Schedule and track sales meetings</p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
          borderRadius: 8, border: 'none', background: 'var(--ops-accent-crm)',
          color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}><Plus className="w-4 h-4" /> Schedule Meeting</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {meetings.map(m => {
          const Icon = typeIcons[m.type] || Calendar;
          return (
            <div key={m.id} className="ops-panel" style={{
              opacity: m.status === 'completed' ? 0.5 : 1,
            }}>
              <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10,
                  background: `${typeColors[m.type]}15`,
                  color: typeColors[m.type],
                  display: 'grid', placeItems: 'center', flexShrink: 0,
                }}>
                  <Icon className="w-5 h-5" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ops-text)', margin: 0 }}>{m.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--ops-text-secondary)', margin: '4px 0 0' }}>
                    <Clock className="w-3 h-3" style={{ display: 'inline', verticalAlign: '-2px' }} /> {m.time} · {m.duration}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--ops-text-muted)', margin: '2px 0 0' }}>
                    {m.attendees.join(', ')}
                  </p>
                </div>
                <span style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                  background: m.status === 'upcoming' ? 'rgba(16,185,129,0.12)' : m.status === 'scheduled' ? 'rgba(59,130,246,0.12)' : 'var(--ops-surface-2)',
                  color: m.status === 'upcoming' ? 'var(--ops-success)' : m.status === 'scheduled' ? 'var(--ops-info)' : 'var(--ops-text-muted)',
                  textTransform: 'capitalize',
                }}>{m.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
