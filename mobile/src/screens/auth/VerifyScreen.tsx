import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/lib/constants';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/AuthStack';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Verify'>;

export function VerifyScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Ionicons name="mail-outline" size={40} color={COLORS.blue} />
      </View>
      <Text style={styles.title}>Check your inbox</Text>
      <Text style={styles.body}>
        We sent a verification link to your university email. Click the link to activate your
        account and start browsing listings.
      </Text>
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.link}>
        <Text style={styles.linkText}>Already verified? Sign in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 32, backgroundColor: COLORS.gray50,
  },
  iconBox: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#dbeafe', justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.gray900, marginBottom: 12, textAlign: 'center' },
  body: { fontSize: 15, color: COLORS.gray500, textAlign: 'center', lineHeight: 22 },
  link: { marginTop: 24 },
  linkText: { fontSize: 14, color: COLORS.blue, fontWeight: '600' },
});
