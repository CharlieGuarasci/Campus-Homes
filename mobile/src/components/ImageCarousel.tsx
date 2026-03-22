import React, { useState } from 'react';
import {
  View, Image, ScrollView, Dimensions, StyleSheet, TouchableWithoutFeedback,
} from 'react-native';
import { COLORS } from '@/lib/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PLACEHOLDER = 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800';

interface Props {
  images: string[];
  height?: number;
}

export function ImageCarousel({ images, height = 240 }: Props) {
  const [active, setActive] = useState(0);
  const srcs = images.length > 0 ? images : [PLACEHOLDER];

  function handleScroll(e: { nativeEvent: { contentOffset: { x: number } } }) {
    const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActive(page);
  }

  return (
    <View style={{ height }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={{ flex: 1 }}
      >
        {srcs.map((src, i) => (
          <Image
            key={i}
            source={{ uri: src }}
            style={{ width: SCREEN_WIDTH, height }}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
      {srcs.length > 1 && (
        <View style={styles.dots}>
          {srcs.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === active && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: {
    position: 'absolute', bottom: 10,
    flexDirection: 'row', alignSelf: 'center', gap: 6,
  },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: { backgroundColor: '#fff' },
});
