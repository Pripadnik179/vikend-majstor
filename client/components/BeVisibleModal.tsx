import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal, Pressable, Dimensions, Platform, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import Feather from '@expo/vector-icons/Feather';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';

const { width } = Dimensions.get('window');

export function BeVisibleModal() {
  const [visible, setVisible] = useState(false);
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  // Check if Feather fonts are loaded
  const [fontsLoaded] = useFonts({
    ...Feather.font,
  });

  useEffect(() => {
    // Only show modal when fonts are loaded and user is on free plan
    if (user && user.subscriptionType === 'free' && fontsLoaded) {
      const timer = setTimeout(() => {
        setVisible(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [user, fontsLoaded]);

  const handleUpgrade = () => {
    setVisible(false);
    navigation.navigate('Subscription');
  };

  const handleClose = () => {
    setVisible(false);
  };

  // Don't render if not visible or fonts not loaded
  if (!visible || !fontsLoaded) return null;

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
            <Feather name="x" size={24} color={theme.textSecondary} />
          </Pressable>
          
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, { backgroundColor: Colors.light.primary }]}>
              <Feather name="star" size={40} color={Colors.light.accent} />
            </View>
          </View>

          <ThemedText style={styles.title}>Budi vidljiv!</ThemedText>
          
          <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
            Tvoji oglasi zasluzuju vise paznje. Nadogradi na Premium i budi prvi u rezultatima pretrage!
          </ThemedText>

          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Feather name="check-circle" size={20} color={Colors.light.primary} />
              <ThemedText style={styles.benefitText}>Neogranicen broj oglasa</ThemedText>
            </View>
            <View style={styles.benefitItem}>
              <Feather name="check-circle" size={20} color={Colors.light.primary} />
              <ThemedText style={styles.benefitText}>Istaknut oglas na vrhu pretrage</ThemedText>
            </View>
            <View style={styles.benefitItem}>
              <Feather name="check-circle" size={20} color={Colors.light.primary} />
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
    width: width - Spacing.xl * 2,
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
    width: '100%',
    marginBottom: Spacing.lg,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
