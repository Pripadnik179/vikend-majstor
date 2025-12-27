import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { SearchIcon, SlidersIcon, ChevronRightIcon } from '@/components/icons/TabBarIcons';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ItemCard } from '@/components/ItemCard';
import { FilterModal, FilterState } from '@/components/FilterModal';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout, MAX_CONTENT_WIDTH } from '@/hooks/useWebLayout';
import { Spacing, BorderRadius } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import type { Item } from '@shared/schema';

const DEFAULT_FILTERS: FilterState = {
  minPrice: null,
  maxPrice: null,
  minRating: null,
  maxDeposit: null,
  city: '',
  maxDistance: null,
};

export default function IznajmiAlatScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { isDesktop } = useWebLayout();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [refreshing, setRefreshing] = useState(false);

  const { data: items = [], isLoading, refetch } = useQuery<Item[]>({
    queryKey: ['/api/items'],
  });

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.minPrice !== null) count++;
    if (filters.maxPrice !== null) count++;
    if (filters.minRating !== null) count++;
    if (filters.city) count++;
    return count;
  }, [filters]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (filters.minPrice !== null && item.pricePerDay < filters.minPrice) return false;
      if (filters.maxPrice !== null && item.pricePerDay > filters.maxPrice) return false;
      if (filters.city && item.city.toLowerCase() !== filters.city.toLowerCase()) return false;
      return true;
    });
  }, [items, filters]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleItemPress = (itemId: string) => {
    navigation.navigate('ItemDetail', { itemId });
  };

  const benefits = [
    { icon: 'map-pin', text: 'Alati u tvojoj blizini' },
    { icon: 'clock', text: 'Rezervisi za par minuta' },
    { icon: 'shield', text: 'Sigurna razmena' },
    { icon: 'percent', text: 'Bez provizije' },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        padding: Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
        alignItems: isDesktop ? 'center' : undefined,
      }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
      }
    >
      <View style={{ width: '100%', maxWidth: MAX_CONTENT_WIDTH }}>
        <Card style={styles.heroCard}>
          <ThemedText type="h2" style={styles.heroTitle}>Iznajmi alat od komsije</ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: 'center', marginBottom: Spacing.lg }}>
            Pronadji alat koji ti treba, rezervisi ga online i preuzmi u svom kraju. Jednostavno, brzo i povoljno.
          </ThemedText>
          
          <View style={styles.benefitsRow}>
            {benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <View style={[styles.benefitIcon, { backgroundColor: theme.primary + '20' }]}>
                  <DynamicIcon name={benefit.icon} size={20} color={theme.primary} />
                </View>
                <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
                  {benefit.text}
                </ThemedText>
              </View>
            ))}
          </View>
        </Card>

        <View style={styles.filterRow}>
          <ThemedText type="h4" style={{ flex: 1 }}>
            {filteredItems.length} alata dostupno
          </ThemedText>
          <Pressable 
            style={[styles.filterButton, { backgroundColor: theme.backgroundSecondary }]}
            onPress={() => setShowFilters(true)}
          >
            <SlidersIcon size={18} color={theme.text} />
            <ThemedText type="body" style={{ marginLeft: Spacing.xs }}>Filteri</ThemedText>
            {activeFilterCount > 0 ? (
              <View style={[styles.filterBadge, { backgroundColor: theme.primary }]}>
                <ThemedText type="small" style={{ color: '#000' }}>{activeFilterCount}</ThemedText>
              </View>
            ) : null}
          </Pressable>
        </View>

        {filteredItems.slice(0, 10).map((item) => (
          <View key={item.id} style={{ marginBottom: Spacing.md }}>
            <ItemCard
              item={item}
              onPress={() => handleItemPress(item.id)}
            />
          </View>
        ))}

        {filteredItems.length > 10 ? (
          <Button onPress={() => navigation.navigate('Search', {})} style={{ marginTop: Spacing.md }}>
            Pogledaj sve alate
          </Button>
        ) : null}

        <Card style={StyleSheet.flatten([styles.ctaCard, { backgroundColor: theme.cta }])}>
          <ThemedText type="h4" style={{ color: '#fff', marginBottom: Spacing.sm }}>
            Rezervisi alat odmah
          </ThemedText>
          <ThemedText type="body" style={{ color: 'rgba(255,255,255,0.9)', marginBottom: Spacing.md }}>
            Izaberi alat iz liste, proveri dostupnost i posalji zahtev za rezervaciju. Vlasnik ce ti odgovoriti u roku od 24 sata.
          </ThemedText>
          <Button onPress={() => navigation.navigate('Search', {})}>
            Pretrazi alate
          </Button>
        </Card>

        <Card style={styles.trustCard}>
          <View style={styles.trustHeader}>
            <DynamicIcon name="shield" size={24} color={theme.success} />
            <ThemedText type="h4" style={{ marginLeft: Spacing.sm }}>
              Sigurno iznajmljivanje
            </ThemedText>
          </View>
          <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
            Svi korisnici su verifikovani putem email-a. Mozete komunicirati direktno kroz aplikaciju pre rezervacije.
          </ThemedText>
        </Card>
      </View>

      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApply={setFilters}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  heroTitle: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  benefitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  benefitItem: {
    alignItems: 'center',
    width: 80,
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  filterBadge: {
    marginLeft: Spacing.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ctaCard: {
    padding: Spacing.lg,
    marginTop: Spacing.xl,
  },
  trustCard: {
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
  trustHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
