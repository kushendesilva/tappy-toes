import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useLayoutEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { formatDate, formatTime, useFeedingStore } from '../../../../store/feedingStore';

export default function FeedingDayDetail() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const navigation = useNavigation();
  const feedings = useFeedingStore(s => s.getDay(date || ''));

  useLayoutEffect(() => {
    navigation.setOptions({ title: date ? formatDate(date) : 'Day' });
  }, [navigation, date]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{date ? formatDate(date) : 'Day'}</Text>
      <Text style={styles.sub}>{feedings.length} feedings</Text>
      <FlatList
        data={feedings}
        keyExtractor={(t, i) => t.timestamp + i}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.index}>{index + 1}</Text>
            <View style={styles.details}>
              <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
              <View style={styles.typeContainer}>
                <Text style={[styles.type, item.type === 'breast' ? styles.breastType : styles.formulaType]}>
                  {item.type === 'breast' ? 'Breast' : 'Formula'}
                </Text>
                {item.amount !== undefined && (
                  <Text style={styles.amount}>{item.amount}ml</Text>
                )}
              </View>
            </View>
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
  details: { flex: 1 },
  time: { fontSize: 16, fontWeight: '500' },
  typeContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 4,
    gap: 8
  },
  type: { 
    fontSize: 12, 
    fontWeight: '600', 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 4 
  },
  breastType: { 
    backgroundColor: '#FFE4EC', 
    color: '#FF69B4' 
  },
  formulaType: { 
    backgroundColor: '#E4F0FF', 
    color: '#4682B4' 
  },
  amount: { 
    fontSize: 12, 
    color: '#666' 
  },
  sep: { height: 8 },
  empty: { marginTop: 40, alignItems: 'center' }
});
