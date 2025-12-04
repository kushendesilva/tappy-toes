import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppModeStore } from '../store/appModeStore';

export default function SelectModeScreen() {
  const setMode = useAppModeStore(s => s.setMode);

  const handlePregnant = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMode('pregnant');
  };

  const handleBorn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMode('born');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Tappy Toes!</Text>
      <Text style={styles.subtitle}>Is your baby born yet?</Text>

      <View style={styles.buttonsContainer}>
        <Pressable
          style={styles.optionButton}
          onPress={handlePregnant}
        >
          <Ionicons name="heart" size={48} color="#4e6af3" />
          <Text style={styles.optionTitle}>Not Yet</Text>
          <Text style={styles.optionDescription}>Track baby kicks during pregnancy</Text>
        </Pressable>

        <Pressable
          style={styles.optionButton}
          onPress={handleBorn}
        >
          <Ionicons name="happy" size={48} color="#4e6af3" />
          <Text style={styles.optionTitle}>Yes!</Text>
          <Text style={styles.optionDescription}>Track poop and pee diapers</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#151718',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#9BA1A6',
    textAlign: 'center',
    marginBottom: 48,
  },
  buttonsContainer: {
    width: '100%',
    gap: 20,
  },
  optionButton: {
    backgroundColor: '#222',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 12,
  },
  optionDescription: {
    fontSize: 14,
    color: '#9BA1A6',
    marginTop: 8,
    textAlign: 'center',
  },
});
