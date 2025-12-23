import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, FlatList, StyleSheet, TextInput, Pressable, RefreshControl, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { SearchIcon, XIcon, SlidersIcon, BoxIcon } from '@/components/icons/TabBarIcons';
import { ItemCard } from '@/components/ItemCard';
import { FilterModal, FilterState } from '@/components/FilterModal';
import { VerificationBanner } from '@/components/VerificationBanner';
import { OnboardingGuide } from '@/components/OnboardingGuide';
import { TrustBadges } from '@/components/TrustBadges';
import { PopularToolsSection } from '@/components/PopularToolsSection';
import { PremiumAdsSection } from '@/components/PremiumAdsSection';
import { FloatingAddButton } from '@/components/FloatingAddButton';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout } from '@/hooks/useWebLayout';
import { Spacing, BorderRadius } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import type { Item } from '@shared/schema';
import { calculateDistance } from '@shared/cityCoordinates';

const isWeb = Platform.OS === 'web';

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
  maxDistance: null,
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isDesktop, contentPaddingTop, contentPaddingBottom, numColumns, width, horizontalPadding } = useWebLayout();
  
  const tabBarHeight = isDesktop ? 0 : (Platform.OS === 'web' ? 0 : 80);
  const effectiveNumColumns = Math.max(1, numColumns);

  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [locationPermission, requestLocationPermission] = Location.useForegroundPermissions();

  useEffect(() => {
    if (isWeb || !locationPermission?.granted) return;
    
    const fetchLocation = async () => {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLat(location.coords.latitude);
        setUserLng(location.coords.longitude);
      } catch (error) {
        console.error('Error getting location:', error);
      }
    };
    fetchLocation();
  }, [locationPermission?.granted]);

  useEffect(() => {
    if (isWeb || !requestLocationPermission) return;
    
    if (filters.maxDistance !== null && locationPermission && !locationPermission.granted) {
      requestLocationPermission();
    }
  }, [filters.maxDistance, locationPermission, requestLocationPermission]);

  const handleSearchSubmit = useCallback(() => {
    setAppliedSearch(searchInput);
  }, [searchInput]);

  const handleClearSearch = useCallback(() => {
    setSearchInput('');
    setAppliedSearch('');
  }, []);

  const handleAddTool = useCallback(() => {
    navigation.navigate('AddItem');
  }, [navigation]);

  const handleBrowse = useCallback(() => {
    navigation.navigate('Search', {});
  }, [navigation]);

  const handleLearnMore = useCallback(() => {
    navigation.navigate('Earnings');
  }, [navigation]);

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
    if (filters.maxDistance !== null) count++;
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
      
      let matchesDistance = true;
      if (filters.maxDistance !== null && userLat !== null && userLng !== null) {
        const itemLat = item.latitude ? parseFloat(item.latitude) : null;
        const itemLng = item.longitude ? parseFloat(item.longitude) : null;
        if (itemLat !== null && itemLng !== null) {
          const distance = calculateDistance(userLat, userLng, itemLat, itemLng);
          matchesDistance = distance <= filters.maxDistance;
        } else {
          matchesDistance = false;
        }
      }
      
      return matchesSearch && matchesMinPrice && matchesMaxPrice && matchesRating && matchesDeposit && matchesCity && matchesDistance;
    });
    
    return filtered.sort((a, b) => {
      const aItem = a as any;
      const bItem = b as any;
      if (aItem.isFeatured && !bItem.isFeatured) return -1;
      if (!aItem.isFeatured && bItem.isFeatured) return 1;
      if (aItem.isPremium && !bItem.isPremium) return -1;
      if (!aItem.isPremium && bItem.isPremium) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [items, appliedSearch, filters, userLat, userLng]);

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
      <VerificationBanner />
      
      <TrustBadges />
      
      <OnboardingGuide
        onAddTool={handleAddTool}
        onBrowse={handleBrowse}
        onLearnMore={handleLearnMore}
      />
      
      <PremiumAdsSection
        items={homeData?.premiumItems || []}
        onSeeAll={handleBrowse}
      />
      
      <PopularToolsSection
        items={items}
        onSeeAll={handleBrowse}
      />
      
      <View style={styles.allToolsHeader}>
        <ThemedText type="h3">Svi alati</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {filteredItems.length} dostupno
        </ThemedText>
      </View>
    </View>
  ), [homeData?.premiumItems, homeData?.remainingEarlyAdopterSlots, items, filteredItems.length, theme.textSecondary, handleAddTool, handleBrowse, handleLearnMore]);

  const renderEmpty = () => {
    let emptyMessage = 'Budi prvi koji ce dodati stvar';
    
    if (filters.maxDistance !== null && userLat === null) {
      emptyMessage = 'Ukljuci GPS lokaciju za pretragu po udaljenosti';
    } else if (filters.maxDistance !== null) {
      emptyMessage = `Nema rezultata u krugu od ${filters.maxDistance} km. Probaj vecu udaljenost.`;
    } else if (appliedSearch || activeFilterCount > 0) {
      emptyMessage = 'Pokusaj sa drugim filterima ili pretragom';
    }
    
    return (
      <View style={styles.emptyContainer}>
        <BoxIcon size={64} color={theme.textTertiary} />
        <ThemedText type="h4" style={[styles.emptyTitle, { color: theme.textSecondary }]}>
          Nema dostupnih stvari
        </ThemedText>
        <ThemedText type="body" style={[styles.emptyText, { color: theme.textTertiary }]}>
          {emptyMessage}
        </ThemedText>
      </View>
    );
  };

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

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundRoot }}>
      <View style={[styles.searchRowFixed, { paddingTop, paddingHorizontal: horizontalPadding }]}>
        <View style={[styles.searchContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <Pressable onPress={handleSearchSubmit} hitSlop={8}>
            <SearchIcon size={20} color={theme.textTertiary} />
          </Pressable>
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Pretrazi stvari..."
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
      
      <FloatingAddButton onPress={handleAddTool} />
      
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
  allToolsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
