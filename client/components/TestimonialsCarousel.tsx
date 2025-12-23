import React, { useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, FlatList, ViewToken } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { StarIcon, UserIcon } from '@/components/icons/TabBarIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Testimonial {
  id: string;
  name: string;
  city: string;
  role: 'owner' | 'renter';
  text: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Marko P.',
    city: 'Beograd',
    role: 'owner',
    text: 'Imam 5 alata na platformi i zarađujem prosečno 12.000 din mesečno. Odličan način da alat ne stoji besposlen!',
    rating: 5,
  },
  {
    id: '2',
    name: 'Ana S.',
    city: 'Novi Sad',
    role: 'renter',
    text: 'Trebala mi je brusilica za vikend projekat. Umesto 15.000 din za novu, platila sam 500 din za iznajmljivanje. Super!',
    rating: 5,
  },
  {
    id: '3',
    name: 'Dragan M.',
    city: 'Niš',
    role: 'owner',
    text: 'Jednostavno za korišćenje. Samo slikam alat, postavim cenu i čekam da me neko kontaktira. Preporučujem!',
    rating: 5,
  },
  {
    id: '4',
    name: 'Jelena K.',
    city: 'Subotica',
    role: 'renter',
    text: 'Komsija mi je iznajmio bušilicu za 300 din dnevno. Završila sam projekat i uštedela dosta novca.',
    rating: 4,
  },
];

interface TestimonialsCarouselProps {
  compact?: boolean;
}

export function TestimonialsCarousel({ compact = false }: TestimonialsCarouselProps) {
  const { theme, isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  
  const cardWidth = compact ? SCREEN_WIDTH - Spacing.xl * 2 - 20 : SCREEN_WIDTH - Spacing.xl * 2;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            size={14}
            color={star <= rating ? Colors.light.primary : theme.border}
            fill={star <= rating ? Colors.light.primary : 'none'}
          />
        ))}
      </View>
    );
  };

  const renderTestimonial = ({ item }: { item: Testimonial }) => {
    return (
      <View 
        style={[
          styles.card, 
          { 
            width: cardWidth,
            backgroundColor: isDark ? theme.backgroundSecondary : theme.backgroundDefault,
            borderColor: theme.border,
          }
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: `${Colors.light.primary}20` }]}>
            <UserIcon size={20} color={Colors.light.primary} />
          </View>
          <View style={styles.userInfo}>
            <ThemedText type="body" style={styles.userName}>
              {item.name}
            </ThemedText>
            <View style={styles.metaRow}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {item.city}
              </ThemedText>
              <View style={[styles.roleBadge, { backgroundColor: item.role === 'owner' ? `${Colors.light.success}15` : `${Colors.light.trust}15` }]}>
                <ThemedText type="small" style={{ color: item.role === 'owner' ? Colors.light.success : Colors.light.trust, fontWeight: '600' }}>
                  {item.role === 'owner' ? 'Vlasnik' : 'Korisnik'}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
        
        <ThemedText type="body" style={[styles.testimonialText, { color: theme.textSecondary }]}>
          "{item.text}"
        </ThemedText>
        
        {renderStars(item.rating)}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ThemedText type="h4" style={styles.title}>
        Šta kažu naši korisnici
      </ThemedText>
      
      <FlatList
        ref={flatListRef}
        data={TESTIMONIALS}
        renderItem={renderTestimonial}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        snapToInterval={cardWidth + Spacing.md}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.pagination}>
        {TESTIMONIALS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              {
                backgroundColor: index === currentIndex ? Colors.light.primary : theme.border,
                width: index === currentIndex ? 16 : 6,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing['2xl'],
  },
  title: {
    marginBottom: Spacing.lg,
    fontWeight: '700',
  },
  listContent: {
    paddingRight: Spacing.xl,
  },
  card: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.lg,
    marginRight: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  userName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  roleBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  testimonialText: {
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.xs,
  },
  paginationDot: {
    height: 6,
    borderRadius: 3,
  },
});
