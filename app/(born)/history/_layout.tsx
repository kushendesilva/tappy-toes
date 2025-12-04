import { Stack } from 'expo-router';
import React from 'react';

export default function BornHistoryStack() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'History' }} />
      <Stack.Screen
        name="poop/[date]"
        options={({ route }: { route: { params?: { date?: string } } }) => ({
          title: route.params?.date ?? 'Poop Day'
        })}
      />
      <Stack.Screen
        name="pee/[date]"
        options={({ route }: { route: { params?: { date?: string } } }) => ({
          title: route.params?.date ?? 'Pee Day'
        })}
      />
    </Stack>
  );
}
