"use client";

import { Box, FileText, Film, ImageIcon, Ruler } from "lucide-react";
import {
  getMediaPreviewUrl,
  getPrimaryListingMedia,
  getTechnicalMediaCounts,
  isMediaPreviewable,
  type ListingMedia,
} from "../../lib/marketplace/listing-media";

type ListingMediaPreviewProps = {
  media: ListingMedia[];
  title: string;
};

export function ListingMediaPreview({ media, title }: ListingMediaPreviewProps) {
  const primaryMedia = getPrimaryListingMedia(media);
  const previewUrl = getMediaPreviewUrl(primaryMedia);
  const counts = getTechnicalMediaCounts(media);

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
      {previewUrl && isMediaPreviewable(primaryMedia) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="h-full w-full object-cover"
          src={previewUrl}
          alt={primaryMedia?.altText || title}
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-zinc-900 text-zinc-400">
          <Box className="h-8 w-8" aria-hidden="true" />
          <span className="text-xs font-medium">Media pending</span>
        </div>
      )}

      <div className="absolute left-2 top-2 flex flex-wrap gap-1">
        {counts.image > 1 ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-zinc-950/80 px-2 py-1 text-xs font-medium text-white">
            <ImageIcon className="h-3 w-3" aria-hidden="true" />
            {counts.image}
          </span>
        ) : null}
        {counts.pdf ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-zinc-950/80 px-2 py-1 text-xs font-medium text-white">
            <FileText className="h-3 w-3" aria-hidden="true" />
            PDF
          </span>
        ) : null}
        {counts.cad ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-zinc-950/80 px-2 py-1 text-xs font-medium text-white">
            <Ruler className="h-3 w-3" aria-hidden="true" />
            CAD
          </span>
        ) : null}
        {counts.video ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-zinc-950/80 px-2 py-1 text-xs font-medium text-white">
            <Film className="h-3 w-3" aria-hidden="true" />
            Video
          </span>
        ) : null}
      </div>
    </div>
  );
}

