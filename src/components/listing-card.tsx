'use client';
import { useState } from 'react';
import { Heart, MapPin } from 'lucide-react';
import { cn, formatPrice, getAvatarInitials, truncate } from '@/lib/utils';
import { TagPill } from './tag-pill';
import type { ListingWithDetails } from '@/types';

interface ListingCardProps {
  listing: ListingWithDetails;
  onTap: (listing: ListingWithDetails) => void;
  onSaveToggle?: (listingId: string, saved: boolean) => void;
}

export function ListingCard({ listing, onTap, onSaveToggle }: ListingCardProps) {
  const [saved, setSaved] = useState(listing.is_saved ?? false);
  const coverImage = listing.listing_images?.sort((a, b) => a.display_order - b.display_order)[0]?.image_url;
  const placeholder = 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800';
  const initials = getAvatarInitials(listing.profiles?.full_name);

  const tags = [
    ...(listing.tags ?? []),
    ...(listing.is_furnished ? ['Furnished'] : []),
    ...(listing.utilities_included ? ['Utilities incl.'] : []),
  ].slice(0, 3);

  function handleSave(e: React.MouseEvent) {
    e.stopPropagation();
    const next = !saved;
    setSaved(next);
    onSaveToggle?.(listing.id, next);
  }

  return (
    <button
      onClick={() => onTap(listing)}
      className="w-full text-left group"
    >
      {/* Image */}
      <div className="relative aspect-[3/2] rounded-lg overflow-hidden bg-[#F7F7F5]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverImage || placeholder}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <button
          onClick={handleSave}
          className={cn(
            'absolute top-2.5 right-2.5 h-7 w-7 rounded-full flex items-center justify-center transition-colors',
            saved
              ? 'bg-white text-[#2383E2]'
              : 'bg-white/80 text-[#A0A0A0] hover:text-[#2383E2]'
          )}
          aria-label={saved ? 'Unsave' : 'Save'}
        >
          <Heart className={cn('h-3.5 w-3.5', saved && 'fill-current')} />
        </button>
      </div>

      {/* Info */}
      <div className="pt-2.5 pb-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-base font-medium text-[#191919]">
            {formatPrice(listing.price_per_month, listing.currency)}
            <span className="text-sm font-normal text-[#A0A0A0]">/mo</span>
          </p>
          {listing.neighborhood && (
            <span className="flex items-center gap-1 text-xs text-[#A0A0A0] shrink-0">
              <MapPin className="h-3 w-3" strokeWidth={1.5} />
              {listing.neighborhood}
            </span>
          )}
        </div>
        <h3 className="mt-0.5 text-sm text-[#191919] leading-snug">
          {listing.title}
        </h3>
        {listing.description && (
          <p className="mt-1 text-xs text-[#6B6B6B] leading-relaxed">
            {truncate(listing.description, 80)}
          </p>
        )}
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.map((tag) => <TagPill key={tag} label={tag} />)}
          </div>
        )}
        {/* Poster */}
        <div className="mt-2.5 flex items-center gap-1.5">
          <span className="h-5 w-5 rounded-full bg-[#E8E8E5] text-[#6B6B6B] text-[9px] font-medium flex items-center justify-center shrink-0">
            {initials}
          </span>
          <span className="text-xs text-[#A0A0A0]">{listing.profiles?.full_name ?? 'Anonymous'}</span>
        </div>
      </div>
    </button>
  );
}
