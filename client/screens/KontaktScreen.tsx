import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Pressable, Linking, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MailIcon, PhoneIcon, MapPinIcon, SendIcon } from '@/components/icons/TabBarIcons';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout, MAX_CONTENT_WIDTH } from '@/hooks/useWebLayout';
import { Spacing, BorderRadius } from '@/constants/theme';

export default function KontaktScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { isDesktop } = useWebLayout();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailPress = () => {
    Linking.openURL('mailto:podrska@vikendmajstor.rs');
  };

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert('Greska', 'Molimo popunite sva polja');
      return;
    }

    setIsSubmitting(true);
    
    const mailtoUrl = `mailto:podrska@vikendmajstor.rs?subject=Kontakt od ${encodeURIComponent(name)}&body=${encodeURIComponent(`Ime: ${name}\nEmail: ${email}\n\nPoruka:\n${message}`)}`;
    
    try {
      await Linking.openURL(mailtoUrl);
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      Alert.alert('Greska', 'Nije moguce otvoriti email aplikaciju');
    }
    
    setIsSubmitting(false);
  };

  const contactMethods = [
    {
      icon: <MailIcon size={24} color={theme.primary} />,
      title: 'Email podrska',
      subtitle: 'podrska@vikendmajstor.rs',
      description: 'Odgovaramo u roku od 24 sata',
      onPress: handleEmailPress,
    },
  ];

  return (
    <KeyboardAwareScrollViewCompat
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
            <DynamicIcon name="message-circle" size={48} color={theme.primary} />
          </View>
          <ThemedText type="h2" style={styles.heroTitle}>Kontaktirajte nas</ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: 'center' }}>
            Tu smo da pomognemo! Posaljite nam poruku i odgovoricemo vam sto je pre moguce.
          </ThemedText>
        </Card>

        {contactMethods.map((method, index) => (
          <Pressable key={index} onPress={method.onPress}>
            <Card style={styles.contactMethodCard}>
              <View style={styles.methodRow}>
                <View style={[styles.methodIcon, { backgroundColor: theme.primary + '15' }]}>
                  {method.icon}
                </View>
                <View style={styles.methodContent}>
                  <ThemedText type="body" style={{ fontWeight: '600' }}>{method.title}</ThemedText>
                  <ThemedText type="body" style={{ color: theme.primary }}>{method.subtitle}</ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>{method.description}</ThemedText>
                </View>
              </View>
            </Card>
          </Pressable>
        ))}

        <ThemedText type="h3" style={styles.sectionTitle}>Posaljite poruku</ThemedText>

        <Card style={styles.formCard}>
          <View style={styles.inputContainer}>
            <ThemedText type="body" style={styles.label}>Vase ime</ThemedText>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
                borderColor: theme.border,
              }]}
              value={name}
              onChangeText={setName}
              placeholder="Unesite vase ime"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText type="body" style={styles.label}>Email adresa</ThemedText>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
                borderColor: theme.border,
              }]}
              value={email}
              onChangeText={setEmail}
              placeholder="vasa@email.com"
              placeholderTextColor={theme.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText type="body" style={styles.label}>Poruka</ThemedText>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
                borderColor: theme.border,
              }]}
              value={message}
              onChangeText={setMessage}
              placeholder="Opisite vase pitanje ili problem..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          <Button onPress={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Slanje...' : 'Posalji poruku'}
          </Button>
        </Card>

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <DynamicIcon name="clock" size={20} color={theme.textSecondary} />
            <ThemedText type="body" style={{ marginLeft: Spacing.sm, color: theme.textSecondary }}>
              Radno vreme podrske: Pon-Pet 9:00-17:00
            </ThemedText>
          </View>
          <View style={[styles.infoRow, { marginTop: Spacing.sm }]}>
            <DynamicIcon name="info" size={20} color={theme.textSecondary} />
            <ThemedText type="body" style={{ marginLeft: Spacing.sm, color: theme.textSecondary }}>
              Za hitne slucajeve, javite nam se direktno na email
            </ThemedText>
          </View>
        </Card>
      </View>
    </KeyboardAwareScrollViewCompat>
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
  contactMethodCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  sectionTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  formCard: {
    padding: Spacing.lg,
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  label: {
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
    minHeight: 120,
  },
  infoCard: {
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
