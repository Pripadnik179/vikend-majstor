import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import { SearchBar } from '@/components/SearchBar';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import type { Item } from '@shared/schema';
import { CATEGORIES, POWER_SOURCES } from '@shared/schema';
import { Image } from 'expo-image';
import { getApiUrl } from '@/lib/query-client';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const route = useRoute<RouteProp<RootStackParamList, 'Search'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const initialCategory = route.params?.category || '';
  const initialSubcategory = route.params?.subcategory || '';
  const initialQuery = route.params?.query || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState(initialSubcategory);
  const [selectedToolType, setSelectedToolType] = useState(route.params?.toolType || '');
  const [selectedPowerSource, setSelectedPowerSource] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const buildApiUrl = () => {
    const baseUrl = getApiUrl();
    const url = new URL('/api/items', baseUrl);
    if (selectedCategory) url.searchParams.append('category', selectedCategory);
    if (selectedSubcategory) url.searchParams.append('subCategory', selectedSubcategory);
    if (selectedToolType) url.searchParams.append('toolType', selectedToolType);
    if (selectedPowerSource) url.searchParams.append('powerSource', selectedPowerSource);
    if (searchQuery) url.searchParams.append('search', searchQuery);
    return url.toString();
  };

  const { data: items = [], isLoading } = useQuery<Item[]>({
    queryKey: ['/api/items', { 
      category: selectedCategory, 
      subCategory: selectedSubcategory,
      toolType: selectedToolType,
      powerSource: selectedPowerSource,
      search: searchQuery,
    }],
    queryFn: async () => {
      const url = buildApiUrl();
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch items');
      return response.json();
    },
    staleTime: 1000,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });

  const allCategories = useMemo(() => {
    const cats: string[] = [];
    Object.values(CATEGORIES.byProject).forEach(c => {
      cats.push(c.name);
    });
    Object.values(CATEGORIES.byToolType).forEach(c => {
      cats.push(c.name);
    });
    return [...new Set(cats)];
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedToolType('');
    setSelectedPowerSource('');
    setSearchQuery('');
  }, []);

  const activeFilterCount = [selectedCategory, selectedSubcategory, selectedToolType, selectedPowerSource]
    .filter(Boolean).length;

  const renderItem = ({ item }: { item: Item }) => (
    <Pressable
      onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
    >
      <Card style={StyleSheet.flatten([styles.itemCard, item.isFeatured && { borderColor: '#F97316', borderWidth: 2 }])}>
        <View style={styles.itemContent}>
          <View style={{ position: 'relative' }}>
            {item.images && item.images.length > 0 ? (
              <Image
                source={{ uri: item.images[0] }}
                style={styles.itemImage}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.itemImage, styles.placeholderImage, { backgroundColor: theme.backgroundDefault }]}>
                <Feather name="image" size={24} color={theme.textTertiary} />
              </View>
            )}
            {item.isFeatured ? (
              <View style={styles.featuredBadge}>
                <Feather name="star" size={10} color="#FFFFFF" />
              </View>
            ) : null}
          </View>
          <View style={styles.itemInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
              <ThemedText type="h4" numberOfLines={1} style={{ flex: 1 }}>{item.title}</ThemedText>
              {item.isFeatured ? (
                <View style={[styles.featuredLabel, { backgroundColor: '#F97316' }]}>
                  <ThemedText type="small" style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '600' }}>
                    Premium
                  </ThemedText>
                </View>
              ) : null}
            </View>
            <ThemedText type="small" style={{ color: theme.textSecondary }} numberOfLines={1}>
              {item.city}{item.district ? `, ${item.district}` : ''}
            </ThemedText>
            <View style={styles.priceRow}>
              <ThemedText type="body" style={{ color: theme.primary, fontWeight: '700' }}>
                {item.pricePerDay} RSD
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>/dan</ThemedText>
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.searchHeader, { paddingTop: Spacing.md }]}>
        <SearchBar 
          value={searchQuery}
          onSearch={handleSearch}
          placeholder="Pretražite alate..."
          debounceMs={300}
        />
        <Pressable 
          style={[styles.filterButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Feather name="sliders" size={20} color={theme.primary} />
          {activeFilterCount > 0 ? (
            <View style={[styles.filterBadge, { backgroundColor: theme.primary }]}>
              <ThemedText type="small" style={{ color: '#FFFFFF', fontSize: 10 }}>
                {activeFilterCount}
              </ThemedText>
            </View>
          ) : null}
        </Pressable>
      </View>

      {showFilters && (
        <View style={[styles.filtersContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <View style={styles.filterRow}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>Kategorija</ThemedText>
            <FlatList
              horizontal
              data={['', ...allCategories]}
              keyExtractor={(item) => item || 'all'}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item: cat }) => (
                <Pressable
                  style={[
                    styles.filterChip,
                    { 
                      backgroundColor: selectedCategory === cat ? theme.primary : theme.backgroundRoot,
                      borderColor: selectedCategory === cat ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <ThemedText 
                    type="small" 
                    style={{ color: selectedCategory === cat ? '#FFFFFF' : theme.text }}
                  >
                    {cat || 'Sve'}
                  </ThemedText>
                </Pressable>
              )}
            />
          </View>

          <View style={styles.filterRow}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>Napajanje</ThemedText>
            <FlatList
              horizontal
              data={['', ...POWER_SOURCES]}
              keyExtractor={(item) => item || 'all'}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item: ps }) => (
                <Pressable
                  style={[
                    styles.filterChip,
                    { 
                      backgroundColor: selectedPowerSource === ps ? theme.primary : theme.backgroundRoot,
                      borderColor: selectedPowerSource === ps ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setSelectedPowerSource(ps)}
                >
                  <ThemedText 
                    type="small" 
                    style={{ color: selectedPowerSource === ps ? '#FFFFFF' : theme.text }}
                  >
                    {ps || 'Sve'}
                  </ThemedText>
                </Pressable>
              )}
            />
          </View>

          {activeFilterCount > 0 && (
            <Pressable style={styles.clearButton} onPress={clearFilters}>
              <Feather name="x-circle" size={16} color={theme.primary} />
              <ThemedText type="small" style={{ color: theme.primary }}>Očisti filtere</ThemedText>
            </Pressable>
          )}
        </View>
      )}

      {(selectedCategory || selectedSubcategory) && (
        <View style={styles.breadcrumb}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Pretražujete: 
          </ThemedText>
          <ThemedText type="body" style={{ fontWeight: '600' }}>
            {selectedSubcategory || selectedCategory}
          </ThemedText>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + Spacing.xl }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="search" size={48} color={theme.textTertiary} />
              <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
                Nema rezultata za ovu pretragu
              </ThemedText>
            </View>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  filterRow: {
    gap: Spacing.xs,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.xs,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    alignSelf: 'flex-start',
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  itemCard: {
    marginBottom: Spacing.md,
  },
  itemContent: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.sm,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    marginTop: Spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  featuredBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredLabel: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
});
