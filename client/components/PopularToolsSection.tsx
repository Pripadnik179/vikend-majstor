import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { TrendingUpIcon, ChevronRightIcon, BoxIcon, StarIcon } from '@/components/icons/TabBarIcons';
import type { RootStackParamList } from '@/navigation/types';
import type { Item } from '@shared/schema';

interface PopularToolsSectionProps {
  items: Item[];
  onSeeAll?: () => void;
}

export function PopularToolsSection({ items, onSeeAll }: PopularToolsSectionProps) {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  if (!items || items.length === 0) {
    return null;
  }

  const sortedByPopularity = [...items]
    .filter(item => item.totalRatings && item.totalRatings > 0)
    .sort((a, b) => (b.totalRatings || 0) - (a.totalRatings || 0))
    .slice(0, 5);

  if (sortedByPopularity.length === 0) {
    return null;
  }

  const handleItemPress = (itemId: string) => {
    navigation.navigate('ItemDetail', { itemId });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <View style={[styles.iconBadge, { backgroundColor: Colors.light.cta + '15' }]}>
            <TrendingUpIcon size={18} color={Colors.light.cta} />
          </View>
          <ThemedText type="h3">Najpopularniji alati</ThemedText>
        </View>
        <Pressable style={styles.seeAllButton} onPress={onSeeAll}>
          <ThemedText type="small" style={{ color: theme.primary }}>
            Vidi sve
          </ThemedText>
          <ChevronRightIcon size={14} color={theme.primary} />
        </Pressable>
      </View>
      
      <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.md }}>
        Sortirano po broju iznajmljivanja
      </ThemedText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {sortedByPopularity.map((item, index) => (
          <Card
            key={item.id}
            style={StyleSheet.flatten([styles.itemCard])}
            onPress={() => handleItemPress(item.id)}
          >
            <View style={[styles.rankBadge, { backgroundColor: index < 3 ? Colors.light.cta : theme.textTertiary }]}>
              <ThemedText type="small" style={styles.rankText}>
                #{index + 1}
              </ThemedText>
            </View>
            
            {item.images && item.images.length > 0 ? (
              <Image
                source={{ uri: item.images[0] }}
                style={styles.itemImage}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.itemImage, styles.placeholderImage, { backgroundColor: theme.backgroundSecondary }]}>
                <BoxIcon size={32} color={theme.textTertiary} />
              </View>
            )}
            
            <View style={styles.itemInfo}>
              <ThemedText type="body" numberOfLines={1} style={styles.itemTitle}>
                {item.title}
              </ThemedText>
              
              <View style={styles.statsRow}>
                {item.rating && parseFloat(item.rating) > 0 ? (
                  <View style={styles.ratingBadge}>
                    <StarIcon size={12} color={Colors.light.primary} />
                    <ThemedText type="small" style={{ color: theme.text, marginLeft: 2 }}>
                      {parseFloat(item.rating).toFixed(1)}
                    </ThemedText>
                  </View>
                ) : null}
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {item.totalRatings || 0} iznajmljivanja
                </ThemedText>
              </View>
              
              <View style={styles.priceRow}>
                <ThemedText type="h4" style={{ color: theme.primary }}>
                  {item.pricePerDay} RSD
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  /dan
                </ThemedText>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing['2xl'],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  scrollContent: {
    paddingRight: Spacing.lg,
  },
  itemCard: {
    width: 160,
    marginRight: Spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  rankBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    zIndex: 1,
  },
  rankText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  itemImage: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: BorderRadius.md,
    borderTopRightRadius: BorderRadius.md,
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    padding: Spacing.sm,
  },
  itemTitle: {
    fontWeight: '600',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    marginTop: Spacing.xs,
  },
});
