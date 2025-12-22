import React from 'react';
import { View, ScrollView, StyleSheet, Pressable, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { ImageIcon, MapPinIcon, StarIcon, MessageIcon } from '@/components/icons/TabBarIcons';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { AvailabilityCalendar } from '@/components/AvailabilityCalendar';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout, MAX_CONTENT_WIDTH } from '@/hooks/useWebLayout';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest, getApiUrl } from '@/lib/query-client';
import { Spacing, BorderRadius, CATEGORIES } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import type { Item, User, Review, Booking } from '@shared/schema';

type ItemWithOwner = Item & { owner: User };

export default function ItemDetailScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const { isDesktop, horizontalPadding } = useWebLayout();
  const { user } = useAuth();
  
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const imageWidth = isDesktop ? contentWidth : width;
  const route = useRoute<RouteProp<RootStackParamList, 'ItemDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();

  const { data: item, isLoading } = useQuery<ItemWithOwner>({
    queryKey: ['/api/items', route.params.itemId],
  });

  const { data: reviews = [] } = useQuery<(Review & { reviewer: User })[]>({
    queryKey: ['/api/items', route.params.itemId, 'reviews'],
    enabled: !!item,
  });

  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ['/api/items', route.params.itemId, 'bookings'],
    enabled: !!item,
  });

  const categoryLabel = CATEGORIES.find(c => c.id === item?.category)?.label || item?.category;

  const handleContactOwner = async () => {
    if (!item || !item.owner) return;
    
    try {
      const response = await apiRequest('POST', '/api/conversations', {
        userId: item.ownerId,
        itemId: item.id,
      });
      const conversation = await response.json();
      navigation.navigate('Chat', { 
        conversationId: conversation.id, 
        otherUserName: item.owner.name,
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const getImageUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    if (path.startsWith('/objects/')) {
      return `${getApiUrl()}/api${path}`;
    }
    return `${getApiUrl()}${path}`;
  };

  if (isLoading || !item) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const isOwner = user?.id === item.ownerId;

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundRoot }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          paddingBottom: 100,
          alignItems: isDesktop ? 'center' : undefined,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
      >
        <View style={{ 
          width: isDesktop ? contentWidth : '100%',
          maxWidth: MAX_CONTENT_WIDTH,
        }}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            style={[styles.imageGallery, { width: imageWidth }]}
          >
            {item.images && item.images.length > 0 ? (
              item.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: getImageUrl(image) }}
                  style={[styles.image, { width: imageWidth }]}
                  contentFit="cover"
                />
              ))
            ) : (
              <View style={[styles.image, styles.placeholderImage, { backgroundColor: theme.backgroundSecondary, width: imageWidth }]}>
                <ImageIcon size={48} color={theme.textTertiary} />
              </View>
            )}
          </ScrollView>

          <View style={[styles.content, { paddingHorizontal: isDesktop ? Spacing.xl : Spacing.lg }]}>
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <ThemedText type="h2">{item.title}</ThemedText>
              <View style={[styles.categoryBadge, { backgroundColor: theme.primaryLight }]}>
                <ThemedText type="small" style={{ color: theme.primary }}>{categoryLabel}</ThemedText>
              </View>
            </View>
            <View style={styles.priceSection}>
              <ThemedText type="h3" style={{ color: theme.primary }}>{item.pricePerDay} RSD</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>po danu</ThemedText>
            </View>
          </View>

          <View style={styles.locationRow}>
            <MapPinIcon size={16} color={theme.textSecondary} />
            <ThemedText type="body" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>
              {item.city}{item.district ? `, ${item.district}` : ''}
            </ThemedText>
          </View>

          {item.owner && (
            <Card style={styles.ownerCard} onPress={handleContactOwner}>
              <View style={[styles.ownerAvatar, { backgroundColor: theme.primary }]}>
                <ThemedText style={styles.ownerAvatarText}>
                  {item.owner.name.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
              <View style={styles.ownerInfo}>
                <ThemedText type="body" style={{ fontWeight: '600' }}>{item.owner.name}</ThemedText>
                <View style={styles.ratingRow}>
                  <StarIcon size={14} color={theme.warning} />
                  <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 4 }}>
                    {item.owner.rating ? Number(item.owner.rating).toFixed(1) : '-'} ({item.owner.totalRatings || 0})
                  </ThemedText>
                </View>
              </View>
              <MessageIcon size={22} color={theme.primary} />
            </Card>
          )}

          <View style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>Opis</ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              {item.description}
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>Depozit</ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              {item.deposit} RSD (vraća se nakon vraćanja)
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>Dostupnost</ThemedText>
            <AvailabilityCalendar 
              bookings={bookings.map(b => ({
                startDate: b.startDate as unknown as string,
                endDate: b.endDate as unknown as string,
              }))}
            />
          </View>

          {reviews.length > 0 && (
            <View style={styles.section}>
              <ThemedText type="h4" style={styles.sectionTitle}>Recenzije ({reviews.length})</ThemedText>
              {reviews.slice(0, 3).map((review) => (
                <Card key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <ThemedText type="body" style={{ fontWeight: '600' }}>
                      {review.reviewer?.name || 'Korisnik'}
                    </ThemedText>
                    <View style={styles.ratingRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          size={14}
                          color={star <= review.rating ? theme.warning : theme.border}
                        />
                      ))}
                    </View>
                  </View>
                  {review.comment && (
                    <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
                      {review.comment}
                    </ThemedText>
                  )}
                </Card>
              ))}
            </View>
          )}
          </View>
        </View>
      </ScrollView>

      {!isOwner && (
        <View style={[
          styles.footer, 
          { 
            backgroundColor: theme.backgroundRoot, 
            borderTopColor: theme.border,
            paddingHorizontal: isDesktop ? Math.max((width - contentWidth) / 2 + Spacing.lg, Spacing.lg) : Spacing.lg,
          }
        ]}>
          <View style={[styles.footerInner, { maxWidth: MAX_CONTENT_WIDTH }]}>
            <View style={styles.footerPrice}>
              <ThemedText type="h3" style={{ color: theme.primary }}>{item.pricePerDay} RSD</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>po danu + {item.deposit} RSD depozit</ThemedText>
            </View>
            <Button
              onPress={() => navigation.navigate('BookingFlow', { itemId: item.id })}
              style={styles.bookButton}
            >
              Rezerviši
            </Button>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageGallery: {
    height: 300,
  },
  image: {
    height: 300,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingVertical: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  titleSection: {
    flex: 1,
    marginRight: Spacing.md,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    marginTop: Spacing.sm,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  ownerAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  ownerInfo: {
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  reviewCard: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingBottom: 34,
    borderTopWidth: 1,
  },
  footerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  footerPrice: {
    flex: 1,
  },
  bookButton: {
    paddingHorizontal: Spacing['2xl'],
  },
});
