'use client';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Settings, LogOut, Heart, Home } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { ListingCard } from '@/components/listing-card';
import { ListingDrawer } from '@/components/listing-drawer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getAvatarInitials } from '@/lib/utils';
import type { ListingWithDetails } from '@/types';

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const supabase = useRef(createClient()).current;

  const [myListings, setMyListings] = useState<ListingWithDetails[]>([]);
  const [savedListings, setSavedListings] = useState<ListingWithDetails[]>([]);
  const [activeTab, setActiveTab] = useState<'listings' | 'saved'>('listings');
  const [selectedListing, setSelectedListing] = useState<ListingWithDetails | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Fetch my listings
    supabase
      .from('listings')
      .select('*, profiles!listings_user_id_fkey(*), listing_images(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setMyListings(data as ListingWithDetails[]); });

    // Fetch saved listings
    supabase
      .from('saved_listings')
      .select('listing_id, listings(*, profiles!listings_user_id_fkey(*), listing_images(*))')
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
    if (!confirm('Delete this listing?')) return;
    await supabase.from('listings').delete().eq('id', listingId);
    setMyListings((prev) => prev.filter((l) => l.id !== listingId));
  }

  const initials = getAvatarInitials(profile?.full_name ?? null);
  const displayListings = activeTab === 'listings' ? myListings : savedListings;

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#1a2035] px-4 pt-safe-top pb-4">
        <div className="flex items-center justify-between pt-2">
          <h1 className="text-xl font-bold text-white">Profile</h1>
          <div className="flex gap-2">
            <Link href="/profile/edit">
              <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="px-4 py-5">
        {/* Profile card */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{profile?.full_name ?? user?.email}</h2>
            <p className="text-sm text-gray-500">{profile?.university}</p>
            {(profile?.program || profile?.year_of_study) && (
              <p className="text-xs text-gray-400 mt-0.5">
                {[profile?.program, profile?.year_of_study ? `Year ${profile.year_of_study}` : null]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            )}
          </div>
        </div>
        {profile?.bio && (
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
        )}

        <Link href="/profile/edit">
          <Button variant="outline" className="mt-4 w-full">Edit profile</Button>
        </Link>
      </div>

      <Separator />

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        {(['listings', 'saved'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'listings' ? <Home className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
            {tab === 'listings' ? 'My listings' : 'Saved'}
            <span className="ml-1 text-xs text-gray-400">
              ({tab === 'listings' ? myListings.length : savedListings.length})
            </span>
          </button>
        ))}
      </div>

      <div className="px-4 py-4 space-y-3">
        {displayListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-gray-400 text-sm">
              {activeTab === 'listings' ? "You haven't posted any listings yet." : "No saved listings."}
            </p>
          </div>
        ) : (
          displayListings.map((listing) => (
            <div key={listing.id} className="relative">
              <ListingCard
                listing={listing}
                onTap={(l) => { setSelectedListing(l); setDrawerOpen(true); }}
              />
              {activeTab === 'listings' && (
                <div className="mt-1 flex gap-2">
                  <Link
                    href={`/create-listing?edit=${listing.id}`}
                    className="flex flex-1 items-center justify-center h-8 px-3 rounded-lg border border-gray-300 bg-white text-xs font-medium text-gray-900 hover:bg-gray-50"
                  >
                    Edit
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs text-red-500 border-red-200 hover:bg-red-50"
                    onClick={() => handleDeleteListing(listing.id)}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <ListingDrawer
        listing={selectedListing}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentUserId={user?.id}
      />
    </>
  );
}
