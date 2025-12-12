import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import AuthScreen from "@/screens/AuthScreen";
import ItemDetailScreen from "@/screens/ItemDetailScreen";
import AddItemScreen from "@/screens/AddItemScreen";
import BookingFlowScreen from "@/screens/BookingFlowScreen";
import BookingDetailScreen from "@/screens/BookingDetailScreen";
import ChatScreen from "@/screens/ChatScreen";
import ReviewScreen from "@/screens/ReviewScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import MyItemsScreen from "@/screens/MyItemsScreen";
import SearchScreen from "@/screens/SearchScreen";
import SubscriptionScreen from "@/screens/SubscriptionScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { ActivityIndicator, View } from "react-native";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { user, isLoading } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.backgroundRoot }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {user ? (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ItemDetail"
            component={ItemDetailScreen}
            options={{ headerTitle: "Detalji" }}
          />
          <Stack.Screen
            name="AddItem"
            component={AddItemScreen}
            options={{ 
              presentation: "modal",
              headerTitle: "Nova Stvar",
            }}
          />
          <Stack.Screen
            name="EditItem"
            component={AddItemScreen}
            options={{ 
              presentation: "modal",
              headerTitle: "Izmeni Stvar",
            }}
          />
          <Stack.Screen
            name="BookingFlow"
            component={BookingFlowScreen}
            options={{ 
              presentation: "modal",
              headerTitle: "Rezervacija",
            }}
          />
          <Stack.Screen
            name="BookingDetail"
            component={BookingDetailScreen}
            options={{ headerTitle: "Detalji Rezervacije" }}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={({ route }) => ({
              headerTitle: route.params.otherUserName,
            })}
          />
          <Stack.Screen
            name="Review"
            component={ReviewScreen}
            options={{ 
              presentation: "modal",
              headerTitle: "Oceni Rezervaciju",
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ headerTitle: "Podešavanja" }}
          />
          <Stack.Screen
            name="MyItems"
            component={MyItemsScreen}
            options={{ headerTitle: "Moje Stvari" }}
          />
          <Stack.Screen
            name="Search"
            component={SearchScreen}
            options={{ headerTitle: "Pretraga" }}
          />
          <Stack.Screen
            name="Subscription"
            component={SubscriptionScreen}
            options={{ 
              presentation: "modal",
              headerTitle: "Pretplata",
            }}
          />
        </>
      ) : (
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}
