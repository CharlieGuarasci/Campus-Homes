import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { getAvatarInitials, formatPrice } from '@/lib/utils';
import { COLORS } from '@/lib/constants';
import type { ListingWithDetails } from '@/types';
import type { ProfileStackParamList } from '@/navigation/TabNavigator';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user, profile } = useAuth();
  const [myListings, setMyListings] = useState<ListingWithDetails[]>([]);
  const [savedListings, setSavedListings] = useState<ListingWithDetails[]>([]);
  const [activeTab, setActiveTab] = useState<'listings' | 'saved'>('listings');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const [{ data: mine }, { data: saved }] = await Promise.all([
        supabase.from('listings')
          .select('*, profiles!listings_user_id_fkey(*), listing_images(*)')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false }),
        supabase.from('saved_listings')
          .select('listing_id, listings(*, profiles!listings_user_id_fkey(*), listing_images(*))')
          .eq('user_id', user!.id),
      ]);

      if (mine) setMyListings(mine as ListingWithDetails[]);
      if (saved) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setSavedListings((saved as any[]).map((r) => r.listings).filter(Boolean) as ListingWithDetails[]);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  async function handleDelete(listingId: string) {
    Alert.alert('Delete listing?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await supabase.from('listings').delete().eq('id', listingId);
          setMyListings((prev) => prev.filter((l) => l.id !== listingId));
        },
      },
    ]);
  }

  const initials = getAvatarInitials(profile?.full_name ?? null);
  const displayListings = activeTab === 'listings' ? myListings : savedListings;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Ionicons name="settings-outline" size={22} color="rgba(255,255,255,0.75)" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSignOut} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Ionicons name="log-out-outline" size={22} color="rgba(255,255,255,0.75)" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} stickyHeaderIndices={[1]}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{profile?.full_name ?? user?.email}</Text>
            {profile?.university && <Text style={styles.uni}>{profile.university}</Text>}
            {(profile?.program || profile?.year_of_study) && (
              <Text style={styles.meta}>
                {[profile.program, profile.year_of_study ? `Year ${profile.year_of_study}` : null]
                  .filter(Boolean).join(' · ')}
              </Text>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['listings', 'saved'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Ionicons
                name={tab === 'listings' ? 'home-outline' : 'heart-outline'}
                size={16}
                color={activeTab === tab ? COLORS.blue : COLORS.gray500}
              />
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'listings' ? 'My listings' : 'Saved'}
              </Text>
              <Text style={styles.tabCount}>
                ({tab === 'listings' ? myListings.length : savedListings.length})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Listings */}
        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.blue} />
        ) : displayListings.length === 0 ? (
          <Text style={styles.emptyText}>
            {activeTab === 'listings' ? "You haven't posted any listings yet." : "No saved listings."}
          </Text>
        ) : (
          displayListings.map((listing) => (
            <View key={listing.id} style={styles.listingRow}>
              <Text style={styles.listingTitle} numberOfLines={1}>{listing.title}</Text>
              <Text style={styles.listingPrice}>
                {formatPrice(listing.price_per_month, listing.currency)}/mo
              </Text>
              {activeTab === 'listings' && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(listing.id)}
                >
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.gray50 },
  header: {
    backgroundColor: COLORS.navy, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 4, paddingBottom: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  headerActions: { flexDirection: 'row', gap: 18 },
  profileCard: {
    flexDirection: 'row', gap: 14, padding: 16,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.gray100,
  },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: COLORS.blue, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#fff' },
  name: { fontSize: 18, fontWeight: '700', color: COLORS.gray900 },
  uni: { fontSize: 13, color: COLORS.gray500, marginTop: 2 },
  meta: { fontSize: 12, color: COLORS.gray400, marginTop: 2 },
  tabs: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: COLORS.gray200,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: COLORS.blue },
  tabText: { fontSize: 13, fontWeight: '500', color: COLORS.gray500 },
  tabTextActive: { color: COLORS.blue },
  tabCount: { fontSize: 11, color: COLORS.gray400 },
  emptyText: { textAlign: 'center', color: COLORS.gray400, fontSize: 14, marginTop: 40 },
  listingRow: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 10,
    borderRadius: 12, padding: 14, gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  listingTitle: { fontSize: 14, fontWeight: '600', color: COLORS.gray900 },
  listingPrice: { fontSize: 13, color: COLORS.blue, fontWeight: '600' },
  deleteBtn: {
    alignSelf: 'flex-start', marginTop: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1, borderColor: '#fecaca',
  },
  deleteBtnText: { fontSize: 12, color: '#dc2626', fontWeight: '500' },
});
