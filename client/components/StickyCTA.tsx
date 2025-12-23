import React from 'react';
import { View, StyleSheet, Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { ChevronRightIcon } from '@/components/icons/TabBarIcons';

interface StickyCTAProps {
  text: string;
  subText?: string;
  onPress: () => void;
  visible?: boolean;
}

export function StickyCTA({ text, subText, onPress, visible = true }: StickyCTAProps) {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  if (!visible || Platform.OS === 'web') {
    return null;
  }

  const containerStyle = [
    styles.container,
    {
      paddingBottom: Math.max(insets.bottom, Spacing.md),
    },
  ];

  const content = (
    <Pressable 
      style={[styles.button, { backgroundColor: Colors.light.cta }]} 
      onPress={onPress}
    >
      <View style={styles.buttonContent}>
        <View style={styles.textContainer}>
          <ThemedText type="body" style={styles.buttonText}>
            {text}
          </ThemedText>
          {subText ? (
            <ThemedText type="small" style={styles.subText}>
              {subText}
            </ThemedText>
          ) : null}
        </View>
        <ChevronRightIcon size={20} color="#FFFFFF" />
      </View>
    </Pressable>
  );

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={80}
        tint={isDark ? 'dark' : 'light'}
        style={containerStyle}
      >
        <View style={styles.innerContainer}>
          {content}
        </View>
      </BlurView>
    );
  }

  return (
    <View style={[containerStyle, { backgroundColor: isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)' }]}>
      <View style={styles.innerContainer}>
        {content}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  innerContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  button: {
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  subText: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
});
