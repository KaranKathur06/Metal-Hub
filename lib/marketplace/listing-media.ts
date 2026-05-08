export type ListingMediaType = "image" | "pdf" | "cad" | "video" | "other";

export type ListingMedia = {
  id: string;
  listingId: string;
  fileUrl: string;
  fileType: ListingMediaType;
  mimeType?: string | null;
  thumbnailUrl?: string | null;
  previewUrl?: string | null;
  altText?: string | null;
  isPrimary: boolean;
  sortOrder: number;
};

export function sortListingMedia(media: ListingMedia[]) {
  return [...media].sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) {
      return a.isPrimary ? -1 : 1;
    }

    return a.sortOrder - b.sortOrder;
  });
}

export function getPrimaryListingMedia(media: ListingMedia[]) {
  const sorted = sortListingMedia(media);

  return sorted.find((item) => item.fileType === "image" && item.isPrimary) ??
    sorted.find((item) => item.fileType === "image") ??
    sorted.find((item) => item.thumbnailUrl || item.previewUrl) ??
    sorted[0] ??
    null;
}

export function getTechnicalMediaCounts(media: ListingMedia[]) {
  return media.reduce(
    (counts, item) => ({
      ...counts,
      [item.fileType]: counts[item.fileType] + 1,
    }),
    {
      image: 0,
      pdf: 0,
      cad: 0,
      video: 0,
      other: 0,
    } satisfies Record<ListingMediaType, number>,
  );
}

export function getMediaPreviewUrl(media: ListingMedia | null) {
  if (!media) {
    return null;
  }

  return media.thumbnailUrl ?? media.previewUrl ?? media.fileUrl;
}

export function isMediaPreviewable(media: ListingMedia | null) {
  if (!media) {
    return false;
  }

  return media.fileType === "image" || Boolean(media.thumbnailUrl || media.previewUrl);
}

