import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Feather from '@expo/vector-icons/Feather';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout } from '@/hooks/useWebLayout';
import { Spacing, BorderRadius } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import { CATEGORIES } from '@shared/schema';

type TabType = 'project' | 'toolType';

const CATEGORY_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  gradjevinarstvo: 'home',
  basta: 'sun',
  renoviranje: 'tool',
  drvoprerađivanje: 'layers',
  autoMehanika: 'truck',
  ciscenje: 'droplet',
  elektricni: 'zap',
  akumulatorski: 'battery-charging',
  rucni: 'edit-3',
  pneumatski: 'wind',
  gradevinskemasine: 'truck',
  merniLaserski: 'crosshair',
};

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { isDesktop, contentPaddingTop, contentPaddingBottom } = useWebLayout();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<TabType>('project');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const categories = activeTab === 'project' ? CATEGORIES.byProject : CATEGORIES.byToolType;

  const handleCategoryPress = (categoryKey: string) => {
    if (expandedCategory === categoryKey) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryKey);
    }
  };

  const handleSubcategoryPress = (category: string, subcategory: string) => {
    navigation.navigate('Search', { category, subcategory });
  };

  const handleViewAllPress = (category: string) => {
    navigation.navigate('Search', { category });
  };

  const paddingTop = isDesktop ? contentPaddingTop + Spacing.md : insets.top;
  const paddingBottom = isDesktop ? contentPaddingBottom + Spacing.xl : insets.bottom + 100;

  return (
    <ThemedView style={[styles.container, { paddingTop }]}>
      <View style={styles.header}>
        <ThemedText type="h2">Kategorije</ThemedText>
      </View>

      <View style={styles.tabs}>
        <Pressable
          style={[
            styles.tab,
            activeTab === 'project' && styles.activeTab,
            activeTab === 'project' && { backgroundColor: theme.primary },
            { borderColor: theme.primary },
          ]}
          onPress={() => setActiveTab('project')}
        >
          <Feather 
            name="briefcase" 
            size={16} 
            color={activeTab === 'project' ? '#FFFFFF' : theme.primary} 
          />
          <ThemedText 
            type="body" 
            style={[
              styles.tabText,
              { color: activeTab === 'project' ? '#FFFFFF' : theme.primary }
            ]}
          >
            Po delatnosti
          </ThemedText>
        </Pressable>
        <Pressable
          style={[
            styles.tab,
            activeTab === 'toolType' && styles.activeTab,
            activeTab === 'toolType' && { backgroundColor: theme.primary },
            { borderColor: theme.primary },
          ]}
          onPress={() => setActiveTab('toolType')}
        >
          <Feather 
            name="tool" 
            size={16} 
            color={activeTab === 'toolType' ? '#FFFFFF' : theme.primary} 
          />
          <ThemedText 
            type="body" 
            style={[
              styles.tabText,
              { color: activeTab === 'toolType' ? '#FFFFFF' : theme.primary }
            ]}
          >
            Po vrsti alata
          </ThemedText>
        </Pressable>
      </View>

      <ScrollView 
        style={styles.list}
        contentContainerStyle={[styles.listContent, { paddingBottom }]}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(categories).map(([key, category]) => {
          const isExpanded = expandedCategory === key;
          const iconName = CATEGORY_ICONS[key] || 'folder';

          return (
            <View key={key} style={styles.categoryWrapper}>
              <Pressable
                onPress={() => handleCategoryPress(key)}
                style={({ pressed }) => [
                  styles.categoryCard,
                  { 
                    backgroundColor: pressed ? theme.primaryLight : theme.backgroundDefault,
                    borderColor: isExpanded ? theme.primary : theme.border,
                  },
                ]}
              >
                <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
                  <Feather name={iconName} size={24} color={theme.primary} />
                </View>
                <View style={styles.categoryInfo}>
                  <ThemedText type="h4">{category.name}</ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    {category.subcategories.length} podkategorija
                  </ThemedText>
                </View>
                <Feather 
                  name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                  size={22} 
                  color={theme.textSecondary} 
                />
              </Pressable>

              {isExpanded && (
                <View style={[styles.subcategories, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                  {category.subcategories.map((sub, index) => (
                    <Pressable
                      key={index}
                      style={({ pressed }) => [
                        styles.subcategoryItem,
                        { backgroundColor: pressed ? theme.primaryLight : 'transparent' },
                        index < category.subcategories.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
                      ]}
                      onPress={() => handleSubcategoryPress(category.name, sub)}
                    >
                      <ThemedText type="body">{sub}</ThemedText>
                      <Feather name="chevron-right" size={18} color={theme.textTertiary} />
                    </Pressable>
                  ))}
                  <Pressable
                    style={[styles.viewAllButton, { backgroundColor: theme.primaryLight }]}
                    onPress={() => handleViewAllPress(category.name)}
                  >
                    <ThemedText type="body" style={{ color: theme.primary, fontWeight: '600' }}>
                      Prikaži sve iz {category.name}
                    </ThemedText>
                  </Pressable>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
  },
  activeTab: {},
  tabText: {
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  categoryWrapper: {
    marginBottom: Spacing.md,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  subcategories: {
    marginTop: -Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    overflow: 'hidden',
  },
  subcategoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  viewAllButton: {
    padding: Spacing.md,
    alignItems: 'center',
  },
});
