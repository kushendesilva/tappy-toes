import { Stack } from 'expo-router';
import React from 'react';

export default function BornHistoryStack() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'History' }} />
      <Stack.Screen
        name="diaper/[date]"
        options={({ route }: { route: { params?: { date?: string } } }) => ({
          title: route.params?.date ?? 'Diaper Day'
        })}
      />
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
      <Stack.Screen
        name="feeding/[date]"
        options={({ route }: { route: { params?: { date?: string } } }) => ({
          title: route.params?.date ?? 'Feeding Day'
        })}
      />
      <Stack.Screen
        name="medicine/[date]"
        options={({ route }: { route: { params?: { date?: string } } }) => ({
          title: route.params?.date ?? 'Medicine Day'
        })}
      />
    </Stack>
  );
}
