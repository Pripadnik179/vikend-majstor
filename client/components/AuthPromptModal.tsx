import React from 'react';
import { View, Modal, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { Spacing, BorderRadius } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import { XIcon } from '@/components/icons/TabBarIcons';

interface AuthPromptModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  actionType?: 'booking' | 'addItem' | 'message' | 'generic';
}

export function AuthPromptModal({ 
  visible, 
  onClose, 
  title,
  message,
  actionType = 'generic' 
}: AuthPromptModalProps) {
  const { theme, isDark } = useTheme();
  const { exitGuestMode } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const getDefaultContent = () => {
    switch (actionType) {
      case 'booking':
        return {
          title: 'Prijavi se za rezervaciju',
          message: 'Da bi rezervisao alat, potrebno je da se prijavis ili registrujes. Registracija traje samo 1 minut.',
        };
      case 'addItem':
        return {
          title: 'Prijavi se za dodavanje',
          message: 'Da bi dodao svoj alat i poceo da zaradujes, potrebno je da se prijavis ili registrujes.',
        };
      case 'message':
        return {
          title: 'Prijavi se za poruke',
          message: 'Da bi kontaktirao vlasnika alata, potrebno je da se prijavis ili registrujes.',
        };
      default:
        return {
          title: 'Prijavi se',
          message: 'Ova funkcija zahteva prijavu. Registracija traje samo 1 minut.',
        };
    }
  };

  const defaultContent = getDefaultContent();
  const displayTitle = title || defaultContent.title;
  const displayMessage = message || defaultContent.message;

  const handleLogin = () => {
    onClose();
    exitGuestMode();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.modal, { backgroundColor: theme.backgroundDefault }]}>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <XIcon size={24} color={theme.textSecondary} />
          </Pressable>

          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, { backgroundColor: theme.primary + '20' }]}>
              <ThemedText style={[styles.iconEmoji, { color: theme.primary }]}>
                {actionType === 'booking' ? '📅' : actionType === 'addItem' ? '➕' : '🔐'}
              </ThemedText>
            </View>
          </View>

          <ThemedText style={styles.title}>{displayTitle}</ThemedText>
          <ThemedText style={[styles.message, { color: theme.textSecondary }]}>
            {displayMessage}
          </ThemedText>

          <View style={styles.benefits}>
            <View style={styles.benefitRow}>
              <ThemedText style={[styles.benefitIcon, { color: theme.success }]}>✓</ThemedText>
              <ThemedText style={[styles.benefitText, { color: theme.textSecondary }]}>
                Bez provizije - 0%
              </ThemedText>
            </View>
            <View style={styles.benefitRow}>
              <ThemedText style={[styles.benefitIcon, { color: theme.success }]}>✓</ThemedText>
              <ThemedText style={[styles.benefitText, { color: theme.textSecondary }]}>
                Samo email i lozinka
              </ThemedText>
            </View>
            <View style={styles.benefitRow}>
              <ThemedText style={[styles.benefitIcon, { color: theme.success }]}>✓</ThemedText>
              <ThemedText style={[styles.benefitText, { color: theme.textSecondary }]}>
                Lokalna zajednica
              </ThemedText>
            </View>
          </View>

          <View style={styles.buttons}>
            <Button
              onPress={handleLogin}
              style={styles.loginButton}
            >
              <ThemedText style={styles.buttonText}>Prijavi se / Registruj se</ThemedText>
            </Button>
            <Pressable onPress={onClose} style={styles.laterButton}>
              <ThemedText style={[styles.laterText, { color: theme.textSecondary }]}>
                Nastavi bez prijave
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modal: {
    width: '90%',
    maxWidth: 400,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    padding: Spacing.xs,
    zIndex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  benefits: {
    marginBottom: Spacing.xl,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  benefitIcon: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: Spacing.sm,
  },
  benefitText: {
    fontSize: 14,
  },
  buttons: {
    gap: Spacing.sm,
  },
  loginButton: {
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  laterButton: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  laterText: {
    fontSize: 14,
  },
});
