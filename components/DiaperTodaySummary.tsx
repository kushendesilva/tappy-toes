import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTodayKey } from '../hooks/use-today-key';
import { EMPTY_ARRAY as PEE_EMPTY_ARRAY, formatTime, getSummary as getPeeSummary, usePeeStore } from '../store/peeStore';
import { EMPTY_ARRAY as POOP_EMPTY_ARRAY, getSummary as getPoopSummary, usePoopStore } from '../store/poopStore';

export const DiaperTodaySummary = () => {
  const dayKey = useTodayKey();
  const pees = usePeeStore(s => s.data[dayKey] ?? PEE_EMPTY_ARRAY);
  const poops = usePoopStore(s => s.data[dayKey] ?? POOP_EMPTY_ARRAY);
  const peeSummary = getPeeSummary(pees);
  const poopSummary = getPoopSummary(poops);
  
  // Combine and sort all timestamps
  const allTimes = [...pees, ...poops].sort();
  const firstTime = allTimes.length > 0 ? allTimes[0] : null;
  const lastTime = allTimes.length > 0 ? allTimes[allTimes.length - 1] : null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Today&apos;s Diaper</Text>
      <Row label="First" value={firstTime ? formatTime(firstTime) : '-'} />
      <Row label="Last" value={lastTime ? formatTime(lastTime) : '-'} />
      <Row label="Pee Count" value={String(peeSummary.count)} />
      <Row label="Poop Count" value={String(poopSummary.count)} />
      <Row label="Total" value={String(peeSummary.count + poopSummary.count)} />
    </View>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { borderRadius: 12, padding: 16, backgroundColor: '#f4f6fa', marginBottom: 16 },
  heading: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { fontSize: 14, color: '#444' },
  value: { fontSize: 14, fontWeight: '500' }
});
