'use client';
import { useState } from 'react';
import { Heart } from 'lucide-react';
import { cn, formatPrice, getAvatarInitials, truncate } from '@/lib/utils';
import type { ListingWithDetails } from '@/types';

interface ListingCardProps {
  listing: ListingWithDetails;
  onTap: (listing: ListingWithDetails) => void;
  onSaveToggle?: (listingId: string, saved: boolean) => void;
}

export function ListingCard({ listing, onTap, onSaveToggle }: ListingCardProps) {
  const [saved, setSaved] = useState(listing.is_saved ?? false);
  const coverImage = listing.listing_images?.[0]?.image_url;
  const placeholder = 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800';
  const initials = getAvatarInitials(listing.profiles?.full_name);

  function handleSave(e: React.MouseEvent) {
    e.stopPropagation();
    const next = !saved;
    setSaved(next);
    onSaveToggle?.(listing.id, next);
  }

  return (
    <button
      onClick={() => onTap(listing)}
      className="w-full text-left bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 active:scale-[0.99] transition-transform"
    >
      {/* Image */}
      <div className="relative aspect-video bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverImage || placeholder}
          alt={listing.title}
          className="w-full h-full object-cover"
        />
        <button
          onClick={handleSave}
          className={cn(
            'absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors',
            saved ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:text-red-500'
          )}
          aria-label={saved ? 'Unsave listing' : 'Save listing'}
        >
          <Heart className={cn('h-4 w-4', saved && 'fill-current')} />
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-lg font-bold text-gray-900 leading-tight">
            {formatPrice(listing.price_per_month, listing.currency)}
            <span className="text-sm font-normal text-gray-500">/mo</span>
          </p>
          {listing.neighborhood && (
            <span className="shrink-0 text-xs text-gray-400 mt-1">{listing.neighborhood}</span>
          )}
        </div>
        <h3 className="mt-0.5 text-sm font-semibold text-gray-800 leading-snug">
          {listing.title}
        </h3>
        {listing.description && (
          <p className="mt-1 text-xs text-gray-500 leading-relaxed">
            {truncate(listing.description, 90)}
          </p>
        )}
        {/* Poster */}
        <div className="mt-2.5 flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-blue-600 text-white text-[10px] font-semibold flex items-center justify-center shrink-0">
            {initials}
          </span>
          <span className="text-xs text-gray-500">{listing.profiles?.full_name ?? 'Anonymous'}</span>
        </div>
      </div>
    </button>
  );
}
