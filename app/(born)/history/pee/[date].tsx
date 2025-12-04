import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useLayoutEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { formatDate, formatTime, usePeeStore } from '../../../../store/peeStore';

export default function PeeDayDetail() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const navigation = useNavigation();
  const pees = usePeeStore(s => s.getDay(date || ''));

  useLayoutEffect(() => {
    navigation.setOptions({ title: date ? formatDate(date) : 'Day' });
  }, [navigation, date]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{date ? formatDate(date) : 'Day'}</Text>
      <Text style={styles.sub}>{pees.length} pees</Text>
      <FlatList
        data={pees}
        keyExtractor={(t, i) => t + i}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.index}>{index + 1}</Text>
            <Text style={styles.time}>{formatTime(item)}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListEmptyComponent={<View style={styles.empty}><Text>No entries</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 20, fontWeight: '600' },
  sub: { fontSize: 14, color: '#555', marginBottom: 16 },
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center'
  },
  index: { width: 32, fontWeight: '600' },
  time: { fontSize: 16, fontWeight: '500' },
  sep: { height: 8 },
  empty: { marginTop: 40, alignItems: 'center' }
});
