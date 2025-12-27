import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { ToolIcon, UserIcon, MapPinIcon, StarIcon, ChevronRightIcon } from '@/components/icons/TabBarIcons';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout, MAX_CONTENT_WIDTH } from '@/hooks/useWebLayout';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

interface Stats {
  totalUsers: number;
  totalItems: number;
  avgRating: number;
}

export default function ONamaScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { isDesktop } = useWebLayout();

  const { data: stats } = useQuery<Stats>({
    queryKey: ['/api/stats/public'],
    staleTime: 60000,
  });

  const displayStats = [
    { 
      icon: <UserIcon size={28} color={theme.primary} />, 
      value: stats?.totalUsers ? `${stats.totalUsers}+` : '500+', 
      label: 'Aktivnih korisnika',
      color: theme.primary,
    },
    { 
      icon: <ToolIcon size={28} color={theme.cta} />, 
      value: stats?.totalItems ? `${stats.totalItems}+` : '2000+', 
      label: 'Alata u ponudi',
      color: theme.cta,
    },
    { 
      icon: <StarIcon size={28} color={theme.warning} />, 
      value: stats?.avgRating ? stats.avgRating.toFixed(1) : '4.8', 
      label: 'Prosecna ocena',
      color: theme.warning,
    },
    { 
      icon: <MapPinIcon size={28} color={theme.success} />, 
      value: '15+', 
      label: 'Gradova u Srbiji',
      color: theme.success,
    },
  ];

  const cities = [
    'Beograd', 'Nis', 'Novi Sad', 'Kragujevac', 'Subotica', 
    'Leskovac', 'Cacak', 'Kraljevo', 'Pancevo', 'Smederevo',
    'Valjevo', 'Krusevac', 'Zrenjanin', 'Sabac', 'Uzice'
  ];

  const values = [
    {
      icon: 'heart',
      title: 'Zajednica',
      description: 'Gradimo lokalnu zajednicu gde se komsije medusobno pomazu i dele resurse.',
    },
    {
      icon: 'globe',
      title: 'Odrzivost',
      description: 'Deljenje alata smanjuje potrosnju, otpad i pozitivno utice na zivotnu sredinu.',
    },
    {
      icon: 'shield',
      title: 'Poverenje',
      description: 'Transparentnost, verifikacija korisnika i sistem ocena garantuju sigurnost.',
    },
    {
      icon: 'dollar-sign',
      title: 'Bez provizije',
      description: 'Ceo iznos ide direktno izmedju korisnika. VikendMajstor ne uzima procenat.',
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
        <Card style={styles.heroCard}>
          <View style={[styles.logoContainer, { backgroundColor: theme.primary }]}>
            <ToolIcon size={48} color="#000" />
          </View>
          <ThemedText type="h2" style={styles.heroTitle}>VikendMajstor</ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: 'center' }}>
            Platforma za iznajmljivanje alata koja povezuje komsije i stedi planetu kroz deljenje resursa.
          </ThemedText>
        </Card>

        <ThemedText type="h3" style={styles.sectionTitle}>Nasa misija</ThemedText>
        <Card style={styles.missionCard}>
          <ThemedText type="body" style={{ lineHeight: 24, color: theme.textSecondary }}>
            Verujemo da svaki alat zasluzuje da bude koriscen, ne da skuplja prasinu u garazi. 
            VikendMajstor postoji da poveze ljude koji imaju alate sa onima kojima su potrebni — 
            jednostavno, lokalno i bez provizije.
          </ThemedText>
          <ThemedText type="body" style={{ lineHeight: 24, color: theme.textSecondary, marginTop: Spacing.md }}>
            Nas cilj je izgraditi zajednicu gde komsije pomazu jedni drugima, stede novac i 
            doprinose odrzivijoj buducnosti.
          </ThemedText>
        </Card>

        <ThemedText type="h3" style={styles.sectionTitle}>Statistike</ThemedText>
        <View style={styles.statsGrid}>
          {displayStats.map((stat, index) => (
            <Card key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
                {stat.icon}
              </View>
              <ThemedText type="h3" style={{ marginTop: Spacing.sm }}>{stat.value}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>{stat.label}</ThemedText>
            </Card>
          ))}
        </View>

        <ThemedText type="h3" style={styles.sectionTitle}>Nase vrednosti</ThemedText>
        {values.map((value, index) => (
          <Card key={index} style={styles.valueCard}>
            <View style={styles.valueRow}>
              <View style={[styles.valueIcon, { backgroundColor: theme.primary + '15' }]}>
                <DynamicIcon name={value.icon} size={24} color={theme.primary} />
              </View>
              <View style={styles.valueContent}>
                <ThemedText type="body" style={{ fontWeight: '600' }}>{value.title}</ThemedText>
                <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                  {value.description}
                </ThemedText>
              </View>
            </View>
          </Card>
        ))}

        <ThemedText type="h3" style={styles.sectionTitle}>Dostupni gradovi</ThemedText>
        <Card style={styles.citiesCard}>
          <View style={styles.citiesGrid}>
            {cities.map((city, index) => (
              <View key={index} style={[styles.cityBadge, { backgroundColor: theme.primary + '10' }]}>
                <MapPinIcon size={14} color={theme.primary} />
                <ThemedText type="small" style={{ marginLeft: 4, color: theme.text }}>{city}</ThemedText>
              </View>
            ))}
          </View>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.md, textAlign: 'center' }}>
            I jos mnogo drugih gradova! Aplikacija automatski prikazuje alate u vasoj blizini.
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
          <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md, lineHeight: 22 }}>
            Koriscenjem VikendMajstora aktivno ucestvujes u zastiti zivotne sredine. Manje kupovine 
            znaci manje proizvodnje i manje otpada. Zajednica koja razmenjuje je zajednica koja 
            stedi i cuva planetu.
          </ThemedText>
        </Card>

        <Card style={styles.contactCard}>
          <ThemedText type="h4" style={{ marginBottom: Spacing.sm }}>Imate pitanja?</ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary, marginBottom: Spacing.md }}>
            Kontaktirajte nas na podrska@vikendmajstor.rs
          </ThemedText>
          <Pressable 
            style={[styles.contactButton, { backgroundColor: theme.primary }]}
            onPress={() => Linking.openURL('mailto:podrska@vikendmajstor.rs')}
          >
            <ThemedText style={{ color: '#000', fontWeight: '600' }}>Posalji email</ThemedText>
          </Pressable>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  heroTitle: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  missionCard: {
    padding: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  statCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: Spacing.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  valueIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  citiesCard: {
    padding: Spacing.lg,
  },
  citiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  cityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  ecoCard: {
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    borderWidth: 2,
  },
  ecoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ecoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactCard: {
    padding: Spacing.lg,
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  contactButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
});
