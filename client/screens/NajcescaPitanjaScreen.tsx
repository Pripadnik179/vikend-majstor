import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronUpIcon, ChevronDownIcon } from '@/components/icons/TabBarIcons';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout, MAX_CONTENT_WIDTH } from '@/hooks/useWebLayout';
import { Spacing, BorderRadius } from '@/constants/theme';

interface FAQCategory {
  title: string;
  icon: string;
  items: { question: string; answer: string }[];
}

const faqCategories: FAQCategory[] = [
  {
    title: 'Rezervacija i placanje',
    icon: 'credit-card',
    items: [
      {
        question: 'Kako da rezervisem alat?',
        answer: 'Pronadjite alat koji vam treba, izaberite datume i posaljite zahtev za rezervaciju. Vlasnik ce primiti obaveštenje i moze da prihvati ili odbije zahtev. Nakon potvrde, dogovorite se o preuzimanju.',
      },
      {
        question: 'Kako se vrsi placanje?',
        answer: 'Placanje se vrsi direktno izmedu korisnika prilikom preuzimanja alata. VikendMajstor trenutno ne procesira placanja kroz aplikaciju, sto znaci da NE UZIMAMO PROVIZIJU. Ceo iznos ide vlasniku.',
      },
      {
        question: 'Sta je depozit i kako funkcionise?',
        answer: 'Depozit je garancija koju placate vlasniku prilikom preuzimanja alata. Depozit se vraca u celosti nakon vraćanja alata u ispravnom stanju. Preporucujemo da uvek trazite potvrdu o primljenom depozitu.',
      },
      {
        question: 'Da li mogu da otkazem rezervaciju?',
        answer: 'Da, mozete otkazati rezervaciju pre nego sto je vlasnik potvrdi. Nakon potvrde, kontaktirajte vlasnika direktno kroz chat da biste se dogovorili o otkazivanju.',
      },
    ],
  },
  {
    title: 'Sigurnost i zastita',
    icon: 'shield',
    items: [
      {
        question: 'Sta ako se alat osteti tokom koriscenja?',
        answer: 'U slucaju oštecenja, obavesite vlasnika odmah. Depozit sluzi kao garancija za manja oštecenja. Za veca oštecenja, dogovorite se sa vlasnikom o nadoknadi. Preporucujemo da fotografisete alat pre i posle koriscenja.',
      },
      {
        question: 'Kako znam da je vlasnik pouzdan?',
        answer: 'Svi korisnici su verifikovani putem email-a. Mozete videti ocene i recenzije drugih korisnika, kao i koliko dugo je vlasnik aktivan na platformi. Uvek mozete komunicirati kroz chat pre rezervacije.',
      },
      {
        question: 'Da li su moji podaci sigurni?',
        answer: 'Da, svi podaci su zasticeni SSL enkripcijom. Lozinke se cuvaju pomocu napredne scrypt enkripcije. Ne delimo vase podatke sa trecim stranama.',
      },
      {
        question: 'Sta ako vlasnik ne odgovara na poruke?',
        answer: 'Ako vlasnik ne odgovori u roku od 48 sati, mozete potraziti drugi alat ili nas kontaktirati na podrska@vikendmajstor.rs. Radimo na sistemu automatskog upozorenja za neaktivne korisnike.',
      },
    ],
  },
  {
    title: 'Dodavanje oglasa',
    icon: 'plus-circle',
    items: [
      {
        question: 'Kako da dodam oglas?',
        answer: 'Kliknite na "+" dugme, popunite naslov, opis, kategoriju, cenu po danu i dodajte do 4 fotografije. Besplatni korisnici mogu dodati do 5 oglasa.',
      },
      {
        question: 'Koliko kosta objavljivanje oglasa?',
        answer: 'Osnovna verzija je potpuno besplatna i ukljucuje do 5 oglasa. Za neogranicen broj oglasa i dodatne benefite, mozete izabrati Premium plan.',
      },
      {
        question: 'Koliko dugo oglas ostaje aktivan?',
        answer: 'Oglasi su aktivni 30 dana, nakon cega mozete obnoviti oglas besplatno. Primicete obaveštenje pre isteka.',
      },
      {
        question: 'Kako da povecam vidljivost oglasa?',
        answer: 'Dodajte kvalitetne fotografije, detaljan opis sa specifikacijama i konkurentnu cenu. Premium korisnici dobijaju istaknute pozicije u pretrazi.',
      },
    ],
  },
  {
    title: 'Pretplata i cene',
    icon: 'star',
    items: [
      {
        question: 'Koji planovi su dostupni?',
        answer: 'Imamo tri plana: Besplatno (do 5 oglasa), Standard (neograniceno oglasa) i Premium (neograniceno + istaknuti oglasi + premium znacka). Prvih 100 korisnika dobija mesec dana Premium-a besplatno!',
      },
      {
        question: 'Kako da postanem Premium korisnik?',
        answer: 'Idite na Profil > Pretplata i izaberite Premium plan. Placanje je sigurno i mozete otkazati bilo kada.',
      },
      {
        question: 'Mogu li da otkazem pretplatu?',
        answer: 'Da, mozete otkazati pretplatu bilo kada. Pristup Premium funkcijama ostaje aktivan do kraja placenog perioda.',
      },
    ],
  },
];

