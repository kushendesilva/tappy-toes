import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import React from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TodaySummary } from '../../../components/TodaySummary';
import { useAppModeStore } from '../../../store/appModeStore';
import { formatDate, useKickStore } from '../../../store/kickStore';
import { useSettingsStore } from '../../../store/settingsStore';

export default function HistoryRoot() {
  const days = useKickStore(s => s.getAllDays());
  const getDay = useKickStore(s => s.getDay);
  const resetAll = useKickStore(s => s.resetAll);
  const setMode = useAppModeStore(s => s.setMode);
  const kickGoal = useSettingsStore(s => s.kickGoal);
  const setKickGoal = useSettingsStore(s => s.setKickGoal);

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

  const handleSwitchMode = () => {
    Alert.alert(
      'Switch Mode',
      'Switch to baby born mode for poop and pee tracking?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Switch', 
          onPress: () => {
            setMode('born');
            router.replace('/(born)/poop');
          }
        }
      ]
    );
  };

  const handleSetGoal = () => {
    Alert.prompt(
      'Set Kick Goal',
      `Enter daily kick goal (current: ${kickGoal})`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Set', 
          onPress: (value: string | undefined) => {
            const num = parseInt(value || '', 10);
            if (!isNaN(num) && num > 0) {
              setKickGoal(num);
            }
          }
        }
      ],
      'plain-text',
      String(kickGoal)
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

      <Pressable style={styles.goalBtn} onPress={handleSetGoal}>
        <Ionicons name="flag" size={18} color="#4e6af3" />
        <Text style={styles.goalBtnText}>Daily Goal: {kickGoal}</Text>
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

      <Pressable style={styles.switchModeBtn} onPress={handleSwitchMode}>
        <Ionicons name="swap-horizontal" size={20} color="#4e6af3" />
        <Text style={styles.switchModeText}>Switch to Baby Born Mode</Text>
      </Pressable>
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
    marginBottom: 10
  },
  resetAllDisabled: {
    opacity: 0.4
  },
  resetAllText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600'
  },
  goalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8ebf7',
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 14,
    gap: 6
  },
  goalBtnText: {
    color: '#4e6af3',
    fontSize: 14,
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