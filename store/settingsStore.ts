import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface SettingsState {
  kickGoal: number;
  poopGoal: number;
  peeGoal: number;
  hydrated: boolean;
  setKickGoal: (goal: number) => void;
  setPoopGoal: (goal: number) => void;
  setPeeGoal: (goal: number) => void;
  load: () => Promise<void>;
}

const STORAGE_KEY = 'settingsV1';

interface SettingsData {
  kickGoal: number;
  poopGoal: number;
  peeGoal: number;
}

async function persist(data: SettingsData) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  kickGoal: 10,
  poopGoal: 10,
  peeGoal: 10,
  hydrated: false,

  setKickGoal: (goal: number) => {
    set({ kickGoal: goal });
    persist({ kickGoal: goal, poopGoal: get().poopGoal, peeGoal: get().peeGoal });
  },

  setPoopGoal: (goal: number) => {
    set({ poopGoal: goal });
    persist({ kickGoal: get().kickGoal, poopGoal: goal, peeGoal: get().peeGoal });
  },

  setPeeGoal: (goal: number) => {
    set({ peeGoal: goal });
    persist({ kickGoal: get().kickGoal, poopGoal: get().poopGoal, peeGoal: goal });
  },

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data: SettingsData = JSON.parse(raw);
        set({ 
          kickGoal: data.kickGoal ?? 10, 
          poopGoal: data.poopGoal ?? 10, 
          peeGoal: data.peeGoal ?? 10,
          hydrated: true 
        });
        return;
      }
    } catch {
      // ignore
    }
    set({ hydrated: true });
  },
}));
