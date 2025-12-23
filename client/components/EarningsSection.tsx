import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Platform, useWindowDimensions, ScrollView } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { BanknoteIcon, ToolIcon, CalendarIcon, TrendingUpIcon, ShieldIcon, UserCheckIcon, ChevronRightIcon, ChevronDownIcon, MapPinIcon } from '@/components/icons/TabBarIcons';

interface EarningsSectionProps {
  onAddTool: () => void;
}

interface ToolType {
  name: string;
  avgPrice: number;
}

interface ExampleEarner {
  name: string;
  city: string;
  tool: string;
  monthlyEarning: number;
  quote: string;
}

const TOOL_TYPES: ToolType[] = [
  { name: 'Bušilica', avgPrice: 800 },
  { name: 'Brusilica', avgPrice: 700 },
  { name: 'Betonska mešalica', avgPrice: 2500 },
  { name: 'Krečara', avgPrice: 1500 },
  { name: 'Merdevine', avgPrice: 600 },
  { name: 'Kosilica', avgPrice: 1800 },
  { name: 'Vibro-nabijač', avgPrice: 3000 },
  { name: 'Šlajferica', avgPrice: 900 },
  { name: 'Cirkularna testera', avgPrice: 1200 },
  { name: 'Kompresor', avgPrice: 2000 },
];

