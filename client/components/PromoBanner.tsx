import React from 'react';
import { View, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import type { Item } from '@shared/schema';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - Spacing.lg * 2;

interface PromoBannerProps {
  premiumItems: Item[];
  earlyAdopterSlotsRemaining: number;
}

export function PromoBanner({ premiumItems, earlyAdopterSlotsRemaining }: PromoBannerProps) {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleEarlyAdopterPress = () => {
    navigation.navigate('Subscription');
  };

  const handlePremiumItemPress = (itemId: string) => {
    navigation.navigate('ItemDetail', { itemId });
  };

  const hasContent = earlyAdopterSlotsRemaining > 0 || premiumItems.length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={BANNER_WIDTH + Spacing.md}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
      >
        {earlyAdopterSlotsRemaining > 0 ? (
          <Pressable onPress={handleEarlyAdopterPress}>
            <Card style={[styles.bannerCard, { backgroundColor: Colors.primary }]}>
              <View style={styles.earlyAdopterContent}>
                <View style={styles.earlyAdopterIcon}>
                  <Feather name="gift" size={32} color="#FFFFFF" />
                </View>
                <View style={styles.earlyAdopterText}>
                  <ThemedText type="h4" style={styles.bannerTitle}>
                    Program ranih usvojilaca
                  </ThemedText>
                  <ThemedText type="body" style={styles.bannerSubtitle}>
                    Ostalo jos {earlyAdopterSlotsRemaining} besplatnih mesta
                  </ThemedText>
                  <View style={styles.bannerCta}>
                    <ThemedText type="caption" style={styles.bannerCtaText}>
                      Saznaj vise
                    </ThemedText>
                    <Feather name="arrow-right" size={14} color="#FFFFFF" />
                  </View>
                </View>
              </View>
            </Card>
          </Pressable>
        ) : null}

        {premiumItems.slice(0, 5).map((item) => (
          <Pressable
            key={item.id}
            onPress={() => handlePremiumItemPress(item.id)}
          >
            <Card style={[styles.bannerCard, styles.premiumCard]}>
              <View style={styles.premiumBadge}>
                <Feather name="star" size={12} color="#FFFFFF" />
                <ThemedText type="caption" style={styles.premiumBadgeText}>
                  Premium
                </ThemedText>
              </View>
              {item.images && item.images.length > 0 ? (
                <Image
                  source={{ uri: item.images[0] }}
                  style={styles.premiumImage}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.premiumImage, styles.premiumPlaceholder, { backgroundColor: theme.backgroundElevated }]}>
                  <Feather name="package" size={40} color={theme.textTertiary} />
                </View>
              )}
              <View style={styles.premiumInfo}>
                <ThemedText type="bodyBold" numberOfLines={1} style={{ color: theme.text }}>
                  {item.title}
                </ThemedText>
                <View style={styles.premiumPriceRow}>
                  <ThemedText type="h4" style={{ color: Colors.primary }}>
                    {item.pricePerDay} RSD
                  </ThemedText>
                  <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                    /dan
                  </ThemedText>
                </View>
              </View>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  scrollContent: {
    paddingRight: Spacing.lg,
  },
  bannerCard: {
    width: BANNER_WIDTH,
    marginRight: Spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  earlyAdopterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  earlyAdopterIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  earlyAdopterText: {
    flex: 1,
  },
  bannerTitle: {
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    marginBottom: Spacing.sm,
  },
  bannerCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  bannerCtaText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  premiumCard: {
    backgroundColor: 'transparent',
  },
  premiumBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    zIndex: 1,
  },
  premiumBadgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  premiumImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: BorderRadius.md,
    borderTopRightRadius: BorderRadius.md,
  },
  premiumPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumInfo: {
    padding: Spacing.md,
  },
  premiumPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: Spacing.xs,
  },
});
