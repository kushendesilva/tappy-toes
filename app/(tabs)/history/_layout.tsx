import { Stack } from 'expo-router';
import React from 'react';

export default function HistoryStack() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'History' }} />
      <Stack.Screen
        name="[date]"
        options={({ route }: { route: { params?: { date?: string } } }) => ({
          title: route.params?.date ?? 'Day'
        })}
      />
    </Stack>
  );
}