const DAY_OPTIONS = [5, 8, 10, 12, 15, 20];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function EarningsSection({ onAddTool }: EarningsSectionProps) {
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  
  const [selectedTool, setSelectedTool] = useState<ToolType>(TOOL_TYPES[0]);
  const [selectedDays, setSelectedDays] = useState(10);
  const [showToolDropdown, setShowToolDropdown] = useState(false);
  const [showDaysDropdown, setShowDaysDropdown] = useState(false);
  
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
    return selectedTool.avgPrice * selectedDays;
  };

  const calculateYearlyEarning = () => {
    return calculateMonthlyEarning() * 12;
  };

  const examples: ExampleEarner[] = [
    { 
      name: 'Milan', 
      city: 'Niš',
      tool: 'Bušilica', 
      monthlyEarning: 12000,
      quote: 'Alat mi je stajao u garaži, sada zarađuje za mene.'
    },
    { 
      name: 'Dragan', 
      city: 'Beograd',
      tool: 'Betonska mešalica', 
      monthlyEarning: 25000,
      quote: 'Isplatilo se za 2 meseca iznajmljivanja.'
    },
    { 
      name: 'Zoran', 
      city: 'Novi Sad',
      tool: 'Brusilica', 
      monthlyEarning: 8400,
      quote: 'Jednostavno i sigurno, preporučujem.'
    },
  ];

  const trustElements = [
    { icon: <BanknoteIcon size={18} color={Colors.light.cta} />, text: 'Bez provizije', description: '0% naknada za vlasnike' },
    { icon: <ShieldIcon size={18} color={Colors.light.success} />, text: 'Plaćanje pri preuzimanju', description: 'Siguran prenos novca' },
    { icon: <UserCheckIcon size={18} color={Colors.light.trust} />, text: 'Verifikovani korisnici', description: 'Provereni iznajmljivači' },
  ];

  const avgDailyPrice = 800;

  return (
    <View style={[styles.container, { backgroundColor: Colors.light.primary + '15' }]}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.headerIcon, { backgroundColor: Colors.light.success + '20' }]}>
            <TrendingUpIcon size={24} color={Colors.light.success} />
          </View>
          <View>
            <ThemedText type="h3">Zaradi od svog alata</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Prosečna zarada: {avgDailyPrice} RSD/dan
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={[styles.content, isDesktop ? styles.contentDesktop : undefined]}>
        <Card style={[styles.calculatorCard, isDesktop ? styles.calculatorCardDesktop : undefined]}>
          <View style={styles.calculatorHeader}>
            <ToolIcon size={20} color={Colors.light.cta} />
            <ThemedText type="h4" style={{ marginLeft: Spacing.sm }}>Kalkulator zarade</ThemedText>
          </View>
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: 6, fontWeight: '600' }}>
                Vrsta alata
              </ThemedText>
              <Pressable 
                style={[styles.dropdown, { backgroundColor: theme.backgroundSecondary, borderColor: showToolDropdown ? Colors.light.cta : theme.border }]}
                onPress={() => {
                  setShowToolDropdown(!showToolDropdown);
                  setShowDaysDropdown(false);
                }}
              >
                <ToolIcon size={16} color={theme.textSecondary} />
                <ThemedText type="body" style={{ flex: 1, marginLeft: Spacing.sm, fontWeight: '500' }}>
                  {selectedTool.name}
                </ThemedText>
                <ChevronDownIcon size={16} color={theme.textSecondary} />
              </Pressable>
              {showToolDropdown && (
                <View style={[styles.dropdownMenu, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                  <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                    {TOOL_TYPES.map((tool, index) => (
                      <Pressable
                        key={index}
                        style={[
                          styles.dropdownItem,
                          selectedTool.name === tool.name && { backgroundColor: Colors.light.primary + '20' }
                        ]}
                        onPress={() => {
                          setSelectedTool(tool);
                          setShowToolDropdown(false);
                        }}
                      >
                        <ThemedText type="body">{tool.name}</ThemedText>
                        <ThemedText type="small" style={{ color: Colors.light.success }}>
                          ~{tool.avgPrice} RSD/dan
                        </ThemedText>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
            
            <View style={styles.inputGroup}>
              <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: 6, fontWeight: '600' }}>
                Broj dana mesečno
              </ThemedText>
              <Pressable 
                style={[styles.dropdown, { backgroundColor: theme.backgroundSecondary, borderColor: showDaysDropdown ? Colors.light.cta : theme.border }]}
                onPress={() => {
                  setShowDaysDropdown(!showDaysDropdown);
                  setShowToolDropdown(false);
                }}
              >
                <CalendarIcon size={16} color={theme.textSecondary} />
                <ThemedText type="body" style={{ flex: 1, marginLeft: Spacing.sm, fontWeight: '500' }}>
                  {selectedDays} dana
                </ThemedText>
                <ChevronDownIcon size={16} color={theme.textSecondary} />
              </Pressable>
              {showDaysDropdown && (
                <View style={[styles.dropdownMenu, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                  {DAY_OPTIONS.map((days, index) => (
                    <Pressable
                      key={index}
                      style={[
                        styles.dropdownItem,
                        selectedDays === days && { backgroundColor: Colors.light.primary + '20' }
                      ]}
                      onPress={() => {
                        setSelectedDays(days);
                        setShowDaysDropdown(false);
                      }}
                    >
                      <ThemedText type="body">{days} dana</ThemedText>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </View>
          
          <View style={[styles.resultBox, { backgroundColor: Colors.light.success + '15', borderColor: Colors.light.success + '30' }]}>
            <View style={styles.resultRow}>
              <View style={styles.resultItem}>
                <ThemedText type="small" style={{ color: Colors.light.success, fontWeight: '600' }}>Mesečno</ThemedText>
                <ThemedText type="h2" style={{ color: Colors.light.success, marginTop: 2 }}>
                  {calculateMonthlyEarning().toLocaleString('sr-RS')} RSD
                </ThemedText>
              </View>
              <View style={[styles.resultDivider, { backgroundColor: Colors.light.success + '30' }]} />
              <View style={styles.resultItem}>
                <ThemedText type="small" style={{ color: theme.textSecondary, fontWeight: '600' }}>Godišnje</ThemedText>
                <ThemedText type="h3" style={{ color: theme.text, marginTop: 2 }}>
                  {calculateYearlyEarning().toLocaleString('sr-RS')} RSD
                </ThemedText>
              </View>
            </View>
          </View>
          
          <AnimatedPressable
            style={[animatedStyle, styles.ctaButton, { backgroundColor: Colors.light.cta }]}
            onPress={onAddTool}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <ToolIcon size={20} color="#FFFFFF" />
            <ThemedText type="body" style={{ color: '#FFFFFF', fontWeight: '700', marginLeft: Spacing.sm }}>
              Dodaj svoj alat i počni da zarađuješ
            </ThemedText>
            <ChevronRightIcon size={18} color="#FFFFFF" />
          </AnimatedPressable>
        </Card>

        <View style={[styles.rightColumn, isDesktop ? styles.rightColumnDesktop : undefined]}>
          <View style={styles.examplesSection}>
            <ThemedText type="h4" style={styles.sectionTitle}>Korisnici koji zarađuju</ThemedText>
            
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
                    <ThemedText type="body" style={{ fontWeight: '600' }}>{example.name} iz {example.city}a</ThemedText>
                    <View style={styles.exampleToolRow}>
                      <ToolIcon size={12} color={theme.textSecondary} />
                      <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 4 }}>{example.tool}</ThemedText>
                    </View>
                  </View>
                  <View style={styles.exampleEarning}>
                    <ThemedText type="h4" style={{ color: Colors.light.success }}>
                      {example.monthlyEarning.toLocaleString('sr-RS')}
                    </ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>RSD/mes</ThemedText>
                  </View>
                </View>
                <View style={[styles.quoteContainer, { backgroundColor: theme.backgroundSecondary }]}>
                  <ThemedText type="small" style={{ color: theme.textSecondary, fontStyle: 'italic' }}>
                    "{example.quote}"
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.trustSection}>
            <ThemedText type="h4" style={styles.sectionTitle}>Zašto VikendMajstor?</ThemedText>
            <View style={styles.trustGrid}>
              {trustElements.map((el, index) => (
                <View key={index} style={[styles.trustCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                  <View style={[styles.trustIconContainer, { backgroundColor: isDark ? theme.backgroundSecondary : '#F5F5F5' }]}>
                    {el.icon}
                  </View>
                  <ThemedText type="body" style={{ fontWeight: '600', marginTop: Spacing.sm }}>
                    {el.text}
                  </ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 2, textAlign: 'center' }}>
                    {el.description}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing['2xl'],
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
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
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
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
    maxWidth: 450,
  },
  calculatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    flex: 1,
    zIndex: 10,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    zIndex: 100,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      },
      default: {
        elevation: 4,
      },
    }),
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  resultBox: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultItem: {
    flex: 1,
    alignItems: 'center',
  },
  resultDivider: {
    width: 1,
    height: 40,
    marginHorizontal: Spacing.md,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  rightColumn: {
    gap: Spacing.lg,
  },
  rightColumnDesktop: {
    flex: 1,
  },
  examplesSection: {
    gap: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  exampleCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  exampleToolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  exampleEarning: {
    alignItems: 'flex-end',
  },
  quoteContainer: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  trustSection: {
    marginTop: Spacing.sm,
  },
  trustGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  trustCard: {
    flex: 1,
    minWidth: 100,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  trustIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
