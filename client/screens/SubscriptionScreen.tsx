import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { apiRequest } from '@/lib/query-client';
import type { RootStackParamList } from '@/navigation/types';

type SubscriptionStatus = {
  subscriptionType: 'none' | 'basic' | 'premium';
  isEarlyAdopter: boolean;
  remainingEarlyAdopterSlots: number;
  canBecomeEarlyAdopter: boolean;
  subscriptionEndDate: string | null;
  isPremiumListing: boolean;
  freeFeatureUsed?: boolean;
};

type AdStats = {
  isPremium: boolean;
  freeFeatureUsed: boolean;
  featuredCount: number;
};

type HomeData = {
  remainingEarlyAdopterSlots: number;
  premiumItems: unknown[];
};

const FREE_PLAN = {
  id: 'free',
  name: 'Besplatno',
  price: 0,
  features: [
    'Do 5 oglasa',
    'Trajanje oglasa: 30 dana',
    'Osnovne kategorije',
    'Poruke sa zakupcima',
  ],
  limitations: [
    'Ograničen broj oglasa (maks 5)',
    'Oglasi ističu nakon 30 dana',
    'Bez isticanja oglasa',
    'Standardna podrška',
  ],
};

const PLANS = [
  {
    id: 'basic',
    name: 'Standard',
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
      'Sve iz Standard paketa',
      '1 istaknuti oglas na vrhu pretrage',
      'Premium značka na oglasima',
      'Prioritet u rezultatima pretrage',
      'Prioritetna podrška 24/7',
    ],
    recommended: true,
  },
];

