import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { formatPrice, getAvatarInitials } from '@/lib/utils';
import { COLORS } from '@/lib/constants';
import { ImageCarousel } from './ImageCarousel';
import { TagPill } from './TagPill';
import type { ListingWithDetails } from '@/types';

interface Props {
  listing: ListingWithDetails | null;
  currentUserId?: string;
  onClose: () => void;
}

export function ListingDetailSheet({ listing, currentUserId, onClose }: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['92%'], []);
  const navigation = useNavigation<any>();
  const [saved, setSaved] = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);

  useEffect(() => {
    if (listing) {
      setSaved(listing.is_saved ?? false);
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [listing]);

  const handleSave = useCallback(async () => {
    if (!currentUserId || !listing) return;
    setSavingLoading(true);
    if (saved) {
      await supabase.from('saved_listings').delete()
        .eq('user_id', currentUserId).eq('listing_id', listing.id);
    } else {
      await supabase.from('saved_listings').insert({ user_id: currentUserId, listing_id: listing.id });
    }
    setSaved(!saved);
    setSavingLoading(false);
  }, [currentUserId, listing, saved]);

  const handleMessage = useCallback(async () => {
    if (!currentUserId || !listing || currentUserId === listing.user_id) return;

    const p1 = currentUserId < listing.user_id ? currentUserId : listing.user_id;
    const p2 = currentUserId < listing.user_id ? listing.user_id : currentUserId;

    const { data: existing } = await supabase.from('conversations').select('id')
      .eq('listing_id', listing.id).eq('participant_1', p1).eq('participant_2', p2).single();

    let convId = existing?.id;
    if (!convId) {
      const { data: newConv } = await supabase.from('conversations')
        .insert({ listing_id: listing.id, participant_1: p1, participant_2: p2 })
        .select('id').single();
      convId = newConv?.id;
    }

    if (convId) {
      onClose();
      navigation.navigate('Messages', {
        screen: 'Chat',
        params: { conversationId: convId, otherUserName: listing.profiles?.full_name },
      });
    }
  }, [currentUserId, listing, navigation, onClose]);

  if (!listing) return null;

  const images = listing.listing_images
    ?.sort((a, b) => a.display_order - b.display_order)
    .map((img) => img.image_url) ?? [];

  const tags = [
    ...(listing.tags ?? []),
    ...(listing.is_furnished ? ['Furnished'] : []),
    ...(listing.utilities_included ? ['Utilities included'] : []),
  ];

  const isOwn = currentUserId === listing.user_id;

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={styles.sheet}
      handleIndicatorStyle={styles.handle}
    >
      {/* Close button */}
      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Ionicons name="close" size={18} color={COLORS.gray700} />
      </TouchableOpacity>

      <BottomSheetScrollView contentContainerStyle={styles.scrollContent}>
        <ImageCarousel images={images} height={220} />

        <View style={styles.body}>
          {tags.length > 0 && (
            <View style={styles.tags}>
              {tags.map((t) => <TagPill key={t} label={t} />)}
            </View>
          )}

          <Text style={styles.title}>{listing.title}</Text>
          <Text style={styles.price}>
            {formatPrice(listing.price_per_month, listing.currency)}
            <Text style={styles.priceUnit}>/month</Text>
          </Text>

          <View style={styles.metaRow}>
            {listing.bedrooms !== null && (
              <View style={styles.metaItem}>
                <Ionicons name="bed-outline" size={15} color={COLORS.gray500} />
                <Text style={styles.metaText}>
                  {listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms} bed`}
                </Text>
              </View>
            )}
            {listing.bathrooms !== null && (
              <View style={styles.metaItem}>
                <Ionicons name="water-outline" size={15} color={COLORS.gray500} />
                <Text style={styles.metaText}>{listing.bathrooms} bath</Text>
              </View>
            )}
            {listing.neighborhood && (
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={15} color={COLORS.gray500} />
                <Text style={styles.metaText}>{listing.neighborhood}</Text>
              </View>
            )}
          </View>

          {listing.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About this place</Text>
              <Text style={styles.description}>{listing.description}</Text>
            </View>
          ) : null}

          {listing.profiles && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About the poster</Text>
              <View style={styles.posterCard}>
                <View style={styles.posterAvatar}>
                  <Text style={styles.posterAvatarText}>
                    {getAvatarInitials(listing.profiles.full_name)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.posterName}>{listing.profiles.full_name ?? 'Anonymous'}</Text>
                  <Text style={styles.posterMeta}>
                    {listing.profiles.university}
                    {listing.profiles.program ? ` · ${listing.profiles.program}` : ''}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </BottomSheetScrollView>

      {/* Action bar */}
      <View style={styles.actionBar}>
        {!isOwn && (
          <TouchableOpacity style={styles.msgBtn} onPress={handleMessage}>
            <Ionicons name="chatbubble-outline" size={18} color="#fff" />
            <Text style={styles.msgBtnText}>Message</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.iconBtn, saved && styles.iconBtnSaved]}
          onPress={handleSave}
          disabled={savingLoading}
        >
          {savingLoading
            ? <ActivityIndicator size="small" color={saved ? '#fff' : COLORS.gray700} />
            : <Ionicons name={saved ? 'heart' : 'heart-outline'} size={20} color={saved ? '#fff' : COLORS.gray700} />
          }
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: { backgroundColor: '#fff', borderRadius: 24 },
  handle: { backgroundColor: COLORS.gray200, width: 40 },
  closeBtn: {
    position: 'absolute', top: 16, right: 16, zIndex: 10,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  scrollContent: { paddingBottom: 100 },
  body: { padding: 16, gap: 12 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.gray900 },
  price: { fontSize: 24, fontWeight: '700', color: COLORS.blue },
  priceUnit: { fontSize: 15, fontWeight: '400', color: COLORS.gray500 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: COLORS.gray500 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.gray900 },
  description: { fontSize: 14, color: COLORS.gray500, lineHeight: 20 },
  posterCard: {
    flexDirection: 'row', gap: 12, alignItems: 'center',
    backgroundColor: COLORS.gray50, borderRadius: 12, padding: 12,
  },
  posterAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.blue, justifyContent: 'center', alignItems: 'center',
  },
  posterAvatarText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  posterName: { fontSize: 14, fontWeight: '600', color: COLORS.gray900 },
  posterMeta: { fontSize: 12, color: COLORS.gray500, marginTop: 2 },
  actionBar: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: COLORS.gray100,
    backgroundColor: '#fff',
  },
  msgBtn: {
    flex: 1, flexDirection: 'row', gap: 8,
    backgroundColor: COLORS.blue, borderRadius: 10,
    paddingVertical: 13, justifyContent: 'center', alignItems: 'center',
  },
  msgBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  iconBtn: {
    width: 46, height: 46, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.gray200,
    justifyContent: 'center', alignItems: 'center',
  },
  iconBtnSaved: { backgroundColor: COLORS.red500, borderColor: COLORS.red500 },
});
