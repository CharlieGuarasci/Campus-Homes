'use client';
import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';

interface ImageCarouselProps {
  images: string[];
  alt?: string;
  className?: string;
  aspectRatio?: 'video' | 'square';
}

export function ImageCarousel({
  images,
  alt = 'Listing image',
  className,
  aspectRatio = 'video',
}: ImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  const placeholder = 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800';
  const displayImages = images.length > 0 ? images : [placeholder];

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div
        ref={emblaRef}
        className={cn(
          'overflow-hidden',
          aspectRatio === 'video' ? 'aspect-video' : 'aspect-square'
        )}
      >
        <div className="flex h-full">
          {displayImages.map((src, i) => (
            <div key={i} className="relative flex-none w-full h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${alt} ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {displayImages.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {displayImages.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === selectedIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
              )}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
