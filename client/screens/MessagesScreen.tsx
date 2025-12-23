import React, { useCallback, useState } from 'react';
import { View, FlatList, StyleSheet, Pressable, RefreshControl, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { MessageIcon, ShieldIcon } from '@/components/icons/TabBarIcons';
import { ThemedText } from '@/components/ThemedText';
import { SecurityBanner } from '@/components/SecurityBanner';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout, MAX_CONTENT_WIDTH } from '@/hooks/useWebLayout';
import { Spacing, BorderRadius, Colors } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import type { Conversation, Message, User } from '@shared/schema';

type ConversationWithDetails = Conversation & {
  otherUser: User;
  lastMessage?: Message;
  unreadCount: number;
};

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const { isDesktop, contentPaddingTop, contentPaddingBottom } = useWebLayout();
  const tabBarHeight = isDesktop ? 0 : (Platform.OS === 'web' ? 0 : 80);
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [refreshing, setRefreshing] = useState(false);

  const { data: conversations = [], isLoading, refetch } = useQuery<ConversationWithDetails[]>({
    queryKey: ['/api/conversations'],
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return d.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Juce';
    } else if (diffDays < 7) {
      return d.toLocaleDateString('sr-RS', { weekday: 'short' });
    }
    return d.toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' });
  };

  const getResponseStatus = (user: User | undefined) => {
    if (!user) return null;
    const rand = Math.random();
    if (rand < 0.3) {
      return { text: 'Online', color: Colors.light.success };
    } else if (rand < 0.7) {
      return { text: 'Odgovara u roku od 1h', color: Colors.light.trust };
    }
    return { text: 'Odgovara u roku od 24h', color: theme.textTertiary };
  };

  const renderItem = ({ item }: { item: ConversationWithDetails }) => {
    const responseStatus = getResponseStatus(item.otherUser);
    
    return (
      <Pressable
        style={({ pressed }) => [
          styles.conversationItem,
          { 
            backgroundColor: pressed ? theme.backgroundDefault : theme.backgroundRoot,
            borderBottomColor: theme.border,
          },
        ]}
        onPress={() => navigation.navigate('Chat', { 
          conversationId: item.id, 
          otherUserName: item.otherUser?.name || 'Korisnik',
        })}
      >
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <ThemedText style={styles.avatarText}>
              {(item.otherUser?.name || 'K').charAt(0).toUpperCase()}
            </ThemedText>
          </View>
          {responseStatus?.text === 'Online' ? (
            <View style={[styles.onlineIndicator, { backgroundColor: Colors.light.success, borderColor: theme.backgroundRoot }]} />
          ) : null}
        </View>
        
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <View style={styles.nameRow}>
              <ThemedText type="body" style={{ fontWeight: '600' }} numberOfLines={1}>
                {item.otherUser?.name || 'Korisnik'}
              </ThemedText>
              {(item.otherUser as any)?.isVerified ? (
                <View style={[styles.verifiedBadge, { backgroundColor: Colors.light.success + '20' }]}>
                  <ShieldIcon size={10} color={Colors.light.success} />
                </View>
              ) : null}
            </View>
            <ThemedText type="small" style={{ color: theme.textTertiary }}>
              {item.lastMessage ? formatTime(item.lastMessage.createdAt) : ''}
            </ThemedText>
          </View>
          
          {responseStatus ? (
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: responseStatus.color }]} />
              <ThemedText type="small" style={{ color: responseStatus.color, fontSize: 11 }}>
                {responseStatus.text}
              </ThemedText>
            </View>
          ) : null}
          
          <View style={styles.conversationFooter}>
            <ThemedText
              type="small"
              style={{ 
                color: item.unreadCount > 0 ? theme.text : theme.textSecondary, 
                flex: 1,
                fontWeight: item.unreadCount > 0 ? '600' : '400',
              }}
              numberOfLines={2}
            >
              {item.lastMessage?.content || 'Nema poruka'}
            </ThemedText>
            {item.unreadCount > 0 ? (
              <View style={[styles.badge, { backgroundColor: theme.accent }]}>
                <ThemedText style={styles.badgeText}>{item.unreadCount}</ThemedText>
              </View>
            ) : null}
          </View>
        </View>
      </Pressable>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MessageIcon size={64} color={theme.textTertiary} />
      <ThemedText type="h4" style={[styles.emptyTitle, { color: theme.textSecondary }]}>
        Nema poruka
      </ThemedText>
      <ThemedText type="body" style={[styles.emptyText, { color: theme.textTertiary }]}>
        Zapocni razgovor sa vlasnikom stvari
      </ThemedText>
    </View>
  );

  const paddingTop = isDesktop ? contentPaddingTop + Spacing.md : 0;
  const paddingBottom = isDesktop ? contentPaddingBottom + Spacing.xl : tabBarHeight + Spacing.fabSize + Spacing.xl;

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot, paddingTop }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundRoot, alignItems: isDesktop ? 'center' : undefined }}>
      <SecurityBanner 
        message="Ne salji novac unapred. Placanje pri preuzimanju." 
        type="warning"
      />
      
      <FlatList
        style={{ flex: 1, width: '100%', maxWidth: MAX_CONTENT_WIDTH }}
        contentContainerStyle={{
          paddingTop: Spacing.sm,
          paddingBottom,
          flexGrow: 1,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        data={conversations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  conversationFooter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: Spacing.sm,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyTitle: {
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
