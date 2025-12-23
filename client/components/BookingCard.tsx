import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ImageIcon, CalendarIcon, UserIcon } from '@/components/icons/TabBarIcons';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { getApiUrl } from '@/lib/query-client';
import { Spacing, BorderRadius, BOOKING_STATUSES } from '@/constants/theme';
import type { Booking, Item, User } from '@shared/schema';

type BookingWithDetails = Booking & { item: Item; renter: User; owner: User };

interface BookingCardProps {
  booking: BookingWithDetails;
  viewType: 'renter' | 'owner';
  onPress: () => void;
}

export function BookingCard({ booking, viewType, onPress }: BookingCardProps) {
  const { theme } = useTheme();

  const getImageUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    if (path.startsWith('/objects/')) {
      return `${getApiUrl()}/api${path}`;
    }
    if (path.startsWith('/public-objects/')) {
      return `${getApiUrl()}/api/objects${path.replace('/public-objects/', '/public/')}`;
    }
    return `${getApiUrl()}${path}`;
  };

  const formatDateRange = (start: Date | string, end: Date | string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' })}`;
  };

  const statusInfo = BOOKING_STATUSES[booking.status as keyof typeof BOOKING_STATUSES] || {
    label: booking.status,
    color: theme.textSecondary,
  };

  const otherUser = viewType === 'renter' ? booking.owner : booking.renter;

  return (
    <Card style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        {booking.item?.images && booking.item.images.length > 0 ? (
          <Image
            source={{ uri: getImageUrl(booking.item.images[0]) }}
            style={styles.image}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage, { backgroundColor: theme.backgroundSecondary }]}>
            <ImageIcon size={24} color={theme.textTertiary} />
          </View>
        )}
        <View style={styles.info}>
          <ThemedText type="body" style={{ fontWeight: '600' }} numberOfLines={1}>
            {booking.item?.title || 'Stvar'}
          </ThemedText>
          <View style={styles.dateRow}>
            <CalendarIcon size={14} color={theme.textTertiary} />
            <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 4 }}>
              {formatDateRange(booking.startDate, booking.endDate)}
            </ThemedText>
          </View>
          <View style={styles.userRow}>
            <UserIcon size={14} color={theme.textTertiary} />
            <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 4 }}>
              {viewType === 'renter' ? 'Vlasnik:' : 'Iznajmljivač:'} {otherUser?.name || 'Korisnik'}
            </ThemedText>
          </View>
        </View>
      </View>
      <View style={styles.footer}>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
          <ThemedText type="small" style={{ color: statusInfo.color, fontWeight: '600' }}>
            {statusInfo.label}
          </ThemedText>
        </View>
        <ThemedText type="body" style={{ color: theme.primary, fontWeight: '600' }}>
          {booking.totalPrice} RSD
        </ThemedText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  content: {
    flexDirection: 'row',
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.md,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.xs,
  },
});
