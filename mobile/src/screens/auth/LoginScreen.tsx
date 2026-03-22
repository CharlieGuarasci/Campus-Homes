import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/lib/constants';
import type { AuthStackParamList } from '@/navigation/AuthStack';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { console.log('[LoginScreen] Mounted'); }, []);

  async function handleLogin() {
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setError('');
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) setError(authError.message);
    setLoading(false);
  }

  async function handleForgotPassword() {
    if (!email) { Alert.alert('Enter your email address first.'); return; }
    const { error: e } = await supabase.auth.resetPasswordForEmail(email);
    if (e) Alert.alert('Error', e.message);
    else Alert.alert('Password reset email sent. Check your inbox.');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>E</Text>
          </View>
          <Text style={styles.appName}>Exchange Housing</Text>
          <Text style={styles.tagline}>Find your home away from home</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>University email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@queensu.ca"
              placeholderTextColor={COLORS.gray400}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={COLORS.gray400}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="current-password"
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Sign in</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={handleForgotPassword} style={styles.linkBtn}>
            <Text style={styles.linkText}>Forgot password?</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.footerLink}>Sign up</Text>
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
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logoBox: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: COLORS.blue,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  logoLetter: { fontSize: 24, fontWeight: '700', color: '#fff' },
  appName: { fontSize: 22, fontWeight: '700', color: COLORS.gray900 },
  tagline: { fontSize: 13, color: COLORS.gray500, marginTop: 4 },
  form: { gap: 16 },
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
    paddingVertical: 14, alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  linkBtn: { alignItems: 'center', marginTop: 4 },
  linkText: { color: COLORS.blue, fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  footerText: { fontSize: 14, color: COLORS.gray500 },
  footerLink: { fontSize: 14, color: COLORS.blue, fontWeight: '600' },
});
