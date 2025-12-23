import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ItemCard } from '@/components/ItemCard';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout } from '@/hooks/useWebLayout';
import { Spacing, BorderRadius, Colors } from '@/constants/theme';
import { BoxIcon, ChevronDownIcon } from '@/components/icons/TabBarIcons';
import type { RootStackParamList } from '@/navigation/types';
import type { Item } from '@shared/schema';

interface AllItemsSectionProps {
  items: Item[];
  onSeeAll?: () => void;
  isLoading?: boolean;
}

const INITIAL_ITEMS_MOBILE = 6;
const ITEMS_PER_PAGE_MOBILE = 6;

export function AllItemsSection({ items, onSeeAll, isLoading }: AllItemsSectionProps) {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isDesktop, isTablet, numColumns, gridMaxWidth, gridGap, sectionPadding, cardWidth } = useWebLayout();

  const [visibleCount, setVisibleCount] = useState(INITIAL_ITEMS_MOBILE);

  if (!items || items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <BoxIcon size={64} color={theme.textTertiary} />
        <ThemedText type="h4" style={[styles.emptyTitle, { color: theme.textSecondary }]}>
          Nema dostupnih stvari
        </ThemedText>
        <ThemedText type="body" style={[styles.emptyText, { color: theme.textTertiary }]}>
          Budi prvi koji ce dodati stvar
        </ThemedText>
      </View>
    );
  }

  const handleItemPress = (itemId: string) => {
    navigation.navigate('ItemDetail', { itemId });
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE_MOBILE);
  };

  const displayedItems = isDesktop ? items : items.slice(0, visibleCount);
  const hasMore = !isDesktop && visibleCount < items.length;

  const renderDesktopGrid = () => (
    <View style={[
      styles.container, 
      { 
        alignItems: 'center',
        paddingHorizontal: sectionPadding,
      }
    ]}>
      <View style={[
        styles.sectionWrapper,
        { maxWidth: gridMaxWidth, width: '100%' }
      ]}>
        <View style={styles.headerRow}>
          <View>
            <ThemedText type="h3">Svi alati</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {items.length} dostupno
            </ThemedText>
          </View>
          <Pressable style={styles.seeAllButton} onPress={onSeeAll}>
            <ThemedText type="small" style={{ color: theme.primary }}>
              Vidi sve
            </ThemedText>
          </Pressable>
        </View>
        
        <View style={[styles.gridContainer, { gap: gridGap }]}>
          {displayedItems.map((item) => (
            <View key={item.id} style={{ width: cardWidth }}>
              <ItemCard
                item={item}
                onPress={() => handleItemPress(item.id)}
              />
            </View>
          ))}
        </View>
        
        {hasMore ? (
          <Pressable 
            style={[styles.loadMoreButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
            onPress={handleLoadMore}
          >
            <ThemedText type="body" style={{ color: theme.text }}>
              Vidi vise
            </ThemedText>
            <ChevronDownIcon size={18} color={theme.text} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );

  const renderMobileGrid = () => (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <ThemedText type="h3">Svi alati</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {items.length} dostupno
          </ThemedText>
        </View>
        {items.length > INITIAL_ITEMS_MOBILE ? (
          <Pressable style={styles.seeAllButton} onPress={onSeeAll}>
            <ThemedText type="small" style={{ color: theme.primary }}>
              Vidi sve
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
      
      <View style={[styles.mobileGrid, { gap: gridGap }]}>
        {displayedItems.map((item) => (
          <View 
            key={item.id} 
            style={[
              styles.mobileGridItem,
              { 
                width: numColumns > 1 
                  ? `${(100 - (gridGap * (numColumns - 1)) / (numColumns * 4)) / numColumns}%` as any
                  : '100%',
              }
            ]}
          >
            <ItemCard
              item={item}
              onPress={() => handleItemPress(item.id)}
            />
          </View>
        ))}
      </View>
      
      {hasMore ? (
        <Pressable 
          style={[styles.loadMoreButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
          onPress={handleLoadMore}
        >
          <ThemedText type="body" style={{ color: theme.text }}>
            Vidi vise ({items.length - visibleCount} preostalo)
          </ThemedText>
          <ChevronDownIcon size={18} color={theme.text} />
        </Pressable>
      ) : null}
    </View>
  );

  return isDesktop ? renderDesktopGrid() : renderMobileGrid();
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing['2xl'],
  },
  sectionWrapper: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  mobileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mobileGridItem: {
    marginBottom: Spacing.md,
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyTitle: {
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
