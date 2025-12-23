import React from 'react';
import { View, StyleSheet, Pressable, Platform, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { ToolIcon, CalendarIcon, BanknoteIcon, ChevronRightIcon } from '@/components/icons/TabBarIcons';

interface OnboardingStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  onPress?: () => void;
}

interface OnboardingGuideProps {
  onAddTool?: () => void;
  onBrowse?: () => void;
  onLearnMore?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function StepCard({ 
  step, 
  index, 
  isDesktop,
  theme 
}: { 
  step: OnboardingStep; 
  index: number;
  isDesktop: boolean;
  theme: any;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const stepColors = [
    { bg: Colors.light.primary, icon: '#1A1A1A' },
    { bg: Colors.light.cta, icon: '#FFFFFF' },
    { bg: Colors.light.success, icon: '#FFFFFF' },
  ];

  const color = stepColors[index] || stepColors[0];

  return (
    <AnimatedPressable
      onPress={step.onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        animatedStyle,
        styles.stepCard,
        isDesktop ? styles.stepCardDesktop : styles.stepCardMobile,
        { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
      ]}
    >
      <View style={[styles.stepNumber, { backgroundColor: color.bg }]}>
        <ThemedText type="body" style={{ color: color.icon, fontWeight: '700' }}>
          {index + 1}
        </ThemedText>
      </View>
      
      <View style={[
        styles.iconContainer, 
        { backgroundColor: `${color.bg}15` },
        isDesktop ? styles.iconContainerDesktop : styles.iconContainerMobile
      ]}>
        {step.icon}
      </View>
      
      <View style={isDesktop ? styles.textContainerDesktop : styles.textContainerMobile}>
        <ThemedText type="h4" style={styles.stepTitle}>
          {step.title}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 4 }}>
          {step.description}
        </ThemedText>
      </View>
      
      <Pressable 
        style={[styles.ctaButton, { backgroundColor: color.bg }]}
        onPress={step.onPress}
      >
        <ThemedText type="small" style={{ color: color.icon, fontWeight: '600' }}>
          {step.cta}
        </ThemedText>
        <ChevronRightIcon size={14} color={color.icon} />
      </Pressable>
    </AnimatedPressable>
  );
}

export function OnboardingGuide({ onAddTool, onBrowse, onLearnMore }: OnboardingGuideProps) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const steps: OnboardingStep[] = [
    {
      icon: <ToolIcon size={28} color={Colors.light.primary} />,
      title: 'Dodaj alat',
      description: 'Fotografisi alat koji ti stoji u garazi i postavi oglas za 2 minuta.',
      cta: 'Dodaj',
      onPress: onAddTool,
    },
    {
      icon: <CalendarIcon size={28} color={Colors.light.cta} />,
      title: 'Iznajmi',
      description: 'Pronadi alat u blizini i rezervisi za dane koji ti odgovaraju.',
      cta: 'Pretrazi',
      onPress: onBrowse,
    },
    {
      icon: <BanknoteIcon size={28} color={Colors.light.success} />,
      title: 'Zaradi',
      description: 'Zaradi do 500 EUR mesecno od alata koji ti ne koristi.',
      cta: 'Saznaj vise',
      onPress: onLearnMore,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <ThemedText type="h3">Kako funkcionise?</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          3 jednostavna koraka
        </ThemedText>
      </View>
      
      <View style={[styles.stepsContainer, isDesktop ? styles.stepsRow : styles.stepsColumn]}>
        {steps.map((step, index) => (
          <StepCard
            key={index}
            step={step}
            index={index}
            isDesktop={isDesktop}
            theme={theme}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing['2xl'],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  stepsContainer: {
    gap: Spacing.md,
  },
  stepsRow: {
    flexDirection: 'row',
  },
  stepsColumn: {
    flexDirection: 'column',
  },
  stepCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    position: 'relative',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      },
    }),
  },
  stepCardDesktop: {
    flex: 1,
    alignItems: 'center',
  },
  stepCardMobile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    position: 'absolute',
    top: -10,
    left: Spacing.md,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerDesktop: {
    width: 64,
    height: 64,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  iconContainerMobile: {
    width: 48,
    height: 48,
    marginRight: Spacing.md,
  },
  textContainerDesktop: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  textContainerMobile: {
    flex: 1,
  },
  stepTitle: {
    fontWeight: '600',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
});
