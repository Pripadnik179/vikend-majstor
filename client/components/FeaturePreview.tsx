import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { StarIcon, MapPinIcon, ToolIcon } from '@/components/icons/TabBarIcons';
import { getApiUrl } from '@/lib/query-client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.65;

interface PreviewItem {
  id: string;
  title: string;
  description: string;
  pricePerDay: number;
  images: string[];
  city?: string;
  category: string;
}

export function FeaturePreview() {
  const { theme } = useTheme();
  const [items, setItems] = useState<PreviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const url = new URL('/api/items?hasImages=true', getApiUrl());
        const response = await fetch(url.toString());
        if (response.ok) {
          const data = await response.json();
          setItems(data.slice(0, 6));
        }
      } catch (error) {
        console.error('Error fetching preview items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={theme.primary} />
      </View>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ToolIcon size={20} color={Colors.light.primary} />
        <ThemedText type="h4" style={styles.title}>
          Popularni alati u ponudi
        </ThemedText>
      </View>
      <ThemedText type="small" style={[styles.subtitle, { color: theme.textSecondary }]}>
        Registruj se da bi video sve detalje i iznajmio
      </ThemedText>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={CARD_WIDTH + Spacing.md}
        decelerationRate="fast"
      >
        {items.map((item) => (
          <View 
            key={item.id} 
            style={[
              styles.card, 
              { 
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.border,
              }
            ]}
          >
            {item.images && item.images[0] ? (
              <Image
                source={{ uri: item.images[0] }}
                style={styles.cardImage}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.cardImage, styles.placeholderImage, { backgroundColor: theme.backgroundSecondary }]}>
                <ToolIcon size={32} color={theme.textTertiary} />
              </View>
            )}
            <View style={styles.cardContent}>
              <ThemedText type="body" style={styles.cardTitle} numberOfLines={1}>
                {item.title}
              </ThemedText>
              <View style={styles.cardMeta}>
                {item.city ? (
                  <View style={styles.metaRow}>
                    <MapPinIcon size={12} color={theme.textSecondary} />
                    <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 4 }}>
                      {item.city}
                    </ThemedText>
                  </View>
                ) : null}
              </View>
              <View style={styles.priceRow}>
                <ThemedText type="h4" style={{ color: Colors.light.cta }}>
                  {item.pricePerDay} din
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  /dan
                </ThemedText>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    marginBottom: Spacing.lg,
  },
  scrollContent: {
    paddingRight: Spacing.xl,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginRight: Spacing.md,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 120,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: Spacing.md,
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  cardMeta: {
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
});
