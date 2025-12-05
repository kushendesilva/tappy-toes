import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface SettingsState {
  // Goals
  kickGoal: number;
  poopGoal: number;
  peeGoal: number;
  feedingGoal: number;
  
  // Feeding settings
  feedingMlIncrement: number; // default 30ml
  feedingLogAmount: boolean; // whether to log ml amounts
  feedingSeparateSections: boolean; // whether to show breast/formula as separate sections
  
  // Enable/disable tracking types
  peeEnabled: boolean;
  poopEnabled: boolean;
  breastFeedEnabled: boolean;
  formulaFeedEnabled: boolean;
  
  hydrated: boolean;
  
  // Setters
  setKickGoal: (goal: number) => void;
  setPoopGoal: (goal: number) => void;
  setPeeGoal: (goal: number) => void;
  setFeedingGoal: (goal: number) => void;
  setFeedingMlIncrement: (increment: number) => void;
  setFeedingLogAmount: (enabled: boolean) => void;
  setFeedingSeparateSections: (enabled: boolean) => void;
  setPeeEnabled: (enabled: boolean) => void;
  setPoopEnabled: (enabled: boolean) => void;
  setBreastFeedEnabled: (enabled: boolean) => void;
  setFormulaFeedEnabled: (enabled: boolean) => void;
  load: () => Promise<void>;
}

const STORAGE_KEY = 'settingsV2';

interface SettingsData {
  kickGoal: number;
  poopGoal: number;
  peeGoal: number;
  feedingGoal: number;
  feedingMlIncrement: number;
  feedingLogAmount: boolean;
  feedingSeparateSections: boolean;
  peeEnabled: boolean;
  poopEnabled: boolean;
  breastFeedEnabled: boolean;
  formulaFeedEnabled: boolean;
}

async function persist(data: SettingsData) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function getPersistedData(state: SettingsState): SettingsData {
  return {
    kickGoal: state.kickGoal,
    poopGoal: state.poopGoal,
    peeGoal: state.peeGoal,
    feedingGoal: state.feedingGoal,
    feedingMlIncrement: state.feedingMlIncrement,
    feedingLogAmount: state.feedingLogAmount,
    feedingSeparateSections: state.feedingSeparateSections,
    peeEnabled: state.peeEnabled,
    poopEnabled: state.poopEnabled,
    breastFeedEnabled: state.breastFeedEnabled,
    formulaFeedEnabled: state.formulaFeedEnabled,
  };
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  kickGoal: 10,
  poopGoal: 10,
  peeGoal: 10,
  feedingGoal: 10,
  feedingMlIncrement: 30,
  feedingLogAmount: true,
  feedingSeparateSections: true,
  peeEnabled: true,
  poopEnabled: true,
  breastFeedEnabled: true,
  formulaFeedEnabled: true,
  hydrated: false,

  setKickGoal: (goal: number) => {
    set({ kickGoal: goal });
    persist(getPersistedData({ ...get(), kickGoal: goal }));
  },

  setPoopGoal: (goal: number) => {
    set({ poopGoal: goal });
    persist(getPersistedData({ ...get(), poopGoal: goal }));
  },

  setPeeGoal: (goal: number) => {
    set({ peeGoal: goal });
    persist(getPersistedData({ ...get(), peeGoal: goal }));
  },

  setFeedingGoal: (goal: number) => {
    set({ feedingGoal: goal });
    persist(getPersistedData({ ...get(), feedingGoal: goal }));
  },

  setFeedingMlIncrement: (increment: number) => {
    set({ feedingMlIncrement: increment });
    persist(getPersistedData({ ...get(), feedingMlIncrement: increment }));
  },

  setFeedingLogAmount: (enabled: boolean) => {
    set({ feedingLogAmount: enabled });
    persist(getPersistedData({ ...get(), feedingLogAmount: enabled }));
  },

  setFeedingSeparateSections: (enabled: boolean) => {
    set({ feedingSeparateSections: enabled });
    persist(getPersistedData({ ...get(), feedingSeparateSections: enabled }));
  },

  setPeeEnabled: (enabled: boolean) => {
    set({ peeEnabled: enabled });
    persist(getPersistedData({ ...get(), peeEnabled: enabled }));
  },

  setPoopEnabled: (enabled: boolean) => {
    set({ poopEnabled: enabled });
    persist(getPersistedData({ ...get(), poopEnabled: enabled }));
  },

  setBreastFeedEnabled: (enabled: boolean) => {
    set({ breastFeedEnabled: enabled });
    persist(getPersistedData({ ...get(), breastFeedEnabled: enabled }));
  },

  setFormulaFeedEnabled: (enabled: boolean) => {
    set({ formulaFeedEnabled: enabled });
    persist(getPersistedData({ ...get(), formulaFeedEnabled: enabled }));
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
          feedingGoal: data.feedingGoal ?? 10,
          feedingMlIncrement: data.feedingMlIncrement ?? 30,
          feedingLogAmount: data.feedingLogAmount ?? true,
          feedingSeparateSections: data.feedingSeparateSections ?? true,
          peeEnabled: data.peeEnabled ?? true,
          poopEnabled: data.poopEnabled ?? true,
          breastFeedEnabled: data.breastFeedEnabled ?? true,
          formulaFeedEnabled: data.formulaFeedEnabled ?? true,
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
