import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCapabilityBySlug } from '@/lib/server/content';

export const dynamic = 'force-dynamic';

type Props = {
  params: {
    slug: string;
  };
};

const defaultSubServices = [
  'Prototype to production support',
  'Custom material and grade options',
  'Batch and high-volume fulfillment',
  'Inspection-ready documentation',
  'RFQ and sample workflow enablement',
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const capability = await getCapabilityBySlug(params.slug);

  if (!capability) {
    return {
      title: 'Capability Not Found | MetalHub',
    };
  }

  return {
    title: `${capability.name} Suppliers | MetalHub`,
    description: capability.description,
  };
}

export default async function CapabilityDetailPage({ params }: Props) {
  const capability = await getCapabilityBySlug(params.slug);

  if (!capability) {
    notFound();
  }

  const heroTitle = capability.heroTitle || `${capability.name} Partners`;
  const heroSubtitle =
    capability.heroSubtitle ||
    'Connect with verified manufacturers and suppliers specialized in this capability.';

  return (
    <div>
      <section className="relative isolate overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0">
          <Image
            src={capability.heroImageUrl || capability.imageUrl}
            alt={capability.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/70 to-slate-900/40" />
        </div>

        <div className="container relative z-10 py-24 text-white">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-200">Capability</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold md:text-5xl">{heroTitle}</h1>
          <p className="mt-5 max-w-2xl text-base text-slate-200 md:text-lg">{heroSubtitle}</p>
          <div className="mt-8">
            <Link href={`/marketplace?tab=buyers&category=${capability.slug}`}>
              <Button className="h-11 rounded-xl bg-blue-600 px-6 text-white hover:bg-blue-500">
                Post Inquiry for {capability.name}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Capability Overview</h2>
            <p className="mt-4 text-slate-600">{capability.description}</p>

            <h3 className="mt-10 text-xl font-semibold text-slate-900">Sub-services (Scalable)</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {defaultSubServices.map((service) => (
                <div
                  key={service}
                  className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 shadow-sm"
                >
                  {service}
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">Need Fast Supplier Matches?</h3>
            <p className="mt-3 text-sm text-slate-600">
              Publish a structured requirement and receive responses from relevant suppliers in this category.
            </p>
            <div className="mt-6 space-y-3 text-sm text-slate-700">
              <p>1. Define your quantity and budget</p>
              <p>2. Add delivery location and specs</p>
              <p>3. Compare supplier responses</p>
            </div>
            <div className="mt-8">
              <Link href={`/marketplace?tab=buyers&category=${capability.slug}`}>
                <Button className="w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800">
                  Start Inquiry
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
