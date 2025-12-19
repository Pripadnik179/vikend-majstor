import React, { useState } from 'react';
import { View, StyleSheet, Modal, Pressable, ScrollView, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XIcon, StarIcon, MapPinIcon } from '@/components/icons/TabBarIcons';
import { ThemedText } from './ThemedText';
import { Button } from './Button';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';

export interface FilterState {
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number | null;
  maxDeposit: number | null;
  city: string;
  maxDistance: number | null;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
}

const RATING_OPTIONS = [
  { label: 'Sve', value: null },
  { label: '4+', value: 4 },
  { label: '3+', value: 3 },
  { label: '2+', value: 2 },
];

const DISTANCE_OPTIONS = [
  { label: 'Sve', value: null },
  { label: '1 km', value: 1 },
  { label: '2 km', value: 2 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '15 km', value: 15 },
  { label: '20 km', value: 20 },
  { label: '50 km', value: 50 },
  { label: '100 km', value: 100 },
];

export function FilterModal({ visible, onClose, filters, onApply }: FilterModalProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      minPrice: null,
      maxPrice: null,
      minRating: null,
      maxDeposit: null,
      city: '',
      maxDistance: null,
    };
    setLocalFilters(resetFilters);
  };

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const parseNumber = (text: string): number | null => {
    const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? null : num;
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.backgroundDefault,
      borderColor: theme.border,
      color: theme.text,
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <XIcon size={24} color={theme.text} />
          </Pressable>
          <ThemedText type="h4" style={styles.title}>Filteri</ThemedText>
          <Pressable onPress={handleReset}>
            <ThemedText type="link">Resetuj</ThemedText>
          </Pressable>
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        >
          <View style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>Cena (RSD/dan)</ThemedText>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
                  Minimum
                </ThemedText>
                <TextInput
                  style={inputStyle}
                  placeholder="0"
                  placeholderTextColor={theme.textTertiary}
                  value={localFilters.minPrice?.toString() || ''}
                  onChangeText={(text) => updateFilter('minPrice', parseNumber(text))}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfInput}>
                <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
                  Maksimum
                </ThemedText>
                <TextInput
                  style={inputStyle}
                  placeholder="10000"
                  placeholderTextColor={theme.textTertiary}
                  value={localFilters.maxPrice?.toString() || ''}
                  onChangeText={(text) => updateFilter('maxPrice', parseNumber(text))}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>Maksimalan depozit (RSD)</ThemedText>
            <TextInput
              style={inputStyle}
              placeholder="Bez limita"
              placeholderTextColor={theme.textTertiary}
              value={localFilters.maxDeposit?.toString() || ''}
              onChangeText={(text) => updateFilter('maxDeposit', parseNumber(text))}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>Minimalna ocena</ThemedText>
            <View style={styles.ratingRow}>
              {RATING_OPTIONS.map((option) => (
                <Pressable
                  key={option.label}
                  style={[
                    styles.ratingButton,
                    {
                      backgroundColor: localFilters.minRating === option.value 
                        ? theme.primary 
                        : theme.backgroundDefault,
                      borderColor: localFilters.minRating === option.value 
                        ? theme.primary 
                        : theme.border,
                    },
                  ]}
                  onPress={() => updateFilter('minRating', option.value)}
                >
                  {option.value ? (
                    <View style={styles.ratingContent}>
                      <StarIcon 
                        size={16} 
                        color={localFilters.minRating === option.value ? '#FFFFFF' : theme.accent} 
                      />
                      <ThemedText
                        type="body"
                        style={{
                          color: localFilters.minRating === option.value ? '#FFFFFF' : theme.text,
                          marginLeft: Spacing.xs,
                        }}
                      >
                        {option.label}
                      </ThemedText>
                    </View>
                  ) : (
                    <ThemedText
                      type="body"
                      style={{
                        color: localFilters.minRating === option.value ? '#FFFFFF' : theme.text,
                      }}
                    >
                      {option.label}
                    </ThemedText>
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>Grad</ThemedText>
            <TextInput
              style={inputStyle}
              placeholder="Bilo koji grad"
              placeholderTextColor={theme.textTertiary}
              value={localFilters.city}
              onChangeText={(text) => updateFilter('city', text)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPinIcon size={20} color={theme.primary} />
              <ThemedText type="h4" style={[styles.sectionTitle, { marginLeft: Spacing.sm, marginBottom: 0 }]}>
                Udaljenost od mene
              </ThemedText>
            </View>
            <ThemedText type="small" style={[styles.distanceHint, { color: theme.textSecondary }]}>
              Potrebna je GPS lokacija za ovaj filter
            </ThemedText>
            <View style={styles.distanceRow}>
              {DISTANCE_OPTIONS.map((option) => (
                <Pressable
                  key={option.label}
                  style={[
                    styles.distanceButton,
                    {
                      backgroundColor: localFilters.maxDistance === option.value 
                        ? theme.primary 
                        : theme.backgroundDefault,
                      borderColor: localFilters.maxDistance === option.value 
                        ? theme.primary 
                        : theme.border,
                    },
                  ]}
                  onPress={() => updateFilter('maxDistance', option.value)}
                >
                  <ThemedText
                    type="small"
                    style={{
                      color: localFilters.maxDistance === option.value ? '#FFFFFF' : theme.text,
                      fontWeight: localFilters.maxDistance === option.value ? '600' : '400',
                    }}
                  >
                    {option.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
          <Button onPress={handleApply}>Primeni filtere</Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  input: {
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  ratingButton: {
    flex: 1,
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  distanceHint: {
    marginBottom: Spacing.md,
  },
  distanceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  distanceButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
});
