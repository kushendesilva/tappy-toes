import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { formatDate, todayKey } from '../utils/dateUtils';

export type MedicineStatus = 'pending' | 'taken' | 'missed' | 'snoozed';
export type ReminderType = 'notification' | 'alarm';
export type RepetitionType = 'daily' | 'weekly' | 'none';

export interface SnoozeRecord {
  snoozedAt: string;
  durationMinutes: number;
}

export interface MedicineReminder {
  id: string;
  name: string;
  time: string;
  enabled: boolean;
  notificationId?: string;
  reminderType: ReminderType;
  repetition: RepetitionType;
}

export interface MedicineLog {
  id: string;
  medicineId: string;
  medicineName: string;
  scheduledTime: string;
  actualTime?: string;
  status: MedicineStatus;
  date: string;
  snoozeHistory: SnoozeRecord[];
}

export type MedicineLogData = Record<string, MedicineLog[]>;

interface MedicineState {
  medicines: MedicineReminder[];
  logs: MedicineLogData;
  logDays: string[];
  hydrated: boolean;
  addMedicine: (name: string, time: string, reminderType?: ReminderType, repetition?: RepetitionType) => MedicineReminder;
  updateMedicine: (id: string, updates: Partial<Pick<MedicineReminder, 'name' | 'time' | 'enabled' | 'reminderType' | 'repetition'>>) => void;
  removeMedicine: (id: string) => void;
  setMedicineNotificationId: (id: string, notificationId: string) => void;
  markAsTaken: (medicineId: string, actualTime?: string) => void;
  markAsMissed: (medicineId: string) => void;
  markAsSnoozed: (medicineId: string, durationMinutes: number) => void;
  getTodayLogs: () => MedicineLog[];
  getLogsForDate: (date: string) => MedicineLog[];
  getAllLogDays: () => string[];
  load: () => Promise<void>;
  resetAll: () => void;
}

const MEDICINES_KEY = 'medicinesV1';
const LOGS_KEY = 'medicineLogsV1';

export { formatDate, todayKey };

export function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const computeLogDays = (logs: MedicineLogData) => Object.keys(logs).sort((a, b) => (a < b ? 1 : -1));

async function persistMedicines(medicines: MedicineReminder[]) {
  try {
    await AsyncStorage.setItem(MEDICINES_KEY, JSON.stringify(medicines));
  } catch {}
}

async function persistLogs(logs: MedicineLogData) {
  try {
    await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  } catch {}
}

