import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  MedicineLog,
  MedicineReminder,
  ReminderType,
  RepetitionType,
  useMedicineStore,
} from "../../store/medicineStore";

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
      ? "th"
      : day % 10 === 1
      ? "st"
      : day % 10 === 2
      ? "nd"
      : day % 10 === 3
      ? "rd"
      : "th";
  const month = d.toLocaleString("en-US", { month: "long" });
  return `${day}${suffix} ${month}`;
}

function formatTimeFromIso(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

async function requestNotificationPermissions() {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("medicine-reminders", {
        name: "Medicine Reminders",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
      await Notifications.setNotificationChannelAsync("medicine-alarms", {
        name: "Medicine Alarms",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 500, 500, 500, 500],
        lightColor: "#FF231F7C",
        sound: "default",
        enableVibrate: true,
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
      });
    }
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === "granted";
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return false;
  }
}

async function scheduleMedicineNotification(
  medicine: MedicineReminder,
  reminderType?: ReminderType,
  repetition?: RepetitionType,
  selectedDate?: Date
): Promise<string | undefined> {
  try {
    const timeParts = medicine.time.split(":");
    if (timeParts.length !== 2) return undefined;
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    if (isNaN(hours) || isNaN(minutes)) return undefined;
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59)
      return undefined;
    const effectiveReminderType =
      reminderType ?? medicine.reminderType ?? "notification";
    const effectiveRepetition = repetition ?? medicine.repetition ?? "daily";
    const isAlarm = effectiveReminderType === "alarm";
    const channelId = isAlarm ? "medicine-alarms" : "medicine-reminders";
    if (effectiveRepetition === "none") {
      const now = new Date();
      const targetTime = selectedDate ? new Date(selectedDate) : new Date();
      targetTime.setHours(hours, minutes, 0, 0);
      if (targetTime <= now) {
        if (!selectedDate) {
          targetTime.setDate(targetTime.getDate() + 1);
        } else {
          return undefined;
        }
      }
      const secondsUntilTrigger = Math.floor(
        (targetTime.getTime() - now.getTime()) / 1000
      );
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: isAlarm ? "⏰ Medicine Alarm" : "Medicine Reminder 💊",
          body: `Time to take: ${medicine.name}`,
          data: {
            medicineId: medicine.id,
            reminderType: effectiveReminderType,
          },
          categoryIdentifier: "medicine",
          sound: true,
          priority: isAlarm
            ? Notifications.AndroidNotificationPriority.MAX
            : Notifications.AndroidNotificationPriority.HIGH,
          ...(Platform.OS === "android" && { channelId }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsUntilTrigger,
        },
      });
      return notificationId;
    }
    const triggerConfig =
      effectiveRepetition === "weekly"
        ? {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY as const,
            weekday: ((new Date().getDay() % 7) + 1) as
              | 1
              | 2
              | 3
              | 4
              | 5
              | 6
              | 7,
            hour: hours,
            minute: minutes,
          }
        : {
            type: Notifications.SchedulableTriggerInputTypes.DAILY as const,
            hour: hours,
            minute: minutes,
          };
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: isAlarm ? "⏰ Medicine Alarm" : "Medicine Reminder 💊",
        body: `Time to take: ${medicine.name}`,
        data: { medicineId: medicine.id, reminderType: effectiveReminderType },
        categoryIdentifier: "medicine",
        sound: true,
        priority: isAlarm
          ? Notifications.AndroidNotificationPriority.MAX
          : Notifications.AndroidNotificationPriority.HIGH,
        ...(Platform.OS === "android" && { channelId }),
      },
      trigger: triggerConfig,
    });
    return notificationId;
  } catch (error) {
    console.error("Error scheduling notification:", error);
    return undefined;
  }
}

async function cancelMedicineNotification(notificationId: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error("Error canceling notification:", error);
  }
}

