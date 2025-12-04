import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Alert, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTodayKey } from '../../hooks/use-today-key';
import { EMPTY_ARRAY, usePeeStore } from '../../store/peeStore';

function formatDisplayDate(d: Date): string {
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

export default function PeeScreen() {
  const dayKey = useTodayKey();
  const recordPee = usePeeStore(s => s.recordPee);
  const undoLastPee = usePeeStore(s => s.undoLastPee);
  const resetToday = usePeeStore(s => s.resetToday);
  const pees = usePeeStore(s => s.data[dayKey] ?? EMPTY_ARRAY);

  const displayDate = formatDisplayDate(new Date());

  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const pressIn = () => {
    scale.value = withSpring(0.94);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  const pressOut = () => {
    scale.value = withSpring(1);
  };
  const tap = () => {
    recordPee();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleUndo = () => {
    if (pees.length === 0) return;
    undoLastPee();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
  };

  const handleLongPressUndo = () => {
    if (pees.length === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Reset Today', 'Remove all pees recorded today?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          resetToday();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.date}>{displayDate}</Text>
        <Text style={styles.count}>{pees.length}</Text>
      </View>

      <Pressable onPressIn={pressIn} onPressOut={pressOut} onPress={tap} style={styles.pressable}>
        <Animated.View style={[styles.button, aStyle]}>
          <Ionicons name="water" size={size * 0.45} color="#ffffff" />
        </Animated.View>
      </Pressable>

      <Pressable
        onPress={handleUndo}
        onLongPress={handleLongPressUndo}
        style={[styles.undoButton, pees.length === 0 && styles.undoDisabled]}
        disabled={pees.length === 0}
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
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center'
  },
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
  undoDisabled: { opacity: 0.4 },
  undoText: { color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' }
});
