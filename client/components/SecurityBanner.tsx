import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { ShieldIcon, AlertTriangleIcon } from '@/components/icons/TabBarIcons';

interface SecurityBannerProps {
  message: string;
  type?: 'warning' | 'info';
}

export function SecurityBanner({ message, type = 'warning' }: SecurityBannerProps) {
  const { theme, isDark } = useTheme();

  const isWarning = type === 'warning';
  const bgColor = isWarning 
    ? (isDark ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255, 193, 7, 0.08)')
    : (isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)');
  const borderColor = isWarning ? Colors.light.warning : Colors.light.trust;
  const iconColor = isWarning ? Colors.light.warning : Colors.light.trust;

  return (
    <View style={[styles.container, { backgroundColor: bgColor, borderColor }]}>
      {isWarning ? (
        <AlertTriangleIcon size={18} color={iconColor} />
      ) : (
        <ShieldIcon size={18} color={iconColor} />
      )}
      <ThemedText type="small" style={[styles.text, { color: theme.text }]}>
        {message}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
  },
  text: {
    flex: 1,
    marginLeft: Spacing.sm,
    lineHeight: 18,
  },
});
