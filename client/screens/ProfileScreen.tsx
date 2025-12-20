import React from 'react';
import { View, StyleSheet, Pressable, Alert, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { StarIcon, ChevronRightIcon, LogOutIcon, ClockIcon } from '@/components/icons/TabBarIcons';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { VerificationBanner } from '@/components/VerificationBanner';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout } from '@/hooks/useWebLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Spacing, BorderRadius } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import { useHeaderHeight } from '@react-navigation/elements';

type SubscriptionStatus = {
  subscriptionType: string;
  isEarlyAdopter: boolean;
  remainingDays: number | null;
  subscriptionEndDate: string | null;
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { isDesktop, contentPaddingTop, contentPaddingBottom } = useWebLayout();
  const tabBarHeight = isDesktop ? 0 : (Platform.OS === 'web' ? 0 : 80);
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { data: subscriptionStatus } = useQuery<SubscriptionStatus>({
    queryKey: ['/api/subscription/status'],
    enabled: !!user,
  });

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Da li ste sigurni da želite da se odjavite?');
      if (confirmed) {
        logout();
      }
    } else {
      Alert.alert(
        'Odjava',
        'Da li ste sigurni da želite da se odjavite?',
        [
          { text: 'Otkaži', style: 'cancel' },
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

  const menuItems = [
    { icon: 'package', label: 'Moje Stvari', onPress: () => navigation.navigate('MyItems') },
    { icon: 'star', label: 'Pretplata', badge: getSubscriptionLabel(), onPress: () => navigation.navigate('Subscription') },
    { icon: 'settings', label: 'Podešavanja', onPress: () => navigation.navigate('Settings') },
    { icon: 'help-circle', label: 'Pomoć', onPress: () => navigation.navigate('Help') },
    { icon: 'info', label: 'O Aplikaciji', onPress: () => navigation.navigate('About') },
    ...(user?.isAdmin ? [{ icon: 'shield', label: 'Admin Panel', badge: 'Admin', onPress: () => navigation.navigate('Admin') }] : []),
  ];

  // For opaque headers on mobile, content starts below header (no extra padding needed)
  const paddingTop = isDesktop ? contentPaddingTop + Spacing.lg : Spacing.sm;
  const paddingBottom = isDesktop ? contentPaddingBottom + Spacing.xl : tabBarHeight + Spacing.fabSize + Spacing.xl;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop,
        paddingBottom,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <VerificationBanner style={{ marginHorizontal: 0, marginBottom: Spacing.lg }} />
      <Card style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <ThemedText style={styles.avatarText}>
            {(user?.name || 'K').charAt(0).toUpperCase()}
          </ThemedText>
        </View>
        <ThemedText type="h3" style={styles.name}>{user?.name || 'Korisnik'}</ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>{user?.email}</ThemedText>
        
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

      {subscriptionStatus?.remainingDays !== null && subscriptionStatus?.remainingDays !== undefined && subscriptionStatus.remainingDays > 0 && (
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
            {subscriptionStatus.subscriptionEndDate && (
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Istice: {new Date(subscriptionStatus.subscriptionEndDate).toLocaleDateString('sr-Latn-RS')}
              </ThemedText>
            )}
          </View>
          <ChevronRightIcon size={20} color={theme.primary} />
        </Pressable>
      )}

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    marginBottom: Spacing.xl,
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
});
