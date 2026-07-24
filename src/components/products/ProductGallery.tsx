"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ProductGalleryProps {
  images: { id: string; url: string; altText: string | null }[];
  primaryImage: string | null;
  productName: string;
}

export function ProductGallery({ images, primaryImage, productName }: ProductGalleryProps) {
  // Always ensure the primary image is first if it exists and isn't already in the list
  const galleryImages = primaryImage 
    ? [{ id: 'primary', url: primaryImage, altText: productName }, ...images.filter(img => img.url !== primaryImage)]
    : images;

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (galleryImages.length === 0) {
    return (
      <div className="aspect-square bg-muted flex items-center justify-center rounded-lg text-muted-foreground">
        No Image Available
      </div>
    );
  }

  const activeImage = galleryImages[activeIndex];

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div 
        className="relative aspect-square overflow-hidden rounded-lg bg-muted cursor-zoom-in"
        onClick={() => setLightboxOpen(true)}
      >
        <Image
          src={activeImage.url}
          alt={activeImage.altText || productName}
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Thumbnails */}
      {galleryImages.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {galleryImages.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(idx)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted ${
                idx === activeIndex ? "ring-2 ring-primary ring-offset-2" : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img.url}
                alt={img.altText || `${productName} thumbnail ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 border-none bg-transparent shadow-none [&>button]:text-white">
          <div className="relative w-full h-[85vh] flex items-center justify-center">
            <Image
              src={activeImage.url}
              alt={activeImage.altText || productName}
              fill
              className="object-contain"
              quality={100}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
