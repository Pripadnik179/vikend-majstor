import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TextInput, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { SearchIcon, UserIcon, CheckCircleIcon, XCircleIcon, StarIcon } from '@/components/icons/TabBarIcons';
import { getApiUrl, apiRequest } from '@/lib/query-client';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  city: string | null;
  isActive: boolean;
  isAdmin: boolean;
  subscriptionType: string;
  subscriptionStatus: string;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  isEarlyAdopter: boolean;
  totalAdsCreated: number;
  createdAt: string;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  earlyAdopters: number;
}

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'premium'>('all');

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
  });

  const { data: users, isLoading, refetch, isRefetching } = useQuery<AdminUser[]>({
    queryKey: ['/api/admin/users', searchQuery, filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filter === 'active') params.append('isActive', 'true');
      if (filter === 'inactive') params.append('isActive', 'false');
      if (filter === 'premium') params.append('subscriptionType', 'premium');
      
      const url = new URL(`/api/admin/users?${params.toString()}`, getApiUrl());
      const response = await apiRequest('GET', url.toString());
      return response.json();
    },
  });

  const getSubscriptionBadge = (user: AdminUser) => {
    if (user.subscriptionType === 'premium') {
      return { text: 'Premium', color: '#FFCC00', bg: 'rgba(255, 204, 0, 0.2)' };
    }
    if (user.subscriptionType === 'basic') {
      return { text: 'Standard', color: '#4CAF50', bg: 'rgba(76, 175, 80, 0.2)' };
    }
    return { text: 'Besplatno', color: theme.textTertiary, bg: theme.backgroundSecondary };
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('sr-RS');
  };

  const renderUserCard = useCallback(({ item }: { item: AdminUser }) => {
    const badge = getSubscriptionBadge(item);
    
    return (
      <Pressable onPress={() => navigation.navigate('AdminUserDetail', { userId: item.id })}>
        <Card style={styles.userCard}>
          <View style={styles.userHeader}>
            <View style={styles.userInfo}>
              <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                <UserIcon size={24} color="#1A1A1A" />
              </View>
              <View style={styles.userDetails}>
                <View style={styles.nameRow}>
                  <ThemedText type="h4" numberOfLines={1}>{item.name}</ThemedText>
                  {item.isAdmin && (
                    <View style={[styles.adminBadge, { backgroundColor: '#FF5722' }]}>
                      <ThemedText type="small" style={{ color: '#FFFFFF' }}>Admin</ThemedText>
                    </View>
                  )}
                </View>
                <ThemedText type="small" style={{ color: theme.textSecondary }} numberOfLines={1}>
                  {item.email}
                </ThemedText>
              </View>
            </View>
            <View style={styles.statusIcons}>
              {item.isActive ? (
                <CheckCircleIcon size={20} color="#4CAF50" />
              ) : (
                <XCircleIcon size={20} color="#F44336" />
              )}
            </View>
          </View>
          
          <View style={styles.userMeta}>
            <View style={[styles.subscriptionBadge, { backgroundColor: badge.bg }]}>
              {item.isEarlyAdopter && <StarIcon size={12} color={badge.color} />}
              <ThemedText type="small" style={{ color: badge.color, marginLeft: item.isEarlyAdopter ? 4 : 0 }}>
                {badge.text}{item.isEarlyAdopter ? ' (Early)' : ''}
              </ThemedText>
            </View>
            <ThemedText type="small" style={{ color: theme.textTertiary }}>
              Oglasi: {item.totalAdsCreated}
            </ThemedText>
            {item.subscriptionEndDate && (
              <ThemedText type="small" style={{ color: theme.textTertiary }}>
                Do: {formatDate(item.subscriptionEndDate)}
              </ThemedText>
            )}
          </View>
        </Card>
      </Pressable>
    );
  }, [theme, navigation]);

  const filterButtons = [
    { key: 'all' as const, label: 'Svi' },
    { key: 'active' as const, label: 'Aktivni' },
    { key: 'inactive' as const, label: 'Neaktivni' },
    { key: 'premium' as const, label: 'Premium' },
  ];

  return (
    <ThemedView style={[styles.container, { paddingTop: Spacing.lg }]}>
      {stats && (
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText type="h3">{stats.totalUsers}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>Ukupno</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText type="h3" style={{ color: '#4CAF50' }}>{stats.activeUsers}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>Aktivni</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText type="h3" style={{ color: '#FFCC00' }}>{stats.premiumUsers}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>Premium</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText type="h3" style={{ color: '#FF9800' }}>{stats.earlyAdopters}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>Early</ThemedText>
          </View>
        </View>
      )}

      <View style={[styles.searchContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
        <SearchIcon size={20} color={theme.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Pretraži korisnike..."
          placeholderTextColor={theme.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterRow}>
        {filterButtons.map((btn) => (
          <Pressable
            key={btn.key}
            onPress={() => setFilter(btn.key)}
            style={[
              styles.filterButton,
              { 
                backgroundColor: filter === btn.key ? theme.primary : theme.backgroundSecondary,
                borderColor: filter === btn.key ? theme.primary : theme.border,
              }
            ]}
          >
            <ThemedText 
              type="small" 
              style={{ color: filter === btn.key ? '#1A1A1A' : theme.textSecondary }}
            >
              {btn.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUserCard}
          contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText type="h4" style={{ color: theme.textSecondary }}>
                Nema korisnika
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
    paddingHorizontal: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
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
    paddingTop: Spacing["2xl"],
  },
  userCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  adminBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  statusIcons: {
    marginLeft: Spacing.sm,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  subscriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
});
