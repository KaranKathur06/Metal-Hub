import type { Metadata } from 'next';
import CapabilitiesGrid from '@/components/home/CapabilitiesGrid';
import { getCapabilities } from '@/lib/server/content';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Industrial Capabilities | MetalHub',
  description: 'Explore MetalHub industrial capabilities including casting, forging, fabrication, machining, and wire drawing.',
};

export default async function CapabilitiesPage() {
  const capabilities = await getCapabilities();

  return (
    <div className="pb-12">
      <section className="border-b bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 py-20 text-white">
        <div className="container">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">Capability-Based Industrial Sourcing</h1>
          <p className="mt-4 max-w-2xl text-base text-slate-200 md:text-lg">
            Discover verified suppliers by manufacturing capability and move from requirement to supplier shortlist faster.
          </p>
        </div>
      </section>

      <CapabilitiesGrid capabilities={capabilities} />
    </div>
  );
}
