import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Platform, useWindowDimensions } from "react-native";
import { ToolIcon, PlusIcon } from "@/components/icons/TabBarIcons";
import { DynamicIcon } from "@/components/icons/DynamicIcon";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import HomeStackNavigator from "@/navigation/HomeStackNavigator";
import CategoriesScreen from "@/screens/CategoriesScreen";
import BookingsStackNavigator from "@/navigation/BookingsStackNavigator";
import MessagesStackNavigator from "@/navigation/MessagesStackNavigator";
import ProfileStackNavigator from "@/navigation/ProfileStackNavigator";
import { BeVisibleModal } from "@/components/BeVisibleModal";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import type { MainTabParamList, RootStackParamList } from "./types";

type NavItem = {
  key: keyof MainTabParamList;
  label: string;
  icon: string;
};

const NAV_ITEMS: NavItem[] = [
  { key: "HomeTab", label: "Početna", icon: "home" },
  { key: "CategoriesTab", label: "Kategorije", icon: "grid" },
  { key: "BookingsTab", label: "Rezervacije", icon: "calendar" },
  { key: "MessagesTab", label: "Poruke", icon: "message-circle" },
  { key: "ProfileTab", label: "Profil", icon: "user" },
];

function WebHeader({ 
  activeTab, 
  onTabPress, 
  onAddPress 
}: { 
  activeTab: keyof MainTabParamList; 
  onTabPress: (tab: keyof MainTabParamList) => void;
  onAddPress: () => void;
}) {
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isCompact = width < 900;

  return (
    <View style={[styles.header, { backgroundColor: theme.backgroundRoot, borderBottomColor: theme.border }]}>
      <View style={styles.headerContent}>
        <View style={styles.logoContainer}>
          <View style={[styles.logoIcon, { backgroundColor: theme.primary }]}>
            <ToolIcon size={20} color={Colors.light.accent} />
          </View>
          <Text style={[styles.logoText, { color: theme.text }]}>VikendMajstor</Text>
        </View>

        <View style={styles.navContainer}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <Pressable
                key={item.key}
                style={({ pressed }) => [
                  styles.navItem,
                  isActive && { backgroundColor: theme.primaryLight },
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => onTabPress(item.key)}
              >
                <DynamicIcon 
                  name={item.icon} 
                  size={18} 
                  color={isActive ? theme.primary : theme.textSecondary} 
                />
                {!isCompact && (
                  <Text 
                    style={[
                      styles.navLabel, 
                      { color: isActive ? theme.primary : theme.textSecondary }
                    ]}
                  >
                    {item.label}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: theme.primary },
            pressed && { transform: [{ scale: 0.95 }] },
          ]}
          onPress={onAddPress}
        >
          <PlusIcon size={20} color={Colors.light.accent} />
          {!isCompact && (
            <Text style={[styles.addButtonText, { color: Colors.light.accent }]}>
              Dodaj Oglas
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

export default function WebNavigator() {
  const [activeTab, setActiveTab] = useState<keyof MainTabParamList>("HomeTab");
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();

  const handleTabPress = (tab: keyof MainTabParamList) => {
    setActiveTab(tab);
  };

  const handleAddPress = () => {
    navigation.navigate("AddItem");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <BeVisibleModal />
      <WebHeader 
        activeTab={activeTab} 
        onTabPress={handleTabPress} 
        onAddPress={handleAddPress}
      />
      <View style={styles.content}>
        <View style={[styles.tabPane, activeTab === "HomeTab" && styles.tabPaneActive]}>
          <HomeStackNavigator />
        </View>
        <View style={[styles.tabPane, activeTab === "CategoriesTab" && styles.tabPaneActive]}>
          <CategoriesScreen />
        </View>
        <View style={[styles.tabPane, activeTab === "BookingsTab" && styles.tabPaneActive]}>
          <BookingsStackNavigator />
        </View>
        <View style={[styles.tabPane, activeTab === "MessagesTab" && styles.tabPaneActive]}>
          <MessagesStackNavigator />
        </View>
        <View style={[styles.tabPane, activeTab === "ProfileTab" && styles.tabPaneActive]}>
          <ProfileStackNavigator />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 64,
    borderBottomWidth: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    ...Typography.h3,
  },
  navContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  navLabel: {
    ...Typography.body,
    fontWeight: "500",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  addButtonText: {
    ...Typography.button,
  },
  content: {
    flex: 1,
  },
  tabPane: {
    display: "none",
    flex: 1,
  },
  tabPaneActive: {
    display: "flex",
  },
});
