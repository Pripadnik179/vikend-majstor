import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { ShieldIcon, ChevronDownIcon, ChevronUpIcon } from '@/components/icons/TabBarIcons';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';

type LegalSection = {
  icon: React.ReactNode;
  title: string;
  content: string[];
};

export default function LegalScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const route = useRoute();
  const initialSection = (route.params as { section?: string })?.section;
  
  const [expandedSections, setExpandedSections] = useState<string[]>(
    initialSection ? [initialSection] : ['privacy', 'terms']
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const sections: { id: string; data: LegalSection }[] = [
    {
      id: 'privacy',
      data: {
        icon: <ShieldIcon size={24} color={theme.primary} />,
        title: 'Politika privatnosti',
        content: [
          'Vasa privatnost nam je vazna.',
          'Podaci koje unosite (ime, email, lokacija) koriste se iskljucivo za funkcionisanje aplikacije i komunikaciju sa drugim korisnicima.',
          'Nikada ne delimo vase podatke sa trecim stranama bez vaseg pristanka.',
          'Lokacija se koristi samo za prikaz udaljenosti izmedju korisnika i dostupnih alata.',
          'Svi podaci se cuvaju u skladu sa vazecim zakonima Republike Srbije i EU regulativom (GDPR).',
        ],
      },
    },
    {
      id: 'terms',
      data: {
        icon: <DynamicIcon name="file-text" size={24} color={theme.primary} />,
        title: 'Uslovi koriscenja',
        content: [
          'Koriscenjem aplikacije prihvatate sledece uslove:',
          '1. Korisnik je odgovoran za tacnost informacija koje unosi.',
          '2. Iznajmljivanje i razmena alata odvija se direktno izmedju korisnika — aplikacija je posrednik i ne snosi odgovornost za eventualne stete.',
          '3. Zabranjeno je zloupotrebljavati platformu, unositi netacne podatke ili nuditi opasne/neispravne alate.',
          '4. Premium pretplata omogucava dodatne pogodnosti i traje 30 dana od aktivacije.',
          '5. U slucaju krsenja pravila, nalog moze biti privremeno ili trajno suspendovan.',
        ],
      },
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
      <ThemedText type="body" style={{ color: theme.textSecondary, marginBottom: Spacing.xl, lineHeight: 22 }}>
        Ovde mozete procitati nase pravne dokumente koji regulisu koriscenje VikendMajstor platforme.
      </ThemedText>

      {sections.map(({ id, data }) => (
        <Card key={id} style={styles.sectionCard}>
          <Pressable
            style={styles.sectionHeader}
            onPress={() => toggleSection(id)}
          >
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                {data.icon}
              </View>
              <ThemedText type="h4" style={{ marginLeft: Spacing.md }}>{data.title}</ThemedText>
            </View>
            {expandedSections.includes(id) ? (
              <ChevronUpIcon size={20} color={theme.textSecondary} />
            ) : (
              <ChevronDownIcon size={20} color={theme.textSecondary} />
            )}
          </Pressable>
          
          {expandedSections.includes(id) ? (
            <View style={[styles.sectionContent, { borderTopColor: theme.border }]}>
              {data.content.map((paragraph, index) => (
                <ThemedText 
                  key={index} 
                  type="body" 
                  style={[
                    styles.paragraph,
                    { color: index === 0 ? theme.text : theme.textSecondary }
                  ]}
                >
                  {paragraph}
                </ThemedText>
              ))}
            </View>
          ) : null}
        </Card>
      ))}

      <View style={styles.footer}>
        <ThemedText type="small" style={{ color: theme.textTertiary, textAlign: 'center' }}>
          Poslednje azuriranje: Decembar 2024
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textTertiary, textAlign: 'center', marginTop: Spacing.xs }}>
          Za sva pitanja kontaktirajte: podrska@vikendmajstor.rs
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    marginBottom: Spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  paragraph: {
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  footer: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
  },
});
