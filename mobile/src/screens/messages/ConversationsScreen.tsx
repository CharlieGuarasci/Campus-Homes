import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useConversations } from '@/hooks/useConversations';
import { getAvatarInitials, truncate, formatRelativeTime } from '@/lib/utils';
import { COLORS } from '@/lib/constants';
import type { MessagesStackParamList } from '@/navigation/TabNavigator';

type Nav = NativeStackNavigationProp<MessagesStackParamList, 'Conversations'>;

export function ConversationsScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { conversations, loading } = useConversations(user?.id);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.blue} />
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubble-outline" size={48} color={COLORS.gray200} />
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap "Message" on any listing to start a conversation.
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item: conv }) => {
            const other = conv.other_participant;
            const initials = getAvatarInitials(other?.full_name);
            const lastMsg = conv.last_message;
            const hasUnread = conv.unread_count > 0;

            return (
              <TouchableOpacity
                style={styles.row}
                onPress={() =>
                  navigation.navigate('Chat', {
                    conversationId: conv.id,
                    otherUserName: other?.full_name ?? undefined,
                  })
                }
                activeOpacity={0.7}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View style={styles.rowContent}>
                  <View style={styles.rowTop}>
                    <Text
                      style={[styles.name, hasUnread && styles.nameBold]}
                      numberOfLines={1}
                    >
                      {other?.full_name ?? 'Unknown'}
                    </Text>
                    <View style={styles.rowMeta}>
                      {lastMsg && (
                        <Text style={styles.time}>{formatRelativeTime(lastMsg.created_at)}</Text>
                      )}
                      {hasUnread && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>
                            {conv.unread_count > 9 ? '9+' : conv.unread_count}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  {conv.listing && (
                    <Text style={styles.listingTitle} numberOfLines={1}>
                      {conv.listing.title}
                    </Text>
                  )}
                  {lastMsg && (
                    <Text
                      style={[styles.preview, hasUnread && styles.previewBold]}
                      numberOfLines={1}
                    >
                      {lastMsg.sender_id === user?.id ? 'You: ' : ''}
                      {truncate(lastMsg.content, 60)}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: COLORS.navy, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: COLORS.gray700 },
  emptySubtitle: { fontSize: 13, color: COLORS.gray400, textAlign: 'center' },
  separator: { height: 1, backgroundColor: COLORS.gray100, marginLeft: 76 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.blue, justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  avatarText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  rowContent: { flex: 1, minWidth: 0 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 14, fontWeight: '500', color: COLORS.gray800 ?? COLORS.gray700, flex: 1 },
  nameBold: { fontWeight: '700', color: COLORS.gray900 },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 },
  time: { fontSize: 11, color: COLORS.gray400 },
  badge: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: COLORS.blue, justifyContent: 'center', alignItems: 'center',
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  listingTitle: { fontSize: 12, color: COLORS.blue, marginTop: 1 },
  preview: { fontSize: 12, color: COLORS.gray400, marginTop: 2 },
  previewBold: { color: COLORS.gray700, fontWeight: '500' },
});
