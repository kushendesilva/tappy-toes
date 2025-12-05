import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type AppMode = 'not_set' | 'pregnant' | 'born';

interface AppModeState {
  mode: AppMode;
  hydrated: boolean;
  setMode: (mode: AppMode) => void;
  load: () => Promise<void>;
}

const STORAGE_KEY = 'appModeV1';

async function persist(mode: AppMode) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // ignore
  }
}

export const useAppModeStore = create<AppModeState>((set) => ({
  mode: 'not_set',
  hydrated: false,

  setMode: (mode: AppMode) => {
    set({ mode });
    persist(mode);
  },

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw && (raw === 'pregnant' || raw === 'born')) {
        set({ mode: raw as AppMode, hydrated: true });
        return;
      }
    } catch {
      // ignore
    }
    set({ hydrated: true });
  },
}));
