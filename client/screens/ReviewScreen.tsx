import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, ActivityIndicator, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { StarIcon } from '@/components/icons/TabBarIcons';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useTheme } from '@/hooks/useTheme';
import { apiRequest } from '@/lib/query-client';
import { Spacing, BorderRadius } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import type { Booking, Item, User } from '@shared/schema';

type BookingWithDetails = Booking & { item: Item; renter: User; owner: User };

export default function ReviewScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const route = useRoute<RouteProp<RootStackParamList, 'Review'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { data: booking, isLoading: isLoadingBooking } = useQuery<BookingWithDetails>({
    queryKey: ['/api/bookings', route.params.bookingId],
  });

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Greška', 'Izaberite ocenu');
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest('POST', '/api/reviews', {
        bookingId: route.params.bookingId,
        rating,
        comment: comment.trim() || null,
      });

      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      
      Alert.alert(
        'Hvala',
        'Vaša recenzija je uspešno poslata!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Greška', error.message || 'Došlo je do greške');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingBooking || !booking) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + Spacing.xl }]}
    >
      <Card style={styles.itemCard}>
        <ThemedText type="h4">{booking.item?.title}</ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
          {booking.item?.city}{booking.item?.district ? `, ${booking.item.district}` : ''}
        </ThemedText>
      </Card>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>Vaša ocena</ThemedText>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable
              key={star}
              onPress={() => setRating(star)}
              style={({ pressed }) => [
                styles.starButton,
                { transform: [{ scale: pressed ? 0.9 : 1 }] },
              ]}
            >
              <StarIcon
                size={40}
                color={star <= rating ? theme.warning : theme.border}
              />
            </Pressable>
          ))}
        </View>
        <ThemedText type="body" style={[styles.ratingText, { color: theme.textSecondary }]}>
          {rating === 0 && 'Izaberite ocenu'}
          {rating === 1 && 'Loše'}
          {rating === 2 && 'Moglo je bolje'}
          {rating === 3 && 'Prosečno'}
          {rating === 4 && 'Dobro'}
          {rating === 5 && 'Odlično'}
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>Komentar (opciono)</ThemedText>
        <TextInput
          style={[
            styles.textArea,
            { 
              backgroundColor: theme.backgroundDefault, 
              borderColor: theme.border, 
              color: theme.text,
            },
          ]}
          placeholder="Opišite vaše iskustvo..."
          placeholderTextColor={theme.textTertiary}
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={500}
        />
        <ThemedText type="small" style={{ color: theme.textTertiary, marginTop: Spacing.xs }}>
          {comment.length}/500
        </ThemedText>
      </View>

      <Button onPress={handleSubmit} disabled={isLoading || rating === 0} style={styles.submitButton}>
        {isLoading ? <ActivityIndicator color="#FFFFFF" /> : 'Pošalji ocenu'}
      </Button>
    </KeyboardAwareScrollViewCompat>
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
  itemCard: {
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  starButton: {
    padding: Spacing.xs,
  },
  ratingText: {
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  textArea: {
    height: 120,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    fontSize: 16,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
});
