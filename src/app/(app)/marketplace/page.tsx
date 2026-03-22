'use client';
import { useState, useCallback } from 'react';
import { Search, Plus } from 'lucide-react';
import { ListingCard } from '@/components/listing-card';
import { ListingDrawer } from '@/components/listing-drawer';
import { FilterSheet } from '@/components/filter-sheet';
import { Input } from '@/components/ui/input';
import { useListings, useSavedListings } from '@/hooks/use-listings';
import { useAuth } from '@/hooks/use-auth';
import type { ListingFilters, ListingWithDetails } from '@/types';
import Link from 'next/link';

export default function MarketplacePage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<ListingFilters>({});
  const [selectedListing, setSelectedListing] = useState<ListingWithDetails | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const combinedFilters: ListingFilters = { ...activeFilters, search: search || undefined };
  const { listings, loading, error } = useListings(combinedFilters);
  const { savedIds, toggle: toggleSave } = useSavedListings(user?.id);

  const listingsWithSaved = listings.map((l) => ({ ...l, is_saved: savedIds.has(l.id) }));

  function handleCardTap(listing: ListingWithDetails) {
    setSelectedListing(listing);
    setDrawerOpen(true);
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
      <header className="sticky top-0 z-30 bg-[#1a2035] px-4 pt-safe-top pb-3 shadow-md">
        <div className="flex items-center gap-2 pt-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
            <span className="text-sm font-bold text-white">E</span>
          </div>
          <h1 className="text-lg font-bold text-white">Exchange Housing</h1>
        </div>
        <div className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search listings…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white focus:text-gray-900 focus:placeholder:text-gray-400 transition-colors"
            />
          </div>
          <FilterSheet filters={activeFilters} onApply={setActiveFilters} />
        </div>
      </header>

      {/* Feed */}
      <div className="px-4 py-4 space-y-3">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
            Error loading listings: {error}
          </div>
        )}
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-gray-200 animate-pulse" />
          ))
        ) : listingsWithSaved.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-4xl mb-3">🏠</p>
            <p className="font-semibold text-gray-700">No listings found</p>
            <p className="mt-1 text-sm text-gray-400">Try adjusting your filters</p>
          </div>
        ) : (
          listingsWithSaved.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onTap={handleCardTap}
              onSaveToggle={handleSaveToggle}
            />
          ))
        )}
      </div>

      {/* FAB */}
      <Link
        href="/create-listing"
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95 transition-transform"
        aria-label="Create listing"
      >
        <Plus className="h-6 w-6" />
      </Link>

      {/* Listing Drawer */}
      <ListingDrawer
        listing={selectedListing}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentUserId={user?.id}
      />
    </>
  );
}
