import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedButton } from '@/components/animated-button';
import { MeshGradient } from '@/components/mesh-gradient';
import { MonthlyBarChart, ServiceTypeChart } from '@/components/service-history-chart';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { addServiceToCalendar } from '@/services/calendarService';
import { Appointment, ServiceType, useServiceStore } from '@/store/service';
import { openRouteToDealer } from '@/utils/maps';
import { groupByMonth, groupByType } from '@/utils/serviceHistory';

const SERVICE_TYPES: ServiceType[] = [
  'Oil Change',
  'Tire Rotation',
  'Brake Inspection',
  'General Check',
  'Battery Check',
  'AC Service',
];

const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

const DATES = (() => {
  const out: { label: string; value: string }[] = [];
  const d = new Date();
  for (let i = 1; i <= 14; i++) {
    const next = new Date(d);
    next.setDate(d.getDate() + i);
    const iso = next.toISOString().split('T')[0];
    const label = next.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
    out.push({ label, value: iso });
  }
  return out;
})();

const STATUS_COLOR: Record<Appointment['status'], string> = {
  upcoming: Colors.blue,
  completed: Colors.success,
  cancelled: Colors.danger,
};

async function scheduleReminder(type: ServiceType, date: string, time: string) {
  const { granted } = await Notifications.getPermissionsAsync();
  if (!granted) return;

  const [hour, minute] = time.split(':').map(Number);
  const apptDate = new Date(`${date}T${time}:00`);

  // 9am on the day before the appointment
  const reminderDate = new Date(apptDate);
  reminderDate.setDate(reminderDate.getDate() - 1);
  reminderDate.setHours(9, 0, 0, 0);

  if (reminderDate <= new Date()) return; // already past

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🔧 Ford Service Reminder',
      body: `Seu ${type} está agendado para amanhã às ${time} na Ford Morumbi.`,
      data: { type, date, time },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
    },
  });
}

