import React, { useMemo } from 'react';
import { Alert, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { EMPTY_ARRAY, todayKey, useKickStore } from '../../store/kickStore';

function formatDisplayDate(): string {
  const d = new Date();
  const day = d.getDate();
  const suffix =
    day % 100 >= 11 && day % 100 <= 13
      ? 'th'
      : day % 10 === 1
      ? 'st'
      : day % 10 === 2
      ? 'nd'
      : day % 10 === 3
      ? 'rd'
      : 'th';
  const month = d.toLocaleString('en-US', { month: 'long' });
  return `${day}${suffix} ${month}`;
}

export default function KickScreen() {
  const recordKick = useKickStore(s => s.recordKick);
  const undoLastKick = useKickStore(s => s.undoLastKick);
  const resetToday = useKickStore(s => s.resetToday);

  const kicks = useKickStore(s => s.data[todayKey()] ?? EMPTY_ARRAY);
  const displayDate = useMemo(formatDisplayDate, []);

  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const pressIn = () => { scale.value = withSpring(0.94); };
  const pressOut = () => { scale.value = withSpring(1); };
  const tap = () => { recordKick(); };

  const handleUndo = () => {
    if (kicks.length === 0) return;
    undoLastKick();
  };

  const handleLongPressUndo = () => {
    if (kicks.length === 0) return;
    Alert.alert(
      'Reset Today',
      'Remove all kicks recorded today?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => resetToday() }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.date}>{displayDate}</Text>
        <Text style={styles.count}>{kicks.length}</Text>
      </View>

      <Pressable
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={tap}
        style={styles.pressable}
      >
        <Animated.View style={[styles.button, aStyle]}>
          <Text style={styles.buttonText}>Kick</Text>
        </Animated.View>
      </Pressable>

      <Pressable
        onPress={handleUndo}
        onLongPress={handleLongPressUndo}
        style={[styles.undoButton, kicks.length === 0 && styles.undoDisabled]}
        disabled={kicks.length === 0}
      >
        <Text style={styles.undoText}>
          Undo
        </Text>
      </Pressable>
    </View>
  );
}

const size = Math.min(Dimensions.get('window').width, 360) * 0.75;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { position: 'absolute', top: 60, left: 0, right: 0, alignItems: 'center' },
  date: { fontSize: 18, fontWeight: '500', marginBottom: 4, color: '#ffffff' },
  count: { fontSize: 54, fontWeight: '700', color: '#ffffff' },
  pressable: { alignItems: 'center', justifyContent: 'center' },
  button: {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: '#4e6af3',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: { color: '#fff', fontSize: 42, fontWeight: '700' },
  undoButton: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    backgroundColor: '#222',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center'
  },
  undoDisabled: {
    opacity: 0.4
  },
  undoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  }
});