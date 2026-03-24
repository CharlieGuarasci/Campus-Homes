'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, X, BedDouble, Bath, MapPin, Calendar, Check } from 'lucide-react';
import { Drawer } from 'vaul';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ImageCarousel } from './image-carousel';
import { TagPill } from './tag-pill';
import { ListingMap } from './listing-map';
import { ListingCard } from './listing-card';
import { createClient } from '@/lib/supabase/client';
import { formatPrice, getAvatarInitials, cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  SLEEP_HABITS_LABELS,
  PARTY_LEVEL_LABELS,
  CLEANLINESS_LABELS,
  KITCHEN_LABELS,
  GUEST_POLICY_LABELS,
  LAUNDRY_TYPE_LABELS,
} from '@/lib/constants';
import type { ListingWithDetails, ListingHousemate, Profile } from '@/types';

interface ListingDrawerProps {
  listing: ListingWithDetails | null;
  open: boolean;
  onClose: () => void;
  currentUserId?: string;
  currentUserProfile?: Profile | null;
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide mb-3">{title}</h3>
  );
}

function PropRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between py-2 border-b border-[#F0F0EE] last:border-0">
      <span className="text-sm text-[#6B6B6B] shrink-0 mr-4">{label}</span>
      <span className="text-sm text-[#191919] text-right">{value}</span>
    </div>
  );
}

function HousemateCard({ housemate }: { housemate: ListingHousemate }) {
  const tags = [
    housemate.sleep_habits ? SLEEP_HABITS_LABELS[housemate.sleep_habits] : null,
    housemate.party_level ? PARTY_LEVEL_LABELS[housemate.party_level] : null,
    housemate.cleanliness ? CLEANLINESS_LABELS[housemate.cleanliness] : null,
    ...(housemate.interests ?? []),
  ].filter(Boolean) as string[];

  return (
    <div className="border border-[#EBEBEA] rounded-lg p-3">
      <p className="text-sm font-medium text-[#191919]">{housemate.name ?? 'Housemate'}</p>
      {housemate.bio && (
        <p className="mt-1 text-xs text-[#6B6B6B] leading-relaxed">{housemate.bio}</p>
      )}
      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {tags.map((t) => <TagPill key={t} label={t} />)}
        </div>
      )}
    </div>
  );
}

interface CompatRowProps {
  label: string;
  userValue: string | null | undefined;
  hmValue: string | null | undefined;
  labelMap?: Record<string, string>;
}

function CompatRow({ label, userValue, hmValue, labelMap }: CompatRowProps) {
  const userDisplay = userValue ? (labelMap?.[userValue] ?? userValue) : '—';
  const hmDisplay = hmValue ? (labelMap?.[hmValue] ?? hmValue) : '—';
  const match = userValue && hmValue && userValue === hmValue;

  return (
    <div className={cn('grid grid-cols-3 gap-2 py-2 border-b border-[#F0F0EE] last:border-0 text-xs', match && 'bg-green-50 -mx-3 px-3 rounded')}>
      <span className="text-[#6B6B6B]">{label}</span>
      <span className="text-[#191919] text-center">{userDisplay}</span>
      <span className={cn('text-center', match ? 'text-green-700 font-medium' : 'text-[#191919]')}>
        {match && <Check className="inline h-3 w-3 mr-0.5" />}
        {hmDisplay}
      </span>
    </div>
  );
}

