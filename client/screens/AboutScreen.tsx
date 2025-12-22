import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ToolIcon, ChevronRightIcon } from '@/components/icons/TabBarIcons';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout, MAX_CONTENT_WIDTH } from '@/hooks/useWebLayout';
import { Spacing, BorderRadius } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

const APP_VERSION = '1.0.0';

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { isDesktop } = useWebLayout();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleContactPress = () => {
    Linking.openURL('mailto:podrska@vikendmajstor.rs');
  };

  const linkItems = [
    { 
      icon: 'shield', 
      label: 'Politika privatnosti', 
      subtitle: 'Saznajte kako stitimo vase podatke',
      onPress: () => navigation.navigate('Legal', { section: 'privacy' }),
    },
    { 
      icon: 'file-text', 
      label: 'Uslovi koriscenja', 
      subtitle: 'Pravila koriscenja platforme',
      onPress: () => navigation.navigate('Legal', { section: 'terms' }),
    },
    { 
      icon: 'mail', 
      label: 'Kontakt', 
      subtitle: 'podrska@vikendmajstor.rs',
      onPress: handleContactPress,
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        padding: Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
        alignItems: isDesktop ? 'center' : undefined,
      }}
    >
      <View style={{ width: '100%', maxWidth: MAX_CONTENT_WIDTH }}>
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
          Umesto da kupujete alat koji cete koristiti jednom, iznajmite ga od komsije po povoljnoj ceni.
        </ThemedText>
      </Card>

      <Card style={StyleSheet.flatten([styles.ecoCard, { borderColor: theme.success + '50' }])}>
        <View style={styles.ecoHeader}>
          <View style={[styles.ecoIconContainer, { backgroundColor: theme.success + '20' }]}>
            <DynamicIcon name="globe" size={24} color={theme.success} />
          </View>
          <ThemedText type="h4" style={{ marginLeft: Spacing.md, color: theme.success }}>
            Ekoloska poruka
          </ThemedText>
        </View>
        <ThemedText type="body" style={[styles.ecoIntro, { color: theme.text }]}>
          Koriscenjem VikendMajstora aktivno ucestvujes u zastiti zivotne sredine:
        </ThemedText>
        <View style={styles.ecoPoints}>
          <View style={styles.ecoPoint}>
            <View style={[styles.ecoBullet, { backgroundColor: theme.success }]} />
            <ThemedText type="body" style={{ color: theme.textSecondary, flex: 1 }}>
              Manje kupovine = manje proizvodnje = manje otpada
            </ThemedText>
          </View>
          <View style={styles.ecoPoint}>
            <View style={[styles.ecoBullet, { backgroundColor: theme.success }]} />
            <ThemedText type="body" style={{ color: theme.textSecondary, flex: 1 }}>
              Deljenje resursa = racionalno koriscenje energije i materijala
            </ThemedText>
          </View>
          <View style={styles.ecoPoint}>
            <View style={[styles.ecoBullet, { backgroundColor: theme.success }]} />
            <ThemedText type="body" style={{ color: theme.textSecondary, flex: 1 }}>
              Zajednica koja razmenjuje = zajednica koja stedi i cuva planetu
            </ThemedText>
          </View>
        </View>
        <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md, lineHeight: 22 }}>
          Nas cilj je da pokazemo da odrzivost moze biti prakticna i korisna — za tvoje projekte, za tvoje komsije i za prirodu.
        </ThemedText>
      </Card>

      <ThemedText type="h4" style={styles.sectionTitle}>Pravne informacije</ThemedText>

      {linkItems.map((item, index) => (
        <Pressable
          key={item.label}
          onPress={item.onPress}
          style={({ pressed }) => [
            styles.linkItem,
            { 
              backgroundColor: pressed ? theme.backgroundSecondary : theme.backgroundDefault,
              borderBottomWidth: index < linkItems.length - 1 ? 1 : 0,
              borderBottomColor: theme.border,
            },
          ]}
        >
          <View style={styles.linkItemLeft}>
            <DynamicIcon name={item.icon} size={20} color={theme.primary} />
            <View style={{ marginLeft: Spacing.md, flex: 1 }}>
              <ThemedText type="body">{item.label}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>{item.subtitle}</ThemedText>
            </View>
          </View>
          <ChevronRightIcon size={20} color={theme.textTertiary} />
        </Pressable>
      ))}

      <View style={styles.footer}>
        <ThemedText type="small" style={{ color: theme.textTertiary, textAlign: 'center' }}>
          2024 VikendMajstor. Sva prava zadrzana.
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textTertiary, textAlign: 'center', marginTop: Spacing.xs }}>
          Napravljeno sa ljubavlju u Srbiji
        </ThemedText>
      </View>
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
    marginBottom: Spacing.lg,
  },
  ecoCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
  },
  ecoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  ecoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ecoIntro: {
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  ecoPoints: {
    gap: Spacing.sm,
  },
  ecoPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  ecoBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
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
    flex: 1,
  },
  footer: {
    marginTop: Spacing['2xl'],
    paddingTop: Spacing.xl,
  },
});
