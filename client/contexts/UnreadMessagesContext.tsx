import React, { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import type { Conversation, Message, User } from '@shared/schema';

type ConversationWithDetails = Conversation & {
  otherUser: User;
  lastMessage?: Message;
  unreadCount: number;
};

interface UnreadMessagesContextType {
  totalUnreadCount: number;
  isLoading: boolean;
}

const UnreadMessagesContext = createContext<UnreadMessagesContextType>({
  totalUnreadCount: 0,
  isLoading: false,
});

export function UnreadMessagesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const { data: conversations = [], isLoading } = useQuery<ConversationWithDetails[]>({
    queryKey: ['/api/conversations'],
    enabled: !!user,
    refetchInterval: 30000,
  });

  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0);
  }, [conversations]);

  return (
    <UnreadMessagesContext.Provider value={{ totalUnreadCount, isLoading }}>
      {children}
    </UnreadMessagesContext.Provider>
  );
}

export function useUnreadMessages() {
  return useContext(UnreadMessagesContext);
}
