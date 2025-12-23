import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { ShieldIcon, UserCheckIcon, BanknoteIcon, StarIcon } from '@/components/icons/TabBarIcons';

interface TrustBadge {
  icon: React.ReactNode;
  text: string;
  color: string;
}

export function TrustBadges() {
  const { theme, isDark } = useTheme();

  const badges: TrustBadge[] = [
    {
      icon: <ShieldIcon size={16} color={Colors.light.success} />,
      text: 'Bezbedno',
      color: Colors.light.success,
    },
    {
      icon: <BanknoteIcon size={16} color={Colors.light.cta} />,
      text: '0% provizije',
      color: Colors.light.cta,
    },
    {
      icon: <UserCheckIcon size={16} color={Colors.light.trust} />,
      text: 'Verifikovani korisnici',
      color: Colors.light.trust,
    },
  ];

  return (
    <View style={styles.container}>
      {badges.map((badge, index) => (
        <View 
          key={index}
          style={[
            styles.badge, 
            { 
              backgroundColor: isDark ? `${badge.color}20` : `${badge.color}10`,
              borderColor: `${badge.color}30`,
            }
          ]}
        >
          {badge.icon}
          <ThemedText type="small" style={{ color: badge.color, fontWeight: '500', marginLeft: 6 }}>
            {badge.text}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
});
