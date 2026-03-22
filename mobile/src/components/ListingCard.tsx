import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatPrice, getAvatarInitials, truncate } from '@/lib/utils';
import { COLORS } from '@/lib/constants';
import type { ListingWithDetails } from '@/types';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800';

interface Props {
  listing: ListingWithDetails;
  onPress: (listing: ListingWithDetails) => void;
  onSaveToggle?: (id: string, saved: boolean) => void;
}

export function ListingCard({ listing, onPress, onSaveToggle }: Props) {
  const [saved, setSaved] = useState(listing.is_saved ?? false);
  const coverImage = listing.listing_images?.[0]?.image_url;
  const initials = getAvatarInitials(listing.profiles?.full_name);

  function handleSave() {
    const next = !saved;
    setSaved(next);
    onSaveToggle?.(listing.id, next);
  }

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(listing)} activeOpacity={0.95}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: coverImage || PLACEHOLDER }}
          style={styles.image}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={[styles.saveBtn, saved && styles.saveBtnActive]}
          onPress={handleSave}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={18}
            color={saved ? '#fff' : COLORS.gray700}
          />
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={styles.price}>
            {formatPrice(listing.price_per_month, listing.currency)}
            <Text style={styles.priceUnit}>/mo</Text>
          </Text>
          {listing.neighborhood && (
            <Text style={styles.neighborhood}>{listing.neighborhood}</Text>
          )}
        </View>
        <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
        {listing.description && (
          <Text style={styles.description} numberOfLines={2}>
            {truncate(listing.description, 90)}
          </Text>
        )}
        <View style={styles.poster}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.posterName}>
            {listing.profiles?.full_name ?? 'Anonymous'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  imageContainer: { position: 'relative', aspectRatio: 16 / 9, backgroundColor: COLORS.gray100 },
  image: { width: '100%', height: '100%' },
  saveBtn: {
    position: 'absolute', top: 10, right: 10,
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center', alignItems: 'center',
  },
  saveBtnActive: { backgroundColor: COLORS.red500 },
  info: { padding: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  price: { fontSize: 18, fontWeight: '700', color: COLORS.gray900 },
  priceUnit: { fontSize: 13, fontWeight: '400', color: COLORS.gray500 },
  neighborhood: { fontSize: 11, color: COLORS.gray400, marginTop: 3 },
  title: { fontSize: 13, fontWeight: '600', color: COLORS.gray700, marginTop: 2 },
  description: { fontSize: 12, color: COLORS.gray500, marginTop: 4, lineHeight: 17 },
  poster: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  avatar: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: COLORS.blue, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 9, fontWeight: '700', color: '#fff' },
  posterName: { fontSize: 12, color: COLORS.gray500 },
});
