import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/query-client';
import { Spacing, BorderRadius } from '@/constants/theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [district, setDistrict] = useState(user?.district || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Greška', 'Ime je obavezno');
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest('PUT', '/api/users/me', {
        name: name.trim(),
        phone: phone.trim() || null,
        city: city.trim() || null,
        district: district.trim() || null,
      });

      await refreshUser();
      Alert.alert('Uspešno', 'Profil je ažuriran');
    } catch (error: any) {
      Alert.alert('Greška', error.message || 'Došlo je do greške');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text },
  ];

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + Spacing.xl }]}
    >
      <View style={styles.section}>
        <ThemedText type="h4" style={styles.label}>Ime i prezime *</ThemedText>
        <TextInput
          style={inputStyle}
          placeholder="Vaše ime"
          placeholderTextColor={theme.textTertiary}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.label}>Email</ThemedText>
        <TextInput
          style={[inputStyle, { opacity: 0.6 }]}
          value={user?.email || ''}
          editable={false}
        />
        <ThemedText type="small" style={{ color: theme.textTertiary, marginTop: Spacing.xs }}>
          Email se ne može promeniti
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.label}>Telefon</ThemedText>
        <TextInput
          style={inputStyle}
          placeholder="+381 6X XXX XXXX"
          placeholderTextColor={theme.textTertiary}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.section, { flex: 1, marginRight: Spacing.md }]}>
          <ThemedText type="h4" style={styles.label}>Grad</ThemedText>
          <TextInput
            style={inputStyle}
            placeholder="Beograd"
            placeholderTextColor={theme.textTertiary}
            value={city}
            onChangeText={setCity}
          />
        </View>
        <View style={[styles.section, { flex: 1 }]}>
          <ThemedText type="h4" style={styles.label}>Deo grada</ThemedText>
          <TextInput
            style={inputStyle}
            placeholder="Vračar"
            placeholderTextColor={theme.textTertiary}
            value={district}
            onChangeText={setDistrict}
          />
        </View>
      </View>

      <Button onPress={handleSave} disabled={isLoading} style={styles.saveButton}>
        {isLoading ? <ActivityIndicator color="#FFFFFF" /> : 'Sačuvaj promene'}
      </Button>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.sm,
  },
  input: {
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  saveButton: {
    marginTop: Spacing.xl,
  },
});
