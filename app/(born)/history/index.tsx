import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { DiaperTodaySummary } from '../../../components/DiaperTodaySummary';
import { FeedingTodaySummary } from '../../../components/FeedingTodaySummary';
import { MedicineTodaySummary } from '../../../components/MedicineTodaySummary';
import { useAppModeStore } from '../../../store/appModeStore';
import { formatDate, usePoopStore } from '../../../store/poopStore';
import { usePeeStore } from '../../../store/peeStore';
import { useFeedingStore, getTotalMl } from '../../../store/feedingStore';
import { useMedicineStore } from '../../../store/medicineStore';
import { useSettingsStore } from '../../../store/settingsStore';

type TabType = 'diaper' | 'feeding' | 'medicine' | 'settings';
type ModalType = 'goal' | 'mlIncrement' | null;

export default function BornHistoryRoot() {
  const [activeTab, setActiveTab] = useState<TabType>('diaper');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [inputValue, setInputValue] = useState('');
  const setMode = useAppModeStore(s => s.setMode);
  
  // Settings
  const poopGoal = useSettingsStore(s => s.poopGoal);
  const peeGoal = useSettingsStore(s => s.peeGoal);
  const feedingGoal = useSettingsStore(s => s.feedingGoal);
  const feedingMlIncrement = useSettingsStore(s => s.feedingMlIncrement);
  const feedingLogAmount = useSettingsStore(s => s.feedingLogAmount);
  const feedingSeparateSections = useSettingsStore(s => s.feedingSeparateSections);
  const peeEnabled = useSettingsStore(s => s.peeEnabled);
  const poopEnabled = useSettingsStore(s => s.poopEnabled);
  const breastFeedEnabled = useSettingsStore(s => s.breastFeedEnabled);
  const formulaFeedEnabled = useSettingsStore(s => s.formulaFeedEnabled);
  
  const setPoopGoal = useSettingsStore(s => s.setPoopGoal);
  const setPeeGoal = useSettingsStore(s => s.setPeeGoal);
  const setFeedingGoal = useSettingsStore(s => s.setFeedingGoal);
  const setFeedingMlIncrement = useSettingsStore(s => s.setFeedingMlIncrement);
  const setFeedingLogAmount = useSettingsStore(s => s.setFeedingLogAmount);
  const setFeedingSeparateSections = useSettingsStore(s => s.setFeedingSeparateSections);
  const setPeeEnabled = useSettingsStore(s => s.setPeeEnabled);
  const setPoopEnabled = useSettingsStore(s => s.setPoopEnabled);
  const setBreastFeedEnabled = useSettingsStore(s => s.setBreastFeedEnabled);
  const setFormulaFeedEnabled = useSettingsStore(s => s.setFormulaFeedEnabled);
  
  // Stores
  const poopDays = usePoopStore(s => s.getAllDays());
  const getPoopDay = usePoopStore(s => s.getDay);
  const resetAllPoop = usePoopStore(s => s.resetAll);
  
  const peeDays = usePeeStore(s => s.getAllDays());
  const getPeeDay = usePeeStore(s => s.getDay);
  const resetAllPee = usePeeStore(s => s.resetAll);
  
  const feedingDays = useFeedingStore(s => s.getAllDays());
  const getFeedingDay = useFeedingStore(s => s.getDay);
  const resetAllFeeding = useFeedingStore(s => s.resetAll);
  
  const medicineDays = useMedicineStore(s => s.getAllLogDays());
  const getMedicineLogsForDate = useMedicineStore(s => s.getLogsForDate);
  const resetAllMedicine = useMedicineStore(s => s.resetAll);

  // Combine pee and poop days for diaper tab
  const getDiaperDays = () => {
    const allDays = new Set([...peeDays, ...poopDays]);
    return Array.from(allDays).sort((a, b) => (a < b ? 1 : -1));
  };

  const getDays = () => {
    if (activeTab === 'diaper') return getDiaperDays();
    if (activeTab === 'feeding') return feedingDays;
    if (activeTab === 'medicine') return medicineDays;
    return [];
  };

  const resetAll = () => {
    if (activeTab === 'diaper') {
      resetAllPee();
      resetAllPoop();
      return;
    }
    if (activeTab === 'feeding') return resetAllFeeding();
    if (activeTab === 'medicine') return resetAllMedicine();
  };

  const currentGoal = activeTab === 'diaper' ? (peeGoal + poopGoal) : feedingGoal;
  const days = getDays();

  const confirmResetAll = () => {
    if (days.length === 0) return;
    const typeLabel = activeTab === 'diaper' ? 'diaper' : activeTab === 'feeding' ? 'feeding' : 'medicine';
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
          onPress: () => {
            setMode('pregnant');
            router.replace('/(tabs)/kick');
          }
        }
      ]
    );
  };

  const handleSetGoal = () => {
    setInputValue(String(currentGoal));
    setModalType('goal');
    setModalVisible(true);
  };

  const handleSetMlIncrement = () => {
    setInputValue(String(feedingMlIncrement));
    setModalType('mlIncrement');
    setModalVisible(true);
  };

  const handleModalSave = () => {
    const num = parseInt(inputValue, 10);
    if (!isNaN(num) && num > 0) {
      if (modalType === 'goal') {
        if (activeTab === 'diaper') {
          // For diaper, split evenly between pee and poop
          const half = Math.ceil(num / 2);
          setPeeGoal(half);
          setPoopGoal(half);
        } else if (activeTab === 'feeding') {
          setFeedingGoal(num);
        }
        // No goal for medicine tab
      } else if (modalType === 'mlIncrement') {
        setFeedingMlIncrement(num);
      }
    }
    setModalVisible(false);
    setModalType(null);
    setInputValue('');
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setModalType(null);
    setInputValue('');
  };

  const getModalTitle = () => {
    if (modalType === 'goal') {
      const typeLabel = activeTab === 'diaper' ? 'Diaper' : 'Feeding';
      return `Set ${typeLabel} Goal`;
    }
    return 'Set ML Increment';
  };

  const getModalDescription = () => {
    if (modalType === 'goal') {
      const typeLabel = activeTab === 'diaper' ? 'diaper' : 'feeding';
      return `Enter daily ${typeLabel} goal`;
    }
    return 'Enter ML increment value';
  };

  const renderSummary = () => {
    if (activeTab === 'diaper') return <DiaperTodaySummary />;
    if (activeTab === 'feeding') return <FeedingTodaySummary />;
    if (activeTab === 'medicine') return <MedicineTodaySummary />;
    return null;
  };

  const renderSettings = () => {
    return (
      <ScrollView style={styles.settingsContainer}>
        <Text style={styles.settingsHeader}>Tracking Settings</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Enable Pee Tracking</Text>
          <Switch value={peeEnabled} onValueChange={setPeeEnabled} />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Enable Poop Tracking</Text>
          <Switch value={poopEnabled} onValueChange={setPoopEnabled} />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Enable Breast Feed</Text>
          <Switch value={breastFeedEnabled} onValueChange={setBreastFeedEnabled} />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Enable Formula Feed</Text>
          <Switch value={formulaFeedEnabled} onValueChange={setFormulaFeedEnabled} />
        </View>
        
        <Text style={styles.settingsHeader}>Feeding Settings</Text>
        
        <Pressable style={styles.settingBtn} onPress={handleSetMlIncrement}>
          <Text style={styles.settingBtnText}>ML Increment: {feedingMlIncrement}ml</Text>
        </Pressable>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Log ML Amounts</Text>
          <Switch value={feedingLogAmount} onValueChange={setFeedingLogAmount} />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Separate Breast/Formula</Text>
          <Switch value={feedingSeparateSections} onValueChange={setFeedingSeparateSections} />
        </View>
        
        <Pressable style={styles.switchModeBtn} onPress={handleSwitchMode}>
          <Ionicons name="swap-horizontal" size={20} color="#4e6af3" />
          <Text style={styles.switchModeText}>Switch to Pregnancy Mode</Text>
        </Pressable>
      </ScrollView>
    );
  };

  const renderHistoryContent = () => {
    if (activeTab === 'settings') {
      return renderSettings();
    }

    // Get display info for diaper tab
    const getDiaperInfo = (date: string) => {
      const peeCount = getPeeDay(date).length;
      const poopCount = getPoopDay(date).length;
      return { peeCount, poopCount, total: peeCount + poopCount };
    };

    // Get display info for medicine tab
    const getMedicineInfo = (date: string) => {
      const logs = getMedicineLogsForDate(date);
      const taken = logs.filter(l => l.status === 'taken').length;
      const missed = logs.filter(l => l.status === 'missed').length;
      const snoozed = logs.filter(l => l.status === 'snoozed').length;
      return { taken, missed, snoozed, total: logs.length };
    };

    const typeLabel = activeTab === 'diaper' ? 'Diaper' : activeTab === 'feeding' ? 'Feeding' : 'Medicine';
    const showGoal = activeTab !== 'medicine'; // No goal for medicine

    return (
      <>
        {renderSummary()}

        <Pressable
          style={[styles.resetAllBtn, days.length === 0 && styles.resetAllDisabled]}
          disabled={days.length === 0}
          onPress={confirmResetAll}
        >
          <Text style={styles.resetAllText}>Reset All {typeLabel} Data</Text>
        </Pressable>

        {showGoal && (
          <Pressable style={styles.goalBtn} onPress={handleSetGoal}>
            <Ionicons name="flag" size={18} color="#4e6af3" />
            <Text style={styles.goalBtnText}>Daily Goal: {currentGoal}</Text>
          </Pressable>
        )}

        <FlatList
          data={days}
          keyExtractor={d => d}
          renderItem={({ item }) => {
            if (activeTab === 'diaper') {
              const info = getDiaperInfo(item);
              return (
                <Link
                  href={{ 
                    pathname: '/(born)/history/diaper/[date]', 
                    params: { date: item } 
                  }}
                  asChild
                >
                  <TouchableOpacity style={styles.row}>
                    <Text style={styles.rowDate}>{formatDate(item)}</Text>
                    <View style={styles.rowInfoContainer}>
                      <Text style={styles.rowInfoText}>💧{info.peeCount} 💩{info.poopCount}</Text>
                      <Text style={styles.rowCount}>{info.total}</Text>
                    </View>
                  </TouchableOpacity>
                </Link>
              );
            }
            
            if (activeTab === 'medicine') {
              const info = getMedicineInfo(item);
              return (
                <Link
                  href={{ 
                    pathname: '/(born)/history/medicine/[date]', 
                    params: { date: item } 
                  }}
                  asChild
                >
                  <TouchableOpacity style={styles.row}>
                    <Text style={styles.rowDate}>{formatDate(item)}</Text>
                    <View style={styles.rowInfoContainer}>
                      <Text style={styles.rowInfoText}>
                        {info.taken > 0 && <Text style={styles.takenText}>✓{info.taken} </Text>}
                        {info.missed > 0 && <Text style={styles.missedText}>✗{info.missed} </Text>}
                        {info.snoozed > 0 && <Text style={styles.snoozedText}>⏰{info.snoozed}</Text>}
                      </Text>
                      <Text style={styles.rowCount}>{info.total}</Text>
                    </View>
                  </TouchableOpacity>
                </Link>
              );
            }

            // Feeding
            const dayData = getFeedingDay(item);
            const count = dayData.length;
            const extraInfo = ` (${getTotalMl(dayData)}ml)`;
            return (
              <Link
                href={{ 
                  pathname: '/(born)/history/feeding/[date]', 
                  params: { date: item } 
                }}
                asChild
              >
                <TouchableOpacity style={styles.row}>
                  <Text style={styles.rowDate}>{formatDate(item)}</Text>
                  <Text style={styles.rowCount}>{count}{extraInfo}</Text>
                </TouchableOpacity>
              </Link>
            );
          }}
          ListEmptyComponent={<View style={styles.empty}><Text>No data yet</Text></View>}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          contentContainerStyle={days.length === 0 ? { flexGrow: 1 } : undefined}
        />

        <Pressable style={styles.switchModeBtn} onPress={handleSwitchMode}>
          <Ionicons name="swap-horizontal" size={20} color="#4e6af3" />
          <Text style={styles.switchModeText}>Switch to Pregnancy Mode</Text>
        </Pressable>
      </>
    );
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
              <Text style={styles.modalTitle}>{getModalTitle()}</Text>
              <Text style={styles.modalDescription}>{getModalDescription()}</Text>
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

      <View style={styles.tabContainer}>
        <Pressable 
          style={[styles.tab, activeTab === 'diaper' && styles.activeTab]}
          onPress={() => setActiveTab('diaper')}
        >
          <Text style={[styles.tabText, activeTab === 'diaper' && styles.activeTabText]}>Diaper</Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'feeding' && styles.activeTab]}
          onPress={() => setActiveTab('feeding')}
        >
          <Text style={[styles.tabText, activeTab === 'feeding' && styles.activeTabText]}>Feed</Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'medicine' && styles.activeTab]}
          onPress={() => setActiveTab('medicine')}
        >
          <Text style={[styles.tabText, activeTab === 'medicine' && styles.activeTabText]}>Meds</Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Ionicons name="settings" size={18} color={activeTab === 'settings' ? '#fff' : '#444'} />
        </Pressable>
      </View>

      {renderHistoryContent()}
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
    fontSize: 14,
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
  rowInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowInfoText: {
    fontSize: 14,
    color: '#666',
  },
  takenText: {
    color: '#1B5E20',
  },
  missedText: {
    color: '#B71C1C',
  },
  snoozedText: {
    color: '#E65100',
  },
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
  },
  settingsContainer: {
    flex: 1,
  },
  settingsHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingBtn: {
    backgroundColor: '#e8ebf7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
  },
  settingBtnText: {
    color: '#4e6af3',
    fontSize: 16,
    fontWeight: '600',
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
