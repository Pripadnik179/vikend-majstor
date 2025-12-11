import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MessagesScreen from "@/screens/MessagesScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import type { MessagesStackParamList } from "./types";

const Stack = createNativeStackNavigator<MessagesStackParamList>();

export default function MessagesStackNavigator() {
  const screenOptions = useScreenOptions({ transparent: false });

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ headerTitle: "Poruke" }}
      />
    </Stack.Navigator>
  );
}
