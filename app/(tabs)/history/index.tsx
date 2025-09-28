import { Link } from 'expo-router';
import React from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TodaySummary } from '../../../components/TodaySummary';
import { formatDate, useKickStore } from '../../../store/kickStore';

export default function HistoryRoot() {
  const days = useKickStore(s => s.getAllDays());
  const getDay = useKickStore(s => s.getDay);
  const resetAll = useKickStore(s => s.resetAll);

  const confirmResetAll = () => {
    if (days.length === 0) return;
    Alert.alert(
      'Reset All Data',
      'This will remove every recorded kick. This cannot be undone. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset All', style: 'destructive', onPress: () => resetAll() }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TodaySummary />

      <Pressable
        style={[styles.resetAllBtn, days.length === 0 && styles.resetAllDisabled]}
        disabled={days.length === 0}
        onPress={confirmResetAll}
      >
        <Text style={styles.resetAllText}>Reset All Data</Text>
      </Pressable>

      <FlatList
        data={days}
        keyExtractor={d => d}
        renderItem={({ item }) => {
          const count = getDay(item).length;
          return (
            <Link
              href={{ pathname: '/(tabs)/history/[date]', params: { date: item } }}
              asChild
            >
              <TouchableOpacity style={styles.row}>
                <Text style={styles.rowDate}>{formatDate(item)}</Text>
                <Text style={styles.rowCount}>{count}</Text>
              </TouchableOpacity>
            </Link>
          );
        }}
        ListEmptyComponent={<View style={styles.empty}><Text>No data yet</Text></View>}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        contentContainerStyle={days.length === 0 && { flexGrow: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  resetAllBtn: {
    backgroundColor: '#c62828',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 14
  },
  resetAllDisabled: {
    opacity: 0.4
  },
  resetAllText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600'
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  rowDate: { fontSize: 16, fontWeight: '500' },
  rowCount: { fontSize: 16, fontWeight: '600', color: '#4e6af3' },
  sep: { height: 10 },
  empty: { marginTop: 40, alignItems: 'center' }
});