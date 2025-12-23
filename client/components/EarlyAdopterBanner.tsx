import React from 'react';
import { View, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { StarIcon, ChevronRightIcon, ClockIcon } from '@/components/icons/TabBarIcons';

interface EarlyAdopterBannerProps {
  remainingSlots: number;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function EarlyAdopterBanner({ remainingSlots, onPress }: EarlyAdopterBannerProps) {
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  if (remainingSlots <= 0) return null;

  return (
    <AnimatedPressable
      style={[
        animatedStyle,
        styles.container,
        isDesktop ? styles.containerDesktop : undefined,
        { 
          backgroundColor: isDark ? '#2A2A2A' : '#FFF9E6',
          borderColor: Colors.light.primary,
        }
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <View style={styles.iconContainer}>
        <View style={[styles.iconBg, { backgroundColor: Colors.light.primary }]}>
          <StarIcon size={24} color="#1A1A1A" />
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <ThemedText type="h4" style={{ color: isDark ? '#FFCC00' : '#1A1A1A' }}>
            Program ranih usvojilaca
          </ThemedText>
          <View style={[styles.badge, { backgroundColor: Colors.light.cta }]}>
            <ClockIcon size={12} color="#FFFFFF" />
            <ThemedText type="small" style={{ color: '#FFFFFF', fontWeight: '700', marginLeft: 4 }}>
              OGRANICENO
            </ThemedText>
          </View>
        </View>
        
        <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: 4 }}>
          1 mesec Premium besplatno za prvih 100 korisnika
        </ThemedText>
        
        <View style={styles.slotsRow}>
          <View style={[styles.slotsBar, { backgroundColor: theme.border }]}>
            <View 
              style={[
                styles.slotsFill, 
                { 
                  backgroundColor: Colors.light.primary,
                  width: `${Math.max(0, 100 - remainingSlots)}%`,
                }
              ]} 
            />
          </View>
          <ThemedText type="small" style={{ color: Colors.light.cta, fontWeight: '700', marginLeft: Spacing.sm }}>
            Preostalo: {remainingSlots} mesta
          </ThemedText>
        </View>
      </View>
      
      <Pressable 
        style={[styles.ctaButton, { backgroundColor: Colors.light.cta }]}
        onPress={onPress}
      >
        <ThemedText type="body" style={{ color: '#FFFFFF', fontWeight: '700' }}>
          Rezervisi mesto
        </ThemedText>
        <ChevronRightIcon size={18} color="#FFFFFF" />
      </Pressable>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing['2xl'],
  },
  containerDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: Spacing.md,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  slotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  slotsBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    maxWidth: 200,
  },
  slotsFill: {
    height: '100%',
    borderRadius: 4,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
});
