'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, ExternalLink, X, BedDouble, Bath, MapPin, Calendar } from 'lucide-react';
import { Drawer } from 'vaul';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ImageCarousel } from './image-carousel';
import { TagPill } from './tag-pill';
import { ListingCard } from './listing-card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase/client';
import { formatPrice, getAvatarInitials } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import type { ListingWithDetails } from '@/types';

interface ListingDrawerProps {
  listing: ListingWithDetails | null;
  open: boolean;
  onClose: () => void;
  currentUserId?: string;
}

export function ListingDrawer({ listing, open, onClose, currentUserId }: ListingDrawerProps) {
  const router = useRouter();
  const supabase = useRef(createClient()).current;
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [saved, setSaved] = useState(false);
  const [related, setRelated] = useState<ListingWithDetails[]>([]);
  const [savingLoading, setSavingLoading] = useState(false);

  useEffect(() => {
    if (!listing) return;
    setSaved(listing.is_saved ?? false);

    async function fetchRelated() {
      const query = supabase
        .from('listings')
        .select('*, profiles!listings_user_id_fkey(*), listing_images(*)')
        .eq('status', 'active')
        .neq('id', listing!.id)
        .limit(4);

      if (listing!.neighborhood) {
        query.eq('neighborhood', listing!.neighborhood);
      }

      const { data } = await query;
      if (data) setRelated(data as ListingWithDetails[]);
    }
    fetchRelated();
  }, [listing, supabase]);

  const handleSave = useCallback(async () => {
    if (!currentUserId || !listing) return;
    setSavingLoading(true);
    if (saved) {
      await supabase
        .from('saved_listings')
        .delete()
        .eq('user_id', currentUserId)
        .eq('listing_id', listing.id);
    } else {
      await supabase
        .from('saved_listings')
        .insert({ user_id: currentUserId, listing_id: listing.id });
    }
    setSaved(!saved);
    setSavingLoading(false);
  }, [currentUserId, listing, saved, supabase]);

  const handleMessage = useCallback(async () => {
    if (!currentUserId || !listing) return;
    if (currentUserId === listing.user_id) return;

    const p1 = currentUserId < listing.user_id ? currentUserId : listing.user_id;
    const p2 = currentUserId < listing.user_id ? listing.user_id : currentUserId;

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('listing_id', listing.id)
      .eq('participant_1', p1)
      .eq('participant_2', p2)
      .single();

    if (existing) {
      onClose();
      router.push(`/messages/${existing.id}`);
      return;
    }

    const { data: newConv } = await supabase
      .from('conversations')
      .insert({ listing_id: listing.id, participant_1: p1, participant_2: p2 })
      .select('id')
      .single();

    if (newConv) {
      onClose();
      router.push(`/messages/${newConv.id}`);
    }
  }, [currentUserId, listing, supabase, onClose, router]);

  if (!listing) return null;

  const images = listing.listing_images
    ?.sort((a, b) => a.display_order - b.display_order)
    .map((img) => img.image_url) ?? [];

  const tags: string[] = [
    ...(listing.tags ?? []),
    ...(listing.is_furnished ? ['Furnished'] : []),
    ...(listing.utilities_included ? ['Utilities included'] : []),
  ];

  const poster = listing.profiles;
  const initials = getAvatarInitials(poster?.full_name);
  const isOwnListing = currentUserId === listing.user_id;

  // Shared inner content used in both Drawer and Dialog
  const content = (
    <>
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-gray-100 transition-colors"
      >
        <X className="h-4 w-4 text-gray-600" />
      </button>

      {/* Scrollable body */}
      <div className="overflow-y-auto flex-1 pb-24">
        <ImageCarousel images={images} alt={listing.title} aspectRatio="video" />

        <div className="px-4 pt-4 space-y-4">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <TagPill key={tag} label={tag} />
              ))}
            </div>
          )}

          <div>
            <h2 className="text-xl font-bold text-gray-900">{listing.title}</h2>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              {formatPrice(listing.price_per_month, listing.currency)}
              <span className="text-base font-normal text-gray-500">/month</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            {listing.bedrooms !== null && (
              <span className="flex items-center gap-1">
                <BedDouble className="h-4 w-4" />
                {listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms} bed`}
              </span>
            )}
            {listing.bathrooms !== null && (
              <span className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                {listing.bathrooms} bath
              </span>
            )}
            {listing.neighborhood && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {listing.neighborhood}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {listing.available_from} – {listing.available_to}
            </span>
          </div>

          <Separator />

          {listing.description && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-1.5">About this place</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>
          )}

          <Separator />

          {poster && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">About the poster</h3>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <Avatar className="h-12 w-12">
                  {poster.avatar_url && <AvatarImage src={poster.avatar_url} />}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">{poster.full_name ?? 'Anonymous'}</p>
                  <p className="text-xs text-gray-500">
                    {poster.university}
                    {poster.program ? ` · ${poster.program}` : ''}
                    {poster.year_of_study ? ` · Year ${poster.year_of_study}` : ''}
                  </p>
                  {poster.bio && (
                    <p className="mt-1 text-xs text-gray-600">{poster.bio}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {related.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Related listings</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
                {related.map((r) => (
                  <div key={r.id} className="w-52 shrink-0">
                    <ListingCard listing={r} onTap={() => {}} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-4 py-3 flex gap-2 safe-area-pb">
        {!isOwnListing && (
          <Button className="flex-1 gap-2" onClick={handleMessage}>
            <MessageCircle className="h-4 w-4" />
            Message
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={handleSave}
          disabled={savingLoading || !currentUserId}
          className={saved ? 'border-red-300 text-red-500 hover:bg-red-50' : ''}
        >
          <Heart className={saved ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
        </Button>
        <Button variant="outline" size="icon">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="p-0 relative">
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-white rounded-t-2xl max-h-[92vh] focus:outline-none">
          {/* Drag handle */}
          <div className="mx-auto mt-3 mb-1 h-1 w-10 rounded-full bg-gray-300 shrink-0" />
          {content}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
