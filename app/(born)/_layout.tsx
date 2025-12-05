import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

export default function BornTabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        headerTitleAlign: 'center'
      }}>
      <Tabs.Screen
        name="diaper"
        options={{
          title: "Diaper",
          tabBarIcon: ({ color }) => (
            <Ionicons name="water" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="feeding"
        options={{
          title: "Feeding",
          tabBarIcon: ({ color }) => (
            <Ionicons name="nutrition" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="medicine"
        options={{
          title: "Medicine",
          tabBarIcon: ({ color }) => (
            <Ionicons name="medical" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => (
            <Ionicons name="list" size={24} color={color} />
          ),
        }}
      />
      {/* Hide old separate screens from tab bar but keep files for backward compatibility */}
      <Tabs.Screen
        name="poop"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="pee"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
