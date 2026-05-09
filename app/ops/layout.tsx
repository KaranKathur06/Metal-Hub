import { OpsProvider } from '@/lib/ops/ops-context';
import { TopBar } from '@/components/ops/shell/TopBar';
import { Sidebar } from '@/components/ops/shell/Sidebar';
import './ops.css';

export const metadata = {
  title: 'MetalHub Ops — Unified Operations Dashboard',
  description: 'Enterprise control center for marketplace administration, CRM, and revenue operations.',
};

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <OpsProvider>
      <div className="ops-shell">
        <Sidebar />
        <div className="ops-main-area">
          <TopBar />
          <main className="ops-content">
            {children}
          </main>
        </div>
      </div>
    </OpsProvider>
  );
}
