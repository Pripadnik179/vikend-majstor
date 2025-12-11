import React, { useState, useRef, useEffect } from 'react';
import { View, FlatList, StyleSheet, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/query-client';
import { Spacing, BorderRadius } from '@/constants/theme';
import type { RootStackParamList } from '@/navigation/types';
import type { Message } from '@shared/schema';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuth();
  const route = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);

  const [message, setMessage] = useState('');

  const { data: messages = [], isLoading, refetch } = useQuery<Message[]>({
    queryKey: ['/api/conversations', route.params.conversationId, 'messages'],
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest('POST', `/api/conversations/${route.params.conversationId}/messages`, { content });
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ 
        queryKey: ['/api/conversations', route.params.conversationId, 'messages'] 
      });
    },
  });

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMutation.mutate(message.trim());
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('sr-RS', { 
      hour: '2-digit', 
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwn = item.senderId === user?.id;
    const showDate = index === 0 || 
      new Date(messages[index - 1].createdAt).toDateString() !== new Date(item.createdAt).toDateString();

    return (
      <View>
        {showDate && (
          <ThemedText type="small" style={[styles.dateHeader, { color: theme.textTertiary }]}>
            {new Date(item.createdAt).toLocaleDateString('sr-RS', { 
              day: 'numeric', 
              month: 'long',
            })}
          </ThemedText>
        )}
        <View style={[
          styles.messageBubble,
          isOwn ? styles.ownMessage : styles.otherMessage,
          { backgroundColor: isOwn ? theme.primary : theme.backgroundSecondary },
        ]}>
          <ThemedText 
            type="body" 
            style={{ color: isOwn ? '#FFFFFF' : theme.text }}
          >
            {item.content}
          </ThemedText>
          <ThemedText 
            type="caption" 
            style={[styles.messageTime, { color: isOwn ? 'rgba(255,255,255,0.7)' : theme.textTertiary }]}
          >
            {formatTime(item.createdAt)}
          </ThemedText>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="message-circle" size={48} color={theme.textTertiary} />
      <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
        Započnite razgovor
      </ThemedText>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <FlatList
        ref={flatListRef}
        style={{ flex: 1 }}
        contentContainerStyle={[styles.messagesList, { flexGrow: 1 }]}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      <View style={[styles.inputContainer, { 
        backgroundColor: theme.backgroundRoot, 
        borderTopColor: theme.border,
        paddingBottom: insets.bottom + Spacing.sm,
      }]}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.backgroundDefault, 
            borderColor: theme.border,
            color: theme.text,
          }]}
          placeholder="Napiši poruku..."
          placeholderTextColor={theme.textTertiary}
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={1000}
        />
        <Pressable
          style={({ pressed }) => [
            styles.sendButton,
            { 
              backgroundColor: message.trim() ? theme.primary : theme.backgroundSecondary,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          onPress={handleSend}
          disabled={!message.trim() || sendMutation.isPending}
        >
          {sendMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Feather name="send" size={20} color={message.trim() ? '#FFFFFF' : theme.textTertiary} />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: Spacing.lg,
  },
  dateHeader: {
    textAlign: 'center',
    marginVertical: Spacing.md,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: Spacing.xs,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: Spacing.xs,
  },
  messageTime: {
    marginTop: Spacing.xs,
    alignSelf: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.md,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
