import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SearchIcon, CalendarIcon, DollarSignIcon, ToolIcon, CameraIcon, ChevronRightIcon } from '@/components/icons/TabBarIcons';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout, MAX_CONTENT_WIDTH } from '@/hooks/useWebLayout';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

type UserRole = 'renter' | 'owner';

interface ProcessStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

export default function KakoFunkcioniseScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { isDesktop } = useWebLayout();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedRole, setSelectedRole] = useState<UserRole>('renter');

  const renterSteps: ProcessStep[] = [
    {
      icon: <SearchIcon size={28} color={theme.primary} />,
      title: 'Pronadji alat',
      description: 'Pretrazi alate u tvojoj blizini. Koristi filtere za cenu, kategoriju i lokaciju.',
      color: theme.primary,
    },
    {
      icon: <CalendarIcon size={28} color={theme.cta} />,
      title: 'Rezervisi termine',
      description: 'Izaberi datume kada ti treba alat i posalji zahtev vlasniku.',
      color: theme.cta,
    },
    {
      icon: <DynamicIcon name="message-circle" size={28} color={theme.success} />,
      title: 'Dogovori preuzimanje',
      description: 'Komuniciraj sa vlasnikom kroz aplikaciju i dogovori gde ces preuzeti alat.',
      color: theme.success,
    },
  ];

  const ownerSteps: ProcessStep[] = [
    {
      icon: <CameraIcon size={28} color={theme.primary} />,
      title: 'Dodaj alat',
      description: 'Fotografisi alat, postavi cenu i objavi oglas. Traje manje od 3 minuta.',
      color: theme.primary,
    },
    {
      icon: <DynamicIcon name="bell" size={28} color={theme.cta} />,
      title: 'Primi rezervacije',
      description: 'Kada neko zeli tvoj alat, dobices obaveštenje. Ti odlucujes kome ces ga dati.',
      color: theme.cta,
    },
    {
      icon: <DollarSignIcon size={28} color={theme.success} />,
      title: 'Zaradi novac',
      description: 'Novac primis direktno od korisnika. Bez provizije, ceo iznos je tvoj.',
      color: theme.success,
    },
  ];

  const currentSteps = selectedRole === 'renter' ? renterSteps : ownerSteps;

  const handleCTAPress = () => {
    if (selectedRole === 'renter') {
      navigation.navigate('IznajmiAlat');
    } else {
      navigation.navigate('AddItem');
    }
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
          <ThemedText type="h2" style={styles.heroTitle}>Kako funkcionise?</ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: 'center' }}>
            VikendMajstor povezuje ljude koji imaju alate sa onima kojima su potrebni. Jednostavno, lokalno, bez provizije.
          </ThemedText>
        </Card>

        <View style={styles.tabContainer}>
          <Pressable
            style={[
              styles.tab,
              { 
                backgroundColor: selectedRole === 'renter' ? theme.cta : theme.backgroundSecondary,
                borderColor: theme.cta,
              }
            ]}
            onPress={() => setSelectedRole('renter')}
          >
            <SearchIcon size={20} color={selectedRole === 'renter' ? '#fff' : theme.text} />
            <ThemedText 
              type="body" 
              style={{ 
                marginLeft: Spacing.xs, 
                fontWeight: '600',
                color: selectedRole === 'renter' ? '#fff' : theme.text,
              }}
            >
              Zelim da iznajmim
            </ThemedText>
          </Pressable>
          <Pressable
            style={[
              styles.tab,
              { 
                backgroundColor: selectedRole === 'owner' ? theme.success : theme.backgroundSecondary,
                borderColor: theme.success,
              }
            ]}
            onPress={() => setSelectedRole('owner')}
          >
            <ToolIcon size={20} color={selectedRole === 'owner' ? '#fff' : theme.text} />
            <ThemedText 
              type="body" 
              style={{ 
                marginLeft: Spacing.xs, 
                fontWeight: '600',
                color: selectedRole === 'owner' ? '#fff' : theme.text,
              }}
            >
              Zelim da zaradim
            </ThemedText>
          </Pressable>
        </View>

        <ThemedText type="h3" style={styles.sectionTitle}>
          {selectedRole === 'renter' ? 'Kako iznajmiti alat?' : 'Kako zaraditi od alata?'}
        </ThemedText>

        {currentSteps.map((step, index) => (
          <Card key={index} style={styles.stepCard}>
            <View style={styles.stepRow}>
              <View style={[styles.stepNumber, { backgroundColor: step.color }]}>
                <ThemedText type="h4" style={{ color: '#fff' }}>{index + 1}</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText type="h4">{step.title}</ThemedText>
                <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                  {step.description}
                </ThemedText>
              </View>
            </View>
          </Card>
        ))}

        <Card style={StyleSheet.flatten([styles.ctaCard, { backgroundColor: selectedRole === 'renter' ? theme.cta : theme.success }])}>
          <ThemedText type="h4" style={{ color: '#fff', marginBottom: Spacing.sm }}>
            {selectedRole === 'renter' ? 'Pronadji alat u tvom kraju' : 'Pocni da zaradujes danas'}
          </ThemedText>
          <Button onPress={handleCTAPress}>
            {selectedRole === 'renter' ? 'Pretrazi alate' : 'Dodaj prvi alat'}
          </Button>
        </Card>

        <Card style={styles.faqCard}>
          <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>Cesta pitanja</ThemedText>
          
          <View style={styles.faqItem}>
            <ThemedText type="body" style={{ fontWeight: '600' }}>Da li je besplatno?</ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
              Da! Osnovna verzija je potpuno besplatna. Mozete dodati do 5 oglasa bez placanja.
            </ThemedText>
          </View>

          <View style={[styles.faqItem, { borderTopWidth: 1, borderTopColor: theme.border }]}>
            <ThemedText type="body" style={{ fontWeight: '600' }}>Kako se vrsi placanje?</ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
              Placanje se vrsi direktno izmedu korisnika prilikom preuzimanja. VikendMajstor ne uzima proviziju.
            </ThemedText>
          </View>

          <Pressable 
            style={styles.moreFaqButton}
            onPress={() => navigation.navigate('NajcescaPitanja')}
          >
            <ThemedText type="body" style={{ color: theme.primary }}>Pogledaj sva pitanja</ThemedText>
            <ChevronRightIcon size={18} color={theme.primary} />
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
  heroTitle: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
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
    alignItems: 'flex-start',
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
  },
  ctaCard: {
    padding: Spacing.xl,
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  faqCard: {
    padding: Spacing.lg,
    marginTop: Spacing.lg,
  },
  faqItem: {
    paddingVertical: Spacing.md,
  },
  moreFaqButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
  },
});
