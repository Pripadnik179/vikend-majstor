import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  Auth: undefined;
  ItemDetail: { itemId: string };
  AddItem: undefined;
  EditItem: { itemId: string };
  BookingFlow: { itemId: string };
  BookingDetail: { bookingId: string };
  Chat: { conversationId: string; otherUserName: string };
  Review: { bookingId: string };
  Settings: undefined;
  MyItems: undefined;
  Search: { category?: string; subcategory?: string; toolType?: string; query?: string };
  Subscription: { scrollToFeature?: boolean } | undefined;
  Earnings: undefined;
  Help: undefined;
  About: undefined;
  Legal: { section?: string } | undefined;
  Admin: undefined;
  AdminUserDetail: { userId: string };
  IznajmiAlat: undefined;
  DodajAlatGuide: undefined;
  KakoFunkcionise: undefined;
  NajcescaPitanja: undefined;
  Kontakt: undefined;
  ONama: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  CategoriesTab: undefined;
  BookingsTab: undefined;
  MessagesTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
};

export type BookingsStackParamList = {
  Bookings: undefined;
};

export type MessagesStackParamList = {
  Messages: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
};
