import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout } from '@/hooks/useWebLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { 
  BanknoteIcon, 
  ToolIcon, 
  CalendarIcon, 
  TrendingUpIcon, 
  ShieldIcon, 
  UserCheckIcon, 
  ChevronRightIcon, 
  ChevronDownIcon 
} from '@/components/icons/TabBarIcons';
import type { RootStackParamList } from '@/navigation/types';

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

const EXAMPLES: ExampleEarner[] = [
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function EarningsScreen() {
  const { theme, isDark } = useTheme();
  const { isDesktop, gridMaxWidth, sectionPadding } = useWebLayout();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, isVerified } = useAuth();
  
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

  const handleAddTool = useCallback(() => {
    if (!user) {
      Alert.alert(
        'Prijava potrebna',
        'Morate biti prijavljeni da biste dodali oglas.',
        [{ text: 'U redu' }]
      );
      return;
    }
    
    if (!isVerified) {
      Alert.alert(
        'Potvrdite email',
        'Pre dodavanja oglasa morate da potvrdite vašu email adresu.',
        [{ text: 'U redu' }]
      );
      return;
    }
    
    navigation.navigate('AddItem');
  }, [user, isVerified, navigation]);

  const calculateMonthlyEarning = () => {
    return selectedTool.avgPrice * selectedDays;
  };

  const calculateYearlyEarning = () => {
    return calculateMonthlyEarning() * 12;
  };

  const trustElements = [
    { icon: <BanknoteIcon size={20} color={Colors.light.cta} />, text: 'Bez provizije', description: '0% naknada za vlasnike' },
    { icon: <ShieldIcon size={20} color={Colors.light.success} />, text: 'Plaćanje pri preuzimanju', description: 'Siguran prenos novca' },
    { icon: <UserCheckIcon size={20} color={Colors.light.trust} />, text: 'Verifikovani korisnici', description: 'Provereni iznajmljivači' },
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingTop: insets.top + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
            paddingHorizontal: sectionPadding,
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[
          styles.wrapper,
          isDesktop ? { maxWidth: gridMaxWidth, alignSelf: 'center', width: '100%' } : undefined
        ]}>
          <View style={styles.header}>
            <View style={[styles.headerIcon, { backgroundColor: Colors.light.success + '20' }]}>
              <TrendingUpIcon size={28} color={Colors.light.success} />
            </View>
            <ThemedText type="h2" style={styles.title}>Zaradi od svog alata</ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: 'center', marginTop: Spacing.sm }}>
              Tvoj alat ti može donositi prihod svaki mesec. Pogledaj kako.
            </ThemedText>
          </View>

          <View style={[styles.content, isDesktop ? styles.contentDesktop : undefined]}>
            <Card style={isDesktop ? { ...styles.calculatorCard, ...styles.calculatorCardDesktop } : styles.calculatorCard}>
              <View style={styles.calculatorHeader}>
                <ToolIcon size={22} color={Colors.light.cta} />
                <ThemedText type="h3" style={{ marginLeft: Spacing.sm }}>Kalkulator zarade</ThemedText>
              </View>
              
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { zIndex: 20 }]}>
                  <ThemedText type="body" style={{ color: theme.textSecondary, marginBottom: 8, fontWeight: '600' }}>
                    Vrsta alata
                  </ThemedText>
                  <Pressable 
                    style={[styles.dropdown, { backgroundColor: theme.backgroundSecondary, borderColor: showToolDropdown ? Colors.light.cta : theme.border }]}
                    onPress={() => {
                      setShowToolDropdown(!showToolDropdown);
                      setShowDaysDropdown(false);
                    }}
                  >
                    <ToolIcon size={18} color={theme.textSecondary} />
                    <ThemedText type="body" style={{ flex: 1, marginLeft: Spacing.sm, fontWeight: '500' }}>
                      {selectedTool.name}
                    </ThemedText>
                    <ChevronDownIcon size={18} color={theme.textSecondary} />
                  </Pressable>
                  {showToolDropdown ? (
                    <View style={[styles.dropdownMenu, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                      <ScrollView style={{ maxHeight: 250 }} nestedScrollEnabled>
                        {TOOL_TYPES.map((tool, index) => (
                          <Pressable
                            key={index}
                            style={[
                              styles.dropdownItem,
                              selectedTool.name === tool.name ? { backgroundColor: Colors.light.primary + '20' } : undefined
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
                  ) : null}
                </View>
                
                <View style={[styles.inputGroup, { zIndex: 10 }]}>
                  <ThemedText type="body" style={{ color: theme.textSecondary, marginBottom: 8, fontWeight: '600' }}>
                    Broj dana mesečno
                  </ThemedText>
                  <Pressable 
                    style={[styles.dropdown, { backgroundColor: theme.backgroundSecondary, borderColor: showDaysDropdown ? Colors.light.cta : theme.border }]}
                    onPress={() => {
                      setShowDaysDropdown(!showDaysDropdown);
                      setShowToolDropdown(false);
                    }}
                  >
                    <CalendarIcon size={18} color={theme.textSecondary} />
                    <ThemedText type="body" style={{ flex: 1, marginLeft: Spacing.sm, fontWeight: '500' }}>
                      {selectedDays} dana
                    </ThemedText>
                    <ChevronDownIcon size={18} color={theme.textSecondary} />
                  </Pressable>
                  {showDaysDropdown ? (
                    <View style={[styles.dropdownMenu, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                      {DAY_OPTIONS.map((days, index) => (
                        <Pressable
                          key={index}
                          style={[
                            styles.dropdownItem,
                            selectedDays === days ? { backgroundColor: Colors.light.primary + '20' } : undefined
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
                  ) : null}
                </View>
              </View>
              
              <View style={[styles.resultBox, { backgroundColor: Colors.light.success + '15', borderColor: Colors.light.success + '30' }]}>
                <View style={styles.resultRow}>
                  <View style={styles.resultItem}>
                    <ThemedText type="small" style={{ color: Colors.light.success, fontWeight: '700', textTransform: 'uppercase' }}>Mesečno</ThemedText>
                    <ThemedText type="h1" style={{ color: Colors.light.success, marginTop: 4 }}>
                      {calculateMonthlyEarning().toLocaleString('sr-RS')}
                    </ThemedText>
                    <ThemedText type="body" style={{ color: Colors.light.success }}>RSD</ThemedText>
                  </View>
                  <View style={[styles.resultDivider, { backgroundColor: Colors.light.success + '30' }]} />
                  <View style={styles.resultItem}>
                    <ThemedText type="small" style={{ color: theme.textSecondary, fontWeight: '700', textTransform: 'uppercase' }}>Godišnje</ThemedText>
                    <ThemedText type="h2" style={{ color: theme.text, marginTop: 4 }}>
                      {calculateYearlyEarning().toLocaleString('sr-RS')}
                    </ThemedText>
                    <ThemedText type="body" style={{ color: theme.textSecondary }}>RSD</ThemedText>
                  </View>
                </View>
              </View>
              
              <AnimatedPressable
                style={[animatedStyle, styles.ctaButton, { backgroundColor: Colors.light.cta }]}
                onPress={handleAddTool}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
              >
                <ToolIcon size={22} color="#FFFFFF" />
                <ThemedText type="h4" style={{ color: '#FFFFFF', marginLeft: Spacing.sm }}>
                  Dodaj svoj alat
                </ThemedText>
                <ChevronRightIcon size={20} color="#FFFFFF" />
              </AnimatedPressable>
            </Card>

            <View style={[styles.rightColumn, isDesktop ? styles.rightColumnDesktop : undefined]}>
              <View style={styles.examplesSection}>
                <ThemedText type="h3" style={styles.sectionTitle}>Korisnici koji zarađuju</ThemedText>
                
                {EXAMPLES.map((example, index) => (
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
                          <ToolIcon size={14} color={theme.textSecondary} />
                          <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 4 }}>{example.tool}</ThemedText>
                        </View>
                      </View>
                      <View style={styles.exampleEarning}>
                        <ThemedText type="h3" style={{ color: Colors.light.success }}>
                          {example.monthlyEarning.toLocaleString('sr-RS')}
                        </ThemedText>
                        <ThemedText type="small" style={{ color: theme.textSecondary }}>RSD/mes</ThemedText>
                      </View>
                    </View>
                    <View style={[styles.quoteContainer, { backgroundColor: theme.backgroundSecondary }]}>
                      <ThemedText type="body" style={{ color: theme.textSecondary, fontStyle: 'italic' }}>
                        "{example.quote}"
                      </ThemedText>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.trustSection}>
                <ThemedText type="h3" style={styles.sectionTitle}>Zašto VikendMajstor?</ThemedText>
                <View style={styles.trustGrid}>
                  {trustElements.map((el, index) => (
                    <View key={index} style={[styles.trustCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                      <View style={[styles.trustIconContainer, { backgroundColor: isDark ? theme.backgroundSecondary : '#F5F5F5' }]}>
                        {el.icon}
                      </View>
                      <ThemedText type="body" style={{ fontWeight: '700', marginTop: Spacing.md }}>
                        {el.text}
                      </ThemedText>
                      <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 4, textAlign: 'center' }}>
                        {el.description}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  wrapper: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    textAlign: 'center',
  },
  content: {
    gap: Spacing.xl,
  },
  contentDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  calculatorCard: {
    padding: Spacing.xl,
  },
  calculatorCardDesktop: {
    flex: 1,
    maxWidth: 500,
  },
  calculatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    flex: 1,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    zIndex: 100,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      },
      default: {
        elevation: 8,
      },
    }),
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  resultBox: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
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
    height: 60,
    marginHorizontal: Spacing.lg,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  rightColumn: {
    gap: Spacing.xl,
  },
  rightColumnDesktop: {
    flex: 1,
  },
  examplesSection: {
    gap: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  exampleCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    color: '#1A1A1A',
    fontWeight: '700',
    fontSize: 18,
  },
  exampleInfo: {
    flex: 1,
  },
  exampleToolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  exampleEarning: {
    alignItems: 'flex-end',
  },
  quoteContainer: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  trustSection: {
    marginTop: Spacing.md,
  },
  trustGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  trustCard: {
    flex: 1,
    minWidth: 140,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  trustIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
