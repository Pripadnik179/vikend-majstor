import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import Animated, { useAnimatedStyle, withSpring, useSharedValue, interpolateColor } from 'react-native-reanimated';
import { ChevronUpIcon, ChevronDownIcon, ChevronRightIcon, BoxIcon, ToolIcon } from '@/components/icons/TabBarIcons';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout } from '@/hooks/useWebLayout';
import { Spacing, BorderRadius, CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_SEO_NAMES } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import { CATEGORIES } from '@shared/schema';
import { getApiUrl } from '@/lib/query-client';

const isWeb = Platform.OS === 'web';

type TabType = 'project' | 'toolType';

interface CategoryCounts {
  [key: string]: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function CategoryCard({ 
  categoryKey, 
  category, 
  isExpanded, 
  onPress,
  onSubcategoryPress,
  onViewAllPress,
  itemCount,
  theme 
}: {
  categoryKey: string;
  category: { name: string; subcategories: string[] };
  isExpanded: boolean;
  onPress: () => void;
  onSubcategoryPress: (category: string, subcategory: string) => void;
  onViewAllPress: (category: string) => void;
  itemCount: number;
  theme: any;
}) {
  const scale = useSharedValue(1);
  const colors = CATEGORY_COLORS[categoryKey] || { primary: theme.primary, secondary: theme.primaryLight, accent: theme.primaryPressed };
  const iconName = CATEGORY_ICONS[categoryKey] || 'folder';
  const seoName = CATEGORY_SEO_NAMES[categoryKey] || category.name;
  
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
        accessibilityLabel={seoName}
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
              key={index}
              style={({ pressed }) => [
                styles.subcategoryItem,
                { backgroundColor: pressed ? colors.secondary : 'transparent' },
                index < category.subcategories.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
              ]}
              onPress={() => onSubcategoryPress(category.name, sub)}
            >
              <View style={styles.subcategoryContent}>
                <ThemedText type="body">{sub}</ThemedText>
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
  const { isDesktop, contentPaddingTop, contentPaddingBottom } = useWebLayout();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<TabType>('project');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

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

  const categories = activeTab === 'project' ? CATEGORIES.byProject : CATEGORIES.byToolType;

  const handleCategoryPress = useCallback((categoryKey: string) => {
    setExpandedCategory(prev => prev === categoryKey ? null : categoryKey);
  }, []);

  const handleSubcategoryPress = useCallback((category: string, subcategory: string) => {
    navigation.navigate('Search', { category, subcategory });
  }, [navigation]);

  const handleViewAllPress = useCallback((category: string) => {
    navigation.navigate('Search', { category });
  }, [navigation]);

  const paddingTop = isDesktop ? contentPaddingTop + Spacing.md : insets.top;
  const paddingBottom = isDesktop ? contentPaddingBottom + Spacing.xl : insets.bottom + 100;

  return (
    <ThemedView style={[styles.container, { paddingTop }]}>
      <View style={styles.header}>
        <ThemedText type="h2">Kategorije</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 4 }}>
          Pronađi alat po delatnosti ili vrsti
        </ThemedText>
      </View>

      <View style={styles.tabs}>
        <Pressable
          style={({ pressed }) => [
            styles.tab,
            activeTab === 'project' && styles.activeTab,
            activeTab === 'project' && { backgroundColor: theme.primary },
            { 
              borderColor: theme.primary,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
          onPress={() => setActiveTab('project')}
        >
          <DynamicIcon 
            name="briefcase" 
            size={16} 
            color={activeTab === 'project' ? '#FFFFFF' : theme.primary} 
          />
          <ThemedText 
            type="body" 
            style={[
              styles.tabText,
              { color: activeTab === 'project' ? '#FFFFFF' : theme.primary }
            ]}
          >
            Po delatnosti
          </ThemedText>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.tab,
            activeTab === 'toolType' && styles.activeTab,
            activeTab === 'toolType' && { backgroundColor: theme.primary },
            { 
              borderColor: theme.primary,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
          onPress={() => setActiveTab('toolType')}
        >
          <ToolIcon 
            size={16} 
            color={activeTab === 'toolType' ? '#FFFFFF' : theme.primary} 
          />
          <ThemedText 
            type="body" 
            style={[
              styles.tabText,
              { color: activeTab === 'toolType' ? '#FFFFFF' : theme.primary }
            ]}
          >
            Po vrsti alata
          </ThemedText>
        </Pressable>
      </View>

      {isLoadingCounts && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.primary} />
        </View>
      )}

      <ScrollView 
        style={styles.list}
        contentContainerStyle={[styles.listContent, { paddingBottom }]}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(categories).map(([key, category]) => {
          const isExpanded = expandedCategory === key;
          const itemCount = categoryCounts[category.name] || 0;

          return (
            <CategoryCard
              key={key}
              categoryKey={key}
              category={category}
              isExpanded={isExpanded}
              onPress={() => handleCategoryPress(key)}
              onSubcategoryPress={handleSubcategoryPress}
              onViewAllPress={handleViewAllPress}
              itemCount={itemCount}
              theme={theme}
            />
          );
        })}
        
        <View style={[styles.statsFooter, { backgroundColor: theme.backgroundSecondary }]}>
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
            Ukupno {Object.values(categoryCounts).reduce((a, b) => a + b, 0)} alata dostupno za iznajmljivanje
          </ThemedText>
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  loadingContainer: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
  },
  activeTab: {},
  tabText: {
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
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
