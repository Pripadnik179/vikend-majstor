import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, withSpring, useSharedValue, withTiming } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
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
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
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
            Dodaj alat
          </ThemedText>
          <ThemedText type="small" style={styles.tooltipSubtext}>
            Zaradi od alata koji ti stoji
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
        <PlusIcon size={28} color="#FFFFFF" />
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
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tooltip: {
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  tooltipText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tooltipSubtext: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    fontSize: 11,
  },
});
