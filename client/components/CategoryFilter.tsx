import React from 'react';
import { ScrollView, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';

interface Category {
  id: string;
  label: string;
  icon: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  const { theme } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <Pressable
        style={({ pressed }) => [
          styles.chip,
          {
            backgroundColor: !selected ? theme.primary : theme.backgroundDefault,
            borderColor: !selected ? theme.primary : theme.border,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
        onPress={() => onSelect(null)}
      >
        <Feather name="grid" size={16} color={!selected ? '#FFFFFF' : theme.text} />
        <ThemedText 
          type="small" 
          style={[styles.chipText, { color: !selected ? '#FFFFFF' : theme.text }]}
        >
          Sve
        </ThemedText>
      </Pressable>

      {categories.map((category) => {
        const isSelected = selected === category.id;
        return (
          <Pressable
            key={category.id}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: isSelected ? theme.primary : theme.backgroundDefault,
                borderColor: isSelected ? theme.primary : theme.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={() => onSelect(isSelected ? null : category.id)}
          >
            <Feather 
              name={category.icon as any} 
              size={16} 
              color={isSelected ? '#FFFFFF' : theme.text} 
            />
            <ThemedText 
              type="small" 
              style={[styles.chipText, { color: isSelected ? '#FFFFFF' : theme.text }]}
            >
              {category.label}
            </ThemedText>
          </Pressable>
        );
      })}
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
  },
  chipText: {
    marginLeft: Spacing.xs,
    fontWeight: '500',
  },
});
