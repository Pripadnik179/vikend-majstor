import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CameraIcon, TagIcon, CheckCircleIcon, ChevronRightIcon } from '@/components/icons/TabBarIcons';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout, MAX_CONTENT_WIDTH } from '@/hooks/useWebLayout';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export default function DodajAlatGuideScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { isDesktop } = useWebLayout();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const steps: Step[] = [
    {
      number: 1,
      title: 'Fotografisi alat',
      description: 'Dodaj do 4 kvalitetne fotografije. Jasne slike privlace vise korisnika.',
      icon: <CameraIcon size={32} color={theme.primary} />,
      color: theme.primary,
    },
    {
      number: 2,
      title: 'Postavi cenu',
      description: 'Odredi dnevnu cenu i depozit. Preporucujemo cene slicne oglasima u tvom gradu.',
      icon: <TagIcon size={32} color={theme.cta} />,
      color: theme.cta,
    },
    {
      number: 3,
      title: 'Objavi i cekaj',
      description: 'Tvoj oglas ce odmah biti vidljiv. Primiceces obaveštenja kada neko posalije zahtev.',
      icon: <CheckCircleIcon size={32} color={theme.success} />,
      color: theme.success,
    },
  ];

  const benefits = [
    { icon: 'dollar-sign', title: 'Bez provizije', description: 'Ceo iznos ide tebi direktno' },
    { icon: 'users', title: 'Lokalni korisnici', description: 'Komsije iz tvog kraja' },
    { icon: 'bell', title: 'Instant obaveštenja', description: 'Saznaj cim neko rezervise' },
    { icon: 'star', title: 'Gradi reputaciju', description: 'Pozitivne ocene privlace vise korisnika' },
  ];

  const handleStartAdding = () => {
    navigation.navigate('AddItem');
  };

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
          <View style={[styles.heroIcon, { backgroundColor: theme.primary + '20' }]}>
            <DynamicIcon name="plus-circle" size={48} color={theme.primary} />
          </View>
          <ThemedText type="h2" style={styles.heroTitle}>Dodaj alat i zaradi</ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: 'center' }}>
            Tvoji alati mogu da rade za tebe. Prosecna zarada je 8.000 din mesecno od samo 3 alata.
          </ThemedText>
        </Card>

        <ThemedText type="h3" style={styles.sectionTitle}>Kako to funkcioniše?</ThemedText>

        {steps.map((step, index) => (
          <Card key={step.number} style={styles.stepCard}>
            <View style={styles.stepRow}>
              <View style={[styles.stepNumber, { backgroundColor: step.color }]}>
                <ThemedText type="h4" style={{ color: '#000' }}>{step.number}</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText type="h4">{step.title}</ThemedText>
                <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                  {step.description}
                </ThemedText>
              </View>
              <View style={[styles.stepIconContainer, { backgroundColor: step.color + '15' }]}>
                {step.icon}
              </View>
            </View>
          </Card>
        ))}

        <ThemedText type="h3" style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          Zasto VikendMajstor?
        </ThemedText>

        <View style={styles.benefitsGrid}>
          {benefits.map((benefit, index) => (
            <Card key={index} style={styles.benefitCard}>
              <View style={[styles.benefitIcon, { backgroundColor: theme.primary + '15' }]}>
                <DynamicIcon name={benefit.icon} size={24} color={theme.primary} />
              </View>
              <ThemedText type="body" style={{ fontWeight: '600', marginTop: Spacing.sm }}>
                {benefit.title}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                {benefit.description}
              </ThemedText>
            </Card>
          ))}
        </View>

        <Card style={StyleSheet.flatten([styles.ctaCard, { backgroundColor: theme.success }])}>
          <ThemedText type="h3" style={{ color: '#fff', marginBottom: Spacing.sm }}>
            Spreman da zaradis?
          </ThemedText>
          <ThemedText type="body" style={{ color: 'rgba(255,255,255,0.9)', marginBottom: Spacing.lg }}>
            Dodavanje alata traje manje od 3 minuta. Pocni odmah i primi prvi zahtev vec danas!
          </ThemedText>
          <Button onPress={handleStartAdding}>
            Dodaj prvi alat
          </Button>
        </Card>

        <Card style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <DynamicIcon name="info" size={20} color={theme.primary} />
            <ThemedText type="body" style={{ fontWeight: '600', marginLeft: Spacing.sm }}>
              Savet za bolji oglas
            </ThemedText>
          </View>
          <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
            Dodaj detaljan opis sa brendom i specifikacijama. Alati sa kompletnim informacijama se iznajmljuju 3x cesce.
          </ThemedText>
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
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  heroTitle: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  stepCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContent: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.md,
  },
  stepIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  benefitCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: Spacing.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaCard: {
    padding: Spacing.xl,
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  tipCard: {
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
