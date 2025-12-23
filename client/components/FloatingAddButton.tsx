import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, withSpring, useSharedValue, withTiming } from 'react-native-reanimated';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { PlusIcon } from '@/components/icons/TabBarIcons';

interface FloatingAddButtonProps {
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FloatingAddButton({ onPress }: FloatingAddButtonProps) {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [showTooltip, setShowTooltip] = useState(false);
  
  const scale = useSharedValue(1);
  const tooltipOpacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const tooltipStyle = useAnimatedStyle(() => ({
    opacity: tooltipOpacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handleHoverIn = () => {
    if (Platform.OS === 'web') {
      setShowTooltip(true);
      tooltipOpacity.value = withTiming(1, { duration: 150 });
    }
  };

  const handleHoverOut = () => {
    if (Platform.OS === 'web') {
      tooltipOpacity.value = withTiming(0, { duration: 150 });
      setTimeout(() => setShowTooltip(false), 150);
    }
  };

  if (isDesktop) {
    return null;
  }

  const bottomOffset = Platform.OS === 'web' ? 80 : Math.max(insets.bottom, 16) + 70;

  return (
    <View style={[styles.container, { bottom: bottomOffset }]}>
      {showTooltip ? (
        <Animated.View style={[styles.tooltip, tooltipStyle, { backgroundColor: isDark ? '#333' : '#1A1A1A' }]}>
          <ThemedText type="small" style={styles.tooltipText}>
            Zaradi od alata koji ti stoji u garazi
          </ThemedText>
        </Animated.View>
      ) : null}
      
      <AnimatedPressable
        style={[animatedStyle, styles.button, { backgroundColor: Colors.light.cta }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...(Platform.OS === 'web' ? { onMouseEnter: handleHoverIn, onMouseLeave: handleHoverOut } : {})}
      >
        <PlusIcon size={20} color="#FFFFFF" />
        <ThemedText type="body" style={styles.buttonText}>
          Dodaj alat
        </ThemedText>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: Spacing.lg,
    alignItems: 'flex-end',
    zIndex: 100,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tooltip: {
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    maxWidth: 200,
  },
  tooltipText: {
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
  },
});
