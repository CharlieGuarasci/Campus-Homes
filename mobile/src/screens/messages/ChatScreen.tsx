import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, RouteProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import { ChatBubble } from '@/components/ChatBubble';
import { COLORS } from '@/lib/constants';
import type { MessagesStackParamList } from '@/navigation/TabNavigator';

type Nav = NativeStackNavigationProp<MessagesStackParamList, 'Chat'>;
type Route = RouteProp<MessagesStackParamList, 'Chat'>;

export function ChatScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { conversationId, otherUserName } = route.params;
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useMessages(conversationId, user?.id);
  const flatListRef = useRef<FlatList>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  async function handleSend() {
    if (!text.trim()) return;
    setSending(true);
    await sendMessage(text.trim());
    setText('');
    setSending(false);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Ionicons name="chevron-back" size={26} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>
            {otherUserName ?? 'Chat'}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.blue} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messages}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => {
              const isSent = item.sender_id === user?.id;
              const showTime = index === messages.length - 1 ||
                new Date(messages[index + 1]?.created_at).getTime() -
                new Date(item.created_at).getTime() > 5 * 60 * 1000;
              return <ChatBubble message={item} isSent={isSent} showTime={showTime} />;
            }}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Text style={styles.emptyChatText}>No messages yet. Say hi!</Text>
              </View>
            }
          />
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Type a message…"
            placeholderTextColor={COLORS.gray400}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
          >
            {sending
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="send" size={18} color="#fff" />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.navy },
  flex: { flex: 1, backgroundColor: COLORS.gray50 },
  header: {
    backgroundColor: COLORS.navy,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingTop: 4, paddingBottom: 14,
  },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: '600', color: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  messages: { padding: 16, gap: 2, flexGrow: 1 },
  emptyChat: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyChatText: { fontSize: 14, color: COLORS.gray400 },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.gray200,
  },
  input: {
    flex: 1, borderWidth: 1, borderColor: COLORS.gray200, borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 15,
    color: COLORS.gray900, backgroundColor: '#fff', maxHeight: 120,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.blue, justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
