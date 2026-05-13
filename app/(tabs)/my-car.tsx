import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { MeshGradient } from '@/components/mesh-gradient';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useAuthStore } from '@/store/auth';

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

function HealthRing({ value, color, label }: { value: number; color: string; label: string }) {
  const circumference = 2 * Math.PI * 22;
  const progress = circumference * (1 - value / 100);
  return (
    <View style={styles.ringContainer}>
      <Svg width={60} height={60} viewBox="0 0 60 60">
        <Circle cx={30} cy={30} r={22} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={5} />
        <Circle
          cx={30} cy={30} r={22}
          fill="none"
          stroke={color}
          strokeWidth={5}
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

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function DocCard({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.docCard, pressed && { opacity: 0.75, transform: [{ scale: 0.97 }] }]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <Text style={styles.docIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.docTitle}>{title}</Text>
        <Text style={styles.docSub}>{sub}</Text>
      </View>
      <Text style={styles.docChevron}>›</Text>
    </Pressable>
  );
}

export default function MyCarScreen() {
  const { vehicle } = useAuthStore();

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
  const year = vehicle?.year ?? '—';
  const plate = vehicle?.plate ?? '—';

  return (
    <View style={styles.root}>
      <MeshGradient />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
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
              <View style={styles.carSvgWrapper}>
                <CarTopView />
              </View>
            </View>
          </Animated.View>

          <Animated.View style={contentStyle}>
            <Text style={styles.sectionTitle}>VEHICLE HEALTH</Text>
            <View style={styles.card}>
              <View style={styles.ringsRow}>
                <HealthRing value={87} color={Colors.success} label="Oil Life" />
                <HealthRing value={72} color="#FFB300" label="Tire" />
                <HealthRing value={94} color={Colors.blue} label="Battery" />
                <HealthRing value={65} color="#FF6B6B" label="Brakes" />
              </View>
            </View>

            <Text style={styles.sectionTitle}>DETAILS</Text>
            <View style={styles.card}>
              <InfoRow icon="🛣️" label="Odometer" value="42,350 km" />
              <View style={styles.divider} />
              <InfoRow icon="⛽" label="Fuel" value="Gasoline + Ethanol" />
              <View style={styles.divider} />
              <InfoRow icon="🔧" label="Next Service" value="Jun 15, 2026" />
              <View style={styles.divider} />
              <InfoRow icon="🎨" label="Color" value="Oxford White" />
              <View style={styles.divider} />
              <InfoRow icon="🔑" label="VIN" value="9BFZZZ···3B4" />
            </View>

            <Text style={styles.sectionTitle}>DOCUMENTS</Text>
            <View style={styles.docsStack}>
              <DocCard icon="📄" title="Vehicle Registration" sub="Valid until Dec 2026" />
              <DocCard icon="🛡️" title="Insurance Policy" sub="Porto Seguro · Expires Aug 2026" />
              <DocCard icon="🔩" title="Warranty Terms" sub="Comprehensive · 3 years / 100k km" />
            </View>
          </Animated.View>

          <View style={{ height: 110 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

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
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  vehicleName: { color: Colors.white, fontSize: 22, fontWeight: '800' },
  vehicleYear: { color: Colors.mutedLight, fontSize: 13, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,200,83,0.15)',
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,200,83,0.3)',
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  statusText: { color: Colors.success, fontSize: 12, fontWeight: '600' },
  carSvgWrapper: { alignItems: 'center', marginTop: Spacing.sm },
  sectionTitle: {
    ...Typography.label,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  card: {
    backgroundColor: 'rgba(13,21,38,0.8)',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  ringsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  ringContainer: { alignItems: 'center', gap: 4 },
  ringValue: { fontSize: 13, fontWeight: '700', marginTop: -4 },
  ringLabel: { color: Colors.muted, fontSize: 10, fontWeight: '600' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  infoIcon: { fontSize: 18, width: 28 },
  infoLabel: { color: Colors.mutedLight, fontSize: 14, flex: 1 },
  infoValue: { color: Colors.white, fontSize: 14, fontWeight: '600' },
  docsStack: { gap: Spacing.sm, marginBottom: Spacing.md },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: 'rgba(13,21,38,0.8)',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  docIcon: { fontSize: 24 },
  docTitle: { color: Colors.white, fontSize: 14, fontWeight: '600' },
  docSub: { color: Colors.muted, fontSize: 12, marginTop: 2 },
  docChevron: { color: Colors.muted, fontSize: 22, fontWeight: '300' },
});