export default function MedicineScreen() {
  const medicines = useMedicineStore((s) => s.medicines);
  const logs = useMedicineStore((s) => s.logs);
  const hydrated = useMedicineStore((s) => s.hydrated);
  const addMedicine = useMedicineStore((s) => s.addMedicine);
  const updateMedicine = useMedicineStore((s) => s.updateMedicine);
  const removeMedicine = useMedicineStore((s) => s.removeMedicine);
  const setMedicineNotificationId = useMedicineStore(
    (s) => s.setMedicineNotificationId
  );
  const markAsTaken = useMedicineStore((s) => s.markAsTaken);
  const markAsMissed = useMedicineStore((s) => s.markAsMissed);
  const markAsSnoozed = useMedicineStore((s) => s.markAsSnoozed);
  const getTodayLogs = useMedicineStore((s) => s.getTodayLogs);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showSnoozeModal, setShowSnoozeModal] = useState(false);
  const [snoozeTargetMedicine, setSnoozeTargetMedicine] =
    useState<MedicineReminder | null>(null);
  const [newMedicineName, setNewMedicineName] = useState("");
  const [selectedTime, setSelectedTime] = useState(() => {
    const now = new Date();
    now.setHours(9, 0, 0, 0);
    return now;
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reminderType, setReminderType] =
    useState<ReminderType>("notification");
  const [repetition, setRepetition] = useState<RepetitionType>("daily");

  const displayDate = formatDisplayDate(new Date());
  const todayLogs = hydrated ? getTodayLogs() : [];
  const SNOOZE_OPTIONS = [5, 10, 15, 30, 60];

  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  const formatTimeString = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleTimeChange = (_event: unknown, date?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
    if (date) {
      setSelectedTime(date);
    }
  };

  const handleDateChange = (_event: unknown, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleAddMedicine = async () => {
    if (!newMedicineName.trim()) {
      Alert.alert("Error", "Please enter a medicine name");
      return;
    }
    if (repetition === "none") {
      const now = new Date();
      const targetTime = new Date(selectedDate);
      const timeParts = formatTimeString(selectedTime).split(":");
      targetTime.setHours(
        parseInt(timeParts[0], 10),
        parseInt(timeParts[1], 10),
        0,
        0
      );
      if (targetTime <= now) {
        Alert.alert(
          "Invalid Date/Time",
          "Please select a future date and time for the reminder."
        );
        return;
      }
    }
    const timeString = formatTimeString(selectedTime);
    const medicine = addMedicine(
      newMedicineName.trim(),
      timeString,
      reminderType,
      repetition
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const notificationId = await scheduleMedicineNotification(
      medicine,
      reminderType,
      repetition,
      selectedDate
    );
    if (notificationId) {
      setMedicineNotificationId(medicine.id, notificationId);
    } else if (repetition === "none") {
      Alert.alert(
        "Scheduling Failed",
        "Unable to schedule the reminder. Please check the date and time."
      );
      removeMedicine(medicine.id);
      return;
    }
    setNewMedicineName("");
    const defaultTime = new Date();
    defaultTime.setHours(9, 0, 0, 0);
    setSelectedTime(defaultTime);
    setSelectedDate(new Date());
    setReminderType("notification");
    setRepetition("daily");
    setShowAddModal(false);
  };

  const handleRemoveMedicine = async (medicine: MedicineReminder) => {
    Alert.alert(
      "Remove Medicine",
      `Remove "${medicine.name}" from your list?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            if (medicine.notificationId) {
              await cancelMedicineNotification(medicine.notificationId);
            }
            removeMedicine(medicine.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
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

  const handleShowSnoozeModal = (medicine: MedicineReminder) => {
    setSnoozeTargetMedicine(medicine);
    setShowSnoozeModal(true);
  };

  const handleSnooze = async (durationMinutes: number) => {
    if (!snoozeTargetMedicine) return;
    markAsSnoozed(snoozeTargetMedicine.id, durationMinutes);
    try {
      const isAlarm = snoozeTargetMedicine.reminderType === "alarm";
      const channelId = isAlarm ? "medicine-alarms" : "medicine-reminders";
      await Notifications.scheduleNotificationAsync({
        content: {
          title: isAlarm
            ? "⏰ Medicine Alarm (Snoozed)"
            : "Medicine Reminder (Snoozed) 💊",
          body: `Reminder: ${snoozeTargetMedicine.name}`,
          data: {
            medicineId: snoozeTargetMedicine.id,
            reminderType: snoozeTargetMedicine.reminderType,
          },
          sound: true,
          priority: isAlarm
            ? Notifications.AndroidNotificationPriority.MAX
            : Notifications.AndroidNotificationPriority.HIGH,
          ...(Platform.OS === "android" && { channelId }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: durationMinutes * 60,
        },
      });
    } catch (error) {
      console.error("Error scheduling snooze:", error);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowSnoozeModal(false);
    setSnoozeTargetMedicine(null);
    Alert.alert(
      "Snoozed",
      `You will be reminded again in ${durationMinutes} minute${
        durationMinutes > 1 ? "s" : ""
      }`
    );
  };

  const getLogForMedicine = (medicineId: string): MedicineLog | null => {
    const log = todayLogs.find((l) => l.medicineId === medicineId);
    return log || null;
  };

  const renderMedicine = ({ item }: { item: MedicineReminder }) => {
    const log = getLogForMedicine(item.id);
    const status = log?.status || null;
    const isAlarm = item.reminderType === "alarm";
    const repetitionLabel =
      item.repetition === "daily"
        ? "Daily"
        : item.repetition === "weekly"
        ? "Weekly"
        : "Once";
    return (
      <View style={styles.medicineCard}>
        <View style={styles.medicineHeader}>
          <View style={styles.medicineInfo}>
            <Text style={styles.medicineName}>{item.name}</Text>
            <View style={styles.medicineTimeRow}>
              <Text style={styles.medicineTime}>Scheduled: {item.time}</Text>
              <View style={styles.reminderTypeBadge}>
                <Ionicons
                  name={isAlarm ? "alarm" : "notifications"}
                  size={12}
                  color="#9BA1A6"
                />
                <Text style={styles.reminderTypeBadgeText}>
                  {isAlarm ? "Alarm" : "Notification"}
                </Text>
              </View>
              <View style={styles.reminderTypeBadge}>
                <Ionicons name="repeat" size={12} color="#9BA1A6" />
                <Text style={styles.reminderTypeBadgeText}>
                  {repetitionLabel}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.medicineActions}>
            <Pressable
              onPress={() => handleToggleMedicine(item)}
              style={[styles.toggleBtn, item.enabled && styles.toggleBtnActive]}
            >
              <Ionicons
                name={
                  item.enabled
                    ? isAlarm
                      ? "alarm"
                      : "notifications"
                    : "notifications-off"
                }
                size={18}
                color={item.enabled ? "#fff" : "#888"}
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
          <View
            style={[
              styles.statusBadge,
              status === "taken" && styles.statusTaken,
              status === "missed" && styles.statusMissed,
              status === "snoozed" && styles.statusSnoozed,
            ]}
          >
            <Text style={styles.statusText}>
              {status === "taken"
                ? `✓ Taken${
                    log?.actualTime
                      ? ` at ${formatTimeFromIso(log.actualTime)}`
                      : ""
                  }`
                : status === "missed"
                ? "✗ Missed"
                : `⏰ Snoozed${
                    log?.snoozeHistory?.length
                      ? ` (${log.snoozeHistory.length}x)`
                      : ""
                  }`}
            </Text>
          </View>
        )}

        {status !== "taken" && status !== "missed" && (
          <View style={styles.actionButtons}>
            <Pressable
              style={[styles.actionBtn, styles.takenBtn]}
              onPress={() => handleMarkTaken(item.id)}
            >
              <Text style={styles.actionBtnText}>Taken</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, styles.snoozeBtn]}
              onPress={() => handleShowSnoozeModal(item)}
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

  if (!hydrated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.date}>{displayDate}</Text>
          <Text style={styles.title}>Medicine Tracker</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.date}>{displayDate}</Text>
        <Text style={styles.title}>Medicine Tracker</Text>
      </View>

      <FlatList
        data={medicines}
        keyExtractor={(item) => item.id}
        renderItem={renderMedicine}
        extraData={logs}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="medical" size={48} color="#aaa" />
            <Text style={styles.emptyText}>No medicines added yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add a medicine
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>Add Medicine</Text>

                <Text style={styles.inputLabel}>Medicine Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter medicine name"
                  placeholderTextColor="#888"
                  value={newMedicineName}
                  onChangeText={setNewMedicineName}
                />

                <Text style={styles.inputLabel}>Reminder Time</Text>
                <Pressable
                  style={styles.timePickerButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Ionicons name="time" size={20} color="#4e6af3" />
                  <Text style={styles.timePickerText}>
                    {formatTimeString(selectedTime)}
                  </Text>
                </Pressable>

                {(showTimePicker || Platform.OS === "ios") && (
                  <View style={styles.timePickerContainer}>
                    <DateTimePicker
                      value={selectedTime}
                      mode="time"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={handleTimeChange}
                      themeVariant="dark"
                    />
                  </View>
                )}

                <Text style={styles.inputLabel}>Reminder Type</Text>
                <View style={styles.reminderTypeContainer}>
                  <Pressable
                    style={[
                      styles.reminderTypeBtn,
                      reminderType === "notification" &&
                        styles.reminderTypeBtnActive,
                    ]}
                    onPress={() => setReminderType("notification")}
                  >
                    <Ionicons
                      name="notifications"
                      size={20}
                      color={reminderType === "notification" ? "#fff" : "#888"}
                    />
                    <Text
                      style={[
                        styles.reminderTypeText,
                        reminderType === "notification" &&
                          styles.reminderTypeTextActive,
                      ]}
                    >
                      Notification
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.reminderTypeBtn,
                      reminderType === "alarm" && styles.reminderTypeBtnActive,
                    ]}
                    onPress={() => setReminderType("alarm")}
                  >
                    <Ionicons
                      name="alarm"
                      size={20}
                      color={reminderType === "alarm" ? "#fff" : "#888"}
                    />
                    <Text
                      style={[
                        styles.reminderTypeText,
                        reminderType === "alarm" &&
                          styles.reminderTypeTextActive,
                      ]}
                    >
                      Alarm
                    </Text>
                  </Pressable>
                </View>
                <Text style={styles.reminderTypeHint}>
                  {reminderType === "alarm"
                    ? "Alarm: More intrusive with longer vibration, bypasses Do Not Disturb, shows on lock screen"
                    : "Notification: Standard push notification reminder"}
                </Text>

                <Text style={styles.inputLabel}>Repetition</Text>
                <View style={styles.reminderTypeContainer}>
                  <Pressable
                    style={[
                      styles.reminderTypeBtn,
                      repetition === "daily" && styles.reminderTypeBtnActive,
                    ]}
                    onPress={() => setRepetition("daily")}
                  >
                    <Text
                      style={[
                        styles.reminderTypeText,
                        repetition === "daily" && styles.reminderTypeTextActive,
                      ]}
                    >
                      Daily
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.reminderTypeBtn,
                      repetition === "weekly" && styles.reminderTypeBtnActive,
                    ]}
                    onPress={() => setRepetition("weekly")}
                  >
                    <Text
                      style={[
                        styles.reminderTypeText,
                        repetition === "weekly" &&
                          styles.reminderTypeTextActive,
                      ]}
                    >
                      Weekly
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.reminderTypeBtn,
                      repetition === "none" && styles.reminderTypeBtnActive,
                    ]}
                    onPress={() => setRepetition("none")}
                  >
                    <Text
                      style={[
                        styles.reminderTypeText,
                        repetition === "none" && styles.reminderTypeTextActive,
                      ]}
                    >
                      Once
                    </Text>
                  </Pressable>
                </View>
                <Text style={styles.reminderTypeHint}>
                  {repetition === "daily"
                    ? "Repeats every day at the scheduled time"
                    : repetition === "weekly"
                    ? "Repeats once a week on the same day"
                    : "One-time reminder only"}
                </Text>

                {repetition === "none" && (
                  <>
                    <Text style={styles.inputLabel}>Reminder Date</Text>
                    <Pressable
                      style={styles.timePickerButton}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Ionicons name="calendar" size={20} color="#4e6af3" />
                      <Text style={styles.timePickerText}>
                        {selectedDate.toLocaleDateString([], {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Text>
                    </Pressable>

                    {(showDatePicker || Platform.OS === "ios") && (
                      <View style={styles.timePickerContainer}>
                        <DateTimePicker
                          value={selectedDate}
                          mode="date"
                          display={
                            Platform.OS === "ios" ? "spinner" : "default"
                          }
                          onChange={handleDateChange}
                          minimumDate={new Date()}
                          themeVariant="dark"
                        />
                      </View>
                    )}
                  </>
                )}

                <View style={styles.formButtons}>
                  <Pressable
                    style={[styles.formBtn, styles.cancelBtn]}
                    onPress={() => setShowAddModal(false)}
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
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showSnoozeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSnoozeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.snoozeModalContent}>
            <Text style={styles.modalTitle}>Snooze for how long?</Text>
            <View style={styles.snoozeOptionsContainer}>
              {SNOOZE_OPTIONS.map((minutes) => (
                <Pressable
                  key={minutes}
                  style={styles.snoozeOption}
                  onPress={() => handleSnooze(minutes)}
                >
                  <Text style={styles.snoozeOptionText}>
                    {minutes < 60 ? `${minutes} min` : `${minutes / 60} hr`}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              style={styles.snoozeCancelBtn}
              onPress={() => {
                setShowSnoozeModal(false);
                setSnoozeTargetMedicine(null);
              }}
            >
              <Text style={styles.snoozeCancelBtnText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Pressable style={styles.addButton} onPress={() => setShowAddModal(true)}>
        <Ionicons name="add" size={28} color="#fff" />
        <Text style={styles.addButtonText}>Add Medicine</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#151718" },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: "center",
  },
  date: { fontSize: 16, fontWeight: "500", color: "#9BA1A6" },
  title: { fontSize: 24, fontWeight: "700", color: "#ffffff", marginTop: 4 },
  listContent: { padding: 16, flexGrow: 1 },
  medicineCard: { backgroundColor: "#222", borderRadius: 16, padding: 16 },
  medicineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  medicineInfo: { flex: 1 },
  medicineName: { fontSize: 18, fontWeight: "600", color: "#fff" },
  medicineTime: { fontSize: 14, color: "#9BA1A6" },
  medicineTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  reminderTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  reminderTypeBadgeText: { fontSize: 10, color: "#9BA1A6" },
  medicineActions: { flexDirection: "row", gap: 8 },
  toggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  toggleBtnActive: { backgroundColor: "#4e6af3" },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  statusTaken: { backgroundColor: "#1B5E20" },
  statusMissed: { backgroundColor: "#B71C1C" },
  statusSnoozed: { backgroundColor: "#E65100" },
  statusText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  actionButtons: { flexDirection: "row", gap: 8, marginTop: 12 },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  takenBtn: { backgroundColor: "#2E7D32" },
  snoozeBtn: { backgroundColor: "#F57C00" },
  missedBtn: { backgroundColor: "#C62828" },
  actionBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  separator: { height: 12 },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyText: {
    color: "#9BA1A6",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: { color: "#666", fontSize: 14, marginTop: 8 },
  addForm: {
    backgroundColor: "#222",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  input: {
    backgroundColor: "#333",
    borderRadius: 12,
    padding: 14,
    color: "#fff",
    fontSize: 16,
    marginBottom: 12,
  },
  formButtons: { flexDirection: "row", gap: 12 },
  formBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelBtn: { backgroundColor: "#333" },
  cancelBtnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  saveBtn: { backgroundColor: "#4e6af3" },
  saveBtnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#4e6af3",
    margin: 16,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  modalContainer: { flex: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#222",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: "85%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9BA1A6",
    marginBottom: 8,
  },
  timePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 12,
  },
  timePickerText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  timePickerContainer: {
    backgroundColor: "#333",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  reminderTypeContainer: { flexDirection: "row", gap: 12, marginBottom: 8 },
  reminderTypeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#333",
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  reminderTypeBtnActive: { backgroundColor: "#4e6af3" },
  reminderTypeText: { color: "#888", fontSize: 14, fontWeight: "600" },
  reminderTypeTextActive: { color: "#fff" },
  reminderTypeHint: {
    color: "#666",
    fontSize: 12,
    marginBottom: 20,
    textAlign: "center",
  },
  snoozeModalContent: {
    backgroundColor: "#222",
    borderRadius: 20,
    padding: 24,
    width: "85%",
    maxWidth: 340,
  },
  snoozeOptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  snoozeOption: {
    backgroundColor: "#F57C00",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    minWidth: 80,
    alignItems: "center",
  },
  snoozeOptionText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  snoozeCancelBtn: {
    backgroundColor: "#333",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  snoozeCancelBtnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