export const useMedicineStore = create<MedicineState>((set, get) => ({
  medicines: [],
  logs: {},
  logDays: [],
  hydrated: false,

  addMedicine: (name: string, time: string, reminderType: ReminderType = 'notification', repetition: RepetitionType = 'daily') => {
    const medicine: MedicineReminder = {
      id: generateId(),
      name,
      time,
      enabled: true,
      reminderType,
      repetition,
    };
    const medicines = [...get().medicines, medicine];
    set({ medicines });
    persistMedicines(medicines);
    return medicine;
  },

  updateMedicine: (id: string, updates: Partial<Pick<MedicineReminder, 'name' | 'time' | 'enabled' | 'reminderType' | 'repetition'>>) => {
    const medicines = get().medicines.map(m => (m.id === id ? { ...m, ...updates } : m));
    set({ medicines });
    persistMedicines(medicines);
  },

  removeMedicine: (id: string) => {
    const medicines = get().medicines.filter(m => m.id !== id);
    set({ medicines });
    persistMedicines(medicines);
  },

  setMedicineNotificationId: (id: string, notificationId: string) => {
    const medicines = get().medicines.map(m => (m.id === id ? { ...m, notificationId } : m));
    set({ medicines });
    persistMedicines(medicines);
  },

  markAsTaken: (medicineId: string, actualTime?: string) => {
    const key = todayKey();
    const now = actualTime || new Date().toISOString();
    const medicine = get().medicines.find(m => m.id === medicineId);
    if (!medicine) return;

    const cur = get().logs;
    const dayLogs = cur[key] || [];

    const existingIdx = dayLogs.findIndex(l => l.medicineId === medicineId);
    const existingLog = existingIdx >= 0 ? dayLogs[existingIdx] : null;

    const log: MedicineLog = {
      id: existingLog?.id || generateId(),
      medicineId,
      medicineName: medicine.name,
      scheduledTime: existingLog?.scheduledTime || new Date().toISOString(),
      actualTime: now,
      status: 'taken',
      date: key,
      snoozeHistory: existingLog?.snoozeHistory || [],
    };

    const newDayLogs = existingIdx >= 0 ? dayLogs.map((l, i) => (i === existingIdx ? log : l)) : [...dayLogs, log];
    const logs = { ...cur, [key]: newDayLogs };
    set({ logs, logDays: computeLogDays(logs) });
    persistLogs(logs);
  },

  markAsMissed: (medicineId: string) => {
    const key = todayKey();
    const medicine = get().medicines.find(m => m.id === medicineId);
    if (!medicine) return;

    const cur = get().logs;
    const dayLogs = cur[key] || [];

    const existingIdx = dayLogs.findIndex(l => l.medicineId === medicineId);
    const existingLog = existingIdx >= 0 ? dayLogs[existingIdx] : null;

    const log: MedicineLog = {
      id: existingLog?.id || generateId(),
      medicineId,
      medicineName: medicine.name,
      scheduledTime: existingLog?.scheduledTime || new Date().toISOString(),
      status: 'missed',
      date: key,
      snoozeHistory: existingLog?.snoozeHistory || [],
    };

    const newDayLogs = existingIdx >= 0 ? dayLogs.map((l, i) => (i === existingIdx ? log : l)) : [...dayLogs, log];
    const logs = { ...cur, [key]: newDayLogs };
    set({ logs, logDays: computeLogDays(logs) });
    persistLogs(logs);
  },

  markAsSnoozed: (medicineId: string, durationMinutes: number) => {
    const key = todayKey();
    const medicine = get().medicines.find(m => m.id === medicineId);
    if (!medicine) return;

    const cur = get().logs;
    const dayLogs = cur[key] || [];

    const existingIdx = dayLogs.findIndex(l => l.medicineId === medicineId);
    const existingLog = existingIdx >= 0 ? dayLogs[existingIdx] : null;

    const snoozeRecord: SnoozeRecord = {
      snoozedAt: new Date().toISOString(),
      durationMinutes,
    };

    const log: MedicineLog = {
      id: existingLog?.id || generateId(),
      medicineId,
      medicineName: medicine.name,
      scheduledTime: existingLog?.scheduledTime || new Date().toISOString(),
      status: 'snoozed',
      date: key,
      snoozeHistory: [...(existingLog?.snoozeHistory || []), snoozeRecord],
    };

    const newDayLogs = existingIdx >= 0 ? dayLogs.map((l, i) => (i === existingIdx ? log : l)) : [...dayLogs, log];
    const logs = { ...cur, [key]: newDayLogs };
    set({ logs, logDays: computeLogDays(logs) });
    persistLogs(logs);
  },

  getTodayLogs: () => {
    const key = todayKey();
    return get().logs[key] || [];
  },

  getLogsForDate: (date: string) => {
    return get().logs[date] || [];
  },

  getAllLogDays: () => {
    return get().logDays;
  },

  load: async () => {
    try {
      const [medicinesRaw, logsRaw] = await Promise.all([AsyncStorage.getItem(MEDICINES_KEY), AsyncStorage.getItem(LOGS_KEY)]);
      const rawMedicines: MedicineReminder[] = medicinesRaw ? JSON.parse(medicinesRaw) : [];
      const medicines: MedicineReminder[] = rawMedicines.map(m => ({
        ...m,
        reminderType: m.reminderType || 'notification',
        repetition: m.repetition || 'daily',
      }));

      const rawLogs: MedicineLogData = logsRaw ? JSON.parse(logsRaw) : {};
      const logs: MedicineLogData = {};
      for (const [date, dayLogs] of Object.entries(rawLogs)) {
        logs[date] = dayLogs.map(log => ({
          ...log,
          snoozeHistory: log.snoozeHistory || [],
        }));
      }

      set({ medicines, logs, logDays: computeLogDays(logs), hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  resetAll: () => {
    set({ medicines: [], logs: {}, logDays: [] });
    persistMedicines([]);
    persistLogs({});
  },
}));