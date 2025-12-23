import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Pressable, FlatList, ViewToken } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/Button';
import { useTheme } from '@/hooks/useTheme';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { ToolIcon, CalendarIcon, DollarSignIcon, ChevronRightIcon, CheckIcon } from '@/components/icons/TabBarIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const ONBOARDING_COMPLETE_KEY = '@vikendmajstor_onboarding_complete';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: '1',
    title: 'Dodaj alat',
    description: 'Fotografiši i objavi alat koji stoji neiskorišćen. Traje manje od 3 minuta!',
    icon: <ToolIcon size={80} color={Colors.light.primary} />,
    color: Colors.light.primary,
  },
  {
    id: '2',
    title: 'Iznajmi susedima',
    description: 'Komsije u tvojoj blizini će pronaći tvoj alat kada im zatreba. Ti odlučuješ kome daješ.',
    icon: <CalendarIcon size={80} color={Colors.light.cta} />,
    color: Colors.light.cta,
  },
  {
    id: '3',
    title: 'Zaradi novac',
    description: 'Prosečna zarada je 8.000 din/mesečno od samo 3 alata. Bez provizije, novac ide direktno tebi!',
    icon: <DollarSignIcon size={80} color={Colors.light.success} />,
    color: Colors.light.success,
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      onComplete();
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      onComplete();
    }
  };

  const handleNext = () => {
    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderStep = ({ item, index }: { item: OnboardingStep; index: number }) => {
    return (
      <View style={[styles.stepContainer, { width: SCREEN_WIDTH }]}>
        <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
          {item.icon}
        </View>
        <View style={styles.stepNumber}>
          <View style={[styles.stepBadge, { backgroundColor: item.color }]}>
            <ThemedText type="body" style={styles.stepBadgeText}>
              Korak {index + 1}
            </ThemedText>
          </View>
        </View>
        <ThemedText type="h1" style={styles.stepTitle}>
          {item.title}
        </ThemedText>
        <ThemedText type="body" style={[styles.stepDescription, { color: theme.textSecondary }]}>
          {item.description}
        </ThemedText>
      </View>
    );
  };

  const isLastStep = currentIndex === ONBOARDING_STEPS.length - 1;

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable onPress={handleSkip} style={styles.skipButton}>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            Preskoči
          </ThemedText>
        </Pressable>
      </View>

      <FlatList
        ref={flatListRef}
        data={ONBOARDING_STEPS}
        renderItem={renderStep}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
        scrollEventThrottle={16}
        onScroll={(e) => {
          scrollX.value = e.nativeEvent.contentOffset.x;
        }}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {ONBOARDING_STEPS.map((step, index) => {
            const isActive = index === currentIndex;
            return (
              <View
                key={step.id}
                style={[
                  styles.paginationDot,
                  {
                    backgroundColor: isActive ? step.color : theme.border,
                    width: isActive ? 24 : 8,
                  },
                ]}
              />
            );
          })}
        </View>

        <Button onPress={handleNext} style={styles.nextButton}>
          <View style={styles.buttonContent}>
            <ThemedText type="body" style={styles.buttonText}>
              {isLastStep ? 'Počni da zarađuješ' : 'Dalje'}
            </ThemedText>
            {isLastStep ? (
              <CheckIcon size={20} color="#FFFFFF" />
            ) : (
              <ChevronRightIcon size={20} color="#FFFFFF" />
            )}
          </View>
        </Button>

        <View style={styles.trustRow}>
          <ThemedText type="small" style={{ color: theme.textTertiary, textAlign: 'center' }}>
            Pridruži se 500+ korisnika koji već zarađuju
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  skipButton: {
    padding: Spacing.sm,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['3xl'],
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['2xl'],
  },
  stepNumber: {
    marginBottom: Spacing.lg,
  },
  stepBadge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  stepBadgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  stepTitle: {
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  stepDescription: {
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    marginBottom: Spacing.lg,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  trustRow: {
    alignItems: 'center',
  },
});
