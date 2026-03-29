const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

type Banner = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
};

type Capability = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  description: string;
  heroImageUrl?: string | null;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
};

const fallbackBanners: Banner[] = [
  {
    id: 'fallback-1',
    title: 'Source From Verified Metal Suppliers',
    subtitle: 'Compare trusted suppliers, request quotes, and close deals faster on MetalHub.',
    imageUrl: '/hero.png',
    ctaText: 'Explore Marketplace',
    ctaLink: '/marketplace',
  },
  {
    id: 'fallback-2',
    title: 'Post Buyer Requirements In Minutes',
    subtitle: 'Reach quality suppliers across India with structured, searchable inquiries.',
    imageUrl: '/casting.jpg',
    ctaText: 'Post Requirement',
    ctaLink: '/post-requirement',
  },
  {
    id: 'fallback-3',
    title: 'Grow Your Supplier Presence',
    subtitle: 'Publish products, get discovered by buyers, and scale B2B orders efficiently.',
    imageUrl: '/Fabrication.jpg',
    ctaText: 'Join as Supplier',
    ctaLink: '/register',
  },
];

const fallbackCapabilities: Capability[] = [
  {
    id: 'casting',
    name: 'Casting',
    slug: 'casting',
    imageUrl: '/casting.jpg',
    description: 'Precision cast components for automotive and industrial projects.',
  },
  {
    id: 'forging',
    name: 'Forging',
    slug: 'forging',
    imageUrl: '/Forging.jpg',
    description: 'High-strength forged parts for demanding operational conditions.',
  },
  {
    id: 'fabrication',
    name: 'Fabrication',
    slug: 'fabrication',
    imageUrl: '/Fabrication.jpg',
    description: 'Custom sheet metal and structural fabrication for B2B buyers.',
  },
  {
    id: 'machining',
    name: 'Machining',
    slug: 'machining',
    imageUrl: '/Machining.jpg',
    description: 'CNC and precision machining with tight tolerance capabilities.',
  },
  {
    id: 'wire-drawing',
    name: 'Wire Drawing',
    slug: 'wire-drawing',
    imageUrl: '/wire drawing.webp',
    description: 'Industrial wire drawing services for diverse metal grades.',
  },
];

async function fetchBackend<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${BACKEND_BASE}/api${path}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getHeroBanners(): Promise<Banner[]> {
  const banners = await fetchBackend<Banner[]>('/banners');
  return banners && banners.length > 0 ? banners : fallbackBanners;
}

export async function getCapabilities(): Promise<Capability[]> {
  const capabilities = await fetchBackend<Capability[]>('/capabilities');
  return capabilities && capabilities.length > 0 ? capabilities : fallbackCapabilities;
}

export async function getCapabilityBySlug(slug: string): Promise<Capability | null> {
  const capability = await fetchBackend<Capability>(`/capabilities/${slug}`);

  if (capability) {
    return capability;
  }

  return fallbackCapabilities.find((item) => item.slug === slug) || null;
}
