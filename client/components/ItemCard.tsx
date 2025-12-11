import React from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { getApiUrl } from '@/lib/query-client';
import { Spacing, BorderRadius } from '@/constants/theme';
import type { Item } from '@shared/schema';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.lg * 2 - Spacing.md) / 2;

interface ItemCardProps {
  item: Item;
  onPress: () => void;
}

export function ItemCard({ item, onPress }: ItemCardProps) {
  const { theme } = useTheme();

  const getImageUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    return `${getApiUrl()}${path}`;
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { 
          backgroundColor: theme.backgroundDefault,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
      onPress={onPress}
    >
      {item.images && item.images.length > 0 ? (
        <Image
          source={{ uri: getImageUrl(item.images[0]) }}
          style={styles.image}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.image, styles.placeholderImage, { backgroundColor: theme.backgroundSecondary }]}>
          <Feather name="image" size={32} color={theme.textTertiary} />
        </View>
      )}
      <View style={styles.content}>
        <ThemedText type="body" style={styles.title} numberOfLines={1}>
          {item.title}
        </ThemedText>
        <View style={styles.locationRow}>
          <Feather name="map-pin" size={12} color={theme.textTertiary} />
          <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 4 }} numberOfLines={1}>
            {item.city}
          </ThemedText>
        </View>
        <ThemedText type="body" style={{ color: theme.primary, fontWeight: '700', marginTop: Spacing.xs }}>
          {item.pricePerDay} RSD<ThemedText type="small" style={{ color: theme.textSecondary, fontWeight: '400' }}>/dan</ThemedText>
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: CARD_WIDTH * 0.75,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: Spacing.sm,
  },
  title: {
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
});
