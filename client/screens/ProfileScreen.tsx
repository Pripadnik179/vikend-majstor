import React from 'react';
import { View, StyleSheet, Pressable, Alert, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { StarIcon, ChevronRightIcon, LogOutIcon, ClockIcon, ShieldIcon, TrendingUpIcon, CrownIcon, PlusIcon } from '@/components/icons/TabBarIcons';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { VerificationBanner } from '@/components/VerificationBanner';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout, MAX_CONTENT_WIDTH } from '@/hooks/useWebLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Spacing, BorderRadius, Colors } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import { useHeaderHeight } from '@react-navigation/elements';

type SubscriptionStatus = {
  subscriptionType: string;
  isEarlyAdopter: boolean;
  remainingDays: number | null;
  subscriptionEndDate: string | null;
};

type UserStats = {
  totalItems: number;
  totalRentals: number;
  totalEarnings: number;
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { isDesktop, contentPaddingTop, contentPaddingBottom } = useWebLayout();
  const tabBarHeight = isDesktop ? 0 : (Platform.OS === 'web' ? 0 : 80);
  const { theme, isDark } = useTheme();
  const { user, logout, isGuest, exitGuestMode } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { data: subscriptionStatus } = useQuery<SubscriptionStatus>({
    queryKey: ['/api/subscription/status'],
    enabled: !!user,
  });

  const { data: userStats } = useQuery<UserStats>({
    queryKey: ['/api/user/stats'],
    enabled: !!user,
  });

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Da li ste sigurni da zelite da se odjavite?');
      if (confirmed) {
        logout();
      }
    } else {
      Alert.alert(
        'Odjava',
        'Da li ste sigurni da zelite da se odjavite?',
        [
          { text: 'Otkazi', style: 'cancel' },
          { text: 'Odjavi se', style: 'destructive', onPress: logout },
        ]
      );
    }
  };

  const getSubscriptionLabel = () => {
    if (user?.isEarlyAdopter) return 'Rani korisnik';
    if (user?.subscriptionType === 'premium') return 'Premium';
    if (user?.subscriptionType === 'basic') return 'Standard';
    return 'Besplatno';
  };

  const getUserBadges = () => {
    const badges = [];
    
    if ((user as any)?.isEmailVerified) {
      badges.push({
        icon: <ShieldIcon size={14} color={Colors.light.success} />,
        label: 'Verifikovan',
        color: Colors.light.success,
      });
    }
    
    if (user?.isEarlyAdopter) {
      badges.push({
        icon: <StarIcon size={14} color={Colors.light.cta} />,
        label: 'Rani korisnik',
        color: Colors.light.cta,
      });
    }
    
    if (user?.subscriptionType === 'premium') {
      badges.push({
        icon: <CrownIcon size={14} color="#FFD700" />,
        label: 'Premium',
        color: '#FFD700',
      });
    }
    
    if ((user?.totalRatings || 0) >= 10) {
      badges.push({
        icon: <TrendingUpIcon size={14} color={Colors.light.trust} />,
        label: 'Top iznajmljivac',
        color: Colors.light.trust,
      });
    }
    
    return badges;
  };

  const menuItems = [
    { icon: 'package', label: 'Moje Stvari', onPress: () => navigation.navigate('MyItems') },
    { icon: 'star', label: 'Pretplata', badge: getSubscriptionLabel(), onPress: () => navigation.navigate('Subscription') },
    { icon: 'settings', label: 'Podesavanja', onPress: () => navigation.navigate('Settings') },
    { icon: 'help-circle', label: 'Pomoc', onPress: () => navigation.navigate('Help') },
    { icon: 'info', label: 'O Aplikaciji', onPress: () => navigation.navigate('About') },
    ...(user?.isAdmin ? [{ icon: 'shield', label: 'Admin Panel', badge: 'Admin', onPress: () => navigation.navigate('Admin') }] : []),
  ];

  const badges = getUserBadges();
  const paddingTop = isDesktop ? contentPaddingTop + Spacing.lg : Spacing.sm;
  const paddingBottom = isDesktop ? contentPaddingBottom + Spacing.xl : tabBarHeight + Spacing.fabSize + Spacing.xl;

  if (isGuest || !user) {
    return (
      <View style={[styles.guestContainer, { backgroundColor: theme.backgroundRoot, paddingTop: paddingTop + headerHeight }]}>
        <View style={styles.guestContent}>
          <View style={[styles.guestIconCircle, { backgroundColor: theme.primary + '20' }]}>
            <DynamicIcon name="user" size={48} color={theme.primary} />
          </View>
          <ThemedText type="h2" style={styles.guestTitle}>Prijavi se</ThemedText>
          <ThemedText type="body" style={[styles.guestSubtitle, { color: theme.textSecondary }]}>
            Da bi rezervisao alate, dodao svoje alate ili komunicirao sa drugim korisnicima, potrebno je da se prijavis.
          </ThemedText>
          
          <View style={styles.guestBenefits}>
            <View style={styles.guestBenefitRow}>
              <ShieldIcon size={20} color={Colors.light.success} />
              <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>Bez provizije - 0%</ThemedText>
            </View>
            <View style={styles.guestBenefitRow}>
              <ClockIcon size={20} color={Colors.light.trust} />
              <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>Registracija traje 1 minut</ThemedText>
            </View>
            <View style={styles.guestBenefitRow}>
              <StarIcon size={20} color={Colors.light.cta} />
              <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>Lokalna zajednica</ThemedText>
            </View>
          </View>

          <Pressable 
            onPress={exitGuestMode} 
            style={[styles.guestLoginButton, { backgroundColor: theme.primary }]}
          >
            <ThemedText style={styles.guestLoginButtonText}>Prijavi se / Registruj se</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop,
        paddingBottom,
        paddingHorizontal: Spacing.lg,
        alignItems: isDesktop ? 'center' : undefined,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <View style={{ width: '100%', maxWidth: MAX_CONTENT_WIDTH }}>
      <VerificationBanner style={{ marginHorizontal: 0, marginBottom: Spacing.lg }} />
      
      <Card style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <ThemedText style={styles.avatarText}>
            {(user?.name || 'K').charAt(0).toUpperCase()}
          </ThemedText>
        </View>
        <ThemedText type="h3" style={styles.name}>{user?.name || 'Korisnik'}</ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>{user?.email}</ThemedText>
        
        {badges.length > 0 ? (
          <View style={styles.badgesRow}>
            {badges.map((badge, index) => (
              <View 
                key={index}
                style={[styles.userBadge, { backgroundColor: badge.color + '15', borderColor: badge.color + '30' }]}
              >
                {badge.icon}
                <ThemedText type="small" style={{ color: badge.color, marginLeft: 4, fontWeight: '600' }}>
                  {badge.label}
                </ThemedText>
              </View>
            ))}
          </View>
        ) : null}
        
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <ThemedText type="h4">{user?.totalRatings || 0}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>Recenzija</ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.stat}>
            <View style={styles.ratingContainer}>
              <StarIcon size={16} color={theme.warning} />
              <ThemedText type="h4" style={{ marginLeft: 4 }}>
                {user?.rating ? Number(user.rating).toFixed(1) : '-'}
              </ThemedText>
            </View>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>Ocena</ThemedText>
          </View>
        </View>
      </Card>

      <Card style={styles.activityCard}>
        <View style={styles.activityHeader}>
          <TrendingUpIcon size={20} color={theme.primary} />
          <ThemedText type="h4" style={{ marginLeft: Spacing.sm }}>Istorija aktivnosti</ThemedText>
        </View>
        
        <View style={styles.activityStats}>
          <View style={styles.activityStat}>
            <ThemedText type="h3" style={{ color: theme.primary }}>{userStats?.totalItems || 0}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>Objavljenih alata</ThemedText>
          </View>
          <View style={[styles.activityDivider, { backgroundColor: theme.border }]} />
          <View style={styles.activityStat}>
            <ThemedText type="h3" style={{ color: Colors.light.success }}>{userStats?.totalRentals || 0}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>Uspesnih iznajmljivanja</ThemedText>
          </View>
          <View style={[styles.activityDivider, { backgroundColor: theme.border }]} />
          <View style={styles.activityStat}>
            <ThemedText type="h3" style={{ color: Colors.light.cta }}>{userStats?.totalEarnings || 0}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>RSD zaradeno</ThemedText>
          </View>
        </View>
      </Card>

      <Pressable
        style={[styles.addToolCTA, { backgroundColor: Colors.light.cta }]}
        onPress={() => navigation.navigate('AddItem')}
      >
        <View style={styles.addToolContent}>
          <PlusIcon size={24} color="#FFFFFF" />
          <View style={styles.addToolText}>
            <ThemedText type="body" style={{ color: '#FFFFFF', fontWeight: '700' }}>
              Dodaj svoj alat
            </ThemedText>
            <ThemedText type="small" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Zaradi od alata koji ti stoji u garazi
            </ThemedText>
          </View>
        </View>
        <ChevronRightIcon size={20} color="#FFFFFF" />
      </Pressable>

      {subscriptionStatus?.remainingDays !== null && subscriptionStatus?.remainingDays !== undefined && subscriptionStatus.remainingDays > 0 ? (
        <Pressable 
          onPress={() => navigation.navigate('Subscription')}
          style={({ pressed }) => [
            styles.premiumBanner,
            { 
              backgroundColor: theme.primary + '15',
              borderColor: theme.primary,
              opacity: pressed ? 0.8 : 1,
            }
          ]}
        >
          <View style={styles.premiumBannerContent}>
            <View style={[styles.premiumBadge, { backgroundColor: theme.primary }]}>
              <StarIcon size={14} color="#FFFFFF" />
              <ThemedText type="small" style={{ color: '#FFFFFF', fontWeight: '700' }}>
                {subscriptionStatus.isEarlyAdopter ? 'RANI KORISNIK' : 'PREMIUM'}
              </ThemedText>
            </View>
            <View style={styles.premiumCountdown}>
              <ClockIcon size={18} color={theme.primary} />
              <ThemedText type="body" style={{ fontWeight: '600' }}>
                Imate jos {subscriptionStatus.remainingDays} {subscriptionStatus.remainingDays === 1 ? 'dan' : 'dana'} Premium pretplate
              </ThemedText>
            </View>
            {subscriptionStatus.subscriptionEndDate ? (
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Istice: {new Date(subscriptionStatus.subscriptionEndDate).toLocaleDateString('sr-Latn-RS')}
              </ThemedText>
            ) : null}
          </View>
          <ChevronRightIcon size={20} color={theme.primary} />
        </Pressable>
      ) : null}

      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [
              styles.menuItem,
              { 
                backgroundColor: pressed ? theme.backgroundDefault : theme.backgroundRoot,
                borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
                borderBottomColor: theme.border,
              },
            ]}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <DynamicIcon name={item.icon} size={22} color={item.icon === 'star' ? theme.warning : theme.text} />
              <ThemedText type="body" style={styles.menuItemLabel}>{item.label}</ThemedText>
              {item.badge ? (
                <View style={[styles.subscriptionBadge, { backgroundColor: theme.primary + '20' }]}>
                  <ThemedText type="small" style={{ color: theme.primary, fontWeight: '600' }}>
                    {item.badge}
                  </ThemedText>
                </View>
              ) : null}
            </View>
            <ChevronRightIcon size={22} color={theme.textTertiary} />
          </Pressable>
        ))}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          { 
            backgroundColor: pressed ? theme.backgroundDefault : theme.backgroundRoot,
            borderColor: theme.error,
          },
        ]}
        onPress={handleLogout}
      >
        <LogOutIcon size={22} color={theme.error} />
        <ThemedText type="body" style={[styles.logoutText, { color: theme.error }]}>
          Odjavi se
        </ThemedText>
      </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  name: {
    marginBottom: Spacing.xs,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  stat: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  activityStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityStat: {
    flex: 1,
    alignItems: 'center',
  },
  activityDivider: {
    width: 1,
    height: 40,
  },
  addToolCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  addToolContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addToolText: {
    marginLeft: Spacing.md,
  },
  menuSection: {
    marginBottom: Spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemLabel: {
    marginLeft: Spacing.md,
  },
  subscriptionBadge: {
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  premiumBannerContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
    alignSelf: 'flex-start',
  },
  premiumCountdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
  },
  logoutText: {
    marginLeft: Spacing.sm,
    fontWeight: '600',
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  guestContent: {
    alignItems: 'center',
    maxWidth: 340,
  },
  guestIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  guestTitle: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  guestSubtitle: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  guestBenefits: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  guestBenefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  guestLoginButton: {
    width: '100%',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  guestLoginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
