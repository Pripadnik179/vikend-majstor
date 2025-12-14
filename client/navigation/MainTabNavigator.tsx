import React from "react";
import { View, StyleSheet, Pressable, Platform, useWindowDimensions, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import HomeStackNavigator from "@/navigation/HomeStackNavigator";
import CategoriesScreen from "@/screens/CategoriesScreen";
import BookingsStackNavigator from "@/navigation/BookingsStackNavigator";
import MessagesStackNavigator from "@/navigation/MessagesStackNavigator";
import ProfileStackNavigator from "@/navigation/ProfileStackNavigator";
import { BeVisibleModal } from "@/components/BeVisibleModal";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, Shadows } from "@/constants/theme";
import type { MainTabParamList, RootStackParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

const isWeb = Platform.OS === 'web';

function FloatingAddButton() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isDark, theme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = isWeb && width >= 768;

  if (isDesktop) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.webAddButton,
          { 
            backgroundColor: isDark ? Colors.dark.accent : Colors.light.accent,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
        onPress={() => navigation.navigate('AddItem')}
      >
        <Feather name="plus" size={20} color="#FFFFFF" />
        <Text style={styles.webAddButtonText}>Dodaj oglas</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.fabContainer}>
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { 
            backgroundColor: isDark ? Colors.dark.accent : Colors.light.accent,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
        ]}
        onPress={() => navigation.navigate('AddItem')}
      >
        <Feather name="plus" size={28} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

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
    backgroundColor: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  } : {};

  const mobileTabBarStyle = {
    position: "absolute" as const,
    backgroundColor: Platform.select({
      ios: "transparent",
      android: theme.backgroundRoot,
      web: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground,
    }),
    borderTopWidth: 0,
    elevation: 0,
  };

  return (
    <View style={{ flex: 1 }}>
      <BeVisibleModal />
      {isDesktop ? <FloatingAddButton /> : null}
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
              <Feather name="home" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="CategoriesTab"
          component={CategoriesScreen}
          options={{
            title: "Kategorije",
            tabBarIcon: ({ color, size }) => (
              <Feather name="grid" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="BookingsTab"
          component={BookingsStackNavigator}
          options={{
            title: "Rezervacije",
            tabBarIcon: ({ color, size }) => (
              <Feather name="calendar" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="MessagesTab"
          component={MessagesStackNavigator}
          options={{
            title: "Poruke",
            tabBarIcon: ({ color, size }) => (
              <Feather name="message-circle" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileStackNavigator}
          options={{
            title: "Profil",
            tabBarIcon: ({ color, size }) => (
              <Feather name="user" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
      {!isDesktop ? <FloatingAddButton /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  fab: {
    width: Spacing.fabSize,
    height: Spacing.fabSize,
    borderRadius: Spacing.fabSize / 2,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.fab,
  },
  webAddButton: {
    position: 'absolute',
    top: 12,
    right: 24,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  webAddButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
