import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, TextInput, Platform, useWindowDimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { MapPinIcon, FilterIcon, SearchIcon, ChevronDownIcon, XCircleIcon } from '@/components/icons/TabBarIcons';

interface FilterBarProps {
  onFilterChange?: (filters: FilterState) => void;
  categories?: string[];
  cities?: string[];
}

interface FilterState {
  city: string | null;
  category: string | null;
  priceRange: string | null;
  availableToday: boolean;
}

export function FilterBar({ onFilterChange, categories = [], cities = [] }: FilterBarProps) {
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  
  const [filters, setFilters] = useState<FilterState>({
    city: null,
    category: null,
    priceRange: null,
    availableToday: false,
  });

  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);

  const defaultCities = ['Beograd', 'Novi Sad', 'Nis', 'Kragujevac', 'Subotica', 'Zrenjanin'];
  const defaultCategories = ['Elektricni alati', 'Gradjevinski', 'Bastenska oprema', 'Rucni alati'];
  const priceRanges = ['Do 500 RSD', '500-1000 RSD', '1000-2000 RSD', 'Preko 2000 RSD'];

  const cityList = cities.length > 0 ? cities : defaultCities;
  const categoryList = categories.length > 0 ? categories : defaultCategories;

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { city: null, category: null, priceRange: null, availableToday: false };
    setFilters(clearedFilters);
    onFilterChange?.(clearedFilters);
  };

  const hasActiveFilters = filters.city || filters.category || filters.priceRange || filters.availableToday;

  const FilterButton = ({ 
    label, 
    value, 
    onPress, 
    isActive 
  }: { 
    label: string; 
    value: string | null; 
    onPress: () => void; 
    isActive: boolean;
  }) => (
    <Pressable
      style={[
        styles.filterButton,
        { 
          backgroundColor: isActive ? Colors.light.primary + '20' : theme.backgroundDefault,
          borderColor: isActive ? Colors.light.primary : theme.border,
        }
      ]}
      onPress={onPress}
    >
      <ThemedText 
        type="small" 
        style={{ 
          color: isActive ? Colors.light.primary : theme.text,
          fontWeight: isActive ? '600' : '400',
        }}
      >
        {value || label}
      </ThemedText>
      <ChevronDownIcon size={14} color={isActive ? Colors.light.primary : theme.textTertiary} />
    </Pressable>
  );

  const Dropdown = ({ 
    items, 
    onSelect, 
    onClose 
  }: { 
    items: string[]; 
    onSelect: (item: string) => void; 
    onClose: () => void;
  }) => (
    <View style={[styles.dropdown, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
      {items.map((item, index) => (
        <Pressable
          key={index}
          style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
          onPress={() => {
            onSelect(item);
            onClose();
          }}
        >
          <ThemedText type="body">{item}</ThemedText>
        </Pressable>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.filterRow}>
          <View style={styles.filterGroup}>
            <FilterButton
              label="Grad"
              value={filters.city}
              onPress={() => setShowCityDropdown(!showCityDropdown)}
              isActive={!!filters.city}
            />
            {showCityDropdown ? (
              <Dropdown
                items={cityList}
                onSelect={(city) => updateFilter('city', city)}
                onClose={() => setShowCityDropdown(false)}
              />
            ) : null}
          </View>

          <View style={styles.filterGroup}>
            <FilterButton
              label="Kategorija"
              value={filters.category}
              onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
              isActive={!!filters.category}
            />
            {showCategoryDropdown ? (
              <Dropdown
                items={categoryList}
                onSelect={(cat) => updateFilter('category', cat)}
                onClose={() => setShowCategoryDropdown(false)}
              />
            ) : null}
          </View>

          <View style={styles.filterGroup}>
            <FilterButton
              label="Cena"
              value={filters.priceRange}
              onPress={() => setShowPriceDropdown(!showPriceDropdown)}
              isActive={!!filters.priceRange}
            />
            {showPriceDropdown ? (
              <Dropdown
                items={priceRanges}
                onSelect={(price) => updateFilter('priceRange', price)}
                onClose={() => setShowPriceDropdown(false)}
              />
            ) : null}
          </View>

          <Pressable
            style={[
              styles.toggleButton,
              { 
                backgroundColor: filters.availableToday ? Colors.light.success + '20' : theme.backgroundDefault,
                borderColor: filters.availableToday ? Colors.light.success : theme.border,
              }
            ]}
            onPress={() => updateFilter('availableToday', !filters.availableToday)}
          >
            <ThemedText 
              type="small" 
              style={{ 
                color: filters.availableToday ? Colors.light.success : theme.text,
                fontWeight: filters.availableToday ? '600' : '400',
              }}
            >
              Dostupno danas
            </ThemedText>
          </Pressable>

          {hasActiveFilters ? (
            <Pressable style={styles.clearButton} onPress={clearFilters}>
              <XCircleIcon size={16} color={theme.error} />
              <ThemedText type="small" style={{ color: theme.error, marginLeft: 4 }}>
                Obriši
              </ThemedText>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  filterGroup: {
    position: 'relative',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  toggleButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    minWidth: 150,
    marginTop: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    zIndex: 1000,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
      },
    }),
  },
  dropdownItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
});
