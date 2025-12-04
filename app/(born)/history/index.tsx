import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PeeTodaySummary } from '../../../components/PeeTodaySummary';
import { PoopTodaySummary } from '../../../components/PoopTodaySummary';
import { useAppModeStore } from '../../../store/appModeStore';
import { formatDate, usePoopStore } from '../../../store/poopStore';
import { usePeeStore } from '../../../store/peeStore';

type TabType = 'poop' | 'pee';

export default function BornHistoryRoot() {
  const [activeTab, setActiveTab] = useState<TabType>('poop');
  const setMode = useAppModeStore(s => s.setMode);
  
  const poopDays = usePoopStore(s => s.getAllDays());
  const getPoopDay = usePoopStore(s => s.getDay);
  const resetAllPoop = usePoopStore(s => s.resetAll);
  
  const peeDays = usePeeStore(s => s.getAllDays());
  const getPeeDay = usePeeStore(s => s.getDay);
  const resetAllPee = usePeeStore(s => s.resetAll);

  const days = activeTab === 'poop' ? poopDays : peeDays;
  const getDay = activeTab === 'poop' ? getPoopDay : getPeeDay;
  const resetAll = activeTab === 'poop' ? resetAllPoop : resetAllPee;

  const confirmResetAll = () => {
    if (days.length === 0) return;
    const typeLabel = activeTab === 'poop' ? 'poop' : 'pee';
    Alert.alert(
      'Reset All Data',
      `This will remove all recorded ${typeLabel} entries. This cannot be undone. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset All', style: 'destructive', onPress: () => resetAll() }
      ]
    );
  };

  const handleSwitchMode = () => {
    Alert.alert(
      'Switch Mode',
      'Switch to pregnancy kick tracking mode?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Switch', 
          onPress: () => setMode('pregnant')
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {activeTab === 'poop' ? <PoopTodaySummary /> : <PeeTodaySummary />}

      <View style={styles.tabContainer}>
        <Pressable 
          style={[styles.tab, activeTab === 'poop' && styles.activeTab]}
          onPress={() => setActiveTab('poop')}
        >
          <Text style={[styles.tabText, activeTab === 'poop' && styles.activeTabText]}>Poop</Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'pee' && styles.activeTab]}
          onPress={() => setActiveTab('pee')}
        >
          <Text style={[styles.tabText, activeTab === 'pee' && styles.activeTabText]}>Pee</Text>
        </Pressable>
      </View>

      <Pressable
        style={[styles.resetAllBtn, days.length === 0 && styles.resetAllDisabled]}
        disabled={days.length === 0}
        onPress={confirmResetAll}
      >
        <Text style={styles.resetAllText}>Reset All {activeTab === 'poop' ? 'Poop' : 'Pee'} Data</Text>
      </Pressable>

      <FlatList
        data={days}
        keyExtractor={d => d}
        renderItem={({ item }) => {
          const count = getDay(item).length;
          return (
            <Link
              href={{ 
                pathname: activeTab === 'poop' 
                  ? '/(born)/history/poop/[date]' 
                  : '/(born)/history/pee/[date]', 
                params: { date: item } 
              }}
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

      <Pressable style={styles.switchModeBtn} onPress={handleSwitchMode}>
        <Ionicons name="swap-horizontal" size={20} color="#4e6af3" />
        <Text style={styles.switchModeText}>Switch to Pregnancy Mode</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f4f6fa',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#4e6af3',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  activeTabText: {
    color: '#fff',
  },
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
  empty: { marginTop: 40, alignItems: 'center' },
  switchModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f6fa',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 14,
    gap: 8
  },
  switchModeText: {
    color: '#4e6af3',
    fontSize: 15,
    fontWeight: '600'
  }
});
