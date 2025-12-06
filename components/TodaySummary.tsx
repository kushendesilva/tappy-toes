import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTodayKey } from '../hooks/use-today-key';
import { EMPTY_ARRAY, formatTime, getSummary, useKickStore } from '../store/kickStore';

export const TodaySummary = () => {
  const dayKey = useTodayKey();
  const hydrated = useKickStore(s => s.hydrated);
  const kicks = useKickStore(s => s.data[dayKey] ?? EMPTY_ARRAY);
  const summary = getSummary(kicks);
  
  if (!hydrated) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Today</Text>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Today</Text>
      <Row label="Started" value={summary.start ? formatTime(summary.start) : '-'} />
      <Row label="Ended" value={summary.end ? formatTime(summary.end) : '-'} />
      <Row label="10th Kick" value={summary.tenth ? formatTime(summary.tenth) : '-'} />
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
  value: { fontSize: 14, fontWeight: '500' },
  loading: { fontSize: 14, color: '#666' }
});