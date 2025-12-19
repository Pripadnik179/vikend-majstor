import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ToolIcon } from '@/components/icons/TabBarIcons';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';

const APP_VERSION = '1.0.0';

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const linkItems = [
    { 
      icon: 'file-text', 
      label: 'Politika privatnosti', 
      subtitle: 'Saznajte kako štitimo vaše podatke',
    },
    { 
      icon: 'book', 
      label: 'Uslovi korišćenja', 
      subtitle: 'Pravila korišćenja platforme',
    },
    { 
      icon: 'mail', 
      label: 'Kontakt', 
      subtitle: 'podrska@vikendmajstor.rs',
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        padding: Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
      }}
    >
      <Card style={styles.headerCard}>
        <View style={[styles.logoContainer, { backgroundColor: theme.primary }]}>
          <ToolIcon size={48} color="#000" />
        </View>
        <ThemedText type="h2" style={styles.appName}>VikendMajstor</ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: 'center' }}>
          Platforma za iznajmljivanje alata i opreme
        </ThemedText>
        <View style={[styles.versionBadge, { backgroundColor: theme.backgroundSecondary }]}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Verzija {APP_VERSION}
          </ThemedText>
        </View>
      </Card>

      <Card style={styles.descriptionCard}>
        <ThemedText type="body" style={{ lineHeight: 24, color: theme.textSecondary }}>
          VikendMajstor povezuje ljude koji imaju alate i opremu sa onima kojima su potrebni. 
          Umesto da kupujete alat koji ćete koristiti jednom, iznajmite ga od komšije po povoljnoj ceni.
        </ThemedText>
      </Card>

      <ThemedText type="h4" style={styles.sectionTitle}>Pravne informacije</ThemedText>

      {linkItems.map((item, index) => (
        <View
          key={item.label}
          style={[
            styles.linkItem,
            { 
              backgroundColor: theme.backgroundSecondary,
              borderBottomWidth: index < linkItems.length - 1 ? 1 : 0,
              borderBottomColor: theme.border,
            },
          ]}
        >
          <View style={styles.linkItemLeft}>
            <DynamicIcon name={item.icon} size={20} color={theme.primary} />
            <View style={{ marginLeft: Spacing.md }}>
              <ThemedText type="body">{item.label}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>{item.subtitle}</ThemedText>
            </View>
          </View>
        </View>
      ))}

      <View style={styles.footer}>
        <ThemedText type="small" style={{ color: theme.textTertiary, textAlign: 'center' }}>
          2024 VikendMajstor. Sva prava zadržana.
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textTertiary, textAlign: 'center', marginTop: Spacing.xs }}>
          Napravljeno sa ljubavlju u Srbiji
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    alignItems: 'center',
    padding: Spacing['2xl'],
    marginBottom: Spacing.lg,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  appName: {
    marginBottom: Spacing.xs,
  },
  versionBadge: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  descriptionCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  linkItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    marginTop: Spacing['2xl'],
    paddingTop: Spacing.xl,
  },
});