export default function SubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'Subscription'>>();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const featureSectionY = useRef<number>(0);

  const scrollToFeature = route.params?.scrollToFeature;

  const { data: status, isLoading: statusLoading } = useQuery<SubscriptionStatus>({
    queryKey: ['/api/subscription/status'],
  });

  const { data: homeData, isLoading: homeLoading } = useQuery<HomeData>({
    queryKey: ['/api/home'],
  });

  const { data: adStats, isLoading: adStatsLoading } = useQuery<AdStats>({
    queryKey: ['/api/user/ad-stats'],
  });

  const remainingSlots = status?.remainingEarlyAdopterSlots ?? homeData?.remainingEarlyAdopterSlots ?? 0;
  const isLoading = statusLoading && homeLoading && adStatsLoading;
  const showSingleFeatureOption = (adStats?.isPremium && adStats?.freeFeatureUsed) || scrollToFeature;

  useEffect(() => {
    if (scrollToFeature && !isLoading && featureSectionY.current > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: featureSectionY.current - 100, animated: true });
      }, 300);
    }
  }, [scrollToFeature, isLoading]);

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

  const buyFeatureMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/subscription/buy-feature');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/ad-stats'] });
      Alert.alert(
        'Stripe integracija',
        'Plaćanje za istaknuti oglas će biti dostupno uskoro. Kontaktirajte nas za više informacija.',
      );
    },
    onError: (error: Error) => {
      Alert.alert('Greška', error.message);
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
      'Aktiviraj Premium',
      'Želite li da aktivirate besplatni Premium pristup kao rani korisnik?',
      [
        { text: 'Otkaži', style: 'cancel' },
        { text: 'Da, aktiviraj!', onPress: () => claimEarlyAdopterMutation.mutate() },
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
        ref={scrollViewRef}
        contentContainerStyle={[styles.content, { paddingTop: headerHeight + Spacing.md, paddingBottom: insets.bottom + Spacing.xl }]}
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
                    Aktiviraj Premium besplatno
                  </ThemedText>
                )}
              </Pressable>
            ) : (
              <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.sm, textAlign: 'center' }}>
                Prijavite se da aktivirate Premium besplatno
              </ThemedText>
            )}
          </Card>
        )}

        <ThemedText type="h3" style={styles.plansTitle}>Uporedi planove</ThemedText>

        <Card style={StyleSheet.flatten([styles.planCard, status?.subscriptionType === 'none' || !status?.subscriptionType ? { borderColor: theme.border, borderWidth: 1 } : {}])}>
          {(status?.subscriptionType === 'none' || (!status?.subscriptionType && !status?.isEarlyAdopter)) && (
            <View style={[styles.activeBadge, { backgroundColor: theme.textSecondary }]}>
              <ThemedText type="small" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                TRENUTNI PLAN
              </ThemedText>
            </View>
          )}
          <ThemedText type="h2">{FREE_PLAN.name}</ThemedText>
          <View style={styles.priceRow}>
            <ThemedText type="h1" style={{ color: theme.textSecondary }}>0</ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary }}> RSD/mesec</ThemedText>
          </View>

          <View style={styles.features}>
            {FREE_PLAN.features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Feather name="check" size={18} color={theme.success} />
                <ThemedText type="body">{feature}</ThemedText>
              </View>
            ))}
          </View>

          <View style={[styles.features, { marginTop: Spacing.sm }]}>
            <ThemedText type="small" style={{ color: theme.textSecondary, fontWeight: '600', marginBottom: Spacing.xs }}>
              Ograničenja:
            </ThemedText>
            {FREE_PLAN.limitations.map((limitation, index) => (
              <View key={index} style={styles.featureRow}>
                <Feather name="x" size={18} color={theme.error} />
                <ThemedText type="body" style={{ color: theme.textSecondary }}>{limitation}</ThemedText>
              </View>
            ))}
          </View>
        </Card>

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

        {showSingleFeatureOption ? (
          <Card 
            style={StyleSheet.flatten([styles.singleFeatureCard, { borderColor: theme.warning, borderWidth: 2 }])}
            onLayout={(event) => {
              featureSectionY.current = event.nativeEvent.layout.y;
            }}
          >
            <View style={styles.singleFeatureHeader}>
              <Feather name="star" size={28} color={theme.warning} />
              <View style={styles.singleFeatureText}>
                <ThemedText type="h3">Kupi istaknuti oglas</ThemedText>
                <ThemedText type="body" style={{ color: theme.textSecondary }}>
                  Istaknite jedan od vaših oglasa na vrhu pretrage
                </ThemedText>
              </View>
            </View>
            <View style={styles.singleFeaturePrice}>
              <ThemedText type="h1" style={{ color: theme.warning }}>99</ThemedText>
              <ThemedText type="body" style={{ color: theme.textSecondary }}> RSD</ThemedText>
            </View>
            <View style={styles.singleFeatureDetails}>
              <View style={styles.featureRow}>
                <Feather name="check" size={16} color={theme.success} />
                <ThemedText type="small">Oglas se prikazuje na vrhu pretrage</ThemedText>
              </View>
              <View style={styles.featureRow}>
                <Feather name="check" size={16} color={theme.success} />
                <ThemedText type="small">Premium značka na oglasu</ThemedText>
              </View>
              <View style={styles.featureRow}>
                <Feather name="check" size={16} color={theme.success} />
                <ThemedText type="small">Važi dok je oglas aktivan</ThemedText>
              </View>
            </View>
            <Pressable
              style={[styles.buyFeatureButton, { backgroundColor: theme.warning }]}
              onPress={() => buyFeatureMutation.mutate()}
              disabled={buyFeatureMutation.isPending}
            >
              {buyFeatureMutation.isPending ? (
                <ActivityIndicator color="#1A1A1A" />
              ) : (
                <ThemedText type="body" style={{ color: '#1A1A1A', fontWeight: '700' }}>
                  Kupi za 99 RSD
                </ThemedText>
              )}
            </Pressable>
          </Card>
        ) : null}

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
  singleFeatureCard: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  singleFeatureHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  singleFeatureText: {
    flex: 1,
    gap: Spacing.xs,
  },
  singleFeaturePrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.md,
  },
  singleFeatureDetails: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  buyFeatureButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
});
