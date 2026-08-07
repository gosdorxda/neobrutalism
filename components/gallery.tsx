"use client";

import { getThumbPath } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";

export function Gallery({ photos }: { photos: string[] }) {
  const [visibleCount, setVisibleCount] = useState(15);

  const visiblePhotos = photos.slice(0, visibleCount);
  const hasMore = visibleCount < photos.length;

  return (
    <section id="gallery" className="w-full bg-background py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading text-foreground mb-3">
            Feeding Gallery
          </h2>
          <p className="text-base font-base text-foreground/60 max-w-xl mx-auto">
            Real photos from every feeding batch. No stock images, no filters — just hungry street cats getting fed.
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {visiblePhotos.map((photo, index) => (
                <div
                  key={index}
                  className="relative aspect-square bg-secondary-background border-2 border-border rounded-base overflow-hidden"
                >
                  <Image
                    src={getThumbPath(photo)}
                    alt={`Feeding photo ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    className="object-cover"
                    unoptimized
                    loading={index < 8 ? "eager" : "lazy"}
                  />
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="neutral"
                  onClick={() => setVisibleCount((prev) => prev + 15)}
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
