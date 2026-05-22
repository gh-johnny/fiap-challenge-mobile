import * as Haptics from 'expo-haptics';
import * as LocalAuth from 'expo-local-authentication';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MeshGradient } from '@/components/mesh-gradient';
import { TripLoggerSection } from '@/components/trip-logger';
import { VinScanner } from '@/components/vin-scanner';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useLiveTelemetry } from '@/hooks/useLiveTelemetry';
import { useAuthStore } from '@/store/auth';

// ─── CarTopView ───────────────────────────────────────────────────────────────

function CarTopView() {
  return <Text style={styles.carTopEmoji}>🚗</Text>;
}

// ─── HealthRing ───────────────────────────────────────────────────────────────

function HealthRing({ value, color, label }: { value: number; color: string; label: string }) {
  const widthSv = useSharedValue(0);
  useEffect(() => {
    widthSv.value = withTiming(value, { duration: 700, easing: Easing.out(Easing.quad) });
  }, [value]);
  const barStyle = useAnimatedStyle(() => ({ width: `${widthSv.value}%` as any }));

  return (
    <View style={styles.ringContainer}>
      <Text style={[styles.ringValue, { color }]}>{value}%</Text>
      <View style={styles.ringTrack}>
        <Animated.View style={[styles.ringFill, { backgroundColor: color }, barStyle]} />
      </View>
      <Text style={styles.ringLabel}>{label}</Text>
    </View>
  );
}

// ─── RpmGauge ─────────────────────────────────────────────────────────────────

function RpmGauge({ rpm }: { rpm: number }) {
  const isRed = rpm >= 5500;
  const color = isRed ? Colors.danger : Colors.blue;
  const rpmDisplay = (Math.round(rpm / 100) * 100 / 1000).toFixed(1);

  return (
    <View style={styles.gaugeWrapper}>
      <Text style={[styles.gaugeValue, { color }]}>{rpmDisplay}</Text>
      <Text style={styles.gaugeUnit}>×1000 RPM</Text>
    </View>
  );
}

// ─── MetricBar ────────────────────────────────────────────────────────────────

function MetricBar({
  icon, label, value, unit, pct, color,
}: {
  icon: string; label: string; value: number; unit: string; pct: number; color: string;
}) {
  const widthSv = useSharedValue(0);
  useEffect(() => {
    widthSv.value = withTiming(pct, { duration: 800, easing: Easing.out(Easing.quad) });
  }, [pct]);
  const barStyle = useAnimatedStyle(() => ({ width: `${widthSv.value}%` as any }));

  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <View style={styles.metricHeader}>
          <Text style={styles.metricLabel}>{label}</Text>
          <Text style={[styles.metricValue, { color }]}>{value.toFixed(0)}{unit}</Text>
        </View>
        <View style={styles.metricTrack}>
          <Animated.View style={[styles.metricFill, { backgroundColor: color }, barStyle]} />
        </View>
      </View>
    </View>
  );
}

// ─── TirePressureGrid ─────────────────────────────────────────────────────────

function TireCell({ label, psi }: { label: string; psi: number }) {
  const ok = psi >= 30 && psi <= 35;
  const color = ok ? Colors.success : Colors.danger;
  return (
    <View style={[styles.tireCell, { borderColor: color + '44' }]}>
      <Text style={[styles.tirePsi, { color }]}>{psi.toFixed(0)}</Text>
      <Text style={styles.tirePsiUnit}>PSI</Text>
      <Text style={styles.tireLabel}>{label}</Text>
    </View>
  );
}

function TirePressureGrid({ tires }: { tires: { fl: number; fr: number; rl: number; rr: number } }) {
  return (
    <View style={styles.tireGrid}>
      <View style={styles.tireRow}>
        <TireCell label="FL" psi={tires.fl} />
        <View style={styles.tireCar}><CarTopView /></View>
        <TireCell label="FR" psi={tires.fr} />
      </View>
      <View style={styles.tireRowBottom}>
        <TireCell label="RL" psi={tires.rl} />
        <TireCell label="RR" psi={tires.rr} />
      </View>
    </View>
  );
}

// ─── InfoRow ──────────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

// ─── DocCard ──────────────────────────────────────────────────────────────────

