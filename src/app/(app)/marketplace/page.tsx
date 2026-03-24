'use client';
import { useState, useCallback } from 'react';
import { Search, Plus } from 'lucide-react';
import { ListingCard } from '@/components/listing-card';
import { ListingDrawer } from '@/components/listing-drawer';
import { FilterSheet } from '@/components/filter-sheet';
import { useListings, useSavedListings } from '@/hooks/use-listings';
import { useAuth } from '@/hooks/use-auth';
import { useMediaQuery } from '@/hooks/use-media-query';
import type { ListingFilters, ListingWithDetails } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MarketplacePage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<ListingFilters>({});
  const [selectedListing, setSelectedListing] = useState<ListingWithDetails | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const combinedFilters: ListingFilters = { ...activeFilters, search: search || undefined };
  const { listings, loading, error } = useListings(combinedFilters);
  const { savedIds, toggle: toggleSave } = useSavedListings(user?.id);

  const listingsWithSaved = listings.map((l) => ({ ...l, is_saved: savedIds.has(l.id) }));

  function handleCardTap(listing: ListingWithDetails) {
    if (isDesktop) {
      router.push(`/listing/${listing.id}`);
    } else {
      setSelectedListing(listing);
      setDrawerOpen(true);
    }
  }

  const handleSaveToggle = useCallback(
    (listingId: string, saved: boolean) => {
      toggleSave(listingId, saved);
    },
    [toggleSave]
  );

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#EBEBEA] px-4 py-3">
        <div className="flex items-center gap-2 mb-3 md:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#2383E2]">
            <span className="text-xs font-medium text-white">E</span>
          </div>
          <h1 className="text-base font-medium text-[#191919]">Exchange Housing</h1>
        </div>
        <h1 className="hidden md:block text-base font-medium text-[#191919] mb-3">Marketplace</h1>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0A0A0]" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search listings…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 h-9 rounded-md bg-[#F7F7F5] border border-[#EBEBEA] text-sm text-[#191919] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#2383E2] transition-colors"
            />
          </div>
          <FilterSheet filters={activeFilters} onApply={setActiveFilters} />
        </div>
      </header>

      {/* Feed */}
      <div className="px-4 py-5 max-w-5xl mx-auto">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 mb-4">
            {error}
          </div>
        )}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-[3/2] rounded-lg bg-[#F7F7F5] animate-pulse" />
                <div className="h-4 w-24 rounded bg-[#F7F7F5] animate-pulse" />
                <div className="h-3 w-40 rounded bg-[#F7F7F5] animate-pulse" />
              </div>
            ))}
          </div>
        ) : listingsWithSaved.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-4xl mb-3">🏠</p>
            <p className="text-sm font-medium text-[#191919]">No listings found</p>
            <p className="mt-1 text-sm text-[#A0A0A0]">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {listingsWithSaved.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onTap={handleCardTap}
                onSaveToggle={handleSaveToggle}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <Link
        href="/create-listing"
        className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#2383E2] text-white hover:bg-[#1a6fc9] active:scale-95 transition-all"
        aria-label="Create listing"
      >
        <Plus className="h-5 w-5" />
      </Link>

      <ListingDrawer
        listing={selectedListing}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentUserId={user?.id}
        currentUserProfile={profile}
      />
    </>
  );
}
