import React, { useCallback, useState } from 'react';
import { View, FlatList, StyleSheet, Pressable, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { apiRequest, getApiUrl } from '@/lib/query-client';
import { Spacing, BorderRadius, CATEGORIES } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import type { Item } from '@shared/schema';

export default function MyItemsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();

  const [refreshing, setRefreshing] = useState(false);

  const { data: items = [], isLoading, refetch } = useQuery<Item[]>({
    queryKey: ['/api/my-items'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await apiRequest('DELETE', `/api/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleDelete = (item: Item) => {
    Alert.alert(
      'Obriši stvar',
      `Da li ste sigurni da želite da obrišete "${item.title}"?`,
      [
        { text: 'Otkaži', style: 'cancel' },
        { 
          text: 'Obriši', 
          style: 'destructive',
          onPress: () => deleteMutation.mutate(item.id),
        },
      ]
    );
  };

  const getImageUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    return `${getApiUrl()}${path}`;
  };

  const getCategoryLabel = (categoryId: string) => {
    return CATEGORIES.find(c => c.id === categoryId)?.label || categoryId;
  };

  const renderItem = ({ item }: { item: Item }) => (
    <Card 
      style={styles.itemCard}
      onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
    >
      <View style={styles.itemContent}>
        {item.images && item.images.length > 0 ? (
          <Image
            source={{ uri: getImageUrl(item.images[0]) }}
            style={styles.itemImage}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.itemImage, styles.placeholderImage, { backgroundColor: theme.backgroundSecondary }]}>
            <Feather name="image" size={24} color={theme.textTertiary} />
          </View>
        )}
        <View style={styles.itemInfo}>
          <ThemedText type="body" style={{ fontWeight: '600' }} numberOfLines={1}>
            {item.title}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }} numberOfLines={1}>
            {getCategoryLabel(item.category)} | {item.city}
          </ThemedText>
          <View style={styles.priceRow}>
            <ThemedText type="body" style={{ color: theme.primary, fontWeight: '600' }}>
              {item.pricePerDay} RSD/dan
            </ThemedText>
            <View style={[
              styles.statusBadge,
              { backgroundColor: item.isAvailable ? theme.success + '20' : theme.error + '20' },
            ]}>
              <ThemedText type="small" style={{ color: item.isAvailable ? theme.success : theme.error }}>
                {item.isAvailable ? 'Dostupno' : 'Nedostupno'}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: pressed ? theme.primaryLight : 'transparent' },
          ]}
          onPress={() => navigation.navigate('EditItem', { itemId: item.id })}
        >
          <Feather name="edit-2" size={18} color={theme.primary} />
          <ThemedText type="small" style={{ color: theme.primary, marginLeft: Spacing.xs }}>
            Izmeni
          </ThemedText>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: pressed ? theme.error + '20' : 'transparent' },
          ]}
          onPress={() => handleDelete(item)}
        >
          <Feather name="trash-2" size={18} color={theme.error} />
          <ThemedText type="small" style={{ color: theme.error, marginLeft: Spacing.xs }}>
            Obriši
          </ThemedText>
        </Pressable>
      </View>
    </Card>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="package" size={64} color={theme.textTertiary} />
      <ThemedText type="h4" style={[styles.emptyTitle, { color: theme.textSecondary }]}>
        Nemate dodatih stvari
      </ThemedText>
      <ThemedText type="body" style={[styles.emptyText, { color: theme.textTertiary }]}>
        Dodajte stvari koje želite da iznajmite
      </ThemedText>
      <Pressable
        style={[styles.addButton, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate('AddItem')}
      >
        <Feather name="plus" size={20} color="#FFFFFF" />
        <ThemedText style={{ color: '#FFFFFF', marginLeft: Spacing.sm, fontWeight: '600' }}>
          Dodaj stvar
        </ThemedText>
      </Pressable>
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
    <FlatList
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
        flexGrow: 1,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
      }
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  itemContent: {
    flexDirection: 'row',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.md,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  actions: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    gap: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
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
    marginBottom: Spacing.xl,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.sm,
  },
});
