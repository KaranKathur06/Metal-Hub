export type SeoMetadataInput = {
  title: string;
  description: string;
  canonicalPath: string;
  imageUrl?: string | null;
};

export function buildSeoMetadata(input: SeoMetadataInput) {
  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: input.canonicalPath,
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url: input.canonicalPath,
      images: input.imageUrl ? [{ url: input.imageUrl }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: input.imageUrl ? [input.imageUrl] : [],
    },
  };
}

export function buildIndustrySchema(input: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: input.url,
  };
}

export function buildSupplierSchema(input: {
  name: string;
  description?: string | null;
  url: string;
  imageUrl?: string | null;
  locationLabel?: string | null;
  certifications?: string[] | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: input.name,
    description: input.description ?? undefined,
    url: input.url,
    image: input.imageUrl ?? undefined,
    areaServed: input.locationLabel ?? undefined,
    hasCredential: (input.certifications ?? []).map((name) => ({
      "@type": "EducationalOccupationalCredential",
      name,
    })),
  };
}

export function buildListingSchema(input: {
  name: string;
  description?: string | null;
  url: string;
  imageUrl?: string | null;
  sellerName: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description ?? undefined,
    url: input.url,
    image: input.imageUrl ?? undefined,
    brand: {
      "@type": "Organization",
      name: input.sellerName,
    },
  };
}

