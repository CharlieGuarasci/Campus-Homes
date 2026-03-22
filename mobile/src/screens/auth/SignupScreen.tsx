import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '@/lib/supabase';
import { isAllowedEmailDomain } from '@/lib/utils';
import { COLORS } from '@/lib/constants';
import type { AuthStackParamList } from '@/navigation/AuthStack';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Signup'>;

export function SignupScreen() {
  const navigation = useNavigation<Nav>();
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', program: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSignup() {
    setError('');
    if (!form.fullName || !form.email || !form.password) {
      setError('Please fill in all required fields.'); return;
    }
    if (!isAllowedEmailDomain(form.email)) {
      setError('Please use your university email (e.g. @queensu.ca).'); return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.'); return;
    }

    setLoading(true);
    const { error: e } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName, program: form.program || null },
      },
    });
    if (e) { setError(e.message); setLoading(false); return; }
    navigation.navigate('Verify');
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>E</Text>
          </View>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Queen's University students only</Text>
        </View>

        <View style={styles.form}>
          {[
            { field: 'fullName', label: 'Full name *', placeholder: 'Alex Taylor', type: 'default' },
            { field: 'email', label: 'University email *', placeholder: 'you@queensu.ca', type: 'email-address' },
            { field: 'password', label: 'Password *', placeholder: 'Min. 8 characters', type: 'default', secure: true },
            { field: 'program', label: 'Program (optional)', placeholder: 'e.g. Commerce, Engineering…', type: 'default' },
          ].map(({ field, label, placeholder, type, secure }) => (
            <View key={field} style={styles.fieldGroup}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={COLORS.gray400}
                value={form[field as keyof typeof form]}
                onChangeText={(v) => update(field, v)}
                keyboardType={type as 'default' | 'email-address'}
                autoCapitalize={field === 'email' ? 'none' : 'words'}
                secureTextEntry={secure}
                autoComplete={field === 'email' ? 'email' : field === 'password' ? 'new-password' : 'off'}
              />
            </View>
          ))}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Create account</Text>
            }
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray50 },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 },
  header: { alignItems: 'center', marginBottom: 28 },
  logoBox: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: COLORS.blue,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  logoLetter: { fontSize: 24, fontWeight: '700', color: '#fff' },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.gray900 },
  subtitle: { fontSize: 13, color: COLORS.gray500, marginTop: 4 },
  form: { gap: 14 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: '500', color: COLORS.gray700 },
  input: {
    borderWidth: 1, borderColor: COLORS.gray200, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: COLORS.gray900, backgroundColor: '#fff',
  },
  error: {
    fontSize: 13, color: '#dc2626',
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca',
    borderRadius: 8, padding: 10,
  },
  button: {
    backgroundColor: COLORS.blue, borderRadius: 10,
    paddingVertical: 14, alignItems: 'center', marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { fontSize: 14, color: COLORS.gray500 },
  footerLink: { fontSize: 14, color: COLORS.blue, fontWeight: '600' },
});
