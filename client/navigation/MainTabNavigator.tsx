import React from "react";
import { View, StyleSheet, Platform, useWindowDimensions } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import HomeStackNavigator from "@/navigation/HomeStackNavigator";
import CategoriesScreen from "@/screens/CategoriesScreen";
import BookingsStackNavigator from "@/navigation/BookingsStackNavigator";
import MessagesStackNavigator from "@/navigation/MessagesStackNavigator";
import ProfileStackNavigator from "@/navigation/ProfileStackNavigator";
import { BeVisibleModal } from "@/components/BeVisibleModal";
import { useTheme } from "@/hooks/useTheme";
import { Colors } from "@/constants/theme";
import type { MainTabParamList } from "./types";
import { HomeIcon, GridIcon, CalendarIcon, MessageIcon, UserIcon } from "@/components/icons/TabBarIcons";

const Tab = createBottomTabNavigator<MainTabParamList>();

const isWeb = Platform.OS === 'web';

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = isWeb && width >= 768;

  const webTabBarStyle = isDesktop ? {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 64,
    flexDirection: 'row' as const,
    backgroundColor: isDark ? Colors.dark.backgroundDefault : Colors.light.backgroundDefault,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    paddingHorizontal: 24,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  } : {};

  const mobileTabBarStyle = {
    position: "absolute" as const,
    backgroundColor: Platform.select({
      ios: "transparent",
      android: theme.backgroundRoot,
      web: isDark ? Colors.dark.backgroundDefault : Colors.light.backgroundDefault,
    }),
    borderTopWidth: 0,
    elevation: 0,
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundRoot }}>
      <BeVisibleModal />
      <Tab.Navigator
        initialRouteName="HomeTab"
        screenOptions={{
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.tabIconDefault,
          tabBarStyle: isDesktop ? webTabBarStyle : mobileTabBarStyle,
          tabBarLabelStyle: isDesktop ? { fontSize: 14, fontWeight: '500', marginLeft: 8 } : undefined,
          tabBarItemStyle: isDesktop ? { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, marginHorizontal: 4, borderRadius: 8 } : undefined,
          tabBarBackground: () =>
            Platform.OS === "ios" ? (
              <BlurView
                intensity={100}
                tint={isDark ? "dark" : "light"}
                style={StyleSheet.absoluteFill}
              />
            ) : null,
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStackNavigator}
          options={{
            title: "Početna",
            tabBarIcon: ({ color, size }) => (
              <HomeIcon size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="CategoriesTab"
          component={CategoriesScreen}
          options={{
            title: "Kategorije",
            tabBarIcon: ({ color, size }) => (
              <GridIcon size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="BookingsTab"
          component={BookingsStackNavigator}
          options={{
            title: "Rezervacije",
            tabBarIcon: ({ color, size }) => (
              <CalendarIcon size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="MessagesTab"
          component={MessagesStackNavigator}
          options={{
            title: "Poruke",
            tabBarIcon: ({ color, size }) => (
              <MessageIcon size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileStackNavigator}
          options={{
            title: "Profil",
            tabBarIcon: ({ color, size }) => (
              <UserIcon size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({});