function DocCard({
  icon, title, sub, locked, onPress,
}: {
  icon: string; title: string; sub: string; locked: boolean; onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.docCard, pressed && { opacity: 0.75, transform: [{ scale: 0.97 }] }]}
      onPress={onPress}
    >
      <Text style={styles.docIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.docTitle}>{title}</Text>
        <Text style={styles.docSub}>{sub}</Text>
      </View>
      <Text style={styles.docChevron}>{locked ? '🔒' : '›'}</Text>
    </Pressable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MyCarScreen() {
  const { vehicle } = useAuthStore();
  const telemetry = useLiveTelemetry();
  const [showVinScanner, setShowVinScanner] = useState(false);
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [authFailed, setAuthFailed] = useState(false);

  async function openDoc() {
    if (vaultUnlocked) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }
    const enrolled = await LocalAuth.isEnrolledAsync();
    if (!enrolled) {
      // No biometrics enrolled — allow access with a light tap
      setVaultUnlocked(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }
    const result = await LocalAuth.authenticateAsync({
      promptMessage: 'Authenticate to view documents',
      fallbackLabel: 'Use passcode',
    });
    if (result.success) {
      setVaultUnlocked(true);
      setAuthFailed(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setAuthFailed(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => setAuthFailed(false), 2000);
    }
  }

  const heroOpacity = useSharedValue(0);
  const heroY = useSharedValue(20);
  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(30);

  useEffect(() => {
    const fast = { duration: 500, easing: Easing.out(Easing.quad) };
    const slow = { duration: 600, easing: Easing.out(Easing.cubic) };
    heroOpacity.value = withTiming(1, fast);
    heroY.value = withTiming(0, fast);
    contentOpacity.value = withDelay(200, withTiming(1, slow));
    contentY.value = withDelay(200, withTiming(0, slow));
  }, []);

  const heroStyle = useAnimatedStyle(() => ({
    opacity: heroOpacity.value,
    transform: [{ translateY: heroY.value }],
  }));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));

  const model = vehicle?.model ?? 'My Ford';
  const year  = vehicle?.year  ?? '—';
  const plate = vehicle?.plate ?? '—';

  const tempPct = ((telemetry.tempC - 60) / 60) * 100;
  const tempColor = telemetry.tempC > 98 ? Colors.danger : telemetry.tempC > 90 ? '#FFB300' : Colors.success;

  return (
    <View style={styles.root}>
      <MeshGradient />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View style={heroStyle}>
            <Text style={styles.screenTitle}>My Car</Text>
            <View style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View>
                  <Text style={styles.vehicleName}>{model}</Text>
                  <Text style={styles.vehicleYear}>{year} · {plate}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Healthy</Text>
                </View>
              </View>
              <View style={styles.carSvgWrapper}><CarTopView /></View>
            </View>
          </Animated.View>

          <Animated.View style={contentStyle}>
            {/* Static health overview */}
            <Text style={styles.sectionTitle}>VEHICLE HEALTH</Text>
            <View style={styles.card}>
              <View style={styles.ringsRow}>
                <HealthRing value={87} color={Colors.success} label="Oil Life" />
                <HealthRing value={72} color="#FFB300"        label="Tire" />
                <HealthRing value={94} color={Colors.blue}    label="Battery" />
                <HealthRing value={65} color="#FF6B6B"        label="Brakes" />
              </View>
            </View>

            {/* Live telemetry */}
            <Text style={styles.sectionTitle}>LIVE TELEMETRY</Text>
            <View style={[styles.card, styles.gaugeCard]}>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
              <RpmGauge rpm={telemetry.rpm} />
              <MetricBar
                icon="🌡️" label="Engine Temp" unit="°C"
                value={telemetry.tempC} pct={tempPct} color={tempColor}
              />
              <View style={styles.divider} />
              <MetricBar
                icon="⛽" label="Fuel Level" unit="%"
                value={telemetry.fuelPct} pct={telemetry.fuelPct} color={Colors.blue}
              />
            </View>

            {/* Tire pressure */}
            <Text style={styles.sectionTitle}>TIRE PRESSURE</Text>
            <View style={styles.card}>
              <TirePressureGrid tires={telemetry.tires} />
            </View>

            {/* Static details */}
            <Text style={styles.sectionTitle}>DETAILS</Text>
            <View style={styles.card}>
              <InfoRow icon="🛣️" label="Odometer"     value="42,350 km" />
              <View style={styles.divider} />
              <InfoRow icon="⛽" label="Fuel"         value="Gasoline + Ethanol" />
              <View style={styles.divider} />
              <InfoRow icon="🔧" label="Next Service" value="Jun 15, 2026" />
              <View style={styles.divider} />
              <InfoRow icon="🎨" label="Color"        value="Oxford White" />
              <View style={styles.divider} />
              <View style={styles.vinRow}>
                <InfoRow icon="🔑" label="VIN" value="9BFZZZ···3B4" />
                <Pressable
                  style={({ pressed }) => [styles.scanVinBtn, pressed && { opacity: 0.7 }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowVinScanner(true); }}
                >
                  <Text style={styles.scanVinText}>Scan</Text>
                </Pressable>
              </View>
            </View>

            <TripLoggerSection />

            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>DOCUMENTS</Text>
              <View style={styles.vaultBadge}>
                <Text style={styles.vaultBadgeText}>{vaultUnlocked ? '🔓 Unlocked' : '🔒 Biometric'}</Text>
              </View>
            </View>
            {authFailed && (
              <Text style={styles.authFailedText}>Authentication failed — try again</Text>
            )}
            <View style={styles.docsStack}>
              <DocCard icon="📄" title="Vehicle Registration" sub="Valid until Dec 2026"    locked={!vaultUnlocked} onPress={openDoc} />
              <DocCard icon="🛡️" title="Insurance Policy"     sub="Porto Seguro · Expires Aug 2026" locked={!vaultUnlocked} onPress={openDoc} />
              <DocCard icon="🔩" title="Warranty Terms"       sub="Comprehensive · 3 years / 100k km" locked={!vaultUnlocked} onPress={openDoc} />
            </View>
          </Animated.View>

          <View style={{ height: 110 }} />
        </ScrollView>
      </SafeAreaView>

      <VinScanner visible={showVinScanner} onClose={() => setShowVinScanner(false)} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.lg },
  screenTitle: { ...Typography.heading, fontSize: 32, marginTop: Spacing.md, marginBottom: Spacing.md },

  heroCard: {
    backgroundColor: 'rgba(1,66,192,0.15)',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(1,66,192,0.35)',
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  vehicleName: { color: Colors.text, fontSize: 22, fontWeight: '800' },
  vehicleYear: { color: Colors.mutedLight, fontSize: 13, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,200,83,0.15)', borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(0,200,83,0.3)',
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  statusText: { color: Colors.success, fontSize: 12, fontWeight: '600' },
  carSvgWrapper: { alignItems: 'center', marginTop: Spacing.sm },

  sectionTitle: { ...Typography.label, fontSize: 11, letterSpacing: 2, marginBottom: Spacing.sm, marginTop: Spacing.xs },

  card: {
    backgroundColor: Platform.OS === 'android' ? 'rgba(238,242,255,0.35)' : 'transparent',
    borderRadius: Radius.lg, padding: Spacing.lg,
    borderWidth: 1, borderColor: 'rgba(238,242,255,0.95)', marginBottom: Spacing.md,
  },
  gaugeCard: { alignItems: 'center' },

  // Live indicator
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-end', marginBottom: -Spacing.sm },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.danger },
  liveText: { color: Colors.danger, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },

  // RPM gauge
  gaugeWrapper: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.md },
  gaugeValue: { fontSize: 48, fontWeight: '800', letterSpacing: -1 },
  gaugeUnit: { color: Colors.muted, fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginTop: 2 },
  carTopEmoji: { fontSize: 48, textAlign: 'center' },

  // Metric bar
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, width: '100%', marginVertical: 4 },
  metricIcon: { fontSize: 18, width: 26 },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  metricLabel: { color: Colors.mutedLight, fontSize: 12 },
  metricValue: { fontSize: 12, fontWeight: '700' },
  metricTrack: { height: 5, backgroundColor: 'rgba(1,66,192,0.10)', borderRadius: 3, overflow: 'hidden' },
  metricFill: { height: 5, borderRadius: 3 },

  // Tire grid
  tireGrid: { gap: Spacing.sm },
  tireRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tireRowBottom: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.sm },
  tireCar: { flex: 1, alignItems: 'center', transform: [{ scale: 0.55 }], height: 60 },
  tireCell: {
    width: 60, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(1,66,192,0.05)',
    borderRadius: Radius.md, borderWidth: 1, paddingVertical: 6,
  },
  tirePsi: { fontSize: 18, fontWeight: '800' },
  tirePsiUnit: { color: Colors.muted, fontSize: 9, fontWeight: '600', marginTop: -2 },
  tireLabel: { color: Colors.muted, fontSize: 10, fontWeight: '700', marginTop: 3 },

  // Health rings
  ringsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  ringContainer: { alignItems: 'center', gap: 4, flex: 1 },
  ringValue: { fontSize: 13, fontWeight: '700' },
  ringTrack: { width: '100%', height: 4, backgroundColor: 'rgba(1,66,192,0.10)', borderRadius: 2, overflow: 'hidden' },
  ringFill: { height: 4, borderRadius: 2 },
  ringLabel: { color: Colors.muted, fontSize: 10, fontWeight: '600' },

  // Info rows
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  infoIcon: { fontSize: 18, width: 28 },
  infoLabel: { color: Colors.mutedLight, fontSize: 14, flex: 1 },
  infoValue: { color: Colors.text, fontSize: 14, fontWeight: '600' },

  // Docs
  docsStack: { gap: Spacing.sm, marginBottom: Spacing.md },
  docCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Platform.OS === 'android' ? 'rgba(238,242,255,0.35)' : 'transparent',
    borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: 'rgba(238,242,255,0.95)',
  },
  docIcon: { fontSize: 24 },
  docTitle: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  docSub: { color: Colors.muted, fontSize: 12, marginTop: 2 },
  docChevron: { color: Colors.muted, fontSize: 22, fontWeight: '300' },

  // Vault / documents
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  vaultBadge: {
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
    borderRadius: Radius.pill, borderWidth: 1,
    borderColor: 'rgba(1,66,192,0.35)', backgroundColor: 'rgba(1,66,192,0.1)',
  },
  vaultBadgeText: { color: Colors.mutedLight, fontSize: 10, fontWeight: '700' },
  authFailedText: { color: Colors.danger, fontSize: 12, marginBottom: Spacing.sm, textAlign: 'center' },

  // VIN row
  vinRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scanVinBtn: {
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: Radius.pill, borderWidth: 1,
    borderColor: 'rgba(1,66,192,0.4)', backgroundColor: 'rgba(1,66,192,0.1)',
  },
  scanVinText: { color: Colors.mutedLight, fontSize: 11, fontWeight: '700' },
});