function AppointmentCard({ appt }: { appt: Appointment }) {
  const opacity = useSharedValue(0);
  const y = useSharedValue(16);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
    y.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) });
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: y.value }] }));
  const color = STATUS_COLOR[appt.status];

  return (
    <Animated.View style={[styles.apptCard, style]}>
      <View style={[styles.apptAccent, { backgroundColor: color }]} />
      <View style={styles.apptBody}>
        <View style={styles.apptTop}>
          <Text style={styles.apptType}>{appt.type}</Text>
          <View style={[styles.apptBadge, { borderColor: color + '55', backgroundColor: color + '18' }]}>
            <Text style={[styles.apptBadgeText, { color }]}>{appt.status}</Text>
          </View>
        </View>
        <Text style={styles.apptMeta}>
          {appt.date} · {appt.time} · {appt.dealer}
        </Text>
        {appt.notes ? <Text style={styles.apptNotes}>{appt.notes}</Text> : null}
        {appt.status === 'upcoming' && (
          <Pressable
            style={({ pressed }) => [styles.routeBtn, pressed && { opacity: 0.7 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              openRouteToDealer(appt.dealer);
            }}
          >
            <Text style={styles.routeBtnText}>📍 Traçar Rota</Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

function BookingModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [step, setStep] = useState<'type' | 'date' | 'time' | 'done'>('type');
  const [selectedType, setSelectedType] = useState<ServiceType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [calendarAdded, setCalendarAdded] = useState(false);
  const addAppointment = useServiceStore((s) => s.addAppointment);

  const scaleY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 250 });
      scaleY.value = withSpring(1, { damping: 18, stiffness: 200 });
      setStep('type');
      setSelectedType(null);
      setSelectedDate(null);
      setSelectedTime(null);
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scaleY.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: scaleY.value }],
    opacity: opacity.value,
  }));

  async function confirm() {
    if (!selectedType || !selectedDate || !selectedTime) return;
    addAppointment({
      type: selectedType,
      date: selectedDate,
      time: selectedTime,
      dealer: 'Ford Morumbi',
      status: 'upcoming',
    });
    scheduleReminder(selectedType, selectedDate, selectedTime);
    const added = await addServiceToCalendar({
      type: selectedType,
      date: selectedDate,
      time: selectedTime,
      dealer: 'Ford Morumbi',
    });
    setCalendarAdded(added);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStep('done');
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable onPress={() => {}}>
          <Animated.View style={[styles.sheet, sheetStyle]}>
            <BlurView
              intensity={Platform.OS === 'android' ? 40 : 80}
              tint="light"
              style={styles.sheetBlur}
            >
              {step === 'done' ? (
                <View style={styles.doneContainer}>
                  <Text style={styles.doneEmoji}>✅</Text>
                  <Text style={styles.doneTitle}>Appointment Booked!</Text>
                  <Text style={styles.doneSub}>{selectedType} · {selectedDate} at {selectedTime}</Text>
                  <View style={styles.reminderBadge}>
                    <Text style={styles.reminderText}>🔔 Lembrete agendado para 1 dia antes</Text>
                  </View>
                  {calendarAdded && (
                    <View style={styles.calendarBadge}>
                      <Text style={styles.reminderText}>📅 Added to Calendar</Text>
                    </View>
                  )}
                  <AnimatedButton label="Close" onPress={onClose} style={styles.doneBtn} />
                </View>
              ) : (
                <>
                  <View style={styles.sheetHandle} />
                  <Text style={styles.sheetTitle}>
                    {step === 'type' && 'Select Service'}
                    {step === 'date' && 'Select Date'}
                    {step === 'time' && 'Select Time'}
                  </Text>

                  {step === 'type' && (
                    <View style={styles.optionGrid}>
                      {SERVICE_TYPES.map((t) => (
                        <Pressable
                          key={t}
                          style={[styles.optionChip, selectedType === t && styles.optionChipSelected]}
                          onPress={() => { setSelectedType(t); Haptics.selectionAsync(); }}
                        >
                          <Text style={[styles.optionText, selectedType === t && styles.optionTextSelected]}>
                            {t}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}

                  {step === 'date' && (
                    <ScrollView style={styles.dateScroll} showsVerticalScrollIndicator={false}>
                      {DATES.map((d) => (
                        <Pressable
                          key={d.value}
                          style={[styles.dateRow, selectedDate === d.value && styles.dateRowSelected]}
                          onPress={() => { setSelectedDate(d.value); Haptics.selectionAsync(); }}
                        >
                          <Text style={[styles.dateText, selectedDate === d.value && styles.dateTextSelected]}>
                            {d.label}
                          </Text>
                          {selectedDate === d.value && <Text style={styles.checkmark}>✓</Text>}
                        </Pressable>
                      ))}
                    </ScrollView>
                  )}

                  {step === 'time' && (
                    <View style={styles.optionGrid}>
                      {TIME_SLOTS.map((t) => (
                        <Pressable
                          key={t}
                          style={[styles.optionChip, selectedTime === t && styles.optionChipSelected]}
                          onPress={() => { setSelectedTime(t); Haptics.selectionAsync(); }}
                        >
                          <Text style={[styles.optionText, selectedTime === t && styles.optionTextSelected]}>
                            {t}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}

                  <View style={styles.sheetFooter}>
                    {step !== 'type' && (
                      <Pressable
                        style={styles.backBtn}
                        onPress={() => {
                          setStep(step === 'time' ? 'date' : 'type');
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                      >
                        <Text style={styles.backBtnText}>Back</Text>
                      </Pressable>
                    )}
                    <AnimatedButton
                      label={step === 'time' ? 'Confirm' : 'Next →'}
                      onPress={() => {
                        if (step === 'type' && selectedType) setStep('date');
                        else if (step === 'date' && selectedDate) setStep('time');
                        else if (step === 'time' && selectedTime) confirm();
                        else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                      }}
                      style={styles.nextBtn}
                    />
                  </View>
                </>
              )}
            </BlurView>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function ScheduleScreen() {
  const [showModal, setShowModal] = useState(false);
  const appointments = useServiceStore((s) => s.appointments);

  const upcoming = appointments.filter((a) => a.status === 'upcoming');
  const past = appointments.filter((a) => a.status !== 'upcoming');

  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(-16);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 500 });
    headerY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) });
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));

  return (
    <View style={styles.root}>
      <MeshGradient />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.header, headerStyle]}>
            <Text style={styles.screenTitle}>Schedule</Text>
            <Pressable
              style={({ pressed }) => [styles.bookFab, pressed && { transform: [{ scale: 0.94 }] }]}
              onPress={() => { setShowModal(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
            >
              <Text style={styles.bookFabText}>+ Book Service</Text>
            </Pressable>
          </Animated.View>

          {upcoming.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>UPCOMING</Text>
              {upcoming.map((a, i) => (
                <Animated.View
                  key={a.id}
                  style={{ opacity: 1 }}
                >
                  <AppointmentCard appt={a} />
                </Animated.View>
              ))}
            </>
          )}

          {upcoming.length === 0 && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>🗓️</Text>
              <Text style={styles.emptyText}>No upcoming appointments</Text>
              <Text style={styles.emptySub}>Book a service to get started.</Text>
            </View>
          )}

          {past.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: Spacing.md }]}>HISTORY</Text>
              {past.map((a) => (
                <AppointmentCard key={a.id} appt={a} />
              ))}
            </>
          )}

          {/* Service history charts */}
          {appointments.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: Spacing.md }]}>HISTORY — BY MONTH</Text>
              <View style={styles.chartCard}>
                <MonthlyBarChart data={groupByMonth(appointments)} />
              </View>

              <Text style={styles.sectionTitle}>HISTORY — BY SERVICE</Text>
              <View style={styles.chartCard}>
                <ServiceTypeChart data={groupByType(appointments)} />
              </View>
            </>
          )}

          <View style={{ height: 110 }} />
        </ScrollView>
      </SafeAreaView>

      <BookingModal visible={showModal} onClose={() => setShowModal(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  screenTitle: { ...Typography.heading, fontSize: 32 },
  bookFab: {
    backgroundColor: Colors.blue,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  bookFabText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  sectionTitle: {
    ...Typography.label,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  apptCard: {
    flexDirection: 'row',
    backgroundColor: Platform.OS === 'android' ? 'rgba(238,242,255,0.35)' : 'transparent',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(238,242,255,0.95)',
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  apptAccent: { width: 4 },
  apptBody: { flex: 1, padding: Spacing.md },
  apptTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  apptType: { color: Colors.text, fontWeight: '700', fontSize: 15 },
  apptBadge: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  apptBadgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  apptMeta: { color: Colors.muted, fontSize: 12, marginTop: 2 },
  apptNotes: { color: Colors.mutedLight, fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  routeBtn: {
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(1,66,192,0.4)',
    backgroundColor: 'rgba(1,66,192,0.1)',
  },
  routeBtnText: { color: Colors.mutedLight, fontSize: 12, fontWeight: '600' },
  emptyCard: {
    backgroundColor: Platform.OS === 'android' ? 'rgba(238,242,255,0.35)' : 'transparent',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(238,242,255,0.95)',
    marginBottom: Spacing.md,
  },
  emptyEmoji: { fontSize: 48 },
  emptyText: { ...Typography.subheading, fontSize: 16 },
  emptySub: { ...Typography.body, fontSize: 13, textAlign: 'center' },
  // Modal
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    overflow: 'hidden',
  },
  sheetBlur: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl + 16,
    backgroundColor: Platform.OS === 'android' ? 'rgba(238,242,255,0.97)' : 'transparent',
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  sheetTitle: { color: Colors.text, fontSize: 20, fontWeight: '700', marginBottom: Spacing.lg },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  optionChip: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'rgba(1,66,192,0.07)',
  },
  optionChipSelected: {
    borderColor: Colors.blue,
    backgroundColor: 'rgba(1,66,192,0.2)',
  },
  optionText: { color: Colors.mutedLight, fontSize: 13, fontWeight: '600' },
  optionTextSelected: { color: Colors.text },
  dateScroll: { maxHeight: 240, marginBottom: Spacing.lg },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  dateRowSelected: { borderColor: Colors.blue },
  dateText: { color: Colors.mutedLight, fontSize: 14 },
  dateTextSelected: { color: Colors.text, fontWeight: '700' },
  checkmark: { color: Colors.blue, fontWeight: '700', fontSize: 16 },
  sheetFooter: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  backBtn: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backBtnText: { color: Colors.mutedLight, fontWeight: '600', fontSize: 15 },
  nextBtn: { flex: 1 },
  doneContainer: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xl },
  doneEmoji: { fontSize: 56 },
  doneTitle: { color: Colors.text, fontSize: 22, fontWeight: '800' },
  doneSub: { color: Colors.mutedLight, fontSize: 14, textAlign: 'center' },
  reminderBadge: {
    backgroundColor: 'rgba(1,66,192,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(1,66,192,0.35)',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  reminderText: { color: Colors.mutedLight, fontSize: 13, fontWeight: '500' },
  doneBtn: { width: '100%', marginTop: Spacing.sm },
  calendarBadge: {
    backgroundColor: 'rgba(0,200,83,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0,200,83,0.35)',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  chartCard: {
    backgroundColor: Platform.OS === 'android' ? 'rgba(238,242,255,0.35)' : 'transparent',
    borderRadius: Radius.lg, padding: Spacing.lg,
    borderWidth: 1, borderColor: 'rgba(238,242,255,0.95)', marginBottom: Spacing.md,
  },
});
