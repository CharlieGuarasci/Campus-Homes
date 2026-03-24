'use client';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Settings, LogOut, Heart, Home } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { ListingCard } from '@/components/listing-card';
import { ListingDrawer } from '@/components/listing-drawer';
import { getAvatarInitials } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import type { ListingWithDetails } from '@/types';

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const supabase = useRef(createClient()).current;
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [myListings, setMyListings] = useState<ListingWithDetails[]>([]);
  const [savedListings, setSavedListings] = useState<ListingWithDetails[]>([]);
  const [activeTab, setActiveTab] = useState<'listings' | 'saved'>('listings');
  const [selectedListing, setSelectedListing] = useState<ListingWithDetails | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    supabase
      .from('listings')
      .select('*, profiles!listings_user_id_fkey(*), listing_images(*), listing_housemates(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setMyListings(data as ListingWithDetails[]); });

    supabase
      .from('saved_listings')
      .select('listing_id, listings(*, profiles!listings_user_id_fkey(*), listing_images(*), listing_housemates(*))')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const listings = (data as any[]).map((r) => r.listings).filter(Boolean);
          setSavedListings(listings as ListingWithDetails[]);
        }
      });
  }, [user, supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  async function handleDeleteListing(listingId: string) {
    if (!myListings.find(l => l.id === listingId)) {
      alert('You do not own this listing.');
      return;
    }
    if (!confirm('Delete this listing?')) return;
    await supabase.from('listings').delete().eq('id', listingId);
    setMyListings((prev) => prev.filter((l) => l.id !== listingId));
  }

  function handleCardTap(listing: ListingWithDetails) {
    if (isDesktop) {
      router.push(`/listing/${listing.id}`);
    } else {
      setSelectedListing(listing);
      setDrawerOpen(true);
    }
  }

  const initials = getAvatarInitials(profile?.full_name ?? null);
  const displayListings = activeTab === 'listings' ? myListings : savedListings;

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-[#EBEBEA] px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-medium text-[#191919]">Profile</h1>
          <div className="flex gap-1">
            <Link href="/profile/edit" className="h-8 w-8 rounded-md flex items-center justify-center text-[#6B6B6B] hover:bg-[#F7F7F5] transition-colors">
              <Settings className="h-4 w-4" strokeWidth={1.5} />
            </Link>
            <button
              onClick={handleSignOut}
              className="h-8 w-8 rounded-md flex items-center justify-center text-[#6B6B6B] hover:bg-[#F7F7F5] transition-colors"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 py-5 max-w-2xl mx-auto w-full">
        {/* Profile info */}
        <div className="flex items-center gap-4">
          <span className="h-14 w-14 rounded-full bg-[#F0F0EE] text-[#6B6B6B] text-lg font-medium flex items-center justify-center shrink-0">
            {initials}
          </span>
          <div>
            <h2 className="text-base font-medium text-[#191919]">{profile?.full_name ?? user?.email}</h2>
            <p className="text-sm text-[#6B6B6B]">{profile?.university}</p>
            {(profile?.program || profile?.year_of_study) && (
              <p className="text-xs text-[#A0A0A0] mt-0.5">
                {[profile?.program, profile?.year_of_study ? `Year ${profile.year_of_study}` : null]
                  .filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>
        {profile?.bio && (
          <p className="mt-3 text-sm text-[#6B6B6B] leading-relaxed">{profile.bio}</p>
        )}
        <Link
          href="/profile/edit"
          className="mt-4 flex h-8 w-full items-center justify-center rounded-md border border-[#EBEBEA] text-sm text-[#6B6B6B] hover:bg-[#F7F7F5] transition-colors"
        >
          Edit profile
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#EBEBEA] bg-white">
        {(['listings', 'saved'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab
                ? 'border-[#2383E2] text-[#2383E2]'
                : 'border-transparent text-[#A0A0A0] hover:text-[#6B6B6B]'
            }`}
          >
            {tab === 'listings' ? <Home className="h-3.5 w-3.5" strokeWidth={1.5} /> : <Heart className="h-3.5 w-3.5" strokeWidth={1.5} />}
            {tab === 'listings' ? 'My listings' : 'Saved'}
            <span className="text-xs text-[#A0A0A0]">
              ({tab === 'listings' ? myListings.length : savedListings.length})
            </span>
          </button>
        ))}
      </div>

      <div className="px-4 py-5 max-w-2xl mx-auto w-full">
        {displayListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-[#A0A0A0]">
              {activeTab === 'listings' ? "You haven't posted any listings yet." : "No saved listings."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayListings.map((listing) => (
              <div key={listing.id}>
                <ListingCard listing={listing} onTap={handleCardTap} />
                {activeTab === 'listings' && (
                  <div className="mt-2 flex gap-2">
                    <Link
                      href={`/create-listing?edit=${listing.id}`}
                      className="flex flex-1 items-center justify-center h-7 px-3 rounded-md border border-[#EBEBEA] text-xs text-[#6B6B6B] hover:bg-[#F7F7F5] transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteListing(listing.id)}
                      className="flex flex-1 items-center justify-center h-7 px-3 rounded-md border border-red-200 text-xs text-red-500 hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

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
