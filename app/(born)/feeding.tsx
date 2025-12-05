import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Alert, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTodayKey } from '../../hooks/use-today-key';
import { 
  EMPTY_ARRAY, 
  getBreastFeedCount, 
  getFormulaFeedCount, 
  getTotalMl, 
  useFeedingStore 
} from '../../store/feedingStore';
import { useSettingsStore } from '../../store/settingsStore';

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

export default function FeedingScreen() {
  const dayKey = useTodayKey();
  
  // Settings
  const feedingMlIncrement = useSettingsStore(s => s.feedingMlIncrement);
  const feedingLogAmount = useSettingsStore(s => s.feedingLogAmount);
  
  // Feeding store
  const recordFeeding = useFeedingStore(s => s.recordFeeding);
  const undoLastFeeding = useFeedingStore(s => s.undoLastFeeding);
  const resetToday = useFeedingStore(s => s.resetToday);
  const feedings = useFeedingStore(s => s.data[dayKey] ?? EMPTY_ARRAY);

  const [breastAmount, setBreastAmount] = useState(feedingMlIncrement);
  const [formulaAmount, setFormulaAmount] = useState(feedingMlIncrement);

  const displayDate = formatDisplayDate(new Date());

  const breastCount = getBreastFeedCount(feedings);
  const formulaCount = getFormulaFeedCount(feedings);
  const totalMl = getTotalMl(feedings);

  // Animation for breast half
  const breastScale = useSharedValue(1);
  const breastStyle = useAnimatedStyle(() => ({ transform: [{ scale: breastScale.value }] }));
  
  // Animation for formula half
  const formulaScale = useSharedValue(1);
  const formulaStyle = useAnimatedStyle(() => ({ transform: [{ scale: formulaScale.value }] }));

  const handleBreastPressIn = () => {
    breastScale.value = withSpring(0.94);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  const handleBreastPressOut = () => {
    breastScale.value = withSpring(1);
  };
  
  const handleBreastTap = () => {
    const amount = feedingLogAmount ? breastAmount : undefined;
    recordFeeding('breast', amount);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleFormulaPressIn = () => {
    formulaScale.value = withSpring(0.94);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  const handleFormulaPressOut = () => {
    formulaScale.value = withSpring(1);
  };
  
  const handleFormulaTap = () => {
    const amount = feedingLogAmount ? formulaAmount : undefined;
    recordFeeding('formula', amount);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleUndo = () => {
    if (feedings.length === 0) return;
    undoLastFeeding();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
  };

  const handleLongPressUndo = () => {
    if (feedings.length === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Reset Today', 'Remove all feedings recorded today?', [
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

  const incrementBreast = () => {
    setBreastAmount(prev => prev + feedingMlIncrement);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const decrementBreast = () => {
    setBreastAmount(prev => Math.max(feedingMlIncrement, prev - feedingMlIncrement));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const incrementFormula = () => {
    setFormulaAmount(prev => prev + feedingMlIncrement);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const decrementFormula = () => {
    setFormulaAmount(prev => Math.max(feedingMlIncrement, prev - feedingMlIncrement));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.date}>{displayDate}</Text>
        <View style={styles.countsContainer}>
          <View style={styles.countItem}>
            <Ionicons name="heart" size={18} color="#FF69B4" />
            <Text style={styles.count}>{breastCount}</Text>
          </View>
          <View style={styles.countItem}>
            <Ionicons name="flask" size={18} color="#87CEEB" />
            <Text style={styles.count}>{formulaCount}</Text>
          </View>
          {feedingLogAmount && (
            <View style={styles.countItem}>
              <Text style={styles.mlTotal}>{totalMl}ml</Text>
            </View>
          )}
        </View>
      </View>

      {/* Amount controls for breast feed */}
      {feedingLogAmount && (
        <View style={styles.amountControlsTop}>
          <View style={styles.amountRow}>
            <Pressable style={styles.amountBtn} onPress={decrementBreast}>
              <Ionicons name="remove" size={20} color="#fff" />
            </Pressable>
            <Text style={styles.amountText}>{breastAmount}ml</Text>
            <Pressable style={styles.amountBtn} onPress={incrementBreast}>
              <Ionicons name="add" size={20} color="#fff" />
            </Pressable>
          </View>
        </View>
      )}

      <View style={styles.splitButtonContainer}>
        {/* Breast Feed Half */}
        <Pressable 
          onPressIn={handleBreastPressIn} 
          onPressOut={handleBreastPressOut} 
          onPress={handleBreastTap} 
          style={styles.halfPressable}
        >
          <Animated.View style={[styles.breastHalf, breastStyle]}>
            <Ionicons name="heart" size={size * 0.18} color="#ffffff" />
            <Text style={styles.buttonLabel}>Breast</Text>
          </Animated.View>
        </Pressable>

        {/* Formula Feed Half */}
        <Pressable 
          onPressIn={handleFormulaPressIn} 
          onPressOut={handleFormulaPressOut} 
          onPress={handleFormulaTap} 
          style={styles.halfPressable}
        >
          <Animated.View style={[styles.formulaHalf, formulaStyle]}>
            <Ionicons name="flask" size={size * 0.18} color="#ffffff" />
            <Text style={styles.buttonLabel}>Formula</Text>
          </Animated.View>
        </Pressable>
      </View>

      {/* Amount controls for formula feed */}
      {feedingLogAmount && (
        <View style={styles.amountControlsBottom}>
          <View style={styles.amountRow}>
            <Pressable style={styles.amountBtn} onPress={decrementFormula}>
              <Ionicons name="remove" size={20} color="#fff" />
            </Pressable>
            <Text style={styles.amountText}>{formulaAmount}ml</Text>
            <Pressable style={styles.amountBtn} onPress={incrementFormula}>
              <Ionicons name="add" size={20} color="#fff" />
            </Pressable>
          </View>
        </View>
      )}

      <Pressable
        onPress={handleUndo}
        onLongPress={handleLongPressUndo}
        style={[styles.undoButton, feedings.length === 0 && styles.undoDisabled]}
        disabled={feedings.length === 0}
      >
        <Text style={styles.undoText}>Undo</Text>
      </Pressable>
    </View>
  );
}

const size = Math.min(Dimensions.get('window').width, 360) * 0.65;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { position: 'absolute', top: 60, left: 0, right: 0, alignItems: 'center' },
  date: { fontSize: 18, fontWeight: '500', marginBottom: 8, color: '#ffffff' },
  countsContainer: { 
    flexDirection: 'row', 
    gap: 20,
    alignItems: 'center'
  },
  countItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  count: { fontSize: 28, fontWeight: '700', color: '#ffffff' },
  mlTotal: { fontSize: 20, fontWeight: '600', color: '#aaa' },
  amountControlsTop: {
    position: 'absolute',
    top: 160,
    left: 24,
    right: 24,
    alignItems: 'flex-start',
  },
  amountControlsBottom: {
    marginTop: 16,
    alignItems: 'flex-end',
    paddingHorizontal: 20,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  amountBtn: {
    backgroundColor: '#333',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'center',
  },
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
  breastHalf: {
    flex: 1,
    backgroundColor: '#FF69B4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formulaHalf: {
    flex: 1,
    backgroundColor: '#4682B4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
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
