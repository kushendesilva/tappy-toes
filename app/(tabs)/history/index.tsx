import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { TodaySummary } from '../../../components/TodaySummary';
import { useAppModeStore } from '../../../store/appModeStore';
import { formatDate, useKickStore } from '../../../store/kickStore';
import { useSettingsStore } from '../../../store/settingsStore';

export default function HistoryRoot() {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
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

  const handleOpenPrivacyPolicy = async () => {
    await WebBrowser.openBrowserAsync('https://github.com/kushendesilva/tappy-toes/blob/main/PRIVACY_POLICY.md');
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
            router.replace('/(born)/diaper');
          }
        }
      ]
    );
  };

  const handleSetGoal = () => {
    setInputValue(String(kickGoal));
    setModalVisible(true);
  };

  const handleModalSave = () => {
    const num = parseInt(inputValue, 10);
    if (!isNaN(num) && num > 0) {
      setKickGoal(num);
    }
    setModalVisible(false);
    setInputValue('');
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setInputValue('');
  };

  return (
    <View style={styles.container}>
      {/* Input Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleModalCancel}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Set Kick Goal</Text>
              <Text style={styles.modalDescription}>Enter daily kick goal</Text>
              <TextInput
                style={styles.modalInput}
                value={inputValue}
                onChangeText={setInputValue}
                keyboardType="numeric"
                autoFocus
                selectTextOnFocus
              />
              <View style={styles.modalButtons}>
                <Pressable style={styles.modalCancelBtn} onPress={handleModalCancel}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.modalSaveBtn} onPress={handleModalSave}>
                  <Text style={styles.modalSaveText}>Save</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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

      <Pressable style={styles.privacyBtn} onPress={handleOpenPrivacyPolicy}>
        <Ionicons name="shield-checkmark" size={18} color="#4e6af3" />
        <Text style={styles.privacyBtnText}>Privacy Policy</Text>
      </Pressable>

      <View style={styles.aboutContainer}>
        <Text style={styles.aboutText}>Tappy Toes - Pregnancy & Baby Helper App</Text>
        <Text style={styles.aboutVersion}>Version 1.0.5</Text>
        <Text style={styles.aboutDeveloper}>Developed by Kushen De Silva</Text>
      </View>

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
  privacyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8ebf7',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 14,
    gap: 6
  },
  privacyBtnText: {
    color: '#4e6af3',
    fontSize: 14,
    fontWeight: '600'
  },
  aboutContainer: {
    backgroundColor: '#f4f6fa',
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  aboutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  aboutVersion: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  aboutDeveloper: {
    fontSize: 12,
    color: '#4e6af3',
    fontWeight: '500',
  },
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
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#f4f6fa',
    borderRadius: 10,
    padding: 14,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#f4f6fa',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSaveBtn: {
    flex: 1,
    backgroundColor: '#4e6af3',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});