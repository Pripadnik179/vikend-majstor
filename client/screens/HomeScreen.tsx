import React, { useState, useCallback, useMemo } from 'react';
import { View, FlatList, StyleSheet, TextInput, Pressable, RefreshControl, ActivityIndicator, Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { SearchIcon, XIcon, SlidersIcon, BoxIcon } from '@/components/icons/TabBarIcons';
import { ItemCard } from '@/components/ItemCard';
import { FilterModal, FilterState } from '@/components/FilterModal';
import { PromoBanner } from '@/components/PromoBanner';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout } from '@/hooks/useWebLayout';
import { Spacing, BorderRadius } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import type { Item } from '@shared/schema';

interface HomeData {
  premiumItems: Item[];
  remainingEarlyAdopterSlots: number;
}

const DEFAULT_FILTERS: FilterState = {
  minPrice: null,
  maxPrice: null,
  minRating: null,
  maxDeposit: null,
  city: '',
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isDesktop, contentPaddingTop, contentPaddingBottom, numColumns, width } = useWebLayout();
  
  const tabBarHeight = isDesktop ? 0 : (Platform.OS === 'web' ? 0 : 80);
  const effectiveNumColumns = Math.max(1, numColumns);

  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const handleSearchSubmit = useCallback(() => {
    setAppliedSearch(searchInput);
  }, [searchInput]);

  const handleClearSearch = useCallback(() => {
    setSearchInput('');
    setAppliedSearch('');
  }, []);

  const { data: items = [], isLoading, refetch } = useQuery<Item[]>({
    queryKey: ['/api/items'],
  });

  const { data: homeData } = useQuery<HomeData>({
    queryKey: ['/api/home'],
  });

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.minPrice !== null) count++;
    if (filters.maxPrice !== null) count++;
    if (filters.minRating !== null) count++;
    if (filters.maxDeposit !== null) count++;
    if (filters.city) count++;
    return count;
  }, [filters]);

  const filteredItems = useMemo(() => {
    const filtered = items.filter((item) => {
      const matchesSearch = !appliedSearch || 
        item.title.toLowerCase().includes(appliedSearch.toLowerCase()) ||
        item.city.toLowerCase().includes(appliedSearch.toLowerCase());
      const matchesMinPrice = filters.minPrice === null || item.pricePerDay >= filters.minPrice;
      const matchesMaxPrice = filters.maxPrice === null || item.pricePerDay <= filters.maxPrice;
      const matchesRating = filters.minRating === null || parseFloat(item.rating || '0') >= filters.minRating;
      const matchesDeposit = filters.maxDeposit === null || item.deposit <= filters.maxDeposit;
      const matchesCity = !filters.city || item.city.toLowerCase().includes(filters.city.toLowerCase());
      return matchesSearch && matchesMinPrice && matchesMaxPrice && matchesRating && matchesDeposit && matchesCity;
    });
    
    // Sort: 1) Featured items first, 2) Premium users' items, 3) by creation date
    return filtered.sort((a, b) => {
      const aItem = a as any;
      const bItem = b as any;
      // Featured items come first
      if (aItem.isFeatured && !bItem.isFeatured) return -1;
      if (!aItem.isFeatured && bItem.isFeatured) return 1;
      // Then premium users' items
      if (aItem.isPremium && !bItem.isPremium) return -1;
      if (!aItem.isPremium && bItem.isPremium) return 1;
      // Then sort by createdAt descending
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [items, appliedSearch, filters]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderItem = ({ item }: { item: Item }) => (
    <ItemCard
      item={item}
      onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
    />
  );

  const listHeader = useMemo(() => (
    <View style={styles.header}>
      <PromoBanner
        premiumItems={homeData?.premiumItems || []}
        earlyAdopterSlotsRemaining={homeData?.remainingEarlyAdopterSlots || 0}
      />
    </View>
  ), [homeData?.premiumItems, homeData?.remainingEarlyAdopterSlots]);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <BoxIcon size={64} color={theme.textTertiary} />
      <ThemedText type="h4" style={[styles.emptyTitle, { color: theme.textSecondary }]}>
        Nema dostupnih stvari
      </ThemedText>
      <ThemedText type="body" style={[styles.emptyText, { color: theme.textTertiary }]}>
        {appliedSearch 
          ? 'Pokušaj sa drugim filterima'
          : 'Budi prvi koji će dodati stvar'}
      </ThemedText>
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const paddingTop = isDesktop 
    ? contentPaddingTop + Spacing.md 
    : headerHeight + Spacing.md;
  
  const paddingBottom = isDesktop 
    ? contentPaddingBottom + Spacing.xl 
    : tabBarHeight + Spacing.fabSize + Spacing.xl;

  const horizontalPadding = isDesktop ? Math.max(24, (width - 1400) / 2) : Spacing.lg;

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundRoot }}>
      <View style={[styles.searchRowFixed, { paddingTop, paddingHorizontal: horizontalPadding }]}>
        <View style={[styles.searchContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <Pressable onPress={handleSearchSubmit} hitSlop={8}>
            <SearchIcon size={20} color={theme.textTertiary} />
          </Pressable>
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Pretraži stvari..."
            placeholderTextColor={theme.textTertiary}
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            blurOnSubmit={false}
          />
          {searchInput ? (
            <Pressable onPress={handleClearSearch} hitSlop={8}>
              <XIcon size={20} color={theme.textTertiary} />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          style={[
            styles.filterButton,
            {
              backgroundColor: activeFilterCount > 0 ? theme.primary : theme.backgroundDefault,
              borderColor: activeFilterCount > 0 ? theme.primary : theme.border,
            },
          ]}
          onPress={() => setShowFilters(true)}
        >
          <SlidersIcon 
            size={20} 
            color={activeFilterCount > 0 ? '#FFFFFF' : theme.text} 
          />
          {activeFilterCount > 0 ? (
            <View style={[styles.filterBadge, { backgroundColor: theme.accent }]}>
              <ThemedText type="small" style={styles.filterBadgeText}>
                {activeFilterCount}
              </ThemedText>
            </View>
          ) : null}
        </Pressable>
      </View>
      <FlatList
        key={`list-${effectiveNumColumns}`}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom,
          paddingHorizontal: horizontalPadding,
          flexGrow: 1,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={effectiveNumColumns}
        columnWrapperStyle={effectiveNumColumns > 1 ? styles.row : undefined}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
      />
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApply={setFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.md,
  },
  searchRowFixed: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: Spacing.sm,
  },
  filterButton: {
    width: Spacing.inputHeight,
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyTitle: {
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
