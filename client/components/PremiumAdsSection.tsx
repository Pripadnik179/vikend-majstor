import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Text, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout } from '@/hooks/useWebLayout';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { CrownIcon, ChevronRightIcon, BoxIcon, StarIcon, MapPinIcon } from '@/components/icons/TabBarIcons';
import type { RootStackParamList } from '@/navigation/types';
import type { Item } from '@shared/schema';

const GOLD_COLOR = '#FFD700';

interface PremiumAdsSectionProps {
  items: Item[];
  onSeeAll?: () => void;
}

const AnimatedCard = Animated.createAnimatedComponent(View);

function PremiumItemCard({ item, index, cardWidth }: { item: Item; index: number; cardWidth?: number }) {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    navigation.navigate('ItemDetail', { itemId: item.id });
  };

  const cardStyle = cardWidth ? { width: cardWidth, marginRight: 0 } : styles.itemCard;

  return (
    <AnimatedCard style={animatedStyle}>
      <Card
        style={StyleSheet.flatten([cardStyle, styles.itemCardBase, { borderColor: GOLD_COLOR + '40' }])}
        onPress={handlePress}
      >
        <View style={styles.goldBadge}>
          <View style={styles.goldBadgeInner}>
            <CrownIcon size={12} color={GOLD_COLOR} />
            <Text style={styles.goldBadgeText}>Premium</Text>
          </View>
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
        
        <View style={[styles.goldStripe, { backgroundColor: GOLD_COLOR }]} />
        
        <View style={styles.itemInfo}>
          <ThemedText type="body" numberOfLines={1} style={styles.itemTitle}>
            {item.title}
          </ThemedText>
          
          <View style={styles.locationRow}>
            <MapPinIcon size={12} color={theme.textTertiary} />
            <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 4 }}>
              {item.city}
            </ThemedText>
          </View>
          
          {item.rating && parseFloat(item.rating) > 0 ? (
            <View style={styles.ratingRow}>
              <StarIcon size={12} color={Colors.light.primary} />
              <ThemedText type="small" style={{ color: theme.text, marginLeft: 2 }}>
                {parseFloat(item.rating).toFixed(1)}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 4 }}>
                ({item.totalRatings || 0})
              </ThemedText>
            </View>
          ) : null}
          
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
    </AnimatedCard>
  );
}

export function PremiumAdsSection({ items, onSeeAll }: PremiumAdsSectionProps) {
  const { theme } = useTheme();
  const { isDesktop, numColumns, gridMaxWidth, gridGap, sectionPadding, cardWidth } = useWebLayout();

  if (!items || items.length === 0) {
    return null;
  }

  const premiumItems = items.slice(0, isDesktop ? numColumns : 5);

  const renderDesktopGrid = () => (
    <View style={[styles.gridContainer, { maxWidth: gridMaxWidth, gap: gridGap }]}>
      {premiumItems.map((item, index) => (
        <PremiumItemCard key={item.id} item={item} index={index} cardWidth={cardWidth} />
      ))}
    </View>
  );

  const renderMobileScroll = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {premiumItems.map((item, index) => (
        <PremiumItemCard key={item.id} item={item} index={index} />
      ))}
    </ScrollView>
  );

  return (
    <View style={[
      styles.container, 
      isDesktop ? { 
        alignItems: 'center',
        paddingHorizontal: sectionPadding,
      } : undefined
    ]}>
      <View style={[
        styles.sectionWrapper,
        isDesktop ? { maxWidth: gridMaxWidth, width: '100%' } : undefined
      ]}>
        <View style={styles.headerRow}>
          <View style={styles.titleRow}>
            <View style={[styles.iconBadge, { backgroundColor: GOLD_COLOR + '20' }]}>
              <CrownIcon size={18} color={GOLD_COLOR} />
            </View>
            <View>
              <ThemedText type="h3">Premijum oglasi</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Istaknuti alati nasih premium korisnika
              </ThemedText>
            </View>
          </View>
          <Pressable style={styles.seeAllButton} onPress={onSeeAll}>
            <ThemedText type="small" style={{ color: GOLD_COLOR }}>
              Vidi sve
            </ThemedText>
            <ChevronRightIcon size={14} color={GOLD_COLOR} />
          </Pressable>
        </View>

        {isDesktop ? renderDesktopGrid() : renderMobileScroll()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing['2xl'],
  },
  sectionWrapper: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  itemCard: {
    width: 180,
    marginRight: Spacing.md,
  },
  itemCardBase: {
    padding: 0,
    overflow: 'hidden',
    borderWidth: 2,
  },
  goldBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    zIndex: 10,
  },
  goldBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
    gap: 4,
  },
  goldBadgeText: {
    color: GOLD_COLOR,
    fontWeight: '700',
    fontSize: 11,
  },
  goldStripe: {
    height: 3,
    width: '100%',
  },
  itemImage: {
    width: '100%',
    height: 120,
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
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    marginTop: Spacing.xs,
  },
});
