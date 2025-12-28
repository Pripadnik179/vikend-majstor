import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Platform, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import Animated, { useAnimatedStyle, withSpring, useSharedValue, withTiming } from 'react-native-reanimated';
import { ImageIcon, StarIcon, MapPinIcon, ClockIcon, ShieldIcon, TrendingUpIcon, ChevronRightIcon, InfoIcon, CheckCircleIcon, XCircleIcon } from '@/components/icons/TabBarIcons';
import { ThemedText } from '@/components/ThemedText';
import { ItemInfoModal } from '@/components/ItemInfoModal';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout } from '@/hooks/useWebLayout';
import { getImageUrl } from '@/lib/imageUtils';
import { Spacing, BorderRadius, Colors } from '@/constants/theme';
import type { Item } from '@shared/schema';

interface ItemCardProps {
  item: Item & { 
    isPremium?: boolean; 
    distance?: number | null;
    isNew?: boolean;
    isTopRenter?: boolean;
    isVerified?: boolean;
    rentalCount?: number;
    availableFrom?: string;
    availableToday?: boolean;
    owner?: any;
  };
  onPress: () => void;
  onReserve?: () => void;
  showExpiration?: boolean;
  showReserveButton?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ItemCard({ item, onPress, onReserve, showExpiration = false, showReserveButton = true }: ItemCardProps) {
  const { theme, isDark } = useTheme();
  const { isDesktop, cardWidth } = useWebLayout();
  const { width } = useWindowDimensions();
  const [showTooltip, setShowTooltip] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  const scale = useSharedValue(1);
  const tooltipOpacity = useSharedValue(0);
  
  const availableToday = item.availableToday !== undefined ? item.availableToday : item.isAvailable;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const tooltipStyle = useAnimatedStyle(() => ({
    opacity: tooltipOpacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handleHoverIn = () => {
    if (Platform.OS === 'web') {
      setShowTooltip(true);
      tooltipOpacity.value = withTiming(1, { duration: 150 });
    }
  };

  const handleHoverOut = () => {
    if (Platform.OS === 'web') {
      tooltipOpacity.value = withTiming(0, { duration: 150 });
      setTimeout(() => setShowTooltip(false), 150);
    }
  };

  const getDaysRemaining = () => {
    if (!item.expiresAt) return null;
    const expiresAt = new Date(item.expiresAt);
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = showExpiration ? getDaysRemaining() : null;
  const rating = item.rating ? (typeof item.rating === 'string' ? parseFloat(item.rating) : item.rating) : null;

  return (
    <AnimatedPressable
      style={[
        animatedStyle,
        styles.container,
        { 
          width: cardWidth,
          flex: cardWidth ? undefined : 1,
          backgroundColor: theme.backgroundDefault,
        },
        item.isPremium && styles.premiumContainer,
        item.isPremium && { borderColor: '#FFD700' },
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...(Platform.OS === 'web' ? { onMouseEnter: handleHoverIn, onMouseLeave: handleHoverOut } : {})}
    >
      <View style={styles.imageContainer}>
        {item.images && item.images.length > 0 ? (
          <Image
            source={{ uri: getImageUrl(item.images[0]) }}
            style={[styles.image, { aspectRatio: 4/3 }]}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage, { backgroundColor: theme.backgroundSecondary, aspectRatio: 4/3 }]}>
            <ImageIcon size={32} color={theme.textTertiary} />
          </View>
        )}
        
        <View style={styles.badgesContainer}>
          {item.isPremium ? (
            <View style={styles.premiumBadge}>
              <StarIcon size={12} color="#1A1A1A" />
              <ThemedText style={styles.premiumText}>PREMIUM</ThemedText>
            </View>
          ) : null}
          
          {item.isNew ? (
            <View style={[styles.statusBadge, { backgroundColor: Colors.light.success }]}>
              <ThemedText style={styles.statusText}>NOVO</ThemedText>
            </View>
          ) : null}
          
          {item.isTopRenter ? (
            <View style={[styles.statusBadge, { backgroundColor: Colors.light.cta }]}>
              <TrendingUpIcon size={10} color="#FFFFFF" />
              <ThemedText style={[styles.statusText, { marginLeft: 2 }]}>TOP</ThemedText>
            </View>
          ) : null}
          
          {item.isVerified ? (
            <View style={[styles.statusBadge, { backgroundColor: Colors.light.trust }]}>
              <ShieldIcon size={10} color="#FFFFFF" />
            </View>
          ) : null}
        </View>
        
        <Pressable 
          style={[styles.infoButton, { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)' }]}
          onPress={(e) => {
            e.stopPropagation?.();
            setShowInfoModal(true);
          }}
        >
          <InfoIcon size={18} color={theme.text} />
        </Pressable>
      </View>
      
      {showTooltip && Platform.OS === 'web' ? (
        <Animated.View style={[styles.tooltip, tooltipStyle, { backgroundColor: isDark ? '#333' : '#1A1A1A' }]}>
          {item.rentalCount ? (
            <ThemedText type="small" style={styles.tooltipText}>
              Iznajmljen {item.rentalCount} puta
            </ThemedText>
          ) : null}
          {rating ? (
            <View style={styles.tooltipRow}>
              <StarIcon size={12} color={Colors.light.primary} />
              <ThemedText type="small" style={[styles.tooltipText, { marginLeft: 4 }]}>
                Ocena {rating.toFixed(1)}
              </ThemedText>
            </View>
          ) : null}
          {item.availableFrom ? (
            <ThemedText type="small" style={styles.tooltipText}>
              Dostupan od {item.availableFrom}
            </ThemedText>
          ) : null}
        </Animated.View>
      ) : null}
      
      <View style={styles.content}>
        <ThemedText type="body" style={styles.title} numberOfLines={1}>
          {item.title}
        </ThemedText>
        
        <View style={styles.locationRow}>
          <MapPinIcon size={12} color={theme.textTertiary} />
          <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 4 }} numberOfLines={1}>
            {item.city}
            {item.distance != null ? ` (${item.distance < 1 ? `${Math.round(item.distance * 1000)} m` : `${item.distance.toFixed(1)} km`})` : ''}
          </ThemedText>
        </View>
        
        {rating ? (
          <View style={styles.ratingRow}>
            <StarIcon size={12} color={Colors.light.primary} />
            <ThemedText type="small" style={{ color: Colors.light.primary, fontWeight: '600', marginLeft: 4 }}>
              {rating.toFixed(1)}
            </ThemedText>
            {item.rentalCount ? (
              <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 4 }}>
                ({item.rentalCount})
              </ThemedText>
            ) : null}
          </View>
        ) : null}
        
        <View style={styles.priceRow}>
          <ThemedText type="body" style={{ color: theme.primary, fontWeight: '700' }}>
            {item.pricePerDay} RSD
            <ThemedText type="small" style={{ color: theme.textSecondary, fontWeight: '400' }}>/dan</ThemedText>
          </ThemedText>
        </View>
        
        <View style={[styles.availabilityRow, { backgroundColor: availableToday ? '#4CAF5015' : '#F4433615' }]}>
          {availableToday ? (
            <>
              <CheckCircleIcon size={14} color="#4CAF50" />
              <ThemedText type="small" style={{ color: '#4CAF50', marginLeft: 4, fontWeight: '500' }}>
                Dostupno danas
              </ThemedText>
            </>
          ) : (
            <>
              <XCircleIcon size={14} color="#F44336" />
              <ThemedText type="small" style={{ color: '#F44336', marginLeft: 4, fontWeight: '500' }}>
                Nije dostupno danas
              </ThemedText>
            </>
          )}
        </View>
        
        {daysRemaining !== null ? (
          <View style={[styles.expirationRow, { backgroundColor: daysRemaining <= 7 ? '#FFF3CD' : theme.backgroundSecondary }]}>
            <ClockIcon size={10} color={daysRemaining <= 7 ? '#856404' : theme.textSecondary} />
            <ThemedText type="small" style={{ color: daysRemaining <= 7 ? '#856404' : theme.textSecondary, marginLeft: 4 }}>
              {daysRemaining === 0 ? 'Istice danas' : `Istice za ${daysRemaining} dana`}
            </ThemedText>
          </View>
        ) : null}
        
        {showReserveButton ? (
          <Pressable 
            style={[
              styles.reserveButton, 
              { backgroundColor: availableToday ? Colors.light.cta : theme.backgroundSecondary }
            ]}
            onPress={(e) => {
              e.stopPropagation?.();
              if (availableToday) {
                onReserve?.() || onPress();
              }
            }}
            disabled={!availableToday}
          >
            <ThemedText type="small" style={{ color: availableToday ? '#FFFFFF' : theme.textTertiary, fontWeight: '600' }}>
              {availableToday ? 'Rezervisi' : 'Nije dostupan'}
            </ThemedText>
            {availableToday ? <ChevronRightIcon size={14} color="#FFFFFF" /> : null}
          </Pressable>
        ) : null}
      </View>
      
      <ItemInfoModal 
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        item={item}
      />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      },
    }),
  },
  premiumContainer: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgesContainer: {
    position: 'absolute',
    top: Spacing.xs,
    left: Spacing.xs,
    right: Spacing.xs,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  tooltip: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -40 }],
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    minWidth: 150,
    zIndex: 100,
  },
  tooltipText: {
    color: '#FFFFFF',
  },
  tooltipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  content: {
    padding: Spacing.sm,
  },
  title: {
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  priceRow: {
    marginTop: Spacing.xs,
  },
  expirationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.xs,
  },
  reserveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  infoButton: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.xs,
    alignSelf: 'flex-start',
  },
});
