import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type KickData = Record<string, string[]>;

interface KickState {
  data: KickData;
  days: string[];
  hydrated: boolean;
  recordKick: () => void;
  load: () => Promise<void>;
  getDay: (day: string) => string[];
  getAllDays: () => string[];
}

const STORAGE_KEY = 'kickDataV1';
export const EMPTY_ARRAY: string[] = [];

export function todayKey() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0')
  ].join('-');
}

function computeDays(data: KickData): string[] {
  return Object.keys(data).sort((a, b) => (a < b ? 1 : -1));
}

export const useKickStore = create<KickState>((set, get) => ({
  data: {},
  days: [],
  hydrated: false,
  recordKick: () => {
    const k = todayKey();
    const now = new Date().toISOString();
    const cur = get().data;
    const existing = cur[k] || EMPTY_ARRAY;
    const updatedDay = existing === EMPTY_ARRAY ? [now] : [...existing, now];
    const data = { ...cur, [k]: updatedDay };
    const days = computeDays(data);
    set({ data, days });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  },
  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data: KickData = JSON.parse(raw);
        set({ data, days: computeDays(data), hydrated: true });
        return;
      }
    } catch {}
    set({ hydrated: true });
  },
  getDay: (day: string) => get().data[day] ?? EMPTY_ARRAY,
  getAllDays: () => get().days
}));

export function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatDate(day: string) {
  if (!day) return '';
  const [y, m, d] = day.split('-');
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

export function getSummary(timestamps: string[]) {
  if (!timestamps.length) return { start: null, end: null, tenth: null, count: 0 };
  return {
    start: timestamps[0],
    end: timestamps[timestamps.length - 1],
    tenth: timestamps[9] || null,
    count: timestamps.length
  };
}