'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ListingFilters, ListingWithDetails } from '@/types';

export function useListings(filters: ListingFilters = {}) {
  const supabase = useRef(createClient()).current;
  const [listings, setListings] = useState<ListingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('listings')
      .select('*, profiles!listings_user_id_fkey(*), listing_images(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    if (filters.minPrice !== undefined) {
      query = query.gte('price_per_month', filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      query = query.lte('price_per_month', filters.maxPrice);
    }
    if (filters.bedrooms !== undefined) {
      query = query.eq('bedrooms', filters.bedrooms);
    }
    if (filters.isFurnished) {
      query = query.eq('is_furnished', true);
    }
    if (filters.utilitiesIncluded) {
      query = query.eq('utilities_included', true);
    }
    if (filters.availableFrom) {
      query = query.lte('available_from', filters.availableFrom);
    }

    const { data, error: err } = await query;
    if (err) {
      setError(err.message);
    } else {
      setListings((data as ListingWithDetails[]) ?? []);
    }
    setLoading(false);
  }, [supabase, filters.search, filters.minPrice, filters.maxPrice, filters.bedrooms, filters.isFurnished, filters.utilitiesIncluded, filters.availableFrom]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  return { listings, loading, error, refetch: fetchListings };
}

export function useSavedListings(userId: string | undefined) {
  const supabase = useRef(createClient()).current;
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('saved_listings')
      .select('listing_id')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (data) setSavedIds(new Set(data.map((r) => r.listing_id)));
      });
  }, [userId, supabase]);

  const toggle = useCallback(async (listingId: string, save: boolean) => {
    if (!userId) return;
    if (save) {
      await supabase.from('saved_listings').insert({ user_id: userId, listing_id: listingId });
      setSavedIds((prev) => new Set(Array.from(prev).concat(listingId)));
    } else {
      await supabase.from('saved_listings').delete().eq('user_id', userId).eq('listing_id', listingId);
      setSavedIds((prev) => { const next = new Set(prev); next.delete(listingId); return next; });
    }
  }, [userId, supabase]);

  return { savedIds, toggle };
}
