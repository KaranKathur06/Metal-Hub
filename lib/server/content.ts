/**
 * Metal Hub — Server-Side Content Fetchers
 *
 * Fetches banners, capabilities, and taxonomy data directly from Supabase.
 * No legacy NestJS proxy — all data comes from the database.
 */

import { createSupabaseServerClient } from '@/lib/supabase/server-client';

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

export async function getHeroBanners(): Promise<Banner[]> {
  try {
    const supabase = createSupabaseServerClient();
    if (!supabase) return fallbackBanners;

    const { data, error } = await supabase
      .from('banners')
      .select('id, title, subtitle, image_url, cta_text, cta_link')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error || !data || data.length === 0) return fallbackBanners;

    return data.map((b: any) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle || '',
      imageUrl: b.image_url,
      ctaText: b.cta_text || 'Explore',
      ctaLink: b.cta_link || '/marketplace',
    }));
  } catch {
    return fallbackBanners;
  }
}

export async function getCapabilities(): Promise<Capability[]> {
  try {
    const supabase = createSupabaseServerClient();
    if (!supabase) return fallbackCapabilities;

    const { data, error } = await supabase
      .from('taxonomy')
      .select('id, name, slug, icon, description')
      .eq('type', 'capability')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) return fallbackCapabilities;

    return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      imageUrl: `/${c.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
      description: c.description || '',
    }));
  } catch {
    return fallbackCapabilities;
  }
}

export async function getCapabilityBySlug(slug: string): Promise<Capability | null> {
  try {
    const supabase = createSupabaseServerClient();
    if (!supabase) return fallbackCapabilities.find((item) => item.slug === slug) || null;

    const { data, error } = await supabase
      .from('taxonomy')
      .select('id, name, slug, icon, description')
      .eq('slug', slug)
      .eq('type', 'capability')
      .maybeSingle();

    if (error || !data) {
      return fallbackCapabilities.find((item) => item.slug === slug) || null;
    }

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      imageUrl: `/${data.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
      description: data.description || '',
    };
  } catch {
    return fallbackCapabilities.find((item) => item.slug === slug) || null;
  }
}
