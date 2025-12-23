import React from 'react';
import { ScrollView, StyleSheet, Pressable, Platform, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, CATEGORY_COLORS, CATEGORY_ICONS } from '@/constants/theme';

interface Category {
  id: string;
  label: string;
  icon: string;
  count?: number;
}

interface CategoryFilterProps {
  categories: Category[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  showCounts?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function CategoryChip({ 
  category, 
  isSelected, 
  onPress, 
  showCount,
  theme 
}: { 
  category: Category; 
  isSelected: boolean; 
  onPress: () => void; 
  showCount?: boolean;
  theme: any;
}) {
  const scale = useSharedValue(1);
  const colors = CATEGORY_COLORS[category.id] || { 
    primary: theme.primary, 
    secondary: theme.primaryLight, 
    accent: theme.primaryPressed 
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        animatedStyle,
        styles.chip,
        {
          backgroundColor: isSelected ? colors.primary : theme.backgroundDefault,
          borderColor: isSelected ? colors.primary : theme.border,
        },
      ]}
      accessibilityLabel={`${category.label}${category.count ? `, ${category.count} alata` : ''}`}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      <DynamicIcon 
        name={category.icon} 
        size={16} 
        color={isSelected ? '#FFFFFF' : colors.primary} 
      />
      <ThemedText 
        type="small" 
        style={[
          styles.chipText, 
          { color: isSelected ? '#FFFFFF' : theme.text }
        ]}
      >
        {category.label}
      </ThemedText>
      {showCount && category.count !== undefined && category.count > 0 && (
        <View style={[
          styles.countBadge,
          { 
            backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : colors.secondary 
          }
        ]}>
          <ThemedText 
            type="small" 
            style={[
              styles.countText,
              { color: isSelected ? '#FFFFFF' : colors.primary }
            ]}
          >
            {category.count}
          </ThemedText>
        </View>
      )}
    </AnimatedPressable>
  );
}

export function CategoryFilter({ categories, selected, onSelect, showCounts = false }: CategoryFilterProps) {
  const { theme } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <CategoryChip
        category={{ id: 'all', label: 'Sve', icon: 'grid' }}
        isSelected={!selected}
        onPress={() => onSelect(null)}
        theme={theme}
      />

      {categories.map((category) => (
        <CategoryChip
          key={category.id}
          category={category}
          isSelected={selected === category.id}
          onPress={() => onSelect(selected === category.id ? null : category.id)}
          showCount={showCounts}
          theme={theme}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    gap: Spacing.xs,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      },
    }),
  },
  chipText: {
    fontWeight: '500',
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginLeft: 2,
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
