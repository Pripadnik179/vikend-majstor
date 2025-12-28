import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { ChevronUpIcon, ChevronDownIcon, ChevronRightIcon } from '@/components/icons/TabBarIcons';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout } from '@/hooks/useWebLayout';
import { Spacing, BorderRadius, CATEGORY_COLORS, CATEGORY_ICONS } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import { getApiUrl } from '@/lib/query-client';

const isWeb = Platform.OS === 'web';

interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories: Subcategory[];
}

interface CategoryCounts {
  [key: string]: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function CategoryCard({ 
  category, 
  isExpanded, 
  onPress,
  onSubcategoryPress,
  onViewAllPress,
  itemCount,
  theme 
}: {
  category: Category;
  isExpanded: boolean;
  onPress: () => void;
  onSubcategoryPress: (category: string, subcategory: string) => void;
  onViewAllPress: (category: string) => void;
  itemCount: number;
  theme: any;
}) {
  const scale = useSharedValue(1);
  const colors = CATEGORY_COLORS[category.name] || { primary: theme.primary, secondary: theme.primaryLight, accent: theme.primaryPressed };
  const iconName = CATEGORY_ICONS[category.name] || 'folder';
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, []);

  return (
    <View style={styles.categoryWrapper}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          animatedStyle,
          styles.categoryCard,
          { 
            backgroundColor: isExpanded ? colors.secondary : theme.backgroundDefault,
            borderColor: isExpanded ? colors.primary : theme.border,
            borderWidth: isExpanded ? 2 : 1,
          },
        ]}
        accessibilityLabel={category.name}
        accessibilityHint={`${itemCount} alata dostupno. Dodirnite za prikaz podkategorija`}
      >
        <View style={[styles.iconContainer, { backgroundColor: colors.secondary }]}>
          <DynamicIcon name={iconName} size={24} color={colors.primary} />
        </View>
        <View style={styles.categoryInfo}>
          <ThemedText type="h4">{category.name}</ThemedText>
          <View style={styles.categoryMeta}>
            <View style={[styles.countBadge, { backgroundColor: colors.secondary }]}>
              <ThemedText type="small" style={[styles.countText, { color: colors.primary }]}>
                {itemCount} alata
              </ThemedText>
            </View>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {category.subcategories.length} podkategorija
            </ThemedText>
          </View>
        </View>
        {isExpanded ? (
          <ChevronUpIcon size={22} color={colors.primary} />
        ) : (
          <ChevronDownIcon size={22} color={theme.textSecondary} />
        )}
      </AnimatedPressable>

      {isExpanded && (
        <View style={[styles.subcategories, { backgroundColor: theme.backgroundDefault, borderColor: colors.primary }]}>
          {category.subcategories.map((sub, index) => (
            <Pressable
              key={sub.id}
              style={({ pressed }) => [
                styles.subcategoryItem,
                { backgroundColor: pressed ? colors.secondary : 'transparent' },
                index < category.subcategories.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
              ]}
              onPress={() => onSubcategoryPress(category.name, sub.name)}
            >
              <View style={styles.subcategoryContent}>
                <ThemedText type="body">{sub.name}</ThemedText>
              </View>
              <ChevronRightIcon size={18} color={theme.textTertiary} />
            </Pressable>
          ))}
          <Pressable
            style={({ pressed }) => [
              styles.viewAllButton, 
              { backgroundColor: pressed ? colors.accent : colors.primary }
            ]}
            onPress={() => onViewAllPress(category.name)}
          >
            <ThemedText type="body" style={styles.viewAllText}>
              Prikaži sve iz {category.name}
            </ThemedText>
            <ChevronRightIcon size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { isDesktop, contentPaddingTop, contentPaddingBottom, horizontalPadding, gridMaxWidth } = useWebLayout();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: categoryCounts = {}, isLoading: isLoadingCounts } = useQuery<CategoryCounts>({
    queryKey: ['/api/items/category-counts'],
    queryFn: async () => {
      const baseUrl = getApiUrl();
      const url = new URL('/api/items/category-counts', baseUrl);
      const response = await fetch(url.toString());
      if (!response.ok) return {};
      return response.json();
    },
    staleTime: 60000,
  });

  const handleCategoryPress = useCallback((categoryId: string) => {
    setExpandedCategory(prev => prev === categoryId ? null : categoryId);
  }, []);

  const handleSubcategoryPress = useCallback((category: string, subcategory: string) => {
    navigation.navigate('Search', { category, subcategory });
  }, [navigation]);

  const handleViewAllPress = useCallback((category: string) => {
    navigation.navigate('Search', { category });
  }, [navigation]);

  const paddingTop = isDesktop ? contentPaddingTop + Spacing.md : insets.top;
  const paddingBottom = isDesktop ? contentPaddingBottom + Spacing.xl : insets.bottom + 100;

  const contentStyle = isDesktop ? {
    maxWidth: gridMaxWidth,
    width: '100%' as const,
    alignSelf: 'center' as const,
  } : undefined;

  const totalItems = useMemo(() => {
    return Object.values(categoryCounts).reduce((a, b) => a + b, 0);
  }, [categoryCounts]);

  const isLoading = isLoadingCategories || isLoadingCounts;

  return (
    <ThemedView style={[styles.container, { paddingTop }]}>
      <ScrollView 
        style={styles.list}
        contentContainerStyle={[
          styles.listContent, 
          { 
            paddingBottom,
            paddingHorizontal: horizontalPadding,
          },
          isDesktop && { alignItems: 'center' }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={contentStyle}>
          <View style={styles.header}>
            <ThemedText type="h2">Kategorije</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 4 }}>
              Pronađi alat po kategoriji
            </ThemedText>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
                Učitavanje kategorija...
              </ThemedText>
            </View>
          ) : (
            <>
              {categories.map((category) => {
                const isExpanded = expandedCategory === category.id;
                const itemCount = categoryCounts[category.name] || 0;

                return (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    isExpanded={isExpanded}
                    onPress={() => handleCategoryPress(category.id)}
                    onSubcategoryPress={handleSubcategoryPress}
                    onViewAllPress={handleViewAllPress}
                    itemCount={itemCount}
                    theme={theme}
                  />
                );
              })}
              
              <View style={[styles.statsFooter, { backgroundColor: theme.backgroundSecondary }]}>
                <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
                  Ukupno {totalItems} alata dostupno za iznajmljivanje
                </ThemedText>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: Spacing.md,
  },
  loadingContainer: {
    paddingVertical: Spacing.xl * 2,
    alignItems: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  categoryWrapper: {
    marginBottom: Spacing.md,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      },
    }),
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  countBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  countText: {
    fontWeight: '600',
  },
  subcategories: {
    marginTop: -Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    overflow: 'hidden',
  },
  subcategoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
      },
    }),
  },
  subcategoryContent: {
    flex: 1,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  viewAllText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsFooter: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
});
