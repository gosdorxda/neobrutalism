"use client";

import { getThumbPath } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export type GalleryPhoto = {
  url: string;
  batchId: number;
  batchName: string;
  batchDate: string;
};

function formatGalleryDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function Gallery({ photos }: { photos: GalleryPhoto[] }) {
  const [expanded, setExpanded] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const previewCount = 10;
  const visiblePhotos = expanded ? photos : photos.slice(0, previewCount);
  const hasMore = photos.length > previewCount;

  const selectedPhoto =
    lightboxIndex !== null ? visiblePhotos[lightboxIndex] : null;

  function openLightbox(index: number) {
    setLightboxIndex(index);
  }

  function closeLightbox() {
    setLightboxIndex(null);
  }

  function nextPhoto() {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) =>
      prev !== null && prev < visiblePhotos.length - 1 ? prev + 1 : prev
    );
  }

  function prevPhoto() {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) =>
      prev !== null && prev > 0 ? prev - 1 : prev
    );
  }

  return (
    <section id="gallery" className="w-full bg-gradient-to-b from-background to-secondary-background py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading text-foreground mb-3">
            Feeding Gallery
          </h2>
          <p className="text-base font-base text-foreground/60 max-w-xl mx-auto">
            Real photos from every feeding batch. No stock images or filters. Just hungry street cats getting fed.
          </p>
          <p className="text-sm font-base text-foreground/40 mt-2">
            {photos.length} photos total
          </p>
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-base">
            <p className="text-sm font-base text-foreground/50">No photos uploaded yet.</p>
          </div>
        ) : (
          <>
            <div
              className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 ${
                expanded ? "" : "max-sm:[&>*:nth-child(n+5)]:hidden"
              }`}
            >
              {visiblePhotos.map((photo, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => openLightbox(index)}
                  className="relative aspect-square bg-secondary-background border-2 border-border rounded-base overflow-hidden text-left hover:border-main transition-colors focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2"
                  aria-label={`View photo from ${photo.batchName}`}
                >
                  <Image
                    src={getThumbPath(photo.url)}
                    alt={`Feeding photo from ${photo.batchName}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover"
                    unoptimized
                    loading={index < 10 ? "eager" : "lazy"}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                    <p className="text-[10px] font-heading text-white truncate">
                      {photo.batchName}
                    </p>
                    <p className="text-[9px] font-base text-white/80">
                      {formatGalleryDate(photo.batchDate)}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="neutral"
                  onClick={() => setExpanded((prev) => !prev)}
                >
                  {expanded
                    ? "Show Less"
                    : `Load More (${photos.length - previewCount})`}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={lightboxIndex !== null} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-4xl w-full p-0 border-2 border-border bg-background overflow-hidden">
          <DialogTitle className="sr-only">
            {selectedPhoto
              ? `Photo from ${selectedPhoto.batchName}`
              : "Photo preview"}
          </DialogTitle>
          {selectedPhoto && (
              <div className="relative flex flex-col">
                <div className="relative w-full aspect-[3/4] bg-secondary-background">
                  <Image
                    src={selectedPhoto.url}
                    alt={`Feeding photo from ${selectedPhoto.batchName}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 80vw"
                    className="object-cover"
                    unoptimized
                    priority
                  />
                </div>
              <div className="px-4 py-3 bg-white border-t-2 border-border">
                <p className="text-sm font-heading text-foreground">
                  {selectedPhoto.batchName}
                </p>
                <p className="text-xs font-base text-foreground/60">
                  {formatGalleryDate(selectedPhoto.batchDate)}
                </p>
              </div>
              {visiblePhotos.length > 1 && (
                <>
                  <Button
                    variant="noShadow"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 bg-white/90 hover:bg-white border-2 border-border"
                    onClick={prevPhoto}
                    disabled={lightboxIndex === 0}
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="noShadow"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 bg-white/90 hover:bg-white border-2 border-border"
                    onClick={nextPhoto}
                    disabled={lightboxIndex === visiblePhotos.length - 1}
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
