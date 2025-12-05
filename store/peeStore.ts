import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { todayKey, formatTime, formatDate } from '../utils/dateUtils';

export type PeeData = Record<string, string[]>;

interface PeeState {
  data: PeeData;
  days: string[];
  hydrated: boolean;
  recordPee: () => void;
  undoLastPee: () => void;
  resetToday: () => void;
  resetAll: () => void;
  load: () => Promise<void>;
  getDay: (day: string) => string[];
  getAllDays: () => string[];
}

const STORAGE_KEY = 'peeDataV1';
export const EMPTY_ARRAY: string[] = [];

// Re-export for backward compatibility
export { todayKey, formatTime, formatDate };

function computeDays(data: PeeData): string[] {
  return Object.keys(data).sort((a, b) => (a < b ? 1 : -1));
}

async function persist(data: PeeData) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export const usePeeStore = create<PeeState>((set, get) => ({
  data: {},
  days: [],
  hydrated: false,

  recordPee: () => {
    const key = todayKey();
    const now = new Date().toISOString();
    const cur = get().data;
    const arr = cur[key] ? [...cur[key], now] : [now];
    const data = { ...cur, [key]: arr };
    const days = computeDays(data);
    set({ data, days });
    persist(data);
  },

  undoLastPee: () => {
    const key = todayKey();
    const cur = get().data;
    const arr = cur[key];
    if (!arr || arr.length === 0) return;
    const nextArr = arr.slice(0, -1);
    const data = { ...cur };
    if (nextArr.length === 0) {
      delete data[key];
    } else {
      data[key] = nextArr;
    }
    const days = computeDays(data);
    set({ data, days });
    persist(data);
  },

  resetToday: () => {
    const key = todayKey();
    const cur = get().data;
    if (!cur[key]) return;
    const data = { ...cur };
    delete data[key];
    const days = computeDays(data);
    set({ data, days });
    persist(data);
  },

  resetAll: () => {
    set({ data: {}, days: [] });
    persist({});
  },

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data: PeeData = JSON.parse(raw);
        set({ data, days: computeDays(data), hydrated: true });
        return;
      }
    } catch {
      // ignore
    }
    set({ hydrated: true });
  },

  getDay: (day: string) => get().data[day] ?? EMPTY_ARRAY,
  getAllDays: () => get().days
}));

export function getSummary(timestamps: string[]) {
  if (!timestamps.length) return { start: null, end: null, count: 0 };
  return {
    start: timestamps[0],
    end: timestamps[timestamps.length - 1],
    count: timestamps.length
  };
}
