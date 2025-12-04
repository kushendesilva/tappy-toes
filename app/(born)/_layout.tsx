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
        name="poop"
        options={{
          title: "Poop",
          tabBarIcon: ({ color }) => (
            <Ionicons name="ellipse" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pee"
        options={{
          title: "Pee",
          tabBarIcon: ({ color }) => (
            <Ionicons name="water" size={24} color={color} />
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
    </Tabs>
  );
}
