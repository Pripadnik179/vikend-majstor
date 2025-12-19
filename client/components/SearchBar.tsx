import React, { useState, useRef, useEffect, memo } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { SearchIcon, XIcon } from '@/components/icons/TabBarIcons';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';

interface SearchBarProps {
  value?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  manualSubmit?: boolean;
}

function SearchBarComponent({ 
  value = '', 
  onSearch, 
  placeholder = 'Pretražite alate...', 
  debounceMs = 300,
  manualSubmit = false
}: SearchBarProps) {
  const { theme } = useTheme();
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<TextInput>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (!isInternalChange.current && value !== inputValue) {
      setInputValue(value);
    }
    isInternalChange.current = false;
  }, [value]);

  useEffect(() => {
    if (manualSubmit) return;
    
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
  }, [inputValue, debounceMs, manualSubmit]);

  const handleChange = (text: string) => {
    isInternalChange.current = true;
    setInputValue(text);
  };

  const handleSubmit = () => {
    onSearch(inputValue);
  };

  const handleClear = () => {
    isInternalChange.current = true;
    setInputValue('');
    onSearch('');
    inputRef.current?.focus();
  };

  return (
    <View style={[styles.searchBar, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
      <Pressable onPress={handleSubmit} hitSlop={8}>
        <SearchIcon size={20} color={theme.textSecondary} />
      </Pressable>
      <TextInput
        ref={inputRef}
        style={[styles.searchInput, { color: theme.text }]}
        placeholder={placeholder}
        placeholderTextColor={theme.textTertiary}
        value={inputValue}
        onChangeText={handleChange}
        onSubmitEditing={handleSubmit}
        maxLength={40}
        autoCorrect={false}
        autoCapitalize="none"
        blurOnSubmit={manualSubmit}
        returnKeyType="search"
        keyboardType="default"
      />
      <Pressable 
        onPress={handleClear}
        style={{ opacity: inputValue ? 1 : 0 }}
        hitSlop={8}
        disabled={!inputValue}
      >
        <XIcon size={20} color={theme.textSecondary} />
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
