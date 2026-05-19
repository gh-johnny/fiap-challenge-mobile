import * as Haptics from 'expo-haptics';
import * as LocalAuth from 'expo-local-authentication';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect, Text as SvgText } from 'react-native-svg';

import { MeshGradient } from '@/components/mesh-gradient';
import { TripLoggerSection } from '@/components/trip-logger';
import { VinScanner } from '@/components/vin-scanner';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useLiveTelemetry } from '@/hooks/useLiveTelemetry';
import { useAuthStore } from '@/store/auth';

// ─── Constants ────────────────────────────────────────────────────────────────

const RPM_MAX = 6500;
const RPM_RED = 5500;
const GAUGE_R = 82;
const GAUGE_CIRC = 2 * Math.PI * GAUGE_R;
const GAUGE_ARC = (260 / 360) * GAUGE_CIRC; // 260° sweep

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── CarTopView ───────────────────────────────────────────────────────────────

function CarTopView() {
  return (
    <Svg width={220} height={110} viewBox="0 0 220 110">
      <Rect x={30} y={38} width={160} height={50} rx={14} fill="#0142C0" opacity={0.9} />
      <Path d="M70 38 Q80 10 140 10 Q160 10 170 38 Z" fill="#0057FF" />
      <Path d="M72 38 Q82 16 138 16 Q155 16 168 38 Z" fill="rgba(160,200,255,0.18)" />
      <Rect x={76} y={16} width={28} height={22} rx={4} fill="rgba(160,200,255,0.12)" />
      <Rect x={110} y={16} width={28} height={22} rx={4} fill="rgba(160,200,255,0.12)" />
      <Circle cx={65} cy={88} r={18} fill="#0A0F1E" stroke="#1A2A4A" strokeWidth={3} />
      <Circle cx={65} cy={88} r={9} fill="#1A2A4A" />
      <Circle cx={155} cy={88} r={18} fill="#0A0F1E" stroke="#1A2A4A" strokeWidth={3} />
      <Circle cx={155} cy={88} r={9} fill="#1A2A4A" />
      <Rect x={27} y={52} width={8} height={6} rx={2} fill="#A0D4FF" opacity={0.9} />
      <Rect x={185} y={52} width={8} height={6} rx={2} fill="#FF4444" opacity={0.8} />
      <Rect x={28} y={60} width={9} height={16} rx={3} fill="#003478" />
    </Svg>
  );
}

// ─── HealthRing ───────────────────────────────────────────────────────────────

function HealthRing({ value, color, label }: { value: number; color: string; label: string }) {
  const circumference = 2 * Math.PI * 22;
  const progress = circumference * (1 - value / 100);
  return (
    <View style={styles.ringContainer}>
      <Svg width={60} height={60} viewBox="0 0 60 60">
        <Circle cx={30} cy={30} r={22} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={5} />
        <Circle
          cx={30} cy={30} r={22}
          fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={`${circumference}`}
          strokeDashoffset={progress}
          strokeLinecap="round"
          transform="rotate(-90 30 30)"
        />
      </Svg>
      <Text style={[styles.ringValue, { color }]}>{value}%</Text>
      <Text style={styles.ringLabel}>{label}</Text>
    </View>
  );
}

// ─── RpmGauge ─────────────────────────────────────────────────────────────────

