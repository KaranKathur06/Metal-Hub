import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

type CapabilityItem = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  description: string;
};

export default function CapabilitiesGrid({ capabilities }: { capabilities: CapabilityItem[] }) {
  return (
    <section className="py-20">
      <div className="container">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Our Industrial Capabilities</h2>
          <p className="mt-4 text-base text-slate-600">
            Explore verified capability clusters across casting, forging, fabrication, machining, and wire drawing.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((capability) => (
            <Link
              key={capability.id}
              href={`/capabilities/${capability.slug}`}
              className="group block"
            >
              <article className="relative h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(15,23,42,0.12)]">
                <div className="relative h-52 w-full overflow-hidden">
                  <Image
                    src={capability.imageUrl}
                    alt={capability.name}
                    fill
                    sizes="(max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/65 via-slate-900/10 to-transparent opacity-60 transition group-hover:opacity-80" />
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-semibold text-slate-900 transition-colors group-hover:text-blue-700">
                    {capability.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">{capability.description}</p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                    Explore Capability
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
