import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Alert, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DollarSignIcon, CheckCircleIcon } from '@/components/icons/TabBarIcons';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { DateRangePicker } from '@/components/DateRangePicker';
import { useTheme } from '@/hooks/useTheme';
import { apiRequest } from '@/lib/query-client';
import { Spacing, BorderRadius, Colors } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import type { Item, User, Booking } from '@shared/schema';

type ItemWithOwner = Item & { owner: User };

export default function BookingFlowScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const route = useRoute<RouteProp<RootStackParamList, 'BookingFlow'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash'>('cash');
  const [isLoading, setIsLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const { data: item, isLoading: isLoadingItem } = useQuery<ItemWithOwner>({
    queryKey: ['/api/items', route.params.itemId],
  });

  const { data: itemBookings = [] } = useQuery<Booking[]>({
    queryKey: ['/api/items', route.params.itemId, 'bookings'],
    enabled: !!route.params.itemId,
  });

  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const quickDates = [
    { label: 'Danas', days: 1, start: today },
    { label: 'Vikend', days: 2, start: getNextWeekend() },
    { label: '3 dana', days: 3, start: today },
    { label: 'Nedelja', days: 7, start: today },
  ];

  function getNextWeekend() {
    const d = new Date();
    const day = d.getDay();
    const daysUntilSaturday = (6 - day + 7) % 7 || 7;
    d.setDate(d.getDate() + daysUntilSaturday);
    return d;
  }

  const confirmedBookings = itemBookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'pending'
  );

  const bookedDates = new Set<string>();
  confirmedBookings.forEach(booking => {
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      bookedDates.add(d.toISOString().split('T')[0]);
    }
  });

  const isDateRangeAvailable = (start: Date, end: Date): boolean => {
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (bookedDates.has(d.toISOString().split('T')[0])) {
        return false;
      }
    }
    return true;
  };

  const selectQuickDate = (option: typeof quickDates[0]) => {
    const start = new Date(option.start);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + option.days - 1);
    
    if (!isDateRangeAvailable(start, end)) {
      Alert.alert('Nedostupno', 'Izabrani datumi su već rezervisani. Molimo izaberite druge datume.');
      return;
    }
    
    setStartDate(start);
    setEndDate(end);
  };

  const confirmedBookingsForPicker = confirmedBookings.map(b => ({
    startDate: b.startDate.toString(),
    endDate: b.endDate.toString(),
  }));

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const totalDays = calculateDays();
  const rentalCost = totalDays * (item?.pricePerDay || 0);
  const depositAmount = item?.deposit || 0;
  const totalCost = rentalCost + depositAmount;

  const handleConfirm = async () => {
    if (!startDate || !endDate) {
      Alert.alert('Greska', 'Izaberite datume');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/bookings', {
        itemId: route.params.itemId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalDays,
        totalPrice: rentalCost,
        deposit: depositAmount,
        paymentMethod,
        status: 'pending',
      });

      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      setBookingSuccess(true);
      
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Uspesno',
          'Vasa rezervacija je poslata vlasniku. Cekajte potvrdu.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error: any) {
      if (Platform.OS !== 'web') {
        Alert.alert('Greska', error.message || 'Doslo je do greske');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return date.toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' });
  };

  if (isLoadingItem || !item) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (bookingSuccess) {
    return (
      <View style={[styles.successContainer, { backgroundColor: theme.backgroundRoot }]}>
        <View style={styles.successIcon}>
          <CheckCircleIcon size={80} color={Colors.light.success} />
        </View>
        <ThemedText type="h2" style={styles.successTitle}>
          Rezervacija poslata!
        </ThemedText>
        <ThemedText type="body" style={[styles.successText, { color: theme.textSecondary }]}>
          Vasa rezervacija je uspesno poslata vlasniku predmeta. Dobicete obavestenje kada vlasnik potvrdi ili odbije vasu rezervaciju.
        </ThemedText>
        <Card style={styles.successCard}>
          <View style={styles.successRow}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>Predmet</ThemedText>
            <ThemedText type="body" style={{ fontWeight: '600' }}>{item.title}</ThemedText>
          </View>
          <View style={[styles.successRow, { marginTop: Spacing.md }]}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>Period</ThemedText>
            <ThemedText type="body">{formatDate(startDate)} - {formatDate(endDate)}</ThemedText>
          </View>
          <View style={[styles.successRow, { marginTop: Spacing.md }]}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>Ukupno</ThemedText>
            <ThemedText type="body" style={{ color: theme.primary, fontWeight: '700' }}>{totalCost} RSD</ThemedText>
          </View>
        </Card>
        <Button onPress={() => navigation.goBack()} style={styles.successButton}>
          Nazad na predmet
        </Button>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + Spacing.xl }]}
    >
      <Card style={styles.itemCard}>
        <ThemedText type="h4">{item.title}</ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
          {item.city}{item.district ? `, ${item.district}` : ''} | {item.pricePerDay} RSD/dan
        </ThemedText>
      </Card>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>Brzi izbor datuma</ThemedText>
        <View style={styles.quickDates}>
          {quickDates.map((option) => (
            <Pressable
              key={option.label}
              style={({ pressed }) => [
                styles.quickDateButton,
                { 
                  backgroundColor: pressed ? theme.primaryLight : theme.backgroundDefault,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => selectQuickDate(option)}
            >
              <ThemedText type="body">{option.label}</ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>Ili izaberite tačne datume</ThemedText>
        <DateRangePicker
          bookings={confirmedBookingsForPicker}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          minDate={today}
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>Način plaćanja</ThemedText>
        <Pressable
          style={[
            styles.paymentOption,
            { 
              backgroundColor: paymentMethod === 'cash' ? theme.primaryLight : theme.backgroundDefault,
              borderColor: paymentMethod === 'cash' ? theme.primary : theme.border,
            },
          ]}
          onPress={() => setPaymentMethod('cash')}
        >
          <DollarSignIcon 
            size={22} 
            color={paymentMethod === 'cash' ? theme.primary : theme.text} 
          />
          <View style={styles.paymentText}>
            <ThemedText type="body" style={{ fontWeight: '600' }}>Plati pri preuzimanju</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>Gotovina ili dogovor</ThemedText>
          </View>
          {paymentMethod === 'cash' && (
            <CheckCircleIcon size={22} color={theme.primary} />
          )}
        </Pressable>

        <Pressable
          style={[
            styles.paymentOption,
            { 
              backgroundColor: paymentMethod === 'stripe' ? theme.primaryLight : theme.backgroundDefault,
              borderColor: paymentMethod === 'stripe' ? theme.primary : theme.border,
              opacity: 0.5,
            },
          ]}
          disabled
        >
          <DynamicIcon 
            name="dollar-sign" 
            size={22} 
            color={theme.textTertiary} 
          />
          <View style={styles.paymentText}>
            <ThemedText type="body" style={{ fontWeight: '600', color: theme.textTertiary }}>
              Online plaćanje
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textTertiary }}>Uskoro dostupno</ThemedText>
          </View>
        </Pressable>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>Ukupno</ThemedText>
        <Card style={styles.priceCard}>
          <View style={styles.priceRow}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              Iznajmljivanje ({totalDays} {totalDays === 1 ? 'dan' : totalDays < 5 ? 'dana' : 'dana'})
            </ThemedText>
            <ThemedText type="body">{rentalCost} RSD</ThemedText>
          </View>
          <View style={styles.priceRow}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>Depozit (vraća se)</ThemedText>
            <ThemedText type="body">{depositAmount} RSD</ThemedText>
          </View>
          <View style={[styles.priceRow, styles.totalRow, { borderTopColor: theme.border }]}>
            <ThemedText type="h4">Ukupno</ThemedText>
            <ThemedText type="h3" style={{ color: theme.primary }}>{totalCost} RSD</ThemedText>
          </View>
        </Card>
      </View>

      <Button 
        onPress={handleConfirm} 
        disabled={isLoading || !startDate || !endDate}
        style={styles.confirmButton}
      >
        {isLoading ? <ActivityIndicator color="#FFFFFF" /> : 'Potvrdi rezervaciju'}
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
  quickDates: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  quickDateButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
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
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  paymentText: {
    flex: 1,
    marginLeft: Spacing.md,
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
  confirmButton: {
    marginTop: Spacing.md,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  successIcon: {
    marginBottom: Spacing.xl,
  },
  successTitle: {
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  successText: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  successCard: {
    width: '100%',
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  successRow: {
    flexDirection: 'column',
  },
  successButton: {
    width: '100%',
  },
});
