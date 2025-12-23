import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { UserIcon, ToolIcon, StarIcon, ShieldIcon } from '@/components/icons/TabBarIcons';

interface StatItem {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}

export function SocialProof() {
  const { theme, isDark } = useTheme();

  const stats: StatItem[] = [
    {
      icon: <UserIcon size={20} color={Colors.light.trust} />,
      value: '500+',
      label: 'korisnika',
      color: Colors.light.trust,
    },
    {
      icon: <ToolIcon size={20} color={Colors.light.primary} />,
      value: '2000+',
      label: 'alata',
      color: Colors.light.primary,
    },
    {
      icon: <StarIcon size={20} color={Colors.light.cta} />,
      value: '4.8',
      label: 'prosek ocena',
      color: Colors.light.cta,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        {stats.map((stat, index) => (
          <View 
            key={index}
            style={[
              styles.statItem,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }
            ]}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${stat.color}15` }]}>
              {stat.icon}
            </View>
            <ThemedText type="h4" style={[styles.statValue, { color: stat.color }]}>
              {stat.value}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {stat.label}
            </ThemedText>
          </View>
        ))}
      </View>
      
      <View style={styles.trustRow}>
        <View style={[styles.trustBadge, { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)' }]}>
          <ShieldIcon size={14} color={Colors.light.success} />
          <ThemedText type="small" style={{ color: Colors.light.success, marginLeft: 4 }}>
            Bezbedno
          </ThemedText>
        </View>
        <View style={[styles.trustBadge, { backgroundColor: isDark ? 'rgba(255, 107, 53, 0.15)' : 'rgba(255, 107, 53, 0.1)' }]}>
          <ThemedText type="small" style={{ color: Colors.light.cta, fontWeight: '600' }}>
            0% provizije
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing['2xl'],
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontWeight: '700',
    marginBottom: 2,
  },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
});
