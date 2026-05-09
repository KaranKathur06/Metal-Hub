'use client';

import { useOps } from '@/lib/ops/ops-context';
import { adminNavItems, crmNavItems } from '@/lib/ops/nav-config';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export function Sidebar() {
  const { mode, sidebarCollapsed, toggleSidebar } = useOps();
  const pathname = usePathname();
  const items = mode === 'admin' ? adminNavItems : crmNavItems;

  return (
    <aside className={`ops-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mode}`}>
      <nav className="ops-sidebar-nav">
        {items.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/ops/admin' && item.href !== '/ops/crm' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`ops-nav-item ${isActive ? 'active' : ''}`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon className="ops-nav-icon" />
              {!sidebarCollapsed && (
                <>
                  <span className="ops-nav-label">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ops-nav-badge">{item.badge}</span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="ops-sidebar-footer">
        <button className="ops-collapse-btn" onClick={toggleSidebar}>
          <ChevronLeft className={`w-4 h-4 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          {!sidebarCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
