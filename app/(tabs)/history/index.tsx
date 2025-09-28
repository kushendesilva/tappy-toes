import { Link } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TodaySummary } from '../../../components/TodaySummary';
import { EMPTY_ARRAY, formatDate, useKickStore } from '../../../store/kickStore';

export default function HistoryRoot() {
  const days = useKickStore(s => s.days);                // stable array from state
  const data = useKickStore(s => s.data);

  return (
    <View style={styles.container}>
      <TodaySummary />
      <FlatList
        data={days}
        keyExtractor={d => d}
        renderItem={({ item }) => {
          const count = (data[item] ?? EMPTY_ARRAY).length;
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
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