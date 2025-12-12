import React, { useState, useRef, useEffect, memo } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';

interface SearchBarProps {
  initialValue?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

function SearchBarComponent({ 
  initialValue = '', 
  onSearch, 
  placeholder = 'Pretražite alate...', 
  debounceMs = 300 
}: SearchBarProps) {
  const { theme } = useTheme();
  const [inputValue, setInputValue] = useState(initialValue);
  const inputRef = useRef<TextInput>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      onSearch(inputValue);
    }, debounceMs);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [inputValue, debounceMs]);

  const handleClear = () => {
    setInputValue('');
    onSearch('');
    inputRef.current?.focus();
  };

  return (
    <View style={[styles.searchBar, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
      <Feather name="search" size={20} color={theme.textSecondary} />
      <TextInput
        ref={inputRef}
        style={[styles.searchInput, { color: theme.text }]}
        placeholder={placeholder}
        placeholderTextColor={theme.textTertiary}
        value={inputValue}
        onChangeText={setInputValue}
        maxLength={40}
        autoCorrect={false}
        autoCapitalize="none"
        blurOnSubmit={false}
        returnKeyType="search"
        keyboardType="default"
      />
      <Pressable 
        onPress={handleClear}
        style={{ opacity: inputValue ? 1 : 0 }}
        hitSlop={8}
        disabled={!inputValue}
      >
        <Feather name="x" size={20} color={theme.textSecondary} />
      </Pressable>
    </View>
  );
}

export const SearchBar = memo(SearchBarComponent);

const styles = StyleSheet.create({
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    height: 44,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
});
