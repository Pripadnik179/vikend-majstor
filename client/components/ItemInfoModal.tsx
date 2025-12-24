import React from 'react';
import { View, StyleSheet, Modal, Pressable, ScrollView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XIcon, StarIcon, MapPinIcon, UserIcon, PhoneIcon, MailIcon, CalendarIcon } from '@/components/icons/TabBarIcons';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, Colors } from '@/constants/theme';
import type { Item, User } from '@shared/schema';

interface ItemInfoModalProps {
  visible: boolean;
  onClose: () => void;
  item: Item & { 
    owner?: User;
    totalRatings?: number | null;
    availableToday?: boolean;
  };
}

export function ItemInfoModal({ visible, onClose, item }: ItemInfoModalProps) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const rating = item.rating ? (typeof item.rating === 'string' ? parseFloat(item.rating) : item.rating) : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
        )}
        
        <Pressable 
          style={[
            styles.modalContent, 
            { 
              backgroundColor: theme.backgroundDefault,
              marginTop: insets.top + 60,
              marginBottom: insets.bottom + 20,
            }
          ]} 
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <ThemedText type="h3" style={{ flex: 1 }}>Detalji alata</ThemedText>
            <Pressable 
              style={[styles.closeButton, { backgroundColor: theme.backgroundSecondary }]}
              onPress={onClose}
            >
              <XIcon size={20} color={theme.text} />
            </Pressable>
          </View>
          
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <ThemedText type="h2" style={styles.title}>{item.title}</ThemedText>
            
            <View style={[styles.section, { backgroundColor: theme.backgroundSecondary }]}>
              <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs, fontWeight: '600' }}>
                Opis
              </ThemedText>
              <ThemedText type="body" style={{ lineHeight: 22 }}>
                {item.description || 'Nema opisa.'}
              </ThemedText>
            </View>
            
            <View style={styles.statsRow}>
              <View style={[styles.statItem, { backgroundColor: theme.backgroundSecondary }]}>
                <View style={styles.statIcon}>
                  <StarIcon size={18} color={Colors.light.primary} />
                </View>
                <ThemedText type="h4" style={{ color: theme.text }}>
                  {rating ? rating.toFixed(1) : '-'}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Prosecna ocena
                </ThemedText>
              </View>
              
              <View style={[styles.statItem, { backgroundColor: theme.backgroundSecondary }]}>
                <View style={styles.statIcon}>
                  <CalendarIcon size={18} color={Colors.light.trust} />
                </View>
                <ThemedText type="h4" style={{ color: theme.text }}>
                  {item.totalRatings || 0}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Iznajmljivanja
                </ThemedText>
              </View>
            </View>
            
            <View style={[styles.section, { backgroundColor: theme.backgroundSecondary }]}>
              <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.sm, fontWeight: '600' }}>
                Lokacija
              </ThemedText>
              <View style={styles.infoRow}>
                <MapPinIcon size={16} color={theme.textSecondary} />
                <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>
                  {item.city}{item.district ? `, ${item.district}` : ''}
                </ThemedText>
              </View>
            </View>
            
            {item.owner ? (
              <View style={[styles.section, { backgroundColor: theme.backgroundSecondary }]}>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.sm, fontWeight: '600' }}>
                  Kontakt vlasnika
                </ThemedText>
                <View style={styles.infoRow}>
                  <UserIcon size={16} color={theme.textSecondary} />
                  <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>
                    {item.owner.name}
                  </ThemedText>
                </View>
                {item.owner.email ? (
                  <View style={[styles.infoRow, { marginTop: Spacing.xs }]}>
                    <MailIcon size={16} color={theme.textSecondary} />
                    <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>
                      {item.owner.email}
                    </ThemedText>
                  </View>
                ) : null}
                {item.owner.phone ? (
                  <View style={[styles.infoRow, { marginTop: Spacing.xs }]}>
                    <PhoneIcon size={16} color={theme.textSecondary} />
                    <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>
                      {item.owner.phone}
                    </ThemedText>
                  </View>
                ) : null}
              </View>
            ) : null}
            
            <View style={[styles.priceSection, { backgroundColor: theme.primary + '15' }]}>
              <ThemedText type="small" style={{ color: theme.primary, fontWeight: '600' }}>Cena po danu</ThemedText>
              <ThemedText type="h2" style={{ color: theme.primary }}>
                {item.pricePerDay} RSD
              </ThemedText>
              {item.deposit > 0 ? (
                <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                  Depozit: {item.deposit} RSD
                </ThemedText>
              ) : null}
            </View>
            
            <View style={{ height: Spacing.xl }} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: Spacing.md,
  },
  title: {
    marginBottom: Spacing.md,
  },
  section: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statItem: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: Spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceSection: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
});
