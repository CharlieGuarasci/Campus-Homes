import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { COLORS } from '@/lib/constants';

export function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, profile } = useAuth();
  const [form, setForm] = useState({
    fullName: profile?.full_name ?? '',
    program: profile?.program ?? '',
    bio: profile?.bio ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!user) return;
    setLoading(true);
    setError('');
    const { error: e } = await supabase
      .from('profiles')
      .update({ full_name: form.fullName, program: form.program || null, bio: form.bio || null })
      .eq('id', user.id);

    if (e) { setError(e.message); setLoading(false); return; }
    navigation.goBack();
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Ionicons name="chevron-back" size={26} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit profile</Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {[
            { field: 'fullName', label: 'Full name', placeholder: 'Alex Taylor' },
            { field: 'program', label: 'Program (optional)', placeholder: 'e.g. Commerce' },
          ].map(({ field, label, placeholder }) => (
            <View key={field} style={styles.fieldGroup}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                value={form[field as keyof typeof form]}
                onChangeText={(v) => update(field, v)}
                placeholder={placeholder}
                placeholderTextColor={COLORS.gray400}
              />
            </View>
          ))}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Bio (optional)</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={form.bio}
              onChangeText={(v) => update('bio', v)}
              placeholder="Tell others a bit about yourself…"
              placeholderTextColor={COLORS.gray400}
              multiline
              numberOfLines={4}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.saveBtnText}>Save changes</Text>
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
  error: {
    fontSize: 13, color: '#dc2626',
    backgroundColor: '#fef2f2', borderRadius: 8, padding: 10,
  },
  saveBtn: {
    backgroundColor: COLORS.blue, borderRadius: 10,
    paddingVertical: 14, alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
