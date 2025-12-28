import React, { useCallback, useState } from 'react';
import { View, FlatList, StyleSheet, Pressable, RefreshControl, ActivityIndicator, Alert, StyleProp, ViewStyle, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { ZapIcon, StarIcon, ImageIcon, ClockIcon, EditIcon, PlusIcon, AwardIcon, TrashIcon, BoxIcon } from '@/components/icons/TabBarIcons';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout, MAX_CONTENT_WIDTH } from '@/hooks/useWebLayout';
import { apiRequest, getApiUrl } from '@/lib/query-client';
import { Spacing, BorderRadius } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import type { Item } from '@shared/schema';

interface AdStats {
  totalAds: number;
  freeAdsUsed: number;
  freeAdsLimit: number;
  canCreateAd: boolean;
  subscriptionType: string;
  subscriptionStatus: string;
  subscriptionEndDate: string | null;
  featuredItemId: string | null;
  isPremium: boolean;
  freeFeatureUsed: boolean;
  featuredCount: number;
}

export default function MyItemsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { isDesktop } = useWebLayout();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();

  const [refreshing, setRefreshing] = useState(false);

  const { data: items = [], isLoading, refetch } = useQuery<Item[]>({
    queryKey: ['/api/my-items'],
  });

  const { data: adStats, refetch: refetchStats } = useQuery<AdStats>({
    queryKey: ['/api/user/ad-stats'],
  });

  const { data: allCategories = [] } = useQuery<{ id: string; name: string; slug: string }[]>({
    queryKey: ['/api/categories'],
  });

  const getSubscriptionLabel = (type: string) => {
    switch (type) {
      case 'premium': return 'Premium';
      case 'basic': return 'Standard';
      default: return 'Besplatno';
    }
  };

  const getDaysRemaining = (expiresAt: Date | string | null) => {
    if (!expiresAt) return null;
    const expDate = new Date(expiresAt);
    const now = new Date();
    const diffMs = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const deleteMutation = useMutation({
    mutationFn: async ({ itemId, force = false }: { itemId: string; force?: boolean }) => {
      const url = force ? `/api/items/${itemId}?force=true` : `/api/items/${itemId}`;
      await apiRequest('DELETE', url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/ad-stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/home'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings/'] });
      Alert.alert('Uspeh', 'Oglas je uspešno obrisan');
    },
    onError: (error: any, variables) => {
      console.error('Delete error:', error);
      if (error.code === 'HAS_ACTIVE_BOOKINGS') {
        Alert.alert(
          'Oglas je trenutno izdat',
          error.message || 'Ovaj oglas ima aktivne rezervacije. Brisanjem se otkazuju sve povezane rezervacije.',
          [
            { text: 'Otkaži', style: 'cancel' },
            { 
              text: 'Obriši svejedno', 
              style: 'destructive',
              onPress: () => deleteMutation.mutate({ itemId: variables.itemId, force: true }),
            },
          ]
        );
      } else {
        Alert.alert('Greška', 'Došlo je do greške pri brisanju oglasa');
      }
    },
  });

  const featureMutation = useMutation({
    mutationFn: async ({ itemId, action }: { itemId: string; action: 'feature' | 'unfeature' }) => {
      const res = await apiRequest('POST', `/api/items/${itemId}/feature`, { action });
      return await res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/ad-stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/home'] });
      if (data?.message) {
        Alert.alert('Uspeh', data.message);
      }
    },
    onError: (error: any) => {
      console.error('Feature error:', error);
      if (error.code === 'PAYMENT_REQUIRED') {
        Alert.alert(
          'Potrebno plaćanje',
          'Već ste iskoristili besplatno isticanje. Dodatno isticanje košta 99 RSD.',
          [
            { text: 'Otkaži', style: 'cancel' },
            { text: 'Kupi', onPress: () => navigation.navigate('Subscription', { scrollToFeature: true }) },
          ]
        );
      } else if (error.code === 'CANNOT_REMOVE_FREE') {
        Alert.alert('Nije moguće', 'Ne možete ukloniti besplatno istaknut oglas');
      } else {
        Alert.alert('Greška', error.message || 'Došlo je do greške pri isticanju oglasa');
      }
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchStats()]);
    setRefreshing(false);
  }, [refetch, refetchStats]);

  const handleDelete = (item: Item) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Da li ste sigurni da želite da obrišete "${item.title}"?`);
      if (confirmed) {
        deleteMutation.mutate({ itemId: item.id });
      }
    } else {
      Alert.alert(
        'Obriši stvar',
        `Da li ste sigurni da želite da obrišete "${item.title}"?`,
        [
          { text: 'Otkaži', style: 'cancel' },
          { 
            text: 'Obriši', 
            style: 'destructive',
            onPress: () => deleteMutation.mutate({ itemId: item.id }),
          },
        ]
      );
    }
  };

  const getImageUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    if (path.startsWith('/objects/')) {
      return `${getApiUrl()}/api${path}`;
    }
    if (path.startsWith('/public-objects/')) {
      return `${getApiUrl()}/api/objects${path.replace('/public-objects/', '/public/')}`;
    }
    return `${getApiUrl()}${path}`;
  };

  const getCategoryLabel = (categoryId: string) => {
    const category = allCategories.find(c => c.id === categoryId || c.slug === categoryId || c.name === categoryId);
    return category?.name || categoryId;
  };

  const renderHeader = () => (
    <Card style={styles.statsCard}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <ThemedText type="h3" style={{ color: theme.primary }}>
            {adStats?.freeAdsUsed || 0}/{adStats?.freeAdsLimit || 2}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Besplatni oglasi
          </ThemedText>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <View style={styles.statItem}>
          <ThemedText type="h4" style={{ color: adStats?.subscriptionStatus === 'active' ? theme.success : theme.textSecondary }}>
            {getSubscriptionLabel(adStats?.subscriptionType || 'free')}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Status pretplate
          </ThemedText>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <View style={styles.statItem}>
          <ThemedText type="h3" style={{ color: theme.text }}>
            {adStats?.totalAds || 0}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Ukupno oglasa
          </ThemedText>
        </View>
      </View>
      {adStats?.subscriptionType === 'free' && (adStats?.freeAdsUsed || 0) >= (adStats?.freeAdsLimit || 2) && (
        <Pressable
          style={[styles.upgradeButton, { backgroundColor: theme.accent }]}
          onPress={() => navigation.navigate('Subscription')}
        >
          <ZapIcon size={16} color="#FFFFFF" />
          <ThemedText style={{ color: '#FFFFFF', marginLeft: Spacing.sm, fontWeight: '600' }}>
            Nadogradi na Standard ili Premium
          </ThemedText>
        </Pressable>
      )}
      {adStats?.isPremium && adStats?.featuredItemId && (
        <View style={[styles.featuredInfo, { backgroundColor: theme.warning + '20' }]}>
          <StarIcon size={14} color={theme.warning} />
          <ThemedText type="small" style={{ color: theme.warning, marginLeft: Spacing.xs }}>
            Imate 1 istaknuti oglas na vrhu liste
          </ThemedText>
        </View>
      )}
    </Card>
  );

  const renderItem = ({ item }: { item: Item }) => {
    const isFeatured = adStats?.featuredItemId === item.id;
    const daysRemaining = getDaysRemaining(item.expiresAt);
    const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7;
    
    return (
      <Card 
        style={isFeatured ? StyleSheet.flatten([styles.itemCard, { borderWidth: 2, borderColor: theme.warning }]) : styles.itemCard}
        onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
      >
        {isFeatured && (
          <View style={[styles.featuredBadge, { backgroundColor: theme.warning }]}>
            <StarIcon size={12} color="#FFFFFF" />
            <ThemedText style={{ color: '#FFFFFF', fontSize: 10, marginLeft: 4, fontWeight: '600' }}>
              ISTAKNUTO
            </ThemedText>
          </View>
        )}
        <View style={styles.itemContent}>
          {item.images && item.images.length > 0 ? (
            <Image
              source={{ uri: getImageUrl(item.images[0]) }}
              style={styles.itemImage}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.itemImage, styles.placeholderImage, { backgroundColor: theme.backgroundSecondary }]}>
              <ImageIcon size={24} color={theme.textTertiary} />
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
            {daysRemaining !== null ? (
              <View style={[styles.expirationRow, { backgroundColor: isExpiringSoon ? '#FFF3CD' : theme.backgroundSecondary }]}>
                <ClockIcon size={12} color={isExpiringSoon ? '#856404' : theme.textSecondary} />
                <ThemedText type="small" style={{ color: isExpiringSoon ? '#856404' : theme.textSecondary, marginLeft: Spacing.xs }}>
                  {daysRemaining === 0 ? 'Ističe danas' : `Ističe za ${daysRemaining} dana`}
                </ThemedText>
              </View>
            ) : null}
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
          <EditIcon size={18} color={theme.primary} />
          <ThemedText type="small" style={{ color: theme.primary, marginLeft: Spacing.xs }}>
            Izmeni
          </ThemedText>
        </Pressable>
        {adStats?.isPremium ? (
          isFeatured ? (
            <View style={[styles.actionButton, { backgroundColor: theme.warning + '20' }]}>
              <StarIcon size={18} color={theme.warning} />
              <ThemedText type="small" style={{ color: theme.warning, marginLeft: Spacing.xs, fontWeight: '600' }}>
                Istaknut
              </ThemedText>
            </View>
          ) : adStats?.featuredItemId ? (
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: pressed ? theme.warning + '20' : 'transparent' },
              ]}
              onPress={() => navigation.navigate('Subscription', { scrollToFeature: true })}
            >
              <PlusIcon size={18} color={theme.warning} />
              <ThemedText type="small" style={{ color: theme.warning, marginLeft: Spacing.xs }}>
                Sledeći (99 RSD)
              </ThemedText>
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: pressed ? theme.warning + '20' : 'transparent' },
              ]}
              disabled={featureMutation.isPending}
              onPress={() => {
                if (adStats?.freeFeatureUsed) {
                  navigation.navigate('Subscription', { scrollToFeature: true });
                } else {
                  featureMutation.mutate({ itemId: item.id, action: 'feature' });
                }
              }}
            >
              <AwardIcon size={18} color={theme.warning} />
              <ThemedText type="small" style={{ color: theme.warning, marginLeft: Spacing.xs }}>
                {featureMutation.isPending ? 'Učitavam...' : (
                  adStats?.freeFeatureUsed ? 'Istakni (99 RSD)' : 'Istakni (besplatno)'
                )}
              </ThemedText>
            </Pressable>
          )
        ) : null}
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: pressed ? theme.error + '20' : 'transparent' },
          ]}
          onPress={() => handleDelete(item)}
        >
          <TrashIcon size={18} color={theme.error} />
          <ThemedText type="small" style={{ color: theme.error, marginLeft: Spacing.xs }}>
            Obriši
          </ThemedText>
        </Pressable>
      </View>
    </Card>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <BoxIcon size={64} color={theme.textTertiary} />
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
        <PlusIcon size={20} color="#FFFFFF" />
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
    <View style={{ flex: 1, backgroundColor: theme.backgroundRoot, alignItems: isDesktop ? 'center' : undefined }}>
      <FlatList
        style={{ flex: 1, width: '100%', maxWidth: MAX_CONTENT_WIDTH }}
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
        ListHeaderComponent={items.length > 0 ? renderHeader : undefined}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.md,
  },
  featuredInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.xs,
    marginTop: Spacing.md,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.sm,
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
  expirationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.xs,
    alignSelf: 'flex-start',
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
