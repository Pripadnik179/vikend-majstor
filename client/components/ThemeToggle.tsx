import React, { useState, useCallback } from 'react';
import { View, Pressable, StyleSheet, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { ThemedText } from '@/components/ThemedText';
import { BorderRadius, Spacing } from '@/constants/theme';
import type { ThemeMode } from '@/contexts/ThemeContext';

interface ThemeOption {
  mode: ThemeMode;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}

const themeOptions: ThemeOption[] = [
  { mode: 'auto', label: 'Automatski', icon: 'settings' },
  { mode: 'light', label: 'Svetli', icon: 'sun' },
  { mode: 'dark', label: 'Tamni', icon: 'moon' },
];

export function ThemeToggle() {
  const { theme, mode, setMode, isDark } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getCurrentIcon = (): keyof typeof Feather.glyphMap => {
    if (mode === 'auto') return 'settings';
    return isDark ? 'moon' : 'sun';
  };

  const handleSelectMode = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
    setIsMenuOpen(false);
  }, [setMode]);

  return (
    <>
      <Pressable
        onPress={() => setIsMenuOpen(true)}
        style={({ pressed }) => [
          styles.toggleButton,
          { opacity: pressed ? 0.7 : 1 },
        ]}
        accessibilityLabel="Promeni temu"
        accessibilityRole="button"
      >
        <Feather name={getCurrentIcon()} size={22} color={theme.text} />
      </Pressable>

      <Modal
        visible={isMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setIsMenuOpen(false)}
        >
          <View style={[styles.menu, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText style={styles.menuTitle}>Izgled</ThemedText>
            {themeOptions.map((option) => (
              <Pressable
                key={option.mode}
                onPress={() => handleSelectMode(option.mode)}
                style={({ pressed }) => [
                  styles.menuItem,
                  { 
                    backgroundColor: mode === option.mode ? theme.primaryLight : 'transparent',
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Feather 
                  name={option.icon} 
                  size={20} 
                  color={mode === option.mode ? theme.primary : theme.text} 
                />
                <ThemedText 
                  style={[
                    styles.menuItemText,
                    { color: mode === option.mode ? theme.primary : theme.text },
                  ]}
                >
                  {option.label}
                </ThemedText>
                {mode === option.mode && (
                  <Feather name="check" size={18} color={theme.primary} />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  toggleButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    minWidth: 200,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
  },
});
