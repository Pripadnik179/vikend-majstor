import React from 'react';
import { View, StyleSheet, Modal, Pressable, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import { XIcon, AlertCircleIcon } from '@/components/icons/TabBarIcons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useTheme } from '@/hooks/useTheme';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

const { width } = Dimensions.get('window');

interface UpgradeLimitModalProps {
  visible: boolean;
  onClose: () => void;
  itemCount: number;
}

export function UpgradeLimitModal({ visible, onClose, itemCount }: UpgradeLimitModalProps) {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleUpgrade = () => {
    onClose();
    navigation.navigate('Subscription');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={30} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <View style={[styles.content, { backgroundColor: theme.backgroundDefault }]}>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <XIcon size={24} color={theme.textSecondary} />
          </Pressable>
          
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
              <AlertCircleIcon size={40} color="#EF4444" />
            </View>
          </View>

          <ThemedText style={styles.title}>Limit dostignut!</ThemedText>
          
          <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
            Vec imate {itemCount} od 5 besplatnih oglasa. Da biste dodali jos oglasa, potrebna vam je pretplata.
          </ThemedText>

          <View style={styles.planComparison}>
            <View style={[styles.planCard, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
              <ThemedText style={styles.planName}>Standard</ThemedText>
              <ThemedText style={[styles.planPrice, { color: Colors.light.primary }]}>500 RSD/mes</ThemedText>
              <ThemedText style={[styles.planFeature, { color: theme.textSecondary }]}>Neogranicen broj oglasa</ThemedText>
            </View>
            
            <View style={[styles.planCard, styles.recommendedPlan, { backgroundColor: Colors.light.primary }]}>
              <View style={styles.recommendedBadge}>
                <ThemedText style={styles.recommendedText}>Preporuceno</ThemedText>
              </View>
              <ThemedText style={[styles.planName, { color: Colors.light.accent }]}>Premium</ThemedText>
              <ThemedText style={[styles.planPrice, { color: Colors.light.accent }]}>1000 RSD/mes</ThemedText>
              <ThemedText style={[styles.planFeature, { color: Colors.light.accent }]}>+ Istaknut oglas na vrhu</ThemedText>
            </View>
          </View>

          <Button
            onPress={handleUpgrade}
            style={styles.upgradeButton}
          >
            Pogledaj ponude
          </Button>

          <Pressable onPress={onClose}>
            <ThemedText style={[styles.laterText, { color: theme.textSecondary }]}>
              Odustani
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
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xl + 20,
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
  planComparison: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    width: '100%',
  },
  planCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
  },
  recommendedPlan: {
    borderWidth: 0,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: Colors.light.accent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  planName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: Spacing.sm,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: Spacing.xs,
  },
  planFeature: {
    fontSize: 12,
    marginTop: Spacing.xs,
    textAlign: 'center',
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
