import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, StyleSheet,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ListingCard } from '@/components/ListingCard';
import { ListingDetailSheet } from '@/components/ListingDetailSheet';
import { useListings, useSavedListings } from '@/hooks/useListings';
import { useAuth } from '@/hooks/useAuth';
import { COLORS } from '@/lib/constants';
import type { ListingWithDetails } from '@/types';

export function MarketplaceScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [search, setSearch] = useState('');
  const [selectedListing, setSelectedListing] = useState<ListingWithDetails | null>(null);

  const { listings, loading, refetch } = useListings({ search: search || undefined });
  const { savedIds, toggle: toggleSave } = useSavedListings(user?.id);

  const listingsWithSaved = listings.map((l) => ({ ...l, is_saved: savedIds.has(l.id) }));

  const handleSaveToggle = useCallback((id: string, saved: boolean) => {
    toggleSave(id, saved);
  }, [toggleSave]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>E</Text>
          </View>
          <Text style={styles.headerTitle}>Exchange Housing</Text>
        </View>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={16} color="rgba(255,255,255,0.5)" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search listings…"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
          </View>
        </View>
      </View>

      {/* Feed */}
      {loading && listings.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.blue} />
        </View>
      ) : (
        <FlatList
          data={listingsWithSaved}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={COLORS.blue} />}
          renderItem={({ item }) => (
            <ListingCard
              listing={item}
              onPress={setSelectedListing}
              onSaveToggle={handleSaveToggle}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🏠</Text>
              <Text style={styles.emptyTitle}>No listings found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your search</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateListing')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Listing detail sheet */}
      <ListingDetailSheet
        listing={selectedListing}
        currentUserId={user?.id}
        onClose={() => setSelectedListing(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.navy },
  header: { backgroundColor: COLORS.navy, paddingHorizontal: 16, paddingBottom: 12 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 4 },
  logoBox: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: COLORS.blueLight, justifyContent: 'center', alignItems: 'center',
  },
  logoLetter: { fontSize: 14, fontWeight: '700', color: '#fff' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  searchRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: '#fff', fontSize: 15, paddingVertical: 10 },
  list: { padding: 16, paddingBottom: 100 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.gray50 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: COLORS.gray700 },
  emptySubtitle: { fontSize: 13, color: COLORS.gray400, marginTop: 4 },
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.blue,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 6,
  },
});
