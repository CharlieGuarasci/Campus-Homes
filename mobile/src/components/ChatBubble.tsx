import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatRelativeTime } from '@/lib/utils';
import { COLORS } from '@/lib/constants';
import type { Message } from '@/types';

interface Props {
  message: Message;
  isSent: boolean;
  showTime: boolean;
}

export function ChatBubble({ message, isSent, showTime }: Props) {
  return (
    <View style={[styles.wrapper, isSent && styles.wrapperSent]}>
      <View style={[styles.bubble, isSent ? styles.bubbleSent : styles.bubbleReceived]}>
        <Text style={[styles.text, isSent && styles.textSent]}>{message.content}</Text>
      </View>
      {showTime && (
        <Text style={[styles.time, isSent && styles.timeSent]}>
          {formatRelativeTime(message.created_at)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'flex-start', marginBottom: 4 },
  wrapperSent: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '78%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9,
  },
  bubbleSent: { backgroundColor: COLORS.blue, borderBottomRightRadius: 4 },
  bubbleReceived: { backgroundColor: '#fff', borderBottomLeftRadius: 4 },
  text: { fontSize: 15, color: COLORS.gray900, lineHeight: 21 },
  textSent: { color: '#fff' },
  time: { fontSize: 11, color: COLORS.gray400, marginTop: 3, marginHorizontal: 4 },
  timeSent: { textAlign: 'right' },
});
