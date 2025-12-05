import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { todayKey, formatTime, formatDate } from '../utils/dateUtils';

export type FeedType = 'breast' | 'formula';

export interface FeedingEntry {
  timestamp: string;
  type: FeedType;
  amount?: number; // in ml, optional
}

export type FeedingData = Record<string, FeedingEntry[]>;

interface FeedingState {
  data: FeedingData;
  days: string[];
  hydrated: boolean;
  recordFeeding: (type: FeedType, amount?: number) => void;
  undoLastFeeding: () => void;
  resetToday: () => void;
  resetAll: () => void;
  load: () => Promise<void>;
  getDay: (day: string) => FeedingEntry[];
  getAllDays: () => string[];
  getTodayByType: (type: FeedType) => FeedingEntry[];
}

const STORAGE_KEY = 'feedingDataV1';
export const EMPTY_ARRAY: FeedingEntry[] = [];

// Re-export for backward compatibility
export { todayKey, formatTime, formatDate };

function computeDays(data: FeedingData): string[] {
  return Object.keys(data).sort((a, b) => (a < b ? 1 : -1));
}

async function persist(data: FeedingData) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export const useFeedingStore = create<FeedingState>((set, get) => ({
  data: {},
  days: [],
  hydrated: false,

  recordFeeding: (type: FeedType, amount?: number) => {
    const key = todayKey();
    const now = new Date().toISOString();
    const cur = get().data;
    const entry: FeedingEntry = { timestamp: now, type, amount };
    const arr = cur[key] ? [...cur[key], entry] : [entry];
    const data = { ...cur, [key]: arr };
    const days = computeDays(data);
    set({ data, days });
    persist(data);
  },

  undoLastFeeding: () => {
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
        const data: FeedingData = JSON.parse(raw);
        set({ data, days: computeDays(data), hydrated: true });
        return;
      }
    } catch {
      // ignore
    }
    set({ hydrated: true });
  },

  getDay: (day: string) => get().data[day] ?? EMPTY_ARRAY,
  getAllDays: () => get().days,
  getTodayByType: (type: FeedType) => {
    const key = todayKey();
    const dayData = get().data[key] ?? EMPTY_ARRAY;
    return dayData.filter(entry => entry.type === type);
  }
}));

export function getSummary(entries: FeedingEntry[]) {
  if (!entries.length) return { start: null, end: null, count: 0, totalAmount: 0 };
  const totalAmount = entries.reduce((sum, e) => sum + (e.amount ?? 0), 0);
  return {
    start: entries[0].timestamp,
    end: entries[entries.length - 1].timestamp,
    count: entries.length,
    totalAmount
  };
}

export function getBreastFeedCount(entries: FeedingEntry[]): number {
  return entries.filter(e => e.type === 'breast').length;
}

export function getFormulaFeedCount(entries: FeedingEntry[]): number {
  return entries.filter(e => e.type === 'formula').length;
}

export function getTotalMl(entries: FeedingEntry[]): number {
  return entries.reduce((sum, e) => sum + (e.amount ?? 0), 0);
}
