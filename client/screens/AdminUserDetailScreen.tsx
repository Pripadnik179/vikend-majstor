import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, Switch, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useTheme } from '@/hooks/useTheme';
import { apiRequest } from '@/lib/query-client';
import { Spacing, BorderRadius } from '@/constants/theme';
import { UserIcon, CheckCircleIcon, XCircleIcon, StarIcon, CalendarIcon } from '@/components/icons/TabBarIcons';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  city: string | null;
  district: string | null;
  rating: string;
  totalRatings: number;
  isActive: boolean;
  isAdmin: boolean;
  emailVerified: boolean;
  subscriptionType: string;
  subscriptionStatus: string;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  isEarlyAdopter: boolean;
  isPremiumListing: boolean;
  premiumListingEndDate: string | null;
  totalAdsCreated: number;
  createdAt: string;
}

const SUBSCRIPTION_OPTIONS = [
  { key: 'free', label: 'Besplatno', color: '#808080' },
  { key: 'basic', label: 'Standard', color: '#4CAF50' },
  { key: 'premium', label: 'Premium', color: '#FFCC00' },
];

const DURATION_OPTIONS = [
  { days: 7, label: '7 dana' },
  { days: 30, label: '30 dana' },
  { days: 90, label: '90 dana' },
  { days: 365, label: '1 godina' },
];

