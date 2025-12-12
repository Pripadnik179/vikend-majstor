import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { apiRequest } from '@/lib/query-client';

type SubscriptionStatus = {
  subscriptionType: 'none' | 'basic' | 'premium';
  isEarlyAdopter: boolean;
  remainingEarlyAdopterSlots: number;
  canBecomeEarlyAdopter: boolean;
  subscriptionEndDate: string | null;
  isPremiumListing: boolean;
};

type HomeData = {
  remainingEarlyAdopterSlots: number;
  premiumItems: unknown[];
};

const PLANS = [
  {
    id: 'basic',
    name: 'Osnovni',
    price: 500,
    features: [
      'Neograničen broj oglasa',
      'Pristup svim kategorijama',
      'Poruke sa zakupcima',
      'Statistika oglasa',
    ],
    recommended: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 1000,
    features: [
      'Sve iz Osnovnog paketa',
      'Istaknuti oglasi sa značkom',
      'Prioritet u pretrazi',
      'Ekskluzivne promocije',
      'Prioritetna podrška',
    ],
    recommended: true,
  },
];

export default function SubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const { data: status, isLoading: statusLoading } = useQuery<SubscriptionStatus>({
    queryKey: ['/api/subscription/status'],
  });

  const { data: homeData, isLoading: homeLoading } = useQuery<HomeData>({
    queryKey: ['/api/home'],
  });

  const remainingSlots = status?.remainingEarlyAdopterSlots ?? homeData?.remainingEarlyAdopterSlots ?? 0;
  const isLoading = statusLoading && homeLoading;

  const claimEarlyAdopterMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/subscription/activate-early-adopter');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/status'] });
      Alert.alert(
        'Uspešno!',
        'Postali ste rani korisnik. Uživajte u besplatnom mesecu premium pristupa!',
      );
    },
    onError: (error: Error) => {
      Alert.alert('Greška', error.message);
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: async (planType: string) => {
      return apiRequest('POST', '/api/subscription/create-checkout', { planType });
    },
    onSuccess: () => {
      Alert.alert(
        'Stripe integracija',
        'Stripe plaćanje će biti dostupno uskoro. Kontaktirajte nas za više informacija.',
      );
    },
  });

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </ThemedView>
    );
  }

  const handleClaimEarlyAdopter = () => {
    Alert.alert(
      'Rani korisnik',
      'Želite li da postanete rani korisnik i dobijete besplatan mesec premium pristupa?',
      [
        { text: 'Otkaži', style: 'cancel' },
        { text: 'Da, želim!', onPress: () => claimEarlyAdopterMutation.mutate() },
      ],
    );
  };

  const handleSubscribe = (planId: string) => {
    setSelectedPlan(planId);
    subscribeMutation.mutate(planId);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {status?.isEarlyAdopter && (
          <Card style={StyleSheet.flatten([styles.statusCard, { borderColor: theme.accent }])}>
            <View style={styles.statusHeader}>
              <View style={[styles.badge, { backgroundColor: theme.accent }]}>
                <Feather name="star" size={14} color="#FFFFFF" />
                <ThemedText type="small" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                  RANI KORISNIK
                </ThemedText>
              </View>
            </View>
            <ThemedText type="body">
              Vi ste jedan od prvih 100 korisnika! Uživate u besplatnom premium pristupu.
            </ThemedText>
            {status.subscriptionEndDate && (
              <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                Važi do: {new Date(status.subscriptionEndDate).toLocaleDateString('sr-Latn-RS')}
              </ThemedText>
            )}
          </Card>
        )}

        {remainingSlots > 0 && !status?.isEarlyAdopter && (
          <Card style={StyleSheet.flatten([styles.earlyAdopterCard, { borderColor: theme.accent, borderWidth: 2 }])}>
            <View style={styles.earlyAdopterContent}>
              <Feather name="gift" size={32} color={theme.accent} />
              <View style={styles.earlyAdopterText}>
                <ThemedText type="h3">Program ranih korisnika</ThemedText>
                <ThemedText type="body" style={{ color: theme.textSecondary }}>
                  Preostalo je još {remainingSlots} mesta za rane korisnike.
                </ThemedText>
                <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                  Postanite jedan od prvih 100 korisnika i dobijte besplatan mesec Premium pristupa!
                </ThemedText>
              </View>
            </View>
            {status ? (
              <Pressable
                style={[styles.claimButton, { backgroundColor: theme.accent }]}
                onPress={handleClaimEarlyAdopter}
                disabled={claimEarlyAdopterMutation.isPending}
              >
                {claimEarlyAdopterMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText type="body" style={{ color: '#FFFFFF', fontWeight: '700' }}>
                    Preuzmi besplatan mesec
                  </ThemedText>
                )}
              </Pressable>
            ) : (
              <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.sm, textAlign: 'center' }}>
                Prijavite se da preuzmete besplatan mesec
              </ThemedText>
            )}
          </Card>
        )}

        <ThemedText type="h3" style={styles.plansTitle}>Planovi pretplate</ThemedText>

        {PLANS.map((plan) => {
          const planStyle: ViewStyle = {
            ...styles.planCard,
            ...(plan.recommended ? { borderColor: theme.primary, borderWidth: 2 } : {}),
            ...(status?.subscriptionType === plan.id ? { borderColor: theme.success, borderWidth: 2 } : {}),
          };
          return (
          <Card 
            key={plan.id} 
            style={planStyle}
          >
            {plan.recommended && (
              <View style={[styles.recommendedBadge, { backgroundColor: theme.primary }]}>
                <ThemedText type="small" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                  PREPORUČENO
                </ThemedText>
              </View>
            )}
            {status?.subscriptionType === plan.id && (
              <View style={[styles.activeBadge, { backgroundColor: theme.success }]}>
                <Feather name="check-circle" size={12} color="#FFFFFF" />
                <ThemedText type="small" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                  AKTIVNO
                </ThemedText>
              </View>
            )}

            <ThemedText type="h2">{plan.name}</ThemedText>
            <View style={styles.priceRow}>
              <ThemedText type="h1" style={{ color: theme.primary }}>{plan.price}</ThemedText>
              <ThemedText type="body" style={{ color: theme.textSecondary }}> RSD/mesec</ThemedText>
            </View>

            <View style={styles.features}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Feather name="check" size={18} color={theme.success} />
                  <ThemedText type="body">{feature}</ThemedText>
                </View>
              ))}
            </View>

            {status?.subscriptionType !== plan.id && (
              <Pressable
                style={[
                  styles.subscribeButton,
                  { backgroundColor: plan.recommended ? theme.primary : theme.backgroundDefault },
                  { borderColor: theme.primary, borderWidth: plan.recommended ? 0 : 2 },
                ]}
                onPress={() => handleSubscribe(plan.id)}
                disabled={subscribeMutation.isPending}
              >
                {subscribeMutation.isPending && selectedPlan === plan.id ? (
                  <ActivityIndicator color={plan.recommended ? '#FFFFFF' : theme.primary} />
                ) : (
                  <ThemedText 
                    type="body" 
                    style={{ 
                      color: plan.recommended ? '#FFFFFF' : theme.primary, 
                      fontWeight: '700',
                    }}
                  >
                    Izaberi {plan.name}
                  </ThemedText>
                )}
              </Pressable>
            )}
          </Card>
        );
        })}

        <ThemedText type="small" style={[styles.disclaimer, { color: theme.textTertiary }]}>
          Plaćanje se vrši preko Stripe platforme. Pretplata se automatski obnavlja svakog meseca.
          Možete je otkazati u bilo kom trenutku.
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: Spacing.lg,
  },
  statusCard: {
    marginBottom: Spacing.lg,
    borderWidth: 2,
  },
  statusHeader: {
    marginBottom: Spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  earlyAdopterCard: {
    marginBottom: Spacing.lg,
  },
  earlyAdopterContent: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  earlyAdopterText: {
    flex: 1,
    gap: Spacing.xs,
  },
  claimButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  plansTitle: {
    marginBottom: Spacing.md,
  },
  planCard: {
    marginBottom: Spacing.md,
    position: 'relative',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    right: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  activeBadge: {
    position: 'absolute',
    top: -12,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: Spacing.sm,
  },
  features: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  subscribeButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  disclaimer: {
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
