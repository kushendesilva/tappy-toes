import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useLayoutEffect, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { formatDate, MedicineLog, useMedicineStore } from '../../../../store/medicineStore';

function formatTimeFromIso(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function MedicineDayDetail() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const navigation = useNavigation();
  const getLogsForDate = useMedicineStore(s => s.getLogsForDate);
  const [selectedLog, setSelectedLog] = useState<MedicineLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const logs = date ? getLogsForDate(date) : [];

  useLayoutEffect(() => {
    navigation.setOptions({ title: date ? formatDate(date) : 'Day' });
  }, [navigation, date]);

  const takenCount = logs.filter(l => l.status === 'taken').length;
  const missedCount = logs.filter(l => l.status === 'missed').length;
  const snoozedCount = logs.filter(l => l.status === 'snoozed').length;

  const handleViewDetails = (log: MedicineLog) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'taken': return '#1B5E20';
      case 'missed': return '#B71C1C';
      case 'snoozed': return '#E65100';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'taken': return 'checkmark-circle';
      case 'missed': return 'close-circle';
      case 'snoozed': return 'alarm';
      default: return 'help-circle';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{date ? formatDate(date) : 'Day'}</Text>
      <View style={styles.summaryRow}>
        <Text style={[styles.sub, { color: '#1B5E20' }]}>✓ {takenCount} taken</Text>
        <Text style={[styles.sub, { color: '#B71C1C' }]}>✗ {missedCount} missed</Text>
        <Text style={[styles.sub, { color: '#E65100' }]}>⏰ {snoozedCount} snoozed</Text>
      </View>
      
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable 
            style={styles.row}
            onPress={() => handleViewDetails(item)}
          >
            <Ionicons 
              name={getStatusIcon(item.status)} 
              size={24} 
              color={getStatusColor(item.status)} 
            />
            <View style={styles.medicineInfo}>
              <Text style={styles.medicineName}>{item.medicineName}</Text>
              <Text style={styles.medicineTime}>
                Scheduled: {formatTimeFromIso(item.scheduledTime)}
                {item.actualTime && ` • Taken: ${formatTimeFromIso(item.actualTime)}`}
              </Text>
            </View>
            <View style={styles.statusContainer}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
              {item.snoozeHistory && item.snoozeHistory.length > 0 && (
                <Text style={styles.snoozeCount}>
                  {item.snoozeHistory.length} snooze{item.snoozeHistory.length > 1 ? 's' : ''}
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListEmptyComponent={<View style={styles.empty}><Text>No medicine records</Text></View>}
      />

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedLog?.medicineName}</Text>
                <Pressable onPress={() => setShowDetailModal(false)}>
                  <Ionicons name="close" size={24} color="#fff" />
                </Pressable>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Status</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedLog?.status || '') }]}>
                  <Text style={styles.statusBadgeText}>
                    {selectedLog?.status.charAt(0).toUpperCase()}{selectedLog?.status.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Scheduled Time</Text>
                <Text style={styles.detailValue}>
                  {selectedLog?.scheduledTime ? formatTimeFromIso(selectedLog.scheduledTime) : '-'}
                </Text>
              </View>

              {selectedLog?.actualTime && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Taken At</Text>
                  <Text style={styles.detailValue}>
                    {formatTimeFromIso(selectedLog.actualTime)}
                  </Text>
                </View>
              )}

              {selectedLog?.snoozeHistory && selectedLog.snoozeHistory.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Snooze History</Text>
                  {selectedLog.snoozeHistory.map((snooze, index) => (
                    <View key={index} style={styles.snoozeItem}>
                      <Ionicons name="alarm" size={16} color="#E65100" />
                      <Text style={styles.snoozeItemText}>
                        Snoozed at {formatTimeFromIso(snooze.snoozedAt)} for {snooze.durationMinutes} min
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <Pressable 
                style={styles.closeBtn}
                onPress={() => setShowDetailModal(false)}
              >
                <Text style={styles.closeBtnText}>Close</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 20, fontWeight: '600' },
  summaryRow: { 
    flexDirection: 'row', 
    gap: 16, 
    marginBottom: 16 
  },
  sub: { fontSize: 14 },
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    gap: 12,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: { 
    fontSize: 16, 
    fontWeight: '600' 
  },
  medicineTime: { 
    fontSize: 13, 
    color: '#666',
    marginTop: 2,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  snoozeCount: {
    fontSize: 12,
    color: '#E65100',
    marginTop: 2,
  },
  sep: { height: 8 },
  empty: { marginTop: 40, alignItems: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#222',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    color: '#9BA1A6',
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
  },
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  snoozeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  snoozeItemText: {
    color: '#fff',
    fontSize: 14,
  },
  closeBtn: {
    backgroundColor: '#4e6af3',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
