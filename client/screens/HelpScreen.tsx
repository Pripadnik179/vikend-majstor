import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'Kako da dodam oglas?',
    answer: 'Kliknite na "+" dugme u donjem meniju da biste dodali novi oglas. Popunite naslov, opis, kategoriju, cenu po danu i dodajte fotografije. Besplatni korisnici mogu dodati do 5 oglasa.',
  },
  {
    question: 'Kako funkcioniše rezervacija?',
    answer: 'Pronađite stvar koju želite da iznajmite, izaberite datume i pošaljite zahtev za rezervaciju. Vlasnik će primiti obaveštenje i može da prihvati ili odbije zahtev. Nakon potvrde, dogovorite se o preuzimanju.',
  },
  {
    question: 'Kako se vrši plaćanje?',
    answer: 'Plaćanje se vrši direktno između korisnika prilikom preuzimanja stvari. VikendMajstor trenutno ne procesira plaćanja kroz aplikaciju. Depozit se vraća nakon vraćanja stvari u dobrom stanju.',
  },
  {
    question: 'Da li je moj novac siguran?',
    answer: 'Preporučujemo da uvek tražite depozit kao garanciju. Fotografišite stvar pre i posle iznajmljivanja. U slučaju problema, kontaktirajte našu podršku.',
  },
  {
    question: 'Kako da postanem Premium korisnik?',
    answer: 'Idite na Profil > Pretplata i izaberite Premium plan. Premium korisnici imaju neograničen broj oglasa, istaknute oglase na vrhu pretrage i premium značku.',
  },
  {
    question: 'Šta ako imam problem sa rezervacijom?',
    answer: 'Koristite chat funkciju da komunicirate direktno sa drugom stranom. Ako ne možete da rešite problem, kontaktirajte našu podršku na podrska@vikendmajstor.rs',
  },
];

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleContactPress = () => {
    Linking.openURL('mailto:podrska@vikendmajstor.rs');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        padding: Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
      }}
    >
      <ThemedText type="h3" style={styles.sectionTitle}>Često postavljana pitanja</ThemedText>

      {faqItems.map((item, index) => (
        <Card key={index} style={styles.faqCard}>
          <Pressable
            style={styles.faqHeader}
            onPress={() => toggleExpand(index)}
          >
            <ThemedText type="body" style={styles.question}>{item.question}</ThemedText>
            <Feather 
              name={expandedIndex === index ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={theme.textSecondary} 
            />
          </Pressable>
          {expandedIndex === index ? (
            <View style={[styles.answerContainer, { borderTopColor: theme.border }]}>
              <ThemedText type="body" style={{ color: theme.textSecondary, lineHeight: 22 }}>
                {item.answer}
              </ThemedText>
            </View>
          ) : null}
        </Card>
      ))}

      <ThemedText type="h3" style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
        Kontaktirajte nas
      </ThemedText>

      <Card style={styles.contactCard}>
        <View style={styles.contactItem}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
            <Feather name="mail" size={24} color={theme.primary} />
          </View>
          <View style={styles.contactInfo}>
            <ThemedText type="body" style={{ fontWeight: '600' }}>Email podrška</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Odgovaramo u roku od 24 sata
            </ThemedText>
          </View>
        </View>
        <Pressable
          style={[styles.contactButton, { backgroundColor: theme.primary }]}
          onPress={handleContactPress}
        >
          <ThemedText style={{ color: '#000', fontWeight: '600' }}>
            podrska@vikendmajstor.rs
          </ThemedText>
        </Pressable>
      </Card>

      <Card style={styles.tipCard}>
        <View style={styles.tipHeader}>
          <Feather name="info" size={20} color={theme.primary} />
          <ThemedText type="body" style={{ fontWeight: '600', marginLeft: Spacing.sm }}>
            Savet
          </ThemedText>
        </View>
        <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.sm, lineHeight: 22 }}>
          Pre iznajmljivanja uvek proverite profil korisnika, ocene i recenzije. Koristite chat za dogovor o detaljima preuzimanja.
        </ThemedText>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  faqCard: {
    marginBottom: Spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  question: {
    flex: 1,
    fontWeight: '600',
    marginRight: Spacing.sm,
  },
  answerContainer: {
    padding: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  contactCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
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
