import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal, Pressable, Dimensions, Platform, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import { XIcon, StarIcon, CheckCircleIcon } from '@/components/icons/TabBarIcons';

const { width } = Dimensions.get('window');
const MAX_MODAL_WIDTH = 400;

export function BeVisibleModal() {
  const [visible, setVisible] = useState(false);
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  useEffect(() => {
    if (user && user.subscriptionType === 'free') {
      const timer = setTimeout(() => {
        setVisible(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleUpgrade = () => {
    setVisible(false);
    navigation.navigate('Subscription');
  };

  const handleClose = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={30} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <View style={[styles.content, { backgroundColor: theme.backgroundDefault }]}>
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <XIcon size={24} color={theme.textSecondary} />
          </Pressable>
          
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, { backgroundColor: Colors.light.primary }]}>
              <StarIcon size={40} color={Colors.light.accent} />
            </View>
          </View>

          <ThemedText style={styles.title}>Budi vidljiv!</ThemedText>
          
          <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
            Tvoji oglasi zasluzuju vise paznje. Nadogradi na Premium i budi prvi u rezultatima pretrage!
          </ThemedText>

          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <CheckCircleIcon size={20} color={Colors.light.primary} />
              <ThemedText style={styles.benefitText}>Neogranicen broj oglasa</ThemedText>
            </View>
            <View style={styles.benefitItem}>
              <CheckCircleIcon size={20} color={Colors.light.primary} />
              <ThemedText style={styles.benefitText}>Istaknut oglas na vrhu pretrage</ThemedText>
            </View>
            <View style={styles.benefitItem}>
              <CheckCircleIcon size={20} color={Colors.light.primary} />
              <ThemedText style={styles.benefitText}>Premium znacka na oglasima</ThemedText>
            </View>
          </View>

          <Button
            onPress={handleUpgrade}
            style={styles.upgradeButton}
          >
            Nadogradi sada
          </Button>

          <Pressable onPress={handleClose}>
            <ThemedText style={[styles.laterText, { color: theme.textSecondary }]}>
              Mozda kasnije
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    width: Math.min(width - Spacing.xl * 2, MAX_MODAL_WIDTH),
    maxWidth: MAX_MODAL_WIDTH,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    padding: Spacing.xs,
    zIndex: 1,
  },
  iconContainer: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  benefitsList: {
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: Spacing.sm,
  },
  benefitText: {
    marginLeft: Spacing.sm,
    fontSize: 15,
  },
  upgradeButton: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  laterText: {
    fontSize: 14,
    paddingVertical: Spacing.sm,
  },
});
