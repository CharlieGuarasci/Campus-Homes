import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/lib/constants';

export function BoardScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Board</Text>
      </View>
      <View style={styles.body}>
        <Ionicons name="newspaper-outline" size={48} color={COLORS.gray200} />
        <Text style={styles.comingSoon}>Community Board</Text>
        <Text style={styles.subtitle}>Coming soon — post questions, find roommates, and more.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: COLORS.navy, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#fff' },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingHorizontal: 32 },
  comingSoon: { fontSize: 18, fontWeight: '600', color: COLORS.gray700 },
  subtitle: { fontSize: 14, color: COLORS.gray400, textAlign: 'center', lineHeight: 20 },
});
