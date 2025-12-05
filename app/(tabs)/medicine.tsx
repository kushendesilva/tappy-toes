import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MedicineReminder, MedicineStatus, useMedicineStore } from '../../store/medicineStore';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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

async function requestNotificationPermissions() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('medicine-reminders', {
      name: 'Medicine Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
}

async function scheduleMedicineNotification(medicine: MedicineReminder): Promise<string | undefined> {
  try {
    const [hours, minutes] = medicine.time.split(':').map(Number);
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Medicine Reminder 💊',
        body: `Time to take: ${medicine.name}`,
        data: { medicineId: medicine.id },
        categoryIdentifier: 'medicine',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      },
    });
    
    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return undefined;
  }
}

async function cancelMedicineNotification(notificationId: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

export default function MedicineScreen() {
  const medicines = useMedicineStore(s => s.medicines);
  const todayLogs = useMedicineStore(s => s.getTodayLogs());
  const addMedicine = useMedicineStore(s => s.addMedicine);
  const updateMedicine = useMedicineStore(s => s.updateMedicine);
  const removeMedicine = useMedicineStore(s => s.removeMedicine);
  const setMedicineNotificationId = useMedicineStore(s => s.setMedicineNotificationId);
  const markAsTaken = useMedicineStore(s => s.markAsTaken);
  const markAsMissed = useMedicineStore(s => s.markAsMissed);
  const markAsSnoozed = useMedicineStore(s => s.markAsSnoozed);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedicineName, setNewMedicineName] = useState('');
  const [newMedicineTime, setNewMedicineTime] = useState('09:00');

  const displayDate = formatDisplayDate(new Date());

  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  const handleAddMedicine = async () => {
    if (!newMedicineName.trim()) {
      Alert.alert('Error', 'Please enter a medicine name');
      return;
    }
    
    const medicine = addMedicine(newMedicineName.trim(), newMedicineTime);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Schedule notification
    const notificationId = await scheduleMedicineNotification(medicine);
    if (notificationId) {
      setMedicineNotificationId(medicine.id, notificationId);
    }
    
    setNewMedicineName('');
    setNewMedicineTime('09:00');
    setShowAddForm(false);
  };

  const handleRemoveMedicine = async (medicine: MedicineReminder) => {
    Alert.alert(
      'Remove Medicine',
      `Remove "${medicine.name}" from your list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            if (medicine.notificationId) {
              await cancelMedicineNotification(medicine.notificationId);
            }
            removeMedicine(medicine.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      ]
    );
  };

  const handleToggleMedicine = async (medicine: MedicineReminder) => {
    const newEnabled = !medicine.enabled;
    
    if (newEnabled && !medicine.notificationId) {
      const notificationId = await scheduleMedicineNotification(medicine);
      if (notificationId) {
        setMedicineNotificationId(medicine.id, notificationId);
      }
    } else if (!newEnabled && medicine.notificationId) {
      await cancelMedicineNotification(medicine.notificationId);
    }
    
    updateMedicine(medicine.id, { enabled: newEnabled });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleMarkTaken = (medicineId: string) => {
    markAsTaken(medicineId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleMarkMissed = (medicineId: string) => {
    markAsMissed(medicineId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
  };

  const handleSnooze = async (medicine: MedicineReminder) => {
    markAsSnoozed(medicine.id);
    
    // Schedule a snooze notification for 10 minutes later
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Medicine Reminder (Snoozed) 💊',
          body: `Reminder: ${medicine.name}`,
          data: { medicineId: medicine.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 600, // 10 minutes
        },
      });
    } catch (error) {
      console.error('Error scheduling snooze:', error);
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Snoozed', 'You will be reminded again in 10 minutes');
  };

  const getStatusForMedicine = (medicineId: string): MedicineStatus | null => {
    const log = todayLogs.find(l => l.medicineId === medicineId);
    return log?.status || null;
  };

  const renderMedicine = ({ item }: { item: MedicineReminder }) => {
    const status = getStatusForMedicine(item.id);
    
    return (
      <View style={styles.medicineCard}>
        <View style={styles.medicineHeader}>
          <View style={styles.medicineInfo}>
            <Text style={styles.medicineName}>{item.name}</Text>
            <Text style={styles.medicineTime}>{item.time}</Text>
          </View>
          <View style={styles.medicineActions}>
            <Pressable 
              onPress={() => handleToggleMedicine(item)}
              style={[styles.toggleBtn, item.enabled && styles.toggleBtnActive]}
            >
              <Ionicons 
                name={item.enabled ? 'notifications' : 'notifications-off'} 
                size={18} 
                color={item.enabled ? '#fff' : '#888'} 
              />
            </Pressable>
            <Pressable 
              onPress={() => handleRemoveMedicine(item)}
              style={styles.removeBtn}
            >
              <Ionicons name="trash-outline" size={18} color="#c62828" />
            </Pressable>
          </View>
        </View>
        
        {status && (
          <View style={[
            styles.statusBadge,
            status === 'taken' && styles.statusTaken,
            status === 'missed' && styles.statusMissed,
            status === 'snoozed' && styles.statusSnoozed,
          ]}>
            <Text style={styles.statusText}>
              {status === 'taken' ? '✓ Taken' : status === 'missed' ? '✗ Missed' : '⏰ Snoozed'}
            </Text>
          </View>
        )}
        
        {!status && (
          <View style={styles.actionButtons}>
            <Pressable 
              style={[styles.actionBtn, styles.takenBtn]}
              onPress={() => handleMarkTaken(item.id)}
            >
              <Text style={styles.actionBtnText}>Taken</Text>
            </Pressable>
            <Pressable 
              style={[styles.actionBtn, styles.snoozeBtn]}
              onPress={() => handleSnooze(item)}
            >
              <Text style={styles.actionBtnText}>Snooze</Text>
            </Pressable>
            <Pressable 
              style={[styles.actionBtn, styles.missedBtn]}
              onPress={() => handleMarkMissed(item.id)}
            >
              <Text style={styles.actionBtnText}>Missed</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.date}>{displayDate}</Text>
        <Text style={styles.title}>Medicine Tracker</Text>
      </View>

      <FlatList
        data={medicines}
        keyExtractor={item => item.id}
        renderItem={renderMedicine}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="medical" size={48} color="#aaa" />
            <Text style={styles.emptyText}>No medicines added yet</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add a medicine</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {showAddForm ? (
        <View style={styles.addForm}>
          <TextInput
            style={styles.input}
            placeholder="Medicine name"
            placeholderTextColor="#888"
            value={newMedicineName}
            onChangeText={setNewMedicineName}
          />
          <TextInput
            style={styles.input}
            placeholder="Time (HH:MM)"
            placeholderTextColor="#888"
            value={newMedicineTime}
            onChangeText={setNewMedicineTime}
          />
          <View style={styles.formButtons}>
            <Pressable 
              style={[styles.formBtn, styles.cancelBtn]}
              onPress={() => setShowAddForm(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable 
              style={[styles.formBtn, styles.saveBtn]}
              onPress={handleAddMedicine}
            >
              <Text style={styles.saveBtnText}>Save</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable 
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <Ionicons name="add" size={28} color="#fff" />
          <Text style={styles.addButtonText}>Add Medicine</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#151718' },
  header: { 
    paddingTop: 60, 
    paddingHorizontal: 24, 
    paddingBottom: 16,
    alignItems: 'center' 
  },
  date: { fontSize: 16, fontWeight: '500', color: '#9BA1A6' },
  title: { fontSize: 24, fontWeight: '700', color: '#ffffff', marginTop: 4 },
  listContent: { padding: 16, flexGrow: 1 },
  medicineCard: {
    backgroundColor: '#222',
    borderRadius: 16,
    padding: 16,
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  medicineInfo: { flex: 1 },
  medicineName: { fontSize: 18, fontWeight: '600', color: '#fff' },
  medicineTime: { fontSize: 14, color: '#9BA1A6', marginTop: 4 },
  medicineActions: { flexDirection: 'row', gap: 8 },
  toggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: { backgroundColor: '#4e6af3' },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusTaken: { backgroundColor: '#1B5E20' },
  statusMissed: { backgroundColor: '#B71C1C' },
  statusSnoozed: { backgroundColor: '#E65100' },
  statusText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  takenBtn: { backgroundColor: '#2E7D32' },
  snoozeBtn: { backgroundColor: '#F57C00' },
  missedBtn: { backgroundColor: '#C62828' },
  actionBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  separator: { height: 12 },
  emptyContainer: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: { 
    color: '#9BA1A6', 
    fontSize: 18, 
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: { 
    color: '#666', 
    fontSize: 14,
    marginTop: 8,
  },
  addForm: {
    backgroundColor: '#222',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  formBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtn: { backgroundColor: '#333' },
  cancelBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  saveBtn: { backgroundColor: '#4e6af3' },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#4e6af3',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
