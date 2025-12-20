import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator, Text } from 'react-native';
import { MailIcon, AlertTriangleIcon } from '@/components/icons/TabBarIcons';
import { useAuth } from '@/contexts/AuthContext';
import { Spacing, BorderRadius } from '@/constants/theme';

interface VerificationBannerProps {
  style?: object;
}

export function VerificationBanner({ style }: VerificationBannerProps) {
  const { user, isVerified, resendVerificationEmail, refreshUser } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!user || isVerified) {
    return null;
  }

  const handleResend = async () => {
    setIsResending(true);
    setMessage(null);
    const success = await resendVerificationEmail();
    if (success) {
      setMessage('Email je poslat! Proverite inbox.');
    } else {
      setMessage('Greska pri slanju. Pokusajte ponovo.');
    }
    setIsResending(false);
  };

  const handleRefresh = async () => {
    await refreshUser();
  };

  return (
    <View style={[styles.container, { backgroundColor: '#FFF3CD', borderColor: '#F0E6B8' }, style]}>
      <View style={styles.iconContainer}>
        <AlertTriangleIcon size={24} color="#856404" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>
          Email nije verifikovan
        </Text>
        <Text style={styles.description}>
          Molimo vas da potvrdite email adresu kako biste koristili sve funkcionalnosti.
        </Text>
        {message ? (
          <Text style={[styles.message, { color: message.includes('poslat') ? '#155724' : '#721c24' }]}>
            {message}
          </Text>
        ) : null}
        <View style={styles.actions}>
          <Pressable 
            style={[styles.button, { backgroundColor: '#856404' }]} 
            onPress={handleResend}
            disabled={isResending}
          >
            {isResending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <MailIcon size={14} color="#FFFFFF" />
                <Text style={styles.buttonText}>
                  Posalji ponovo
                </Text>
              </>
            )}
          </Pressable>
          <Pressable 
            style={[styles.refreshButton, { borderColor: '#856404' }]} 
            onPress={handleRefresh}
          >
            <Text style={[styles.refreshButtonText, { color: '#856404' }]}>
              Osvezi status
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  iconContainer: {
    marginRight: Spacing.md,
    paddingTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    color: '#856404',
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  description: {
    color: '#856404',
    marginBottom: Spacing.sm,
  },
  message: {
    marginBottom: Spacing.sm,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  refreshButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  refreshButtonText: {
    fontWeight: '600',
  },
});
