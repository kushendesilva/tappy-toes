import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useMedicineStore, formatTime } from '../store/medicineStore';

export const MedicineTodaySummary = () => {
  const getTodayLogs = useMedicineStore(s => s.getTodayLogs);
  const hydrated = useMedicineStore(s => s.hydrated);
  const medicines = useMedicineStore(s => s.medicines);
  
  if (!hydrated) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Today&apos;s Medicine</Text>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }
  
  const todayLogs = getTodayLogs();
  
  const takenCount = todayLogs.filter(l => l.status === 'taken').length;
  const missedCount = todayLogs.filter(l => l.status === 'missed').length;
  const snoozedCount = todayLogs.filter(l => l.status === 'snoozed').length;
  const pendingCount = medicines.length - todayLogs.length;
  
  // Get first and last action times
  const allTimes = todayLogs
    .map(l => l.actualTime || l.scheduledTime)
    .filter(Boolean)
    .sort();
  const firstTime = allTimes.length > 0 ? allTimes[0] : null;
  const lastTime = allTimes.length > 0 ? allTimes[allTimes.length - 1] : null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Today&apos;s Medicine</Text>
      <Row label="First Action" value={firstTime ? formatTime(firstTime) : '-'} />
      <Row label="Last Action" value={lastTime ? formatTime(lastTime) : '-'} />
      <Row label="Taken" value={String(takenCount)} color="#1B5E20" />
      <Row label="Missed" value={String(missedCount)} color="#B71C1C" />
      <Row label="Snoozed" value={String(snoozedCount)} color="#E65100" />
      <Row label="Pending" value={String(pendingCount)} />
      <Row label="Total Medicines" value={String(medicines.length)} />
    </View>
  );
};

const Row = ({ label, value, color }: { label: string; value: string; color?: string }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={[styles.value, color ? { color } : undefined]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { borderRadius: 12, padding: 16, backgroundColor: '#f4f6fa', marginBottom: 16 },
  heading: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { fontSize: 14, color: '#444' },
  value: { fontSize: 14, fontWeight: '500' },
  loading: { fontSize: 14, color: '#666' }
});
