import React from 'react';
import { View, StyleSheet, Pressable, ScrollView, Dimensions, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
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
            <Card style={StyleSheet.flatten([styles.bannerCard, { backgroundColor: theme.primary }])}>
              <View style={styles.earlyAdopterContent}>
                <View style={[styles.earlyAdopterIcon, { backgroundColor: 'rgba(0,0,0,0.15)' }]}>
                  <Feather name="gift" size={32} color="#1A1A1A" />
                </View>
                <View style={styles.earlyAdopterText}>
                  <ThemedText type="h4" style={[styles.bannerTitle, { color: '#1A1A1A' }]}>
                    Program ranih usvojilaca
                  </ThemedText>
                  <ThemedText type="body" style={[styles.bannerSubtitle, { color: 'rgba(0,0,0,0.7)' }]}>
                    Ostalo jos {earlyAdopterSlotsRemaining} besplatnih mesta
                  </ThemedText>
                  <View style={styles.bannerCta}>
                    <Text style={[styles.bannerCtaText, { color: '#1A1A1A' }]}>
                      Saznaj vise
                    </Text>
                    <Feather name="arrow-right" size={14} color="#1A1A1A" />
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
            <Card style={StyleSheet.flatten([styles.bannerCard, styles.premiumCard])}>
              <View style={[styles.premiumBadge, { backgroundColor: theme.accent }]}>
                <Feather name="star" size={12} color="#FFFFFF" />
                <Text style={styles.premiumBadgeText}>
                  Premium
                </Text>
              </View>
              {item.images && item.images.length > 0 ? (
                <Image
                  source={{ uri: item.images[0] }}
                  style={styles.premiumImage}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.premiumImage, styles.premiumPlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
                  <Feather name="package" size={40} color={theme.textTertiary} />
                </View>
              )}
              <View style={styles.premiumInfo}>
                <Text style={[styles.premiumTitle, { color: theme.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <View style={styles.premiumPriceRow}>
                  <ThemedText type="h4" style={{ color: theme.primary }}>
                    {item.pricePerDay} RSD
                  </ThemedText>
                  <Text style={[styles.perDay, { color: theme.textSecondary }]}>
                    /dan
                  </Text>
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
    fontSize: 12,
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
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    zIndex: 1,
  },
  premiumBadgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
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
  premiumTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  premiumPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: Spacing.xs,
  },
  perDay: {
    fontSize: 12,
  },
});
