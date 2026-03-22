import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { COLORS, NEIGHBORHOODS, LISTING_TAGS } from '@/lib/constants';

export function CreateListingScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price_per_month: '',
    bedrooms: '',
    bathrooms: '',
    neighborhood: '',
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSubmit() {
    if (!user) return;
    if (!form.title || !form.price_per_month) {
      Alert.alert('Please fill in title and price.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('listings').insert({
      user_id: user.id,
      title: form.title,
      description: form.description || null,
      price_per_month: parseFloat(form.price_per_month),
      bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
      bathrooms: form.bathrooms ? parseFloat(form.bathrooms) : null,
      neighborhood: form.neighborhood || null,
      tags: selectedTags,
      currency: 'CAD',
      status: 'active',
    });
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      navigation.goBack();
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Ionicons name="chevron-back" size={26} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New listing</Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {[
            { field: 'title', label: 'Title', placeholder: 'e.g. Bright room near campus' },
            { field: 'price_per_month', label: 'Price / month (CAD)', placeholder: '850', keyboardType: 'numeric' as const },
            { field: 'bedrooms', label: 'Bedrooms', placeholder: '0 = Studio', keyboardType: 'numeric' as const },
            { field: 'bathrooms', label: 'Bathrooms', placeholder: '1', keyboardType: 'numeric' as const },
            { field: 'neighborhood', label: 'Neighborhood', placeholder: 'e.g. University District' },
          ].map(({ field, label, placeholder, keyboardType }) => (
            <View key={field} style={styles.fieldGroup}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                value={form[field as keyof typeof form]}
                onChangeText={(v) => update(field, v)}
                placeholder={placeholder}
                placeholderTextColor={COLORS.gray400}
                keyboardType={keyboardType ?? 'default'}
              />
            </View>
          ))}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={form.description}
              onChangeText={(v) => update('description', v)}
              placeholder="Describe the place…"
              placeholderTextColor={COLORS.gray400}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Tags</Text>
            <View style={styles.tagRow}>
              {LISTING_TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tagChip, selectedTags.includes(tag) && styles.tagChipActive]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={[styles.tagChipText, selectedTags.includes(tag) && styles.tagChipTextActive]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitBtnText}>Post listing</Text>
            }
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.gray50 },
  header: {
    backgroundColor: COLORS.navy, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 4, paddingBottom: 16,
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#fff' },
  content: { padding: 20, gap: 16 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: '500', color: COLORS.gray700 },
  input: {
    borderWidth: 1, borderColor: COLORS.gray200, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: COLORS.gray900, backgroundColor: '#fff',
  },
  textarea: { height: 100, textAlignVertical: 'top' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: COLORS.gray200,
    backgroundColor: '#fff',
  },
  tagChipActive: { backgroundColor: COLORS.blue, borderColor: COLORS.blue },
  tagChipText: { fontSize: 13, color: COLORS.gray700 },
  tagChipTextActive: { color: '#fff' },
  submitBtn: {
    backgroundColor: COLORS.blue, borderRadius: 10,
    paddingVertical: 14, alignItems: 'center', marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
