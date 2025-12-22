import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { ImageIcon, StarIcon, MapPinIcon, ClockIcon } from '@/components/icons/TabBarIcons';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout } from '@/hooks/useWebLayout';
import { getApiUrl } from '@/lib/query-client';
import { Spacing, BorderRadius, Colors } from '@/constants/theme';
import type { Item } from '@shared/schema';

interface ItemCardProps {
  item: Item & { isPremium?: boolean; distance?: number | null };
  onPress: () => void;
  showExpiration?: boolean;
}

export function ItemCard({ item, onPress, showExpiration = false }: ItemCardProps) {
  const { theme } = useTheme();
  const { isDesktop, cardWidth } = useWebLayout();

  const getImageUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    return `${getApiUrl()}${path}`;
  };

  const getDaysRemaining = () => {
    if (!item.expiresAt) return null;
    const expiresAt = new Date(item.expiresAt);
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = showExpiration ? getDaysRemaining() : null;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { 
          width: cardWidth,
          flex: cardWidth ? undefined : 1, // Use flex: 1 for mobile grid
          backgroundColor: theme.backgroundDefault,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        {item.images && item.images.length > 0 ? (
          <Image
            source={{ uri: getImageUrl(item.images[0]) }}
            style={[styles.image, { aspectRatio: 4/3 }]}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage, { backgroundColor: theme.backgroundSecondary, aspectRatio: 4/3 }]}>
            <ImageIcon size={32} color={theme.textTertiary} />
          </View>
        )}
        {item.isPremium ? (
          <View style={styles.premiumBadge}>
            <StarIcon size={10} color={Colors.light.accent} />
            <ThemedText style={styles.premiumText}>PREMIUM</ThemedText>
          </View>
        ) : null}
      </View>
      <View style={styles.content}>
        <ThemedText type="body" style={styles.title} numberOfLines={1}>
          {item.title}
        </ThemedText>
        <View style={styles.locationRow}>
          <MapPinIcon size={12} color={theme.textTertiary} />
          <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 4 }} numberOfLines={1}>
            {item.city}
            {item.distance != null ? ` (${item.distance < 1 ? `${Math.round(item.distance * 1000)} m` : `${item.distance.toFixed(1)} km`})` : ''}
          </ThemedText>
        </View>
        <ThemedText type="body" style={{ color: theme.primary, fontWeight: '700', marginTop: Spacing.xs }}>
          {item.pricePerDay} RSD<ThemedText type="small" style={{ color: theme.textSecondary, fontWeight: '400' }}>/dan</ThemedText>
        </ThemedText>
        {daysRemaining !== null ? (
          <View style={[styles.expirationRow, { backgroundColor: daysRemaining <= 7 ? '#FFF3CD' : theme.backgroundSecondary }]}>
            <ClockIcon size={10} color={daysRemaining <= 7 ? '#856404' : theme.textSecondary} />
            <ThemedText type="small" style={{ color: daysRemaining <= 7 ? '#856404' : theme.textSecondary, marginLeft: 4 }}>
              {daysRemaining === 0 ? 'Ističe danas' : `Ističe za ${daysRemaining} dana`}
            </ThemedText>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumBadge: {
    position: 'absolute',
    top: Spacing.xs,
    left: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  premiumText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.light.accent,
    letterSpacing: 0.5,
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
  expirationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.xs,
  },
});
