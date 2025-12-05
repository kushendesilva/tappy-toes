import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTodayKey } from '../hooks/use-today-key';
import { 
  EMPTY_ARRAY, 
  formatTime, 
  getBreastFeedCount, 
  getFormulaFeedCount, 
  getSummary, 
  getTotalMl, 
  useFeedingStore 
} from '../store/feedingStore';

export const FeedingTodaySummary = () => {
  const dayKey = useTodayKey();
  const feedings = useFeedingStore(s => s.data[dayKey] ?? EMPTY_ARRAY);
  const summary = getSummary(feedings);
  const breastCount = getBreastFeedCount(feedings);
  const formulaCount = getFormulaFeedCount(feedings);
  const totalMl = getTotalMl(feedings);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Today&apos;s Feeding</Text>
      <Row label="First" value={summary.start ? formatTime(summary.start) : '-'} />
      <Row label="Last" value={summary.end ? formatTime(summary.end) : '-'} />
      <Row label="Breast Feed" value={String(breastCount)} />
      <Row label="Formula Feed" value={String(formulaCount)} />
      <Row label="Total" value={String(summary.count)} />
      <Row label="Total ML" value={`${totalMl}ml`} />
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