function RpmGauge({ rpm }: { rpm: number }) {
  const rpmSv = useSharedValue(rpm);

  useEffect(() => {
    rpmSv.value = withSpring(rpm, { damping: 22, stiffness: 90, mass: 0.7 });
  }, [rpm]);

  const isRed = rpm >= RPM_RED;
  const arcColor = isRed ? Colors.danger : Colors.blue;

  const arcProps = useAnimatedProps(() => {
    'worklet';
    const len = Math.max(0, (rpmSv.value / RPM_MAX) * GAUGE_ARC);
    return { strokeDashoffset: GAUGE_ARC - len };
  });

  const rpmText = Math.round(rpm / 100) * 100;

  return (
    <View style={styles.gaugeWrapper}>
      <Svg width={200} height={200} viewBox="0 0 200 200">
        {/* Background arc */}
        <Circle
          cx={100} cy={100} r={GAUGE_R}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={12}
          strokeDasharray={`${GAUGE_ARC} ${GAUGE_CIRC - GAUGE_ARC}`}
          strokeLinecap="round"
          transform="rotate(-230 100 100)"
        />
        {/* Red zone overlay */}
        <Circle
          cx={100} cy={100} r={GAUGE_R}
          fill="none"
          stroke="rgba(229,57,53,0.18)"
          strokeWidth={12}
          strokeDasharray={`${(RPM_RED / RPM_MAX) * GAUGE_ARC * 0.18} ${GAUGE_CIRC}`}
          strokeLinecap="round"
          transform="rotate(-230 100 100)"
        />
        {/* Animated value arc */}
        <AnimatedCircle
          cx={100} cy={100} r={GAUGE_R}
          fill="none"
          stroke={arcColor}
          strokeWidth={12}
          strokeDasharray={`${GAUGE_ARC} ${GAUGE_CIRC - GAUGE_ARC}`}
          strokeLinecap="round"
          transform="rotate(-230 100 100)"
          animatedProps={arcProps}
        />
        {/* RPM label */}
        <SvgText x={100} y={110} textAnchor="middle" fill={Colors.white} fontSize={28} fontWeight="700">
          {(rpmText / 1000).toFixed(1)}
        </SvgText>
        <SvgText x={100} y={130} textAnchor="middle" fill={Colors.muted} fontSize={11}>
          ×1000 RPM
        </SvgText>
      </Svg>
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
  vehicleName: { color: Colors.white, fontSize: 22, fontWeight: '800' },
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
    backgroundColor: 'rgba(13,21,38,0.8)',
    borderRadius: Radius.lg, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md,
  },
  gaugeCard: { alignItems: 'center' },

  // Live indicator
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-end', marginBottom: -Spacing.sm },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.danger },
  liveText: { color: Colors.danger, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },

  // RPM gauge
  gaugeWrapper: { alignItems: 'center', justifyContent: 'center' },

  // Metric bar
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, width: '100%', marginVertical: 4 },
  metricIcon: { fontSize: 18, width: 26 },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  metricLabel: { color: Colors.mutedLight, fontSize: 12 },
  metricValue: { fontSize: 12, fontWeight: '700' },
  metricTrack: { height: 5, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  metricFill: { height: 5, borderRadius: 3 },

  // Tire grid
  tireGrid: { gap: Spacing.sm },
  tireRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tireRowBottom: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.sm },
  tireCar: { flex: 1, alignItems: 'center', transform: [{ scale: 0.55 }], height: 60 },
  tireCell: {
    width: 60, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: Radius.md, borderWidth: 1, paddingVertical: 6,
  },
  tirePsi: { fontSize: 18, fontWeight: '800' },
  tirePsiUnit: { color: Colors.muted, fontSize: 9, fontWeight: '600', marginTop: -2 },
  tireLabel: { color: Colors.muted, fontSize: 10, fontWeight: '700', marginTop: 3 },

  // Health rings
  ringsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  ringContainer: { alignItems: 'center', gap: 4 },
  ringValue: { fontSize: 13, fontWeight: '700', marginTop: -4 },
  ringLabel: { color: Colors.muted, fontSize: 10, fontWeight: '600' },

  // Info rows
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  infoIcon: { fontSize: 18, width: 28 },
  infoLabel: { color: Colors.mutedLight, fontSize: 14, flex: 1 },
  infoValue: { color: Colors.white, fontSize: 14, fontWeight: '600' },

  // Docs
  docsStack: { gap: Spacing.sm, marginBottom: Spacing.md },
  docCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: 'rgba(13,21,38,0.8)', borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  docIcon: { fontSize: 24 },
  docTitle: { color: Colors.white, fontSize: 14, fontWeight: '600' },
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
