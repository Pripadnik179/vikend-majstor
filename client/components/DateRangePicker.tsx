import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import Feather from '@expo/vector-icons/Feather';

interface Booking {
  startDate: string;
  endDate: string;
}

interface DateRangePickerProps {
  bookings?: Booking[];
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  minDate?: Date;
}

const DAYS_OF_WEEK = ['P', 'U', 'S', 'Č', 'P', 'S', 'N'];
const MONTH_NAMES = [
  'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
  'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
];

export function DateRangePicker({ 
  bookings = [], 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange,
  minDate = new Date()
}: DateRangePickerProps) {
  const { theme } = useTheme();
  const [displayMonth, setDisplayMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [selectingEnd, setSelectingEnd] = useState(false);

  const bookedDates = useMemo(() => {
    const dates = new Set<string>();
    bookings.forEach(booking => {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.add(d.toISOString().split('T')[0]);
      }
    });
    return dates;
  }, [bookings]);

  const calendarDays = useMemo(() => {
    const year = displayMonth.getFullYear();
    const month = displayMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let startDayOfWeek = firstDay.getDay();
    if (startDayOfWeek === 0) startDayOfWeek = 7;
    startDayOfWeek--;

    const days: (Date | null)[] = [];
    
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 0; i < remaining; i++) {
        days.push(null);
      }
    }
    
    return days;
  }, [displayMonth]);

  const goToPreviousMonth = () => {
    setDisplayMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const goToNextMonth = () => {
    setDisplayMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const normalizedMinDate = new Date(minDate);
  normalizedMinDate.setHours(0, 0, 0, 0);

  const isDateBooked = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookedDates.has(dateStr);
  };

  const isDateDisabled = (date: Date) => {
    return date < normalizedMinDate || isDateBooked(date);
  };

  const isDateSelected = (date: Date) => {
    if (!startDate && !endDate) return false;
    const dateStr = date.toISOString().split('T')[0];
    if (startDate && dateStr === startDate.toISOString().split('T')[0]) return true;
    if (endDate && dateStr === endDate.toISOString().split('T')[0]) return true;
    return false;
  };

  const isDateInRange = (date: Date) => {
    if (!startDate || !endDate) return false;
    return date > startDate && date < endDate;
  };

  const handleDatePress = (date: Date) => {
    if (isDateDisabled(date)) return;

    if (!startDate || (startDate && endDate)) {
      onStartDateChange(date);
      onEndDateChange(null);
      setSelectingEnd(true);
    } else if (selectingEnd) {
      if (date < startDate) {
        onStartDateChange(date);
        onEndDateChange(null);
      } else {
        const hasBookedDateInRange = checkBookedDatesInRange(startDate, date);
        if (hasBookedDateInRange) {
          onStartDateChange(date);
          onEndDateChange(null);
        } else {
          onEndDateChange(date);
          setSelectingEnd(false);
        }
      }
    }
  };

  const checkBookedDatesInRange = (start: Date, end: Date) => {
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (isDateBooked(d)) return true;
    }
    return false;
  };

  const canGoBack = displayMonth > today;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
      <View style={styles.header}>
        <Pressable 
          onPress={goToPreviousMonth} 
          style={[styles.navButton, !canGoBack && { opacity: 0.3 }]}
          disabled={!canGoBack}
        >
          <Feather name="chevron-left" size={24} color={theme.primary} />
        </Pressable>
        <ThemedText type="h4">
          {MONTH_NAMES[displayMonth.getMonth()]} {displayMonth.getFullYear()}
        </ThemedText>
        <Pressable onPress={goToNextMonth} style={styles.navButton}>
          <Feather name="chevron-right" size={24} color={theme.primary} />
        </Pressable>
      </View>

      <View style={styles.weekDays}>
        {DAYS_OF_WEEK.map((day, index) => (
          <View key={index} style={styles.dayCell}>
            <ThemedText type="small" style={{ color: theme.textTertiary, fontWeight: '600' }}>{day}</ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {calendarDays.map((date, index) => {
          if (!date) {
            return <View key={index} style={styles.dayCell} />;
          }

          const isBooked = isDateBooked(date);
          const isDisabled = isDateDisabled(date);
          const isSelected = isDateSelected(date);
          const isInRange = isDateInRange(date);
          const isToday = date.toDateString() === today.toDateString();
          const isStart = startDate && date.toISOString().split('T')[0] === startDate.toISOString().split('T')[0];
          const isEnd = endDate && date.toISOString().split('T')[0] === endDate.toISOString().split('T')[0];

          return (
            <Pressable
              key={index}
              style={styles.dayCell}
              onPress={() => handleDatePress(date)}
              disabled={isDisabled}
            >
              <View
                style={[
                  styles.dayContent,
                  isInRange && styles.inRangeDay,
                  isInRange && { backgroundColor: theme.primaryLight },
                  isSelected && styles.selectedDay,
                  isSelected && { backgroundColor: theme.primary },
                  isStart && styles.startDay,
                  isEnd && styles.endDay,
                  isBooked && styles.bookedDay,
                  isBooked && { backgroundColor: Colors.error + '20' },
                  isDisabled && !isBooked && { opacity: 0.3 },
                  isToday && !isSelected && styles.todayDay,
                  isToday && !isSelected && { borderColor: theme.primary },
                ]}
              >
                <ThemedText
                  type="small"
                  style={[
                    { color: theme.text, fontWeight: '500' },
                    isSelected && { color: '#FFFFFF', fontWeight: '700' },
                    isBooked && { color: Colors.error },
                    isDisabled && !isBooked && { color: theme.textTertiary },
                  ]}
                >
                  {date.getDate()}
                </ThemedText>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.selectionInfo}>
        <View style={[styles.selectionBox, { borderColor: startDate ? theme.primary : theme.border }]}>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>Početak</ThemedText>
          <ThemedText type="body" style={{ fontWeight: '600' }}>
            {startDate ? formatDateShort(startDate) : 'Izaberi'}
          </ThemedText>
        </View>
        <Feather name="arrow-right" size={20} color={theme.textTertiary} />
        <View style={[styles.selectionBox, { borderColor: endDate ? theme.primary : theme.border }]}>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>Kraj</ThemedText>
          <ThemedText type="body" style={{ fontWeight: '600' }}>
            {endDate ? formatDateShort(endDate) : 'Izaberi'}
          </ThemedText>
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>Dostupno</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.error }]} />
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>Rezervisano</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.primary }]} />
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>Izabrano</ThemedText>
        </View>
      </View>
    </View>
  );
}

function formatDateShort(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${day}.${month}.`;
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  navButton: {
    padding: Spacing.sm,
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  dayContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.round,
  },
  selectedDay: {
    borderRadius: BorderRadius.round,
  },
  startDay: {
    borderTopLeftRadius: BorderRadius.round,
    borderBottomLeftRadius: BorderRadius.round,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  endDay: {
    borderTopRightRadius: BorderRadius.round,
    borderBottomRightRadius: BorderRadius.round,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  inRangeDay: {
    borderRadius: 0,
  },
  bookedDay: {
    borderRadius: BorderRadius.sm,
  },
  todayDay: {
    borderWidth: 2,
  },
  selectionInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  selectionBox: {
    flex: 1,
    padding: Spacing.sm,
    borderWidth: 2,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginTop: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
