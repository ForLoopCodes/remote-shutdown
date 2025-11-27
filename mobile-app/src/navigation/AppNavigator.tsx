/**
 * App Navigator
 *
 * Main navigation structure for the app.
 * Uses bottom tab navigation with Home, Info, and Settings screens.
 */

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, StyleSheet } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import InfoScreen from "../screens/InfoScreen";
import SettingsScreen from "../screens/SettingsScreen";
import {
  HomeIcon as HomeIconSvg,
  InfoIcon as InfoIconSvg,
  SettingsIcon as SettingsIconSvg,
  AppLogo,
} from "../components/Icons";

const Tab = createBottomTabNavigator();

// Icon components using pixel art SVGs
const HomeIcon = ({ focused }: { focused: boolean }) => (
  <View style={styles.iconContainer}>
    <HomeIconSvg size={28} color={focused ? "#000000" : "#8E8E93"} />
  </View>
);

const InfoIcon = ({ focused }: { focused: boolean }) => (
  <View style={styles.iconContainer}>
    <InfoIconSvg size={28} color={focused ? "#000000" : "#8E8E93"} />
  </View>
);

const SettingsIcon = ({ focused }: { focused: boolean }) => (
  <View style={styles.iconContainer}>
    <SettingsIconSvg size={28} color={focused ? "#000000" : "#8E8E93"} />
  </View>
);

// Header icon component
const HeaderIcon = () => (
  <View>
    <AppLogo size={24} color="#FFFFFF" />
  </View>
);

const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#000000",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E5EA",
          paddingTop: 12,
          paddingBottom: 20,
          height: 85,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: "#000000",
        },
        headerTintColor: "#FFFFFF",
        headerTitle: () => <AppLogo size={28} color="#FFFFFF" />,
        headerTitleAlign: "center",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
          headerTitle: () => <AppLogo size={28} color="#FFFFFF" />,
        }}
      />
      <Tab.Screen
        name="Info"
        component={InfoScreen}
        options={{
          tabBarLabel: "Info",
          tabBarIcon: ({ focused }) => <InfoIcon focused={focused} />,
          headerTitle: () => <InfoIconSvg size={28} color="#FFFFFF" />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ focused }) => <SettingsIcon focused={focused} />,
          headerTitle: () => <SettingsIconSvg size={28} color="#FFFFFF" />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
  },
});

export default AppNavigator;
