import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { VoiceNote } from '@/components/voice-note';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import {
  buildTrip,
  CONSUMPTION_ESTIMATES,
  FuelType,
  Trip,
  useTripStore,
} from '@/store/trip';

// ─── Mini bar chart ───────────────────────────────────────────────────────────

const CHART_H = 80;
const BAR_W = 24;

function TripBar({ trip, maxKm, index }: { trip: Trip; maxKm: number; index: number }) {
  const scale = useSharedValue(0);
  const barH = maxKm > 0 ? (trip.distanceKm / maxKm) * CHART_H : 0;

  useEffect(() => {
    scale.value = withDelay(index * 50, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
  }, []);

  const style = useAnimatedStyle(() => ({
    height: barH * scale.value,
    width: BAR_W,
    backgroundColor: Colors.blue,
    borderRadius: 4,
    alignSelf: 'flex-end',
  }));

  return <Animated.View style={style} />;
}

function TripChart({ trips }: { trips: Trip[] }) {
  if (trips.length === 0) return null;
  const visible = trips.slice(0, 10).reverse();
  const maxKm = Math.max(...visible.map((t) => t.distanceKm), 1);

  return (
    <View style={chart.wrap}>
      {[0, 0.5, 1].map((f) => (
        <View key={f} style={{
          position: 'absolute', top: CHART_H * (1 - f), left: 0, right: 0,
          borderTopWidth: 1, borderTopColor: 'rgba(1,66,192,0.08)',
        }} />
      ))}
      <View style={chart.bars}>
        {visible.map((t, i) => <TripBar key={t.id} trip={t} maxKm={maxKm} index={i} />)}
      </View>
      <Text style={chart.label}>Last {visible.length} trips (km)</Text>
    </View>
  );
}

const chart = StyleSheet.create({
  wrap: { marginBottom: Spacing.md },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: CHART_H },
  label: { color: Colors.muted, fontSize: 9, marginTop: 4 },
});

// ─── Trip row ─────────────────────────────────────────────────────────────────

function TripRow({ trip, onDelete }: { trip: Trip; onDelete: () => void }) {
  const setVoiceNote = useTripStore((s) => s.setVoiceNote);
  return (
    <View style={styles.tripRowWrap}>
      <View style={styles.tripRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.tripDist}>{trip.distanceKm.toFixed(0)} km</Text>
          <Text style={styles.tripMeta}>
            {trip.date} · {trip.fuelType} · {trip.consumptionL100km} L/100km
          </Text>
        </View>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onDelete(); }}
          style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.deleteBtnText}>✕</Text>
        </Pressable>
      </View>
      <VoiceNote
        uri={trip.voiceNoteUri}
        onSave={(uri) => setVoiceNote(trip.id, uri)}
        onDelete={() => setVoiceNote(trip.id, undefined)}
      />
    </View>
  );
}

// ─── Add trip modal ───────────────────────────────────────────────────────────

function AddTripModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const addTrip = useTripStore((s) => s.addTrip);
  const [kmStart, setKmStart] = useState('');
  const [kmEnd, setKmEnd] = useState('');
  const [fuel, setFuel] = useState<FuelType>('Flex');
  const [error, setError] = useState('');

  function reset() {
    setKmStart(''); setKmEnd(''); setFuel('Flex'); setError('');
  }

  function confirm() {
    const start = parseFloat(kmStart);
    const end = parseFloat(kmEnd);
    if (isNaN(start) || isNaN(end) || end <= start) {
      setError('Km final deve ser maior que km inicial.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    addTrip(buildTrip(start, end, fuel));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    reset();
    onClose();
  }

  function handleClose() { reset(); onClose(); }

  const FUELS: FuelType[] = ['Gasoline', 'Ethanol', 'Flex'];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.modalBg}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Log a Trip</Text>

          <Text style={styles.fieldLabel}>Start odometer (km)</Text>
          <TextInput
            style={styles.input}
            value={kmStart}
            onChangeText={setKmStart}
            keyboardType="numeric"
            placeholder="e.g. 42350"
            placeholderTextColor={Colors.muted}
          />

          <Text style={styles.fieldLabel}>End odometer (km)</Text>
          <TextInput
            style={styles.input}
            value={kmEnd}
            onChangeText={setKmEnd}
            keyboardType="numeric"
            placeholder="e.g. 42480"
            placeholderTextColor={Colors.muted}
          />

          <Text style={styles.fieldLabel}>Fuel type</Text>
          <View style={styles.fuelRow}>
            {FUELS.map((f) => (
              <Pressable
                key={f}
                style={[styles.fuelChip, fuel === f && styles.fuelChipActive]}
                onPress={() => { setFuel(f); Haptics.selectionAsync(); }}
              >
                <Text style={[styles.fuelChipText, fuel === f && styles.fuelChipTextActive]}>{f}</Text>
              </Pressable>
            ))}
          </View>

          {fuel && (
            <Text style={styles.consumptionHint}>
              Est. consumption: {CONSUMPTION_ESTIMATES[fuel]} L/100km
            </Text>
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            style={({ pressed }) => [styles.confirmBtn, pressed && { opacity: 0.85 }]}
            onPress={confirm}
          >
            <Text style={styles.confirmBtnText}>Save Trip</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Public section component ─────────────────────────────────────────────────

export function TripLoggerSection() {
  const { trips, deleteTrip } = useTripStore();
  const [showAdd, setShowAdd] = useState(false);

  const totalKm = trips.reduce((s, t) => s + t.distanceKm, 0);
  const avgConsumption = trips.length > 0
    ? trips.reduce((s, t) => s + t.consumptionL100km, 0) / trips.length
    : 0;

  return (
    <>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>TRIP LOG</Text>
          {trips.length > 0 && (
            <Text style={styles.tripSummary}>
              {trips.length} trips · {totalKm.toFixed(0)} km total · {avgConsumption.toFixed(1)} L/100km avg
            </Text>
          )}
        </View>
        <Pressable
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.7 }]}
          onPress={() => { setShowAdd(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
        >
          <Text style={styles.addBtnText}>+ Log Trip</Text>
        </Pressable>
      </View>

      {trips.length > 0 ? (
        <View style={styles.card}>
          <TripChart trips={trips} />
          {trips.slice(0, 5).map((t) => (
            <View key={t.id}>
              <TripRow trip={t} onDelete={() => deleteTrip(t.id)} />
              {t !== trips[Math.min(4, trips.length - 1)] && <View style={styles.tripDivider} />}
            </View>
          ))}
          {trips.length > 5 && (
            <Text style={styles.moreText}>+{trips.length - 5} more trips</Text>
          )}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>🛣️</Text>
          <Text style={styles.emptyText}>No trips logged yet</Text>
          <Text style={styles.emptySub}>Tap "+ Log Trip" to record your first trip.</Text>
        </View>
      )}

      <AddTripModal visible={showAdd} onClose={() => setShowAdd(false)} />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', marginBottom: Spacing.sm, marginTop: Spacing.xs,
  },
  sectionTitle: { ...Typography.label, fontSize: 11, letterSpacing: 2 },
  tripSummary: { color: Colors.muted, fontSize: 10, marginTop: 2 },
  addBtn: {
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: Radius.pill, borderWidth: 1,
    borderColor: 'rgba(1,66,192,0.4)', backgroundColor: 'rgba(1,66,192,0.1)',
  },
  addBtnText: { color: Colors.mutedLight, fontSize: 11, fontWeight: '700' },

  card: {
    backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: Radius.lg,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md,
  },
  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: Radius.xl,
    padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md,
  },
  emptyEmoji: { fontSize: 40 },
  emptyText: { ...Typography.subheading, fontSize: 15 },
  emptySub: { ...Typography.body, fontSize: 12, textAlign: 'center' },

  tripRowWrap: { paddingVertical: Spacing.sm },
  tripRow: { flexDirection: 'row', alignItems: 'center' },
  tripDist: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  tripMeta: { color: Colors.muted, fontSize: 11, marginTop: 2 },
  tripDivider: { height: 1, backgroundColor: Colors.border },
  deleteBtn: { padding: 6 },
  deleteBtnText: { color: Colors.muted, fontSize: 14 },
  moreText: { color: Colors.muted, fontSize: 11, textAlign: 'center', marginTop: Spacing.sm },

  // Modal
  modalBg: { flex: 1, justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.card, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    padding: Spacing.lg, paddingBottom: 48,
    borderTopWidth: 1, borderColor: Colors.border,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border,
    alignSelf: 'center', marginBottom: Spacing.lg,
  },
  modalTitle: { color: Colors.text, fontSize: 20, fontWeight: '700', marginBottom: Spacing.lg },
  fieldLabel: { color: Colors.mutedLight, fontSize: 12, marginBottom: 6 },
  input: {
    backgroundColor: 'rgba(1,66,192,0.07)', borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, color: Colors.text,
    fontSize: 15, paddingHorizontal: Spacing.md, paddingVertical: 12,
    marginBottom: Spacing.md,
  },
  fuelRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  fuelChip: {
    flex: 1, paddingVertical: 10, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    backgroundColor: 'rgba(1,66,192,0.05)', alignItems: 'center',
  },
  fuelChipActive: { borderColor: Colors.blue, backgroundColor: 'rgba(1,66,192,0.2)' },
  fuelChipText: { color: Colors.mutedLight, fontWeight: '600', fontSize: 13 },
  fuelChipTextActive: { color: Colors.text },
  consumptionHint: { color: Colors.muted, fontSize: 11, marginBottom: Spacing.md },
  errorText: { color: Colors.danger, fontSize: 12, marginBottom: Spacing.sm },
  confirmBtn: {
    backgroundColor: Colors.blue, borderRadius: Radius.md,
    paddingVertical: 14, alignItems: 'center', marginTop: Spacing.sm,
  },
  confirmBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
});
