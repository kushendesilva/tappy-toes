import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTodayKey } from '../../hooks/use-today-key';
import { EMPTY_ARRAY, useKickStore } from '../../store/kickStore';

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

const MILESTONE = 10;

export default function KickScreen() {
  const dayKey = useTodayKey();
  const recordKick = useKickStore(s => s.recordKick);
  const undoLastKick = useKickStore(s => s.undoLastKick);
  const resetToday = useKickStore(s => s.resetToday);
  const kicks = useKickStore(s => s.data[dayKey] ?? EMPTY_ARRAY);

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
    const next = kicks.length + 1;
    recordKick();
    if (next === MILESTONE) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const triggered = useRef(false);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (kicks.length === MILESTONE && !triggered.current) {
      triggered.current = true;
      setCelebrate(true);
      const t = setTimeout(() => setCelebrate(false), 3500);
      return () => clearTimeout(t);
    }
    if (kicks.length < MILESTONE) triggered.current = false;
  }, [kicks.length]);

  const handleUndo = () => {
    if (kicks.length === 0) return;
    undoLastKick();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
  };

  const handleLongPressUndo = () => {
    if (kicks.length === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Reset Today', 'Remove all kicks recorded today?', [
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
        <Text style={styles.count}>{kicks.length}</Text>
      </View>

      <Pressable onPressIn={pressIn} onPressOut={pressOut} onPress={tap} style={styles.pressable}>
        <Animated.View style={[styles.button, aStyle]}>
          <Image source={require('../../assets/icons/kick.png')} style={styles.icon} resizeMode="contain" />
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

      {celebrate && (
        <View pointerEvents="none" style={styles.celebrateOverlay}>
          <View style={styles.celebrateBox}>
            <Text style={styles.celebrateTitle}>Congrats!</Text>
            <Text style={styles.celebrateSub}>10 kicks recorded</Text>
          </View>
          <ConfettiCannon
            count={160}
            origin={{ x: Dimensions.get('window').width / 2, y: 0 }}
            fadeOut
            explosionSpeed={450}
            fallSpeed={2500}
          />
        </View>
      )}
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
  icon: { width: size * 0.45, height: size * 0.45, tintColor: '#ffffff' },
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
  undoText: { color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  celebrateOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center'
  },
  celebrateBox: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 28,
    paddingVertical: 24,
    borderRadius: 20,
    alignItems: 'center'
  },
  celebrateTitle: { color: '#fff', fontSize: 28, fontWeight: '700' },
  celebrateSub: { color: '#fff', fontSize: 16, marginTop: 6, fontWeight: '500' }
});