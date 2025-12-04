import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTodayKey } from '../hooks/use-today-key';
import { EMPTY_ARRAY, formatTime, getSummary, usePoopStore } from '../store/poopStore';

export const PoopTodaySummary = () => {
  const dayKey = useTodayKey();
  const poops = usePoopStore(s => s.data[dayKey] ?? EMPTY_ARRAY);
  const summary = getSummary(poops);
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Today&apos;s Poop</Text>
      <Row label="First" value={summary.start ? formatTime(summary.start) : '-'} />
      <Row label="Last" value={summary.end ? formatTime(summary.end) : '-'} />
      <Row label="Count" value={String(summary.count)} />
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
