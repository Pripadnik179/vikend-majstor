import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ImageIcon, CalendarIcon, UserIcon, ClockIcon, CheckCircleIcon, XCircleIcon, AlertCircleIcon, StarIcon } from '@/components/icons/TabBarIcons';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { getApiUrl } from '@/lib/query-client';
import { Spacing, BorderRadius, Colors } from '@/constants/theme';
import type { Booking, Item, User } from '@shared/schema';

type BookingWithDetails = Booking & { item: Item; renter: User; owner: User };

interface BookingCardProps {
  booking: BookingWithDetails;
  viewType: 'renter' | 'owner';
  onPress: () => void;
}

const STATUS_CONFIG = {
  pending: {
    label: 'Na cekanju',
    color: Colors.light.warning,
    icon: ClockIcon,
    description: 'Ceka se potvrda vlasnika',
  },
  confirmed: {
    label: 'Potvrdjeno',
    color: Colors.light.success,
    icon: CheckCircleIcon,
    description: 'Rezervacija je potvrđena',
  },
  cancelled: {
    label: 'Otkazano',
    color: Colors.light.error,
    icon: XCircleIcon,
    description: 'Rezervacija je otkazana',
  },
  completed: {
    label: 'Zavrseno',
    color: Colors.light.trust,
    icon: StarIcon,
    description: 'Oceni iskustvo',
  },
  rejected: {
    label: 'Odbijeno',
    color: Colors.light.error,
    icon: XCircleIcon,
    description: 'Vlasnik je odbio zahtev',
  },
};

export function BookingCard({ booking, viewType, onPress }: BookingCardProps) {
  const { theme, isDark } = useTheme();

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

  const getDaysRemaining = () => {
    const start = new Date(booking.startDate);
    const now = new Date();
    const diffTime = start.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const statusKey = booking.status as keyof typeof STATUS_CONFIG;
  const statusInfo = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
  const StatusIcon = statusInfo.icon;

  const otherUser = viewType === 'renter' ? booking.owner : booking.renter;
  const daysRemaining = getDaysRemaining();
  const isUpcoming = booking.status === 'confirmed' && daysRemaining > 0 && daysRemaining <= 7;

  return (
    <Card style={styles.container} onPress={onPress}>
      {isUpcoming ? (
        <View style={[styles.upcomingBanner, { backgroundColor: Colors.light.cta + '15' }]}>
          <AlertCircleIcon size={14} color={Colors.light.cta} />
          <ThemedText type="small" style={{ color: Colors.light.cta, fontWeight: '600', marginLeft: 6 }}>
            Za {daysRemaining} {daysRemaining === 1 ? 'dan' : 'dana'}
          </ThemedText>
        </View>
      ) : null}
      
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
              {viewType === 'renter' ? 'Vlasnik:' : 'Iznajmljivac:'} {otherUser?.name || 'Korisnik'}
            </ThemedText>
          </View>
        </View>
      </View>
      
      <View style={[styles.timeline, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
        <View style={styles.timelineStep}>
          <View style={[styles.timelineDot, { backgroundColor: Colors.light.success }]} />
          <ThemedText type="small" style={{ color: theme.textSecondary }}>Zahtev</ThemedText>
        </View>
        <View style={[styles.timelineLine, { backgroundColor: booking.status !== 'pending' ? Colors.light.success : theme.border }]} />
        <View style={styles.timelineStep}>
          <View style={[
            styles.timelineDot, 
            { backgroundColor: booking.status === 'confirmed' || booking.status === 'completed' ? Colors.light.success : theme.border }
          ]} />
          <ThemedText type="small" style={{ color: theme.textSecondary }}>Potvrda</ThemedText>
        </View>
        <View style={[styles.timelineLine, { backgroundColor: booking.status === 'completed' ? Colors.light.success : theme.border }]} />
        <View style={styles.timelineStep}>
          <View style={[
            styles.timelineDot, 
            { backgroundColor: booking.status === 'completed' ? Colors.light.success : theme.border }
          ]} />
          <ThemedText type="small" style={{ color: theme.textSecondary }}>Zavrseno</ThemedText>
        </View>
      </View>
      
      <View style={styles.footer}>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
          <StatusIcon size={14} color={statusInfo.color} />
          <ThemedText type="small" style={{ color: statusInfo.color, fontWeight: '600', marginLeft: 4 }}>
            {statusInfo.label}
          </ThemedText>
        </View>
        <ThemedText type="body" style={{ color: theme.primary, fontWeight: '600' }}>
          {booking.totalPrice} RSD
        </ThemedText>
      </View>
      
      {booking.status === 'completed' && !(booking as any).hasReview ? (
        <Pressable 
          style={[styles.reviewButton, { backgroundColor: Colors.light.primary }]}
          onPress={onPress}
        >
          <StarIcon size={16} color="#1A1A1A" />
          <ThemedText type="small" style={{ color: '#1A1A1A', fontWeight: '600', marginLeft: 6 }}>
            Ostavi ocenu
          </ThemedText>
        </Pressable>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  upcomingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.sm,
    alignSelf: 'flex-start',
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
  timeline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  timelineStep: {
    alignItems: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 4,
  },
  timelineLine: {
    flex: 1,
    height: 2,
    marginHorizontal: Spacing.xs,
    marginBottom: 16,
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
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
});
