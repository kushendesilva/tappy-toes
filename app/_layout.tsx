import { useColorScheme } from "@/hooks/use-color-scheme";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { useAppModeStore } from "../store/appModeStore";
import { useKickStore } from "../store/kickStore";
import { usePeeStore } from "../store/peeStore";
import { usePoopStore } from "../store/poopStore";
import { useSettingsStore } from "../store/settingsStore";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  // App mode
  const appModeHydrated = useAppModeStore(s => s.hydrated);
  const loadAppMode = useAppModeStore(s => s.load);
  
  // Kick store
  const kickHydrated = useKickStore(s => s.hydrated);
  const loadKick = useKickStore(s => s.load);
  
  // Poop store
  const poopHydrated = usePoopStore(s => s.hydrated);
  const loadPoop = usePoopStore(s => s.load);
  
  // Pee store
  const peeHydrated = usePeeStore(s => s.hydrated);
  const loadPee = usePeeStore(s => s.load);
  
  // Settings store
  const settingsHydrated = useSettingsStore(s => s.hydrated);
  const loadSettings = useSettingsStore(s => s.load);

  useEffect(() => {
    loadAppMode();
    loadKick();
    loadPoop();
    loadPee();
    loadSettings();
  }, [loadAppMode, loadKick, loadPoop, loadPee, loadSettings]);

  const allHydrated = appModeHydrated && kickHydrated && poopHydrated && peeHydrated && settingsHydrated;

  useEffect(() => {
    if (allHydrated) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [allHydrated]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="select-mode" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(born)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}