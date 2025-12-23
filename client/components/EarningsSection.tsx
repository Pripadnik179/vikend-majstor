import React, { useState } from 'react';
import { View, StyleSheet, Pressable, TextInput, Platform, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { BanknoteIcon, ToolIcon, CalendarIcon, TrendingUpIcon, ShieldIcon, UserCheckIcon, ChevronRightIcon } from '@/components/icons/TabBarIcons';

interface EarningsSectionProps {
  onAddTool: () => void;
}

interface ExampleEarner {
  name: string;
  tool: string;
  monthlyEarning: number;
  rentals: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function EarningsSection({ onAddTool }: EarningsSectionProps) {
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  
  const [pricePerDay, setPricePerDay] = useState('500');
  const [daysPerMonth, setDaysPerMonth] = useState('10');
  
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const calculateMonthlyEarning = () => {
    const price = parseFloat(pricePerDay) || 0;
    const days = parseFloat(daysPerMonth) || 0;
    return Math.round(price * days);
  };

  const examples: ExampleEarner[] = [
    { name: 'Marko B.', tool: 'Brusilica', monthlyEarning: 8500, rentals: 12 },
    { name: 'Petar S.', tool: 'Busiliica', monthlyEarning: 6200, rentals: 8 },
    { name: 'Jovan M.', tool: 'Betonska mesalica', monthlyEarning: 15000, rentals: 5 },
  ];

  const trustElements = [
    { icon: <BanknoteIcon size={16} color={Colors.light.cta} />, text: 'Bez provizije' },
    { icon: <ShieldIcon size={16} color={Colors.light.success} />, text: 'Placanje pri preuzimanju' },
    { icon: <UserCheckIcon size={16} color={Colors.light.trust} />, text: 'Verifikovani korisnici' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <TrendingUpIcon size={24} color={Colors.light.success} />
          <ThemedText type="h3" style={{ marginLeft: Spacing.sm }}>Zaradi od svog alata</ThemedText>
        </View>
      </View>

      <View style={[styles.content, isDesktop && styles.contentDesktop]}>
        <Card style={isDesktop ? { ...styles.calculatorCard, ...styles.calculatorCardDesktop } : styles.calculatorCard}>
          <ThemedText type="h4" style={styles.cardTitle}>Kalkulator zarade</ThemedText>
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: 4 }}>
                Cena po danu (RSD)
              </ThemedText>
              <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                <BanknoteIcon size={16} color={theme.textTertiary} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={pricePerDay}
                  onChangeText={setPricePerDay}
                  keyboardType="numeric"
                  placeholder="500"
                  placeholderTextColor={theme.textTertiary}
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: 4 }}>
                Dana mesecno
              </ThemedText>
              <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                <CalendarIcon size={16} color={theme.textTertiary} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={daysPerMonth}
                  onChangeText={setDaysPerMonth}
                  keyboardType="numeric"
                  placeholder="10"
                  placeholderTextColor={theme.textTertiary}
                />
              </View>
            </View>
          </View>
          
          <View style={[styles.resultBox, { backgroundColor: Colors.light.success + '15' }]}>
            <ThemedText type="small" style={{ color: Colors.light.success }}>Mesecna zarada</ThemedText>
            <ThemedText type="h2" style={{ color: Colors.light.success, marginTop: 4 }}>
              {calculateMonthlyEarning().toLocaleString('sr-RS')} RSD
            </ThemedText>
          </View>
          
          <AnimatedPressable
            style={[animatedStyle, styles.ctaButton, { backgroundColor: Colors.light.cta }]}
            onPress={onAddTool}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <ToolIcon size={20} color="#FFFFFF" />
            <ThemedText type="body" style={{ color: '#FFFFFF', fontWeight: '700', marginLeft: Spacing.sm }}>
              Dodaj svoj alat
            </ThemedText>
            <ChevronRightIcon size={18} color="#FFFFFF" />
          </AnimatedPressable>
        </Card>

        <View style={[styles.examplesSection, isDesktop && styles.examplesSectionDesktop]}>
          <ThemedText type="h4" style={styles.cardTitle}>Primeri zarade korisnika</ThemedText>
          
          {examples.map((example, index) => (
            <View 
              key={index}
              style={[styles.exampleCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
            >
              <View style={styles.exampleHeader}>
                <View style={[styles.avatar, { backgroundColor: Colors.light.primary }]}>
                  <ThemedText style={styles.avatarText}>{example.name.charAt(0)}</ThemedText>
                </View>
                <View style={styles.exampleInfo}>
                  <ThemedText type="body" style={{ fontWeight: '600' }}>{example.name}</ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>{example.tool}</ThemedText>
                </View>
              </View>
              <View style={styles.exampleStats}>
                <View style={styles.exampleStat}>
                  <ThemedText type="h4" style={{ color: Colors.light.success }}>
                    {example.monthlyEarning.toLocaleString('sr-RS')} RSD
                  </ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>mesecno</ThemedText>
                </View>
                <View style={[styles.exampleDivider, { backgroundColor: theme.border }]} />
                <View style={styles.exampleStat}>
                  <ThemedText type="h4" style={{ color: theme.primary }}>{example.rentals}</ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>iznajmljivanja</ThemedText>
                </View>
              </View>
            </View>
          ))}

          <View style={styles.trustElements}>
            {trustElements.map((el, index) => (
              <View key={index} style={styles.trustElement}>
                {el.icon}
                <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 6 }}>
                  {el.text}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing['2xl'],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    gap: Spacing.lg,
  },
  contentDesktop: {
    flexDirection: 'row',
  },
  calculatorCard: {
    padding: Spacing.lg,
  },
  calculatorCardDesktop: {
    flex: 1,
  },
  cardTitle: {
    marginBottom: Spacing.lg,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  resultBox: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  examplesSection: {
    gap: Spacing.md,
  },
  examplesSectionDesktop: {
    flex: 1,
  },
  exampleCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  avatarText: {
    color: '#1A1A1A',
    fontWeight: '700',
    fontSize: 16,
  },
  exampleInfo: {
    flex: 1,
  },
  exampleStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exampleStat: {
    flex: 1,
    alignItems: 'center',
  },
  exampleDivider: {
    width: 1,
    height: 30,
  },
  trustElements: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  trustElement: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
