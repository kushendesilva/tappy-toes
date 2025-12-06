import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useLayoutEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { formatDate, formatTime, usePeeStore } from '../../../../store/peeStore';
import { usePoopStore } from '../../../../store/poopStore';

type DiaperEntry = {
  timestamp: string;
  type: 'pee' | 'poop';
};

export default function DiaperDayDetail() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const navigation = useNavigation();
  const pees = usePeeStore(s => s.getDay(date || ''));
  const poops = usePoopStore(s => s.getDay(date || ''));

  useLayoutEffect(() => {
    navigation.setOptions({ title: date ? formatDate(date) : 'Day' });
  }, [navigation, date]);

  // Combine and sort pee and poop entries
  const entries: DiaperEntry[] = [
    ...pees.map(timestamp => ({ timestamp, type: 'pee' as const })),
    ...poops.map(timestamp => ({ timestamp, type: 'poop' as const })),
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const peeCount = pees.length;
  const poopCount = poops.length;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{date ? formatDate(date) : 'Day'}</Text>
      <View style={styles.summaryRow}>
        <Text style={styles.sub}>💧 {peeCount} pee{peeCount !== 1 ? 's' : ''}</Text>
        <Text style={styles.sub}>💩 {poopCount} poop{poopCount !== 1 ? 's' : ''}</Text>
        <Text style={styles.sub}>Total: {entries.length}</Text>
      </View>
      <FlatList
        data={entries}
        keyExtractor={(item, i) => item.timestamp + i}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.index}>{index + 1}</Text>
            <View style={styles.iconContainer}>
              {item.type === 'pee' ? (
                <Ionicons name="water" size={20} color="#FFD700" />
              ) : (
                <Ionicons name="ellipse" size={20} color="#8B4513" />
              )}
            </View>
            <Text style={styles.type}>{item.type === 'pee' ? 'Pee' : 'Poop'}</Text>
            <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
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
  summaryRow: { 
    flexDirection: 'row', 
    gap: 16, 
    marginBottom: 16 
  },
  sub: { fontSize: 14, color: '#555' },
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center'
  },
  index: { width: 32, fontWeight: '600' },
  iconContainer: { 
    width: 32, 
    alignItems: 'center' 
  },
  type: { 
    flex: 1, 
    fontSize: 16, 
    fontWeight: '500' 
  },
  time: { 
    fontSize: 16, 
    fontWeight: '500',
    color: '#666'
  },
  sep: { height: 8 },
  empty: { marginTop: 40, alignItems: 'center' }
});
