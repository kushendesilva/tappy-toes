import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Alert, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTodayKey } from '../../hooks/use-today-key';
import { EMPTY_ARRAY, usePeeStore } from '../../store/peeStore';
import { EMPTY_ARRAY as POOP_EMPTY_ARRAY, usePoopStore } from '../../store/poopStore';

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

export default function DiaperScreen() {
  const dayKey = useTodayKey();
  
  // Pee store
  const recordPee = usePeeStore(s => s.recordPee);
  const undoLastPee = usePeeStore(s => s.undoLastPee);
  const resetTodayPee = usePeeStore(s => s.resetToday);
  const pees = usePeeStore(s => s.data[dayKey] ?? EMPTY_ARRAY);
  
  // Poop store
  const recordPoop = usePoopStore(s => s.recordPoop);
  const undoLastPoop = usePoopStore(s => s.undoLastPoop);
  const resetTodayPoop = usePoopStore(s => s.resetToday);
  const poops = usePoopStore(s => s.data[dayKey] ?? POOP_EMPTY_ARRAY);

  const displayDate = formatDisplayDate(new Date());

  // Animation for pee half
  const peeScale = useSharedValue(1);
  const peeStyle = useAnimatedStyle(() => ({ transform: [{ scale: peeScale.value }] }));
  
  // Animation for poop half
  const poopScale = useSharedValue(1);
  const poopStyle = useAnimatedStyle(() => ({ transform: [{ scale: poopScale.value }] }));

  const handlePeePressIn = () => {
    peeScale.value = withSpring(0.94);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  const handlePeePressOut = () => {
    peeScale.value = withSpring(1);
  };
  
  const handlePeeTap = () => {
    recordPee();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePoopPressIn = () => {
    poopScale.value = withSpring(0.94);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  const handlePoopPressOut = () => {
    poopScale.value = withSpring(1);
  };
  
  const handlePoopTap = () => {
    recordPoop();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleUndoPee = () => {
    if (pees.length === 0) return;
    undoLastPee();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
  };

  const handleUndoPoop = () => {
    if (poops.length === 0) return;
    undoLastPoop();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
  };

  const handleLongPressUndoPee = () => {
    if (pees.length === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Reset Today', 'Remove all pees recorded today?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          resetTodayPee();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    ]);
  };

  const handleLongPressUndoPoop = () => {
    if (poops.length === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Reset Today', 'Remove all poops recorded today?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          resetTodayPoop();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.date}>{displayDate}</Text>
        <View style={styles.countsContainer}>
          <View style={styles.countItem}>
            <Ionicons name="water" size={20} color="#FFD700" />
            <Text style={styles.count}>{pees.length}</Text>
          </View>
          <View style={styles.countItem}>
            <Ionicons name="ellipse" size={20} color="#8B4513" />
            <Text style={styles.count}>{poops.length}</Text>
          </View>
        </View>
      </View>

      <View style={styles.splitButtonContainer}>
        {/* Pee Half */}
        <Pressable 
          onPressIn={handlePeePressIn} 
          onPressOut={handlePeePressOut} 
          onPress={handlePeeTap} 
          style={styles.halfPressable}
        >
          <Animated.View style={[styles.peeHalf, peeStyle]}>
            <Ionicons name="water" size={size * 0.22} color="#ffffff" />
            <Text style={styles.buttonLabel}>Pee</Text>
          </Animated.View>
        </Pressable>

        {/* Poop Half */}
        <Pressable 
          onPressIn={handlePoopPressIn} 
          onPressOut={handlePoopPressOut} 
          onPress={handlePoopTap} 
          style={styles.halfPressable}
        >
          <Animated.View style={[styles.poopHalf, poopStyle]}>
            <Ionicons name="ellipse" size={size * 0.22} color="#ffffff" />
            <Text style={styles.buttonLabel}>Poop</Text>
          </Animated.View>
        </Pressable>
      </View>

      <View style={styles.undoContainer}>
        <Pressable
          onPress={handleUndoPee}
          onLongPress={handleLongPressUndoPee}
          style={[styles.undoButton, pees.length === 0 && styles.undoDisabled]}
          disabled={pees.length === 0}
        >
          <Ionicons name="water" size={14} color="#FFD700" />
          <Text style={styles.undoText}>Undo Pee</Text>
        </Pressable>

        <Pressable
          onPress={handleUndoPoop}
          onLongPress={handleLongPressUndoPoop}
          style={[styles.undoButton, poops.length === 0 && styles.undoDisabled]}
          disabled={poops.length === 0}
        >
          <Ionicons name="ellipse" size={14} color="#8B4513" />
          <Text style={styles.undoText}>Undo Poop</Text>
        </Pressable>
      </View>
    </View>
  );
}

const size = Math.min(Dimensions.get('window').width, 360) * 0.75;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { position: 'absolute', top: 60, left: 0, right: 0, alignItems: 'center' },
  date: { fontSize: 18, fontWeight: '500', marginBottom: 8, color: '#ffffff' },
  countsContainer: { 
    flexDirection: 'row', 
    gap: 24,
    alignItems: 'center'
  },
  countItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6 
  },
  count: { fontSize: 36, fontWeight: '700', color: '#ffffff' },
  splitButtonContainer: {
    flexDirection: 'row',
    width: size,
    height: size,
    alignSelf: 'center',
    borderRadius: size / 2,
    overflow: 'hidden',
  },
  halfPressable: {
    flex: 1,
  },
  peeHalf: {
    flex: 1,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
  },
  poopHalf: {
    flex: 1,
    backgroundColor: '#8B4513',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  undoContainer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    flexDirection: 'row',
    gap: 12,
  },
  undoButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#222',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  undoDisabled: { opacity: 0.4 },
  undoText: { color: '#fff', fontSize: 14, fontWeight: '600' }
});
