'use client';
import { FileText, Image, Layout, Megaphone } from 'lucide-react';

export default function CMSPage() {
  const cards = [
    { icon: Image, title: 'Hero Banners', desc: 'Manage homepage carousel slides', count: 4, href: '/admin' },
    { icon: Layout, title: 'Landing Pages', desc: 'Create and edit landing pages', count: 6, href: '#' },
    { icon: FileText, title: 'Blog Posts', desc: 'Content moderation and publishing', count: 12, href: '#' },
    { icon: Megaphone, title: 'Announcements', desc: 'Platform-wide notifications', count: 2, href: '#' },
  ];

  return (
    <div>
      <div className="ops-section-header">
        <div>
          <h1 className="ops-section-title">CMS & Content</h1>
          <p className="ops-section-subtitle">Manage banners, pages, SEO, and platform content</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
        {cards.map(c => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="ops-panel" style={{ cursor: 'pointer', transition: 'all 150ms' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ops-border-light)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--ops-border)'; e.currentTarget.style.transform = 'none'; }}>
              <div className="ops-panel-body" style={{ padding: 20 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: 'rgba(59,130,246,0.1)',
                  color: 'var(--ops-accent-admin)', display: 'grid', placeItems: 'center', marginBottom: 12,
                }}><Icon className="w-5 h-5" /></div>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ops-text)', margin: '0 0 4px' }}>{c.title}</p>
                <p style={{ fontSize: 12, color: 'var(--ops-text-muted)', margin: '0 0 8px' }}>{c.desc}</p>
                <span style={{ fontSize: 12, color: 'var(--ops-text-secondary)' }}>{c.count} items</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