export function ListingDrawer({ listing, open, onClose, currentUserId, currentUserProfile }: ListingDrawerProps) {
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
  const housemates = listing.listing_housemates ?? [];

  const amenities: string[] = [
    ...(listing.room_furnishings ?? []),
    ...(listing.is_furnished ? ['Furnished'] : []),
    ...(listing.utilities_included ? ['Utilities included'] : []),
    ...(listing.has_ac ? ['Air conditioning'] : []),
    ...(listing.has_heating ? ['Heating'] : []),
    ...(listing.has_dishwasher ? ['Dishwasher'] : []),
  ];

  const content = (
    <>
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-white border border-[#EBEBEA] flex items-center justify-center hover:bg-[#F7F7F5] transition-colors"
      >
        <X className="h-4 w-4 text-[#6B6B6B]" />
      </button>

      {/* Scrollable body */}
      <div className="overflow-y-auto flex-1 pb-24">
        <ImageCarousel images={images} alt={listing.title} aspectRatio="video" />

        <div className="px-5 pt-5 space-y-6">
          {/* Title + price */}
          <div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {tags.map((tag) => <TagPill key={tag} label={tag} />)}
              </div>
            )}
            <h2 className="text-xl font-medium text-[#191919]">{listing.title}</h2>
            <p className="mt-1 text-2xl font-medium text-[#2383E2]">
              {formatPrice(listing.price_per_month, listing.currency)}
              <span className="text-base font-normal text-[#A0A0A0]">/month</span>
            </p>
          </div>

          {/* Quick facts */}
          <div className="flex flex-wrap gap-3 text-sm text-[#6B6B6B]">
            {listing.bedrooms !== null && (
              <span className="flex items-center gap-1.5">
                <BedDouble className="h-4 w-4" strokeWidth={1.5} />
                {listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms} bed`}
              </span>
            )}
            {listing.bathrooms !== null && (
              <span className="flex items-center gap-1.5">
                <Bath className="h-4 w-4" strokeWidth={1.5} />
                {listing.bathrooms} bath
              </span>
            )}
            {listing.neighborhood && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" strokeWidth={1.5} />
                {listing.neighborhood}
              </span>
            )}
            {(listing.available_from || listing.available_to) && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" strokeWidth={1.5} />
                {listing.available_from}
                {listing.available_to ? ` – ${listing.available_to}` : ''}
              </span>
            )}
          </div>

          <div className="border-t border-[#EBEBEA]" />

          {/* Description */}
          {listing.description && (
            <div>
              <SectionHeader title="About this place" />
              <p className="text-sm text-[#6B6B6B] leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>
          )}

          {/* Location */}
          {listing.latitude && listing.longitude && (
            <div>
              <SectionHeader title="Location" />
              <ListingMap latitude={listing.latitude} longitude={listing.longitude} address={listing.address} />
            </div>
          )}

          {/* Room details */}
          {(listing.room_size_sqft || listing.laundry_type || listing.has_parking) && (
            <div>
              <SectionHeader title="Room details" />
              <div>
                <PropRow label="Size" value={listing.room_size_sqft ? `${listing.room_size_sqft} sq ft` : null} />
                <PropRow label="Laundry" value={listing.laundry_type ? LAUNDRY_TYPE_LABELS[listing.laundry_type] : null} />
                <PropRow label="Parking" value={listing.has_parking ? 'Available' : null} />
              </div>
            </div>
          )}

          {/* Amenities */}
          {amenities.length > 0 && (
            <div>
              <SectionHeader title="Amenities" />
              <div className="grid grid-cols-2 gap-y-1.5">
                {amenities.map((a) => (
                  <span key={a} className="flex items-center gap-1.5 text-sm text-[#6B6B6B]">
                    <Check className="h-3.5 w-3.5 text-[#2383E2] shrink-0" />
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* House rules */}
          {(listing.guest_policy || listing.house_cleanliness || listing.kitchen_arrangement) && (
            <div>
              <SectionHeader title="House rules" />
              <div>
                <PropRow label="Guests" value={listing.guest_policy ? GUEST_POLICY_LABELS[listing.guest_policy] : null} />
                <PropRow label="Cleanliness" value={listing.house_cleanliness ? CLEANLINESS_LABELS[listing.house_cleanliness] : null} />
                <PropRow label="Kitchen" value={listing.kitchen_arrangement ? KITCHEN_LABELS[listing.kitchen_arrangement] : null} />
              </div>
            </div>
          )}

          <div className="border-t border-[#EBEBEA]" />

          {/* Housemates */}
          {housemates.length > 0 && (
            <div>
              <SectionHeader title={`Housemates (${housemates.length})`} />
              <div className="space-y-2">
                {housemates
                  .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
                  .map((hm) => <HousemateCard key={hm.id} housemate={hm} />)}
              </div>
            </div>
          )}

          {/* Compatibility */}
          {currentUserProfile && housemates.length > 0 && (
            <div>
              <SectionHeader title="Compatibility" />
              <p className="text-xs text-[#A0A0A0] mb-3">Your profile vs. housemates — green rows match</p>
              {housemates
                .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
                .map((hm) => (
                  <div key={hm.id} className="mb-4">
                    <p className="text-xs font-medium text-[#6B6B6B] mb-1">{hm.name ?? 'Housemate'}</p>
                    <div className="grid grid-cols-3 gap-2 text-[10px] font-medium text-[#A0A0A0] uppercase tracking-wide mb-1 px-0">
                      <span>Category</span>
                      <span className="text-center">You</span>
                      <span className="text-center">Them</span>
                    </div>
                    <CompatRow label="Sleep" userValue={currentUserProfile.sleep_habits} hmValue={hm.sleep_habits} labelMap={SLEEP_HABITS_LABELS} />
                    <CompatRow label="Social" userValue={currentUserProfile.party_level} hmValue={hm.party_level} labelMap={PARTY_LEVEL_LABELS} />
                  </div>
                ))}
            </div>
          )}

          <div className="border-t border-[#EBEBEA]" />

          {/* Poster */}
          {poster && (
            <div>
              <SectionHeader title="Posted by" />
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-full bg-[#F0F0EE] text-[#6B6B6B] text-sm font-medium flex items-center justify-center shrink-0">
                  {initials}
                </span>
                <div>
                  <p className="text-sm font-medium text-[#191919]">{poster.full_name ?? 'Anonymous'}</p>
                  <p className="text-xs text-[#A0A0A0]">
                    {[poster.university, poster.program, poster.year_of_study ? `Year ${poster.year_of_study}` : null]
                      .filter(Boolean).join(' · ')}
                  </p>
                  {poster.bio && (
                    <p className="mt-1 text-xs text-[#6B6B6B]">{poster.bio}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Related */}
          {related.length > 0 && (
            <div>
              <SectionHeader title="Similar listings" />
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5">
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
      <div className="absolute bottom-0 left-0 right-0 border-t border-[#EBEBEA] bg-white px-4 py-3 flex gap-2 safe-area-pb">
        {!isOwnListing && (
          <button
            onClick={handleMessage}
            className="flex-1 flex items-center justify-center gap-2 h-10 rounded-md bg-[#2383E2] text-white text-sm font-medium hover:bg-[#1a6fc9] transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Message
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={savingLoading || !currentUserId}
          className={cn(
            'h-10 w-10 rounded-md border flex items-center justify-center transition-colors',
            saved
              ? 'border-[#2383E2] text-[#2383E2] bg-blue-50'
              : 'border-[#EBEBEA] text-[#6B6B6B] hover:border-[#2383E2] hover:text-[#2383E2]'
          )}
          aria-label={saved ? 'Unsave' : 'Save'}
        >
          <Heart className={cn('h-4 w-4', saved && 'fill-current')} />
        </button>
      </div>
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="p-0 relative max-w-lg">
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-white rounded-t-2xl max-h-[92vh] focus:outline-none">
          <div className="mx-auto mt-3 mb-1 h-1 w-10 rounded-full bg-[#E8E8E5] shrink-0" />
          {content}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
