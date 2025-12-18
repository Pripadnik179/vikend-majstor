import React from 'react';
import { View, ScrollView, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Feather from '@expo/vector-icons/Feather';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/query-client';
import { Spacing, BorderRadius, BOOKING_STATUSES } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import type { Booking, Item, User } from '@shared/schema';

type BookingWithDetails = Booking & { item: Item; renter: User; owner: User };

export default function BookingDetailScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuth();
  const route = useRoute<RouteProp<RootStackParamList, 'BookingDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();

  const { data: booking, isLoading } = useQuery<BookingWithDetails>({
    queryKey: ['/api/bookings', route.params.bookingId],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Booking>) => {
      const response = await apiRequest('PUT', `/api/bookings/${route.params.bookingId}`, data);
      if (response.status === 204) {
        return null;
      }
      const text = await response.text();
      if (!text) {
        return null;
      }
      return JSON.parse(text);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings', route.params.bookingId] });
      
      if (variables.status === 'confirmed') {
        Alert.alert('Uspeh', 'Rezervacija je uspešno potvrđena!');
      } else if (variables.status === 'cancelled') {
        Alert.alert('Otkazano', 'Rezervacija je otkazana.');
        navigation.goBack();
      } else if (variables.status === 'completed') {
        Alert.alert('Završeno', 'Vraćanje je potvrđeno. Rezervacija je završena!');
      }
    },
    onError: (error: Error) => {
      console.error('Booking update error:', error);
      Alert.alert('Greška', error.message || 'Došlo je do greške pri ažuriranju rezervacije');
    },
  });

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('sr-RS', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric',
    });
  };

  const handleConfirm = () => {
    Alert.alert(
      'Potvrdi rezervaciju',
      'Da li želite da potvrdite ovu rezervaciju?',
      [
        { text: 'Otkaži', style: 'cancel' },
        { 
          text: 'Potvrdi', 
          onPress: () => updateMutation.mutate({ status: 'confirmed' }),
        },
      ]
    );
  };

  const handlePickupConfirm = () => {
    Alert.alert(
      'Potvrdi preuzimanje',
      'Da li potvrđujete da je stvar preuzeta?',
      [
        { text: 'Otkaži', style: 'cancel' },
        { 
          text: 'Potvrdi', 
          onPress: () => updateMutation.mutate({ 
            pickupConfirmed: true,
            status: 'active',
          }),
        },
      ]
    );
  };

  const handleReturnConfirm = () => {
    Alert.alert(
      'Potvrdi vraćanje',
      'Da li potvrđujete da je stvar vraćena?',
      [
        { text: 'Otkaži', style: 'cancel' },
        { 
          text: 'Potvrdi', 
          onPress: () => updateMutation.mutate({ 
            returnConfirmed: true,
            status: 'completed',
          }),
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Otkaži rezervaciju',
      'Da li ste sigurni da želite da otkažete ovu rezervaciju?',
      [
        { text: 'Ne', style: 'cancel' },
        { 
          text: 'Da, otkaži', 
          style: 'destructive',
          onPress: () => updateMutation.mutate({ status: 'cancelled' }),
        },
      ]
    );
  };

  const handleContactUser = async () => {
    if (!booking) return;
    const otherUserId = user?.id === booking.renterId ? booking.ownerId : booking.renterId;
    const otherUser = user?.id === booking.renterId ? booking.owner : booking.renter;
    
    try {
      const response = await apiRequest('POST', '/api/conversations', {
        userId: otherUserId,
        itemId: booking.itemId,
      });
      const conversation = await response.json();
      navigation.navigate('Chat', { 
        conversationId: conversation.id, 
        otherUserName: otherUser?.name || 'Korisnik',
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  if (isLoading || !booking) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const isOwner = user?.id === booking.ownerId;
  const isRenter = user?.id === booking.renterId;
  const statusInfo = BOOKING_STATUSES[booking.status as keyof typeof BOOKING_STATUSES];
  const otherUser = isOwner ? booking.renter : booking.owner;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + Spacing.xl }]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
        <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
        <ThemedText type="body" style={{ color: statusInfo.color, fontWeight: '600' }}>
          {statusInfo.label}
        </ThemedText>
      </View>

      <Card style={styles.itemCard}>
        <ThemedText type="h4">{booking.item?.title}</ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
          {booking.item?.city}{booking.item?.district ? `, ${booking.item.district}` : ''}
        </ThemedText>
      </Card>

      <Card style={styles.userCard} onPress={handleContactUser}>
        <View style={[styles.userAvatar, { backgroundColor: theme.primary }]}>
          <ThemedText style={styles.userAvatarText}>
            {(otherUser?.name || 'K').charAt(0).toUpperCase()}
          </ThemedText>
        </View>
        <View style={styles.userInfo}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {isOwner ? 'Iznajmljivač' : 'Vlasnik'}
          </ThemedText>
          <ThemedText type="body" style={{ fontWeight: '600' }}>{otherUser?.name}</ThemedText>
        </View>
        <Feather name="message-circle" size={22} color={theme.primary} />
      </Card>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>Period iznajmljivanja</ThemedText>
        <Card style={styles.dateCard}>
          <View style={styles.dateRow}>
            <View style={styles.dateColumn}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Od</ThemedText>
              <ThemedText type="body" style={{ fontWeight: '600' }}>
                {formatDate(booking.startDate)}
              </ThemedText>
            </View>
            <Feather name="arrow-right" size={20} color={theme.textTertiary} />
            <View style={styles.dateColumn}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Do</ThemedText>
              <ThemedText type="body" style={{ fontWeight: '600' }}>
                {formatDate(booking.endDate)}
              </ThemedText>
            </View>
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>Cena</ThemedText>
        <Card style={styles.priceCard}>
          <View style={styles.priceRow}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              Iznajmljivanje ({booking.totalDays} dana)
            </ThemedText>
            <ThemedText type="body">{booking.totalPrice} RSD</ThemedText>
          </View>
          <View style={styles.priceRow}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>Depozit</ThemedText>
            <ThemedText type="body">{booking.deposit} RSD</ThemedText>
          </View>
          <View style={[styles.priceRow, styles.totalRow, { borderTopColor: theme.border }]}>
            <ThemedText type="h4">Ukupno</ThemedText>
            <ThemedText type="h4" style={{ color: theme.primary }}>
              {booking.totalPrice + booking.deposit} RSD
            </ThemedText>
          </View>
        </Card>
      </View>

      <View style={styles.actions}>
        {booking.status === 'pending' && isOwner && (
          <>
            <Button 
              onPress={handleConfirm} 
              style={styles.actionButton}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Potvrđivanje...' : 'Potvrdi rezervaciju'}
            </Button>
            <Pressable 
              style={[styles.cancelButton, updateMutation.isPending && { opacity: 0.5 }]} 
              onPress={handleCancel}
              disabled={updateMutation.isPending}
            >
              <ThemedText type="body" style={{ color: theme.error }}>Odbij</ThemedText>
            </Pressable>
          </>
        )}

        {booking.status === 'pending' && isRenter && (
          <Pressable style={styles.cancelButton} onPress={handleCancel}>
            <ThemedText type="body" style={{ color: theme.error }}>Otkaži rezervaciju</ThemedText>
          </Pressable>
        )}

        {booking.status === 'confirmed' && !booking.pickupConfirmed && (
          <Button onPress={handlePickupConfirm} style={styles.actionButton}>
            Potvrdi preuzimanje
          </Button>
        )}

        {booking.status === 'active' && isOwner && !booking.returnConfirmed && (
          <Button onPress={handleReturnConfirm} style={styles.actionButton}>
            Potvrdi vraćanje
          </Button>
        )}

        {booking.status === 'completed' && (
          <Button 
            onPress={() => navigation.navigate('Review', { bookingId: booking.id })}
            style={styles.actionButton}
          >
            Oceni
          </Button>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: Spacing.lg,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  itemCard: {
    marginBottom: Spacing.md,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  dateCard: {
    padding: Spacing.lg,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  dateColumn: {
    alignItems: 'center',
  },
  priceCard: {
    padding: Spacing.lg,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  totalRow: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    marginBottom: 0,
  },
  actions: {
    marginTop: Spacing.md,
  },
  actionButton: {
    marginBottom: Spacing.md,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
});
