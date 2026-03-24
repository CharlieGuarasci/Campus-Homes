'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Heart, MessageCircle, BedDouble, Bath, MapPin, Calendar, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { ImageCarousel } from '@/components/image-carousel';
import { TagPill } from '@/components/tag-pill';
import { ListingMap } from '@/components/listing-map';
import { formatPrice, getAvatarInitials, cn } from '@/lib/utils';
import {
  SLEEP_HABITS_LABELS,
  PARTY_LEVEL_LABELS,
  CLEANLINESS_LABELS,
  KITCHEN_LABELS,
  GUEST_POLICY_LABELS,
  LAUNDRY_TYPE_LABELS,
} from '@/lib/constants';
import type { ListingWithDetails, ListingHousemate } from '@/types';
import Link from 'next/link';

function SectionHeader({ title }: { title: string }) {
  return <h3 className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide mb-3">{title}</h3>;
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
    ...(housemate.interests ?? []),
  ].filter(Boolean) as string[];

  return (
    <div className="border border-[#EBEBEA] rounded-lg p-3">
      <p className="text-sm font-medium text-[#191919]">{housemate.name}</p>
      {housemate.bio && <p className="mt-1 text-xs text-[#6B6B6B] leading-relaxed">{housemate.bio}</p>}
      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {tags.map((t) => <TagPill key={t} label={t} />)}
        </div>
      )}
    </div>
  );
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, profile } = useAuth();
  const supabase = useRef(createClient()).current;

  const [listing, setListing] = useState<ListingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);

  useEffect(() => {
    supabase
      .from('listings')
      .select('*, profiles!listings_user_id_fkey(*), listing_images(*), listing_housemates(*)')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) setListing(data as ListingWithDetails);
        setLoading(false);
      });
  }, [id, supabase]);

  useEffect(() => {
    if (!user || !listing) return;
    supabase
      .from('saved_listings')
      .select('listing_id')
      .eq('user_id', user.id)
      .eq('listing_id', listing.id)
      .maybeSingle()
      .then(({ data }) => setSaved(!!data));
  }, [user, listing, supabase]);

  const handleSave = useCallback(async () => {
    if (!user || !listing) return;
    setSavingLoading(true);
    if (saved) {
      await supabase.from('saved_listings').delete().eq('user_id', user.id).eq('listing_id', listing.id);
    } else {
      await supabase.from('saved_listings').insert({ user_id: user.id, listing_id: listing.id });
    }
    setSaved(!saved);
    setSavingLoading(false);
  }, [user, listing, saved, supabase]);

  const handleMessage = useCallback(async () => {
    if (!user || !listing || user.id === listing.user_id) return;

    const p1 = user.id < listing.user_id ? user.id : listing.user_id;
    const p2 = user.id < listing.user_id ? listing.user_id : user.id;

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('listing_id', listing.id)
      .eq('participant_1', p1)
      .eq('participant_2', p2)
      .single();

    if (existing) { router.push(`/messages/${existing.id}`); return; }

    const { data: newConv } = await supabase
      .from('conversations')
      .insert({ listing_id: listing.id, participant_1: p1, participant_2: p2 })
      .select('id')
      .single();

    if (newConv) router.push(`/messages/${newConv.id}`);
  }, [user, listing, supabase, router]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <div className="aspect-video rounded-lg bg-[#F7F7F5] animate-pulse" />
        <div className="h-6 w-64 rounded bg-[#F7F7F5] animate-pulse" />
        <div className="h-4 w-32 rounded bg-[#F7F7F5] animate-pulse" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm text-[#A0A0A0]">Listing not found.</p>
        <Link href="/marketplace" className="mt-3 text-sm text-[#2383E2] hover:underline">Back to marketplace</Link>
      </div>
    );
  }

  const images = listing.listing_images?.sort((a, b) => a.display_order - b.display_order).map((i) => i.image_url) ?? [];
  const housemates = listing.listing_housemates ?? [];
  const isOwnListing = user?.id === listing.user_id;
  const poster = listing.profiles;
  const initials = getAvatarInitials(poster?.full_name);

  const tags: string[] = [
    ...(listing.tags ?? []),
    ...(listing.is_furnished ? ['Furnished'] : []),
    ...(listing.utilities_included ? ['Utilities included'] : []),
  ];

  const amenities: string[] = [
    ...(listing.room_furnishings ?? []),
    ...(listing.is_furnished ? ['Furnished'] : []),
    ...(listing.utilities_included ? ['Utilities included'] : []),
    ...(listing.has_ac ? ['Air conditioning'] : []),
    ...(listing.has_heating ? ['Heating'] : []),
    ...(listing.has_dishwasher ? ['Dishwasher'] : []),
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#EBEBEA] px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-[#6B6B6B] hover:text-[#191919] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={savingLoading || !user}
            className={cn(
              'h-8 w-8 rounded-md border flex items-center justify-center transition-colors',
              saved ? 'border-[#2383E2] text-[#2383E2] bg-blue-50' : 'border-[#EBEBEA] text-[#6B6B6B] hover:border-[#2383E2] hover:text-[#2383E2]'
            )}
          >
            <Heart className={cn('h-4 w-4', saved && 'fill-current')} />
          </button>
          {!isOwnListing && (
            <button
              onClick={handleMessage}
              className="flex items-center gap-1.5 h-8 px-3 rounded-md bg-[#2383E2] text-white text-sm font-medium hover:bg-[#1a6fc9] transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Message
            </button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        {/* Images */}
        <ImageCarousel images={images} alt={listing.title} aspectRatio="video" />

        {/* Title block */}
        <div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.map((t) => <TagPill key={t} label={t} />)}
            </div>
          )}
          <h1 className="text-2xl font-medium text-[#191919]">{listing.title}</h1>
          <p className="mt-1.5 text-2xl font-medium text-[#2383E2]">
            {formatPrice(listing.price_per_month, listing.currency)}
            <span className="text-base font-normal text-[#A0A0A0]">/month</span>
          </p>

          <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#6B6B6B]">
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
                {listing.available_from}{listing.available_to ? ` – ${listing.available_to}` : ''}
              </span>
            )}
          </div>
        </div>

        <div className="border-t border-[#EBEBEA]" />

        {/* Description */}
        {listing.description && (
          <div>
            <SectionHeader title="About this place" />
            <p className="text-sm text-[#6B6B6B] leading-relaxed whitespace-pre-line">{listing.description}</p>
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
            <PropRow label="Size" value={listing.room_size_sqft ? `${listing.room_size_sqft} sq ft` : null} />
            <PropRow label="Laundry" value={listing.laundry_type ? LAUNDRY_TYPE_LABELS[listing.laundry_type] : null} />
            <PropRow label="Parking" value={listing.has_parking ? 'Available' : null} />
          </div>
        )}

        {/* Amenities */}
        {amenities.length > 0 && (
          <div>
            <SectionHeader title="Amenities" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2">
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
            <PropRow label="Guests" value={listing.guest_policy ? GUEST_POLICY_LABELS[listing.guest_policy] : null} />
            <PropRow label="Cleanliness" value={listing.house_cleanliness ? CLEANLINESS_LABELS[listing.house_cleanliness] : null} />
            <PropRow label="Kitchen" value={listing.kitchen_arrangement ? KITCHEN_LABELS[listing.kitchen_arrangement] : null} />
          </div>
        )}

        <div className="border-t border-[#EBEBEA]" />

        {/* Housemates */}
        {housemates.length > 0 && (
          <div>
            <SectionHeader title={`Housemates (${housemates.length})`} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {housemates.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)).map((hm) => (
                <HousemateCard key={hm.id} housemate={hm} />
              ))}
            </div>
          </div>
        )}

        {/* Compatibility */}
        {profile && housemates.length > 0 && (
          <div>
            <SectionHeader title="Compatibility" />
            <p className="text-xs text-[#A0A0A0] mb-4">Your profile vs. housemates — green rows match</p>
            <div className="space-y-6">
              {housemates.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)).map((hm) => (
                <div key={hm.id}>
                  <p className="text-xs font-medium text-[#6B6B6B] mb-2">{hm.name}</p>
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-medium text-[#A0A0A0] uppercase tracking-wide mb-1">
                    <span>Category</span>
                    <span className="text-center">You</span>
                    <span className="text-center">Them</span>
                  </div>
                  {[
                    { label: 'Sleep', uk: profile.sleep_habits, hk: hm.sleep_habits, map: SLEEP_HABITS_LABELS },
                    { label: 'Social', uk: profile.party_level, hk: hm.party_level, map: PARTY_LEVEL_LABELS },
                  ].map(({ label, uk, hk, map }) => {
                    const match = uk && hk && uk === hk;
                    return (
                      <div key={label} className={cn('grid grid-cols-3 gap-2 py-2 border-b border-[#F0F0EE] last:border-0 text-xs', match && 'bg-green-50 -mx-1 px-1 rounded')}>
                        <span className="text-[#6B6B6B]">{label}</span>
                        <span className="text-[#191919] text-center">{uk ? (map[uk] ?? uk) : '—'}</span>
                        <span className={cn('text-center', match ? 'text-green-700 font-medium' : 'text-[#191919]')}>
                          {match && <Check className="inline h-3 w-3 mr-0.5" />}
                          {hk ? (map[hk] ?? hk) : '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
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
                  {[poster.university, poster.program, poster.year_of_study ? `Year ${poster.year_of_study}` : null].filter(Boolean).join(' · ')}
                </p>
                {poster.bio && <p className="mt-1 text-xs text-[#6B6B6B]">{poster.bio}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
