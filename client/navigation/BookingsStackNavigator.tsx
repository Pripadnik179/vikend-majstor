import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BookingsScreen from "@/screens/BookingsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import type { BookingsStackParamList } from "./types";

const Stack = createNativeStackNavigator<BookingsStackParamList>();

export default function BookingsStackNavigator() {
  const screenOptions = useScreenOptions({ transparent: false });

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{ headerTitle: "Rezervacije" }}
      />
    </Stack.Navigator>
  );
}
