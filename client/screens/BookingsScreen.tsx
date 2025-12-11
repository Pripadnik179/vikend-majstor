import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { BookingCard } from '@/components/BookingCard';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import type { Booking, Item, User } from '@shared/schema';

type BookingWithDetails = Booking & { item: Item; renter: User; owner: User };

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [viewType, setViewType] = useState<'renter' | 'owner'>('renter');
  const [refreshing, setRefreshing] = useState(false);

  const { data: bookings = [], isLoading, refetch } = useQuery<BookingWithDetails[]>({
    queryKey: ['/api/bookings', `?type=${viewType}`],
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderItem = ({ item }: { item: BookingWithDetails }) => (
    <BookingCard
      booking={item}
      viewType={viewType}
      onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id })}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="calendar" size={64} color={theme.textTertiary} />
      <ThemedText type="h4" style={[styles.emptyTitle, { color: theme.textSecondary }]}>
        Nema rezervacija
      </ThemedText>
      <ThemedText type="body" style={[styles.emptyText, { color: theme.textTertiary }]}>
        {viewType === 'renter'
          ? 'Pronađi nešto za iznajmljivanje'
          : 'Dodaj stvari da bi ih drugi mogli iznajmiti'}
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

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundRoot }}>
      <View style={[styles.tabContainer, { borderBottomColor: theme.border }]}>
        <Pressable
          style={[
            styles.tab,
            viewType === 'renter' && { borderBottomColor: theme.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => setViewType('renter')}
        >
          <ThemedText
            type="body"
            style={{ color: viewType === 'renter' ? theme.primary : theme.textSecondary, fontWeight: '600' }}
          >
            Iznajmljeno
          </ThemedText>
        </Pressable>
        <Pressable
          style={[
            styles.tab,
            viewType === 'owner' && { borderBottomColor: theme.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => setViewType('owner')}
        >
          <ThemedText
            type="body"
            style={{ color: viewType === 'owner' ? theme.primary : theme.textSecondary, fontWeight: '600' }}
          >
            Izdato
          </ThemedText>
        </Pressable>
      </View>

      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: Spacing.lg,
          paddingBottom: tabBarHeight + Spacing.fabSize + Spacing.xl,
          paddingHorizontal: Spacing.lg,
          flexGrow: 1,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        data={bookings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
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