export default function NajcescaPitanjaScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { isDesktop } = useWebLayout();
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});

  const toggleItem = (categoryIndex: number, itemIndex: number) => {
    const key = `${categoryIndex}-${itemIndex}`;
    setExpandedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isExpanded = (categoryIndex: number, itemIndex: number) => {
    return expandedItems[`${categoryIndex}-${itemIndex}`] || false;
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
            <DynamicIcon name="help-circle" size={48} color={theme.primary} />
          </View>
          <ThemedText type="h2" style={styles.heroTitle}>Najcesca pitanja</ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: 'center' }}>
            Pronadjite odgovore na najcesca pitanja o koriscenju VikendMajstora
          </ThemedText>
        </Card>

        {faqCategories.map((category, categoryIndex) => (
          <View key={categoryIndex}>
            <View style={styles.categoryHeader}>
              <View style={[styles.categoryIcon, { backgroundColor: theme.primary + '15' }]}>
                <DynamicIcon name={category.icon} size={20} color={theme.primary} />
              </View>
              <ThemedText type="h4">{category.title}</ThemedText>
            </View>

            {category.items.map((item, itemIndex) => (
              <Card key={itemIndex} style={styles.faqCard}>
                <Pressable
                  style={styles.faqHeader}
                  onPress={() => toggleItem(categoryIndex, itemIndex)}
                >
                  <ThemedText type="body" style={styles.question}>{item.question}</ThemedText>
                  {isExpanded(categoryIndex, itemIndex) ? (
                    <ChevronUpIcon size={20} color={theme.textSecondary} />
                  ) : (
                    <ChevronDownIcon size={20} color={theme.textSecondary} />
                  )}
                </Pressable>
                {isExpanded(categoryIndex, itemIndex) ? (
                  <View style={[styles.answerContainer, { borderTopColor: theme.border }]}>
                    <ThemedText type="body" style={{ color: theme.textSecondary, lineHeight: 22 }}>
                      {item.answer}
                    </ThemedText>
                  </View>
                ) : null}
              </Card>
            ))}
          </View>
        ))}

        <Card style={StyleSheet.flatten([styles.contactCard, { borderColor: theme.primary + '30' }])}>
          <DynamicIcon name="message-circle" size={32} color={theme.primary} />
          <ThemedText type="h4" style={{ marginTop: Spacing.md }}>Niste nasli odgovor?</ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: 'center', marginTop: Spacing.sm }}>
            Kontaktirajte nas na podrska@vikendmajstor.rs i odgovoricemo vam u roku od 24 sata.
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
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  faqCard: {
    marginBottom: Spacing.sm,
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
    fontWeight: '500',
    marginRight: Spacing.sm,
  },
  answerContainer: {
    padding: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  contactCard: {
    padding: Spacing.xl,
    marginTop: Spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
  },
});
