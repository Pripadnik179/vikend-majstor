import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

interface Booking {
  startDate: string;
  endDate: string;
}

interface AvailabilityCalendarProps {
  bookings: Booking[];
  currentMonth?: Date;
}

const DAYS_OF_WEEK = ['P', 'U', 'S', 'Č', 'P', 'S', 'N'];
const MONTH_NAMES = [
  'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
  'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
];

export function AvailabilityCalendar({ bookings, currentMonth = new Date() }: AvailabilityCalendarProps) {
  const { theme } = useTheme();
  const [displayMonth, setDisplayMonth] = React.useState(() => {
    const d = new Date(currentMonth);
    d.setDate(1);
    return d;
  });

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

  const isDateBooked = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookedDates.has(dateStr);
  };

  const isDatePast = (date: Date) => {
    return date < today;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
      <View style={styles.header}>
        <Pressable onPress={goToPreviousMonth} style={styles.navButton}>
          <ThemedText type="h4" style={{ color: theme.primary }}>{'<'}</ThemedText>
        </Pressable>
        <ThemedText type="h4">
          {MONTH_NAMES[displayMonth.getMonth()]} {displayMonth.getFullYear()}
        </ThemedText>
        <Pressable onPress={goToNextMonth} style={styles.navButton}>
          <ThemedText type="h4" style={{ color: theme.primary }}>{'>'}</ThemedText>
        </Pressable>
      </View>

      <View style={styles.weekDays}>
        {DAYS_OF_WEEK.map((day, index) => (
          <View key={index} style={styles.dayCell}>
            <ThemedText type="small" style={{ color: theme.textTertiary }}>{day}</ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {calendarDays.map((date, index) => {
          if (!date) {
            return <View key={index} style={styles.dayCell} />;
          }

          const isBooked = isDateBooked(date);
          const isPast = isDatePast(date);
          const isToday = date.toDateString() === today.toDateString();

          return (
            <View key={index} style={styles.dayCell}>
              <View
                style={[
                  styles.dayContent,
                  isBooked && styles.bookedDay,
                  isBooked && { backgroundColor: Colors.error + '20' },
                  isPast && !isBooked && { opacity: 0.4 },
                  isToday && styles.todayDay,
                  isToday && { borderColor: theme.primary },
                ]}
              >
                <ThemedText
                  type="small"
                  style={[
                    { color: theme.text },
                    isBooked && { color: Colors.error },
                    isPast && !isBooked && { color: theme.textTertiary },
                  ]}
                >
                  {date.getDate()}
                </ThemedText>
              </View>
            </View>
          );
        })}
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
      </View>
    </View>
  );
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
  bookedDay: {
    borderRadius: BorderRadius.sm,
  },
  todayDay: {
    borderWidth: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
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
