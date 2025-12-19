import React, { useCallback, useState } from 'react';
import { View, FlatList, StyleSheet, Pressable, RefreshControl, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { MessageIcon } from '@/components/icons/TabBarIcons';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { useWebLayout } from '@/hooks/useWebLayout';
import { Spacing, BorderRadius } from '@/constants/theme';
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
  const { theme } = useTheme();
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
      return 'Juče';
    } else if (diffDays < 7) {
      return d.toLocaleDateString('sr-RS', { weekday: 'short' });
    }
    return d.toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' });
  };

  const renderItem = ({ item }: { item: ConversationWithDetails }) => (
    <Pressable
      style={({ pressed }) => [
        styles.conversationItem,
        { backgroundColor: pressed ? theme.backgroundDefault : theme.backgroundRoot },
      ]}
      onPress={() => navigation.navigate('Chat', { 
        conversationId: item.id, 
        otherUserName: item.otherUser?.name || 'Korisnik',
      })}
    >
      <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
        <ThemedText style={styles.avatarText}>
          {(item.otherUser?.name || 'K').charAt(0).toUpperCase()}
        </ThemedText>
      </View>
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <ThemedText type="body" style={{ fontWeight: '600' }} numberOfLines={1}>
            {item.otherUser?.name || 'Korisnik'}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textTertiary }}>
            {item.lastMessage ? formatTime(item.lastMessage.createdAt) : ''}
          </ThemedText>
        </View>
        <View style={styles.conversationFooter}>
          <ThemedText
            type="small"
            style={{ color: theme.textSecondary, flex: 1 }}
            numberOfLines={1}
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

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MessageIcon size={64} color={theme.textTertiary} />
      <ThemedText type="h4" style={[styles.emptyTitle, { color: theme.textSecondary }]}>
        Nema poruka
      </ThemedText>
      <ThemedText type="body" style={[styles.emptyText, { color: theme.textTertiary }]}>
        Započni razgovor sa vlasnikom stvari
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
    <FlatList
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop,
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
  );
}

const styles = StyleSheet.create({
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  conversationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
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
