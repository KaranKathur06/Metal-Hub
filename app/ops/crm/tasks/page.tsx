'use client';

import { useState } from 'react';
import { CheckSquare, Circle, CheckCircle2, Clock, Plus } from 'lucide-react';

const mockTasks = [
  { id: 'T-01', title: 'Call Tata Steel — contract renewal discussion', assignee: 'You', due: 'Today 2:00 PM', priority: 'high', done: false },
  { id: 'T-02', title: 'Send pricing proposal to Hindalco', assignee: 'You', due: 'Today 3:30 PM', priority: 'high', done: false },
  { id: 'T-03', title: 'Follow up with JSW Group onboarding docs', assignee: 'Priya S.', due: 'Tomorrow', priority: 'medium', done: false },
  { id: 'T-04', title: 'Research Vedanta Metals procurement needs', assignee: 'You', due: 'Tomorrow', priority: 'low', done: false },
  { id: 'T-05', title: 'Update CRM notes for SAIL account', assignee: 'Amit P.', due: 'Yesterday', priority: 'medium', done: true },
  { id: 'T-06', title: 'Prepare quarterly sales report', assignee: 'You', due: 'May 12', priority: 'medium', done: false },
];

const priorityColors: Record<string, string> = {
  high: 'var(--ops-danger)', medium: 'var(--ops-warning)', low: 'var(--ops-info)',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState(mockTasks);
  const toggle = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const pending = tasks.filter(t => !t.done);
  const completed = tasks.filter(t => t.done);

  return (
    <div>
      <div className="ops-section-header">
        <div>
          <h1 className="ops-section-title">Tasks & Activities</h1>
          <p className="ops-section-subtitle">{pending.length} pending · {completed.length} completed</p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
          borderRadius: 8, border: 'none', background: 'var(--ops-accent-crm)',
          color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}><Plus className="w-4 h-4" /> Add Task</button>
      </div>

      <div className="ops-panel" style={{ marginBottom: 16 }}>
        <div className="ops-panel-header"><div className="ops-panel-title">Pending ({pending.length})</div></div>
        <div className="ops-panel-body" style={{ padding: 0 }}>
          {pending.map(task => (
            <div key={task.id} style={{
              padding: '12px 20px', borderBottom: '1px solid var(--ops-border)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <button onClick={() => toggle(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <Circle className="w-5 h-5" style={{ color: 'var(--ops-border-light)' }} />
              </button>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--ops-text)', margin: 0 }}>{task.title}</p>
                <p style={{ fontSize: 11, color: 'var(--ops-text-muted)', margin: '2px 0 0' }}>
                  {task.assignee} · <Clock className="w-3 h-3" style={{ display: 'inline', verticalAlign: '-2px' }} /> {task.due}
                </p>
              </div>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: priorityColors[task.priority],
              }} title={task.priority} />
            </div>
          ))}
        </div>
      </div>

      {completed.length > 0 && (
        <div className="ops-panel">
          <div className="ops-panel-header"><div className="ops-panel-title" style={{ color: 'var(--ops-text-muted)' }}>Completed ({completed.length})</div></div>
          <div className="ops-panel-body" style={{ padding: 0 }}>
            {completed.map(task => (
              <div key={task.id} style={{
                padding: '12px 20px', borderBottom: '1px solid var(--ops-border)',
                display: 'flex', alignItems: 'center', gap: 12, opacity: 0.5,
              }}>
                <button onClick={() => toggle(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--ops-success)' }} />
                </button>
                <p style={{ fontSize: 13, color: 'var(--ops-text-muted)', margin: 0, textDecoration: 'line-through' }}>{task.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