export default function AdminUserDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const { userId } = route.params;

  const [isActive, setIsActive] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState('free');
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: user, isLoading, error } = useQuery<AdminUser>({
    queryKey: ['/api/admin/users', userId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Korisnik nije pronađen');
      return response.json();
    },
  });

  useEffect(() => {
    if (user) {
      setIsActive(user.isActive);
      setIsAdminUser(user.isAdmin);
      setSelectedSubscription(user.subscriptionType);
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('PATCH', `/api/admin/users/${userId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      Alert.alert('Uspešno', 'Korisnik je ažuriran');
      setHasChanges(false);
    },
    onError: (error: any) => {
      Alert.alert('Greška', error.message || 'Došlo je do greške');
    },
  });

  const handleSave = () => {
    const data: any = {};
    
    if (isActive !== user?.isActive) {
      data.isActive = isActive;
    }
    
    if (isAdminUser !== user?.isAdmin) {
      data.isAdmin = isAdminUser;
    }
    
    if (selectedSubscription !== user?.subscriptionType) {
      data.subscriptionType = selectedSubscription;
      if (selectedSubscription !== 'free') {
        data.subscriptionDays = selectedDuration;
      }
    }
    
    if (Object.keys(data).length === 0) {
      Alert.alert('Info', 'Nema promena za čuvanje');
      return;
    }
    
    updateMutation.mutate(data);
  };

  const handleToggleActive = (value: boolean) => {
    setIsActive(value);
    setHasChanges(true);
  };

  const handleToggleAdmin = (value: boolean) => {
    setIsAdminUser(value);
    setHasChanges(true);
  };

  const handleSubscriptionChange = (type: string) => {
    setSelectedSubscription(type);
    setHasChanges(true);
  };

  const handleDurationChange = (days: number) => {
    setSelectedDuration(days);
    if (selectedSubscription !== 'free') {
      setHasChanges(true);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRemainingDays = (endDate: string | null) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </ThemedView>
    );
  }

  if (error || !user) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText type="h4">Korisnik nije pronađen</ThemedText>
      </ThemedView>
    );
  }

  const remainingDays = getRemainingDays(user.subscriptionEndDate);

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + Spacing["2xl"] }]}
    >
      <Card style={styles.headerCard}>
        <View style={styles.userHeader}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <UserIcon size={32} color="#1A1A1A" />
          </View>
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <ThemedText type="h3">{user.name}</ThemedText>
              {user.isAdmin && (
                <View style={[styles.badge, { backgroundColor: '#FF5722' }]}>
                  <ThemedText type="small" style={{ color: '#FFFFFF' }}>Admin</ThemedText>
                </View>
              )}
            </View>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>{user.email}</ThemedText>
            {user.phone && (
              <ThemedText type="small" style={{ color: theme.textTertiary }}>{user.phone}</ThemedText>
            )}
          </View>
        </View>
        
        <View style={styles.metaRow}>
          {user.city && (
            <ThemedText type="small" style={{ color: theme.textTertiary }}>
              {user.city}{user.district ? `, ${user.district}` : ''}
            </ThemedText>
          )}
          <ThemedText type="small" style={{ color: theme.textTertiary }}>
            Registrovan: {formatDate(user.createdAt)}
          </ThemedText>
        </View>
      </Card>

      <Card style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>Status naloga</ThemedText>
        
        <View style={styles.switchRow}>
          <View style={styles.switchLabel}>
            {isActive ? (
              <CheckCircleIcon size={20} color="#4CAF50" />
            ) : (
              <XCircleIcon size={20} color="#F44336" />
            )}
            <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>
              {isActive ? 'Aktivan nalog' : 'Deaktiviran nalog'}
            </ThemedText>
          </View>
          <Switch
            value={isActive}
            onValueChange={handleToggleActive}
            trackColor={{ false: '#767577', true: theme.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        <View style={styles.switchRow}>
          <View style={styles.switchLabel}>
            {isAdminUser ? (
              <CheckCircleIcon size={20} color="#FF5722" />
            ) : (
              <XCircleIcon size={20} color="#808080" />
            )}
            <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>
              {isAdminUser ? 'Administrator' : 'Običan korisnik'}
            </ThemedText>
          </View>
          <Switch
            value={isAdminUser}
            onValueChange={handleToggleAdmin}
            trackColor={{ false: '#767577', true: '#FF5722' }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        <View style={styles.infoRow}>
          <ThemedText type="small" style={{ color: theme.textTertiary }}>Email verifikovan:</ThemedText>
          <ThemedText type="body" style={{ color: user.emailVerified ? '#4CAF50' : '#F44336' }}>
            {user.emailVerified ? 'Da' : 'Ne'}
          </ThemedText>
        </View>
        
        <View style={styles.infoRow}>
          <ThemedText type="small" style={{ color: theme.textTertiary }}>Ukupno oglasa:</ThemedText>
          <ThemedText type="body">{user.totalAdsCreated}</ThemedText>
        </View>
        
        <View style={styles.infoRow}>
          <ThemedText type="small" style={{ color: theme.textTertiary }}>Rejting:</ThemedText>
          <ThemedText type="body">{user.rating} ({user.totalRatings} ocena)</ThemedText>
        </View>
      </Card>

      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="h4" style={styles.sectionTitle}>Pretplata</ThemedText>
          {user.isEarlyAdopter && (
            <View style={[styles.badge, { backgroundColor: 'rgba(255, 152, 0, 0.2)' }]}>
              <StarIcon size={12} color="#FF9800" />
              <ThemedText type="small" style={{ color: '#FF9800', marginLeft: 4 }}>Early Adopter</ThemedText>
            </View>
          )}
        </View>
        
        <View style={styles.currentSubscription}>
          <ThemedText type="small" style={{ color: theme.textTertiary }}>Trenutna pretplata:</ThemedText>
          <ThemedText type="h4" style={{ color: SUBSCRIPTION_OPTIONS.find(s => s.key === user.subscriptionType)?.color }}>
            {SUBSCRIPTION_OPTIONS.find(s => s.key === user.subscriptionType)?.label}
          </ThemedText>
        </View>
        
        {user.subscriptionEndDate && (
          <View style={styles.infoRow}>
            <View style={styles.dateInfo}>
              <CalendarIcon size={16} color={theme.textTertiary} />
              <ThemedText type="small" style={{ color: theme.textTertiary, marginLeft: Spacing.xs }}>
                Ističe: {formatDate(user.subscriptionEndDate)}
              </ThemedText>
            </View>
            {remainingDays !== null && (
              <ThemedText 
                type="body" 
                style={{ color: remainingDays <= 7 ? '#F44336' : remainingDays <= 14 ? '#FF9800' : '#4CAF50' }}
              >
                {remainingDays === 0 ? 'Istekla' : `${remainingDays} dana`}
              </ThemedText>
            )}
          </View>
        )}

        <View style={styles.divider} />

        <ThemedText type="h4" style={styles.subsectionTitle}>Promeni pretplatu</ThemedText>
        
        <View style={styles.optionsRow}>
          {SUBSCRIPTION_OPTIONS.map((option) => (
            <Pressable
              key={option.key}
              onPress={() => handleSubscriptionChange(option.key)}
              style={[
                styles.optionButton,
                { 
                  backgroundColor: selectedSubscription === option.key ? option.color : theme.backgroundSecondary,
                  borderColor: option.color,
                }
              ]}
            >
              <ThemedText 
                type="small" 
                style={{ color: selectedSubscription === option.key ? '#1A1A1A' : option.color }}
              >
                {option.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {selectedSubscription !== 'free' && (
          <>
            <ThemedText type="small" style={[styles.subsectionTitle, { color: theme.textSecondary }]}>
              Trajanje pretplate
            </ThemedText>
            <View style={styles.optionsRow}>
              {DURATION_OPTIONS.map((option) => (
                <Pressable
                  key={option.days}
                  onPress={() => handleDurationChange(option.days)}
                  style={[
                    styles.optionButton,
                    { 
                      backgroundColor: selectedDuration === option.days ? theme.primary : theme.backgroundSecondary,
                      borderColor: selectedDuration === option.days ? theme.primary : theme.border,
                    }
                  ]}
                >
                  <ThemedText 
                    type="small" 
                    style={{ color: selectedDuration === option.days ? '#1A1A1A' : theme.textSecondary }}
                  >
                    {option.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </Card>

      {hasChanges && (
        <Button 
          onPress={handleSave} 
          disabled={updateMutation.isPending}
          style={styles.saveButton}
        >
          {updateMutation.isPending ? <ActivityIndicator color="#1A1A1A" /> : 'Sačuvaj promene'}
        </Button>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  metaRow: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
    gap: Spacing.xs,
  },
  section: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentSubscription: {
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    marginVertical: Spacing.md,
  },
  subsectionTitle: {
    marginBottom: Spacing.sm,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  optionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  saveButton: {
    marginTop: Spacing.md,
  },
});
