import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FordLogo } from '@/components/ford-logo';
import { MeshGradient } from '@/components/mesh-gradient';
import { SosModal } from '@/components/sos-modal';
import { VehicleCard3D } from '@/components/vehicle-card-3d';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useBarometerAdvisor } from '@/hooks/useBarometerAdvisor';
import { useCrashDetector } from '@/hooks/useCrashDetector';
import { useGyroTilt } from '@/hooks/useGyroTilt';
import { useShakeDetector } from '@/hooks/useShakeDetector';
import { useAuthStore } from '@/store/auth';
import { useSosStore } from '@/store/sos';

function QuickAction({ icon, label, onPress }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress?: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.75 }]}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress?.(); }}
    >
      <View
        style={[styles.actionBlur]}
      >
        <Ionicons name={icon} size={26} color={Colors.mutedLight} />
        <Text style={styles.actionLabel}>{label}</Text>
      </View>
    </Pressable>
  );
}

function StatRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, accent && { color: Colors.blue }]}>{value}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { user, vehicle, logout } = useAuthStore();
  const router = useRouter();
  const firstName = user?.name?.split(' ')[0] ?? 'Driver';
  const { isAssistModeOn, toggleAssistMode, persistentNotifId, setPersistentNotifId } = useSosStore();
  const { tiltX, tiltY } = useGyroTilt();
  const { pressure, alert: baroAlert } = useBarometerAdvisor();
  const [sosVisible, setSosVisible] = useState(false);

  const handleShake = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setSosVisible(true);
  }, []);

  useShakeDetector(handleShake, isAssistModeOn);
  useCrashDetector(useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setSosVisible(true);
  }, []), isAssistModeOn);

  useEffect(() => {
    if (isAssistModeOn) {
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Ford Assist ativo',
          body: 'Sacuda o celular 3x para socorro de emergência',
          sticky: true,
        },
        trigger: null,
      }).then((id) => setPersistentNotifId(id));
    } else {
      if (persistentNotifId) {
        Notifications.dismissNotificationAsync(persistentNotifId);
        setPersistentNotifId(null);
      }
    }
  }, [isAssistModeOn]);

  const headerY = useSharedValue(-20);
  const headerOpacity = useSharedValue(0);
  const contentY = useSharedValue(30);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    const fast = { duration: 500, easing: Easing.out(Easing.quad) };
    const slow = { duration: 600, easing: Easing.out(Easing.cubic) };
    headerOpacity.value = withTiming(1, fast);
    headerY.value = withTiming(0, fast);
    contentOpacity.value = withDelay(200, withTiming(1, slow));
    contentY.value = withDelay(200, withTiming(0, slow));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));

  return (
    <View style={styles.root}>
      <MeshGradient gyroTiltX={tiltX} gyroTiltY={tiltY} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={[styles.header, headerStyle]}>
            <FordLogo width={120} height={70} />
            <Pressable
              style={({ pressed }) => [styles.avatar, pressed && { opacity: 0.7 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                logout();
                router.replace('/(auth)/login');
              }}
            >
              <Text style={styles.avatarText}>{firstName[0].toUpperCase()}</Text>
            </Pressable>
          </Animated.View>

          <Animated.View style={contentStyle}>
            {/* Greeting */}
            <View style={styles.greeting}>
              <Text style={styles.greetingSmall}>Good morning,</Text>
              <Text style={styles.greetingName}>{firstName} 👋</Text>
            </View>

            {/* Vehicle card */}
            {vehicle ? (
              <VehicleCard3D vehicle={vehicle} gyroTiltX={tiltX} gyroTiltY={tiltY} />
            ) : (
              <View style={styles.noVehicleCard}>
                <Text style={styles.noVehicleEmoji}>🚗</Text>
                <Text style={styles.noVehicleText}>No vehicle added yet</Text>
                <Text style={styles.noVehicleSub}>Go to My Car to add your Ford.</Text>
              </View>
            )}

            {/* Stats */}
            <Text style={styles.sectionTitle}>OVERVIEW</Text>
            <View style={styles.card}>
              <StatRow label="Next Service" value="Jun 15, 2026" />
              <View style={styles.divider} />
              <StatRow label="Last Visit" value="Mar 20, 2026" />
              <View style={styles.divider} />
              <StatRow label="Open Cases" value="0" accent />
            </View>

            {/* Quick actions */}
            <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
            <View style={styles.actionsRow}>
              <QuickAction icon="calendar-outline" label="Book Service" />
              <QuickAction icon="chatbubble-ellipses-outline" label="Get Support" />
              <QuickAction icon="document-text-outline" label="History" />
            </View>

            {/* Barometer advisory */}
            {baroAlert && (
              <View style={[
                styles.baroCard,
                baroAlert.type === 'storm'    && styles.baroCardStorm,
                baroAlert.type === 'altitude' && styles.baroCardAltitude,
              ]}>
                <Text style={styles.baroIcon}>
                  {baroAlert.type === 'rain' ? '🌧️' : baroAlert.type === 'storm' ? '⛈️' : '🏔️'}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.baroTitle}>
                    {baroAlert.type === 'rain' ? 'Rain Advisory'
                      : baroAlert.type === 'storm' ? 'Storm Warning'
                      : 'High Altitude'}
                  </Text>
                  <Text style={styles.baroMessage}>{baroAlert.message}</Text>
                  {pressure != null && (
                    <Text style={styles.baroPressure}>{pressure.toFixed(1)} hPa</Text>
                  )}
                </View>
              </View>
            )}

            {/* Ford Assist toggle */}
            <Text style={styles.sectionTitle}>ASSISTÊNCIA</Text>
            <Pressable
              style={({ pressed }) => [styles.assistCard, pressed && { opacity: 0.9 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                toggleAssistMode();
              }}
            >
              <View style={styles.assistLeft}>
                <View style={[styles.assistDot, isAssistModeOn && styles.assistDotActive]} />
                <View>
                  <Text style={styles.assistTitle}>Modo Assistido</Text>
                  <Text style={styles.assistSub}>
                    {isAssistModeOn ? 'Sacuda 3x para emergência' : 'Ative para suporte emergencial'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isAssistModeOn}
                onValueChange={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  toggleAssistMode();
                }}
                trackColor={{ false: Colors.border, true: 'rgba(229,57,53,0.5)' }}
                thumbColor={isAssistModeOn ? Colors.danger : Colors.muted}
              />
            </Pressable>
          </Animated.View>

          <View style={{ height: 110 }} />
        </ScrollView>
      </SafeAreaView>

      <SosModal visible={sosVisible} onClose={() => setSosVisible(false)} />
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
    paddingTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: Colors.blue,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  avatarText: {
    color: Colors.blue,
    fontWeight: '700',
    fontSize: 16
  },
  greeting: { marginBottom: Spacing.lg },
  greetingSmall: { ...Typography.body, fontSize: 14 },
  greetingName: { color: Colors.text, fontSize: 32, fontWeight: '800' },
  noVehicleCard: {
    borderColor: 'rgba(238,242,255,0.95)',
    backgroundColor: Platform.OS === 'android' ? 'rgba(238,242,255,0.35)' : 'transparent',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  noVehicleEmoji: { fontSize: 48 },
  noVehicleText: { ...Typography.subheading, fontSize: 16 },
  noVehicleSub: { ...Typography.body, fontSize: 13, textAlign: 'center' },
  sectionTitle: { ...Typography.label, fontSize: 11, letterSpacing: 2, marginBottom: Spacing.sm, marginTop: Spacing.xs },
  card: {
    borderColor: 'rgba(238,242,255,0.95)',
    backgroundColor: Platform.OS === 'android' ? 'rgba(238,242,255,0.35)' : 'transparent',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statLabel: { ...Typography.body, fontSize: 14 },
  statValue: { color: Colors.text, fontWeight: '600', fontSize: 14 },
  actionsRow: { flexDirection: 'row', gap: Spacing.sm },
  actionCard: {
    flex: 1,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(238,242,255,0.95)',
    backgroundColor: Platform.OS === 'android' ? 'rgba(238,242,255,0.35)' : 'transparent',
  },
  actionBlur: {
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionLabel: { color: Colors.mutedLight, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  assistCard: {
    borderColor: 'rgba(238,242,255,0.95)',
    backgroundColor: Platform.OS === 'android' ? 'rgba(238,242,255,0.35)' : 'transparent',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  assistLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  assistDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.muted,
  },
  assistDotActive: {
    backgroundColor: Colors.danger,
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  assistTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  assistSub: {
    ...Typography.caption,
    marginTop: 2,
  },

  // Barometer advisory card
  baroCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
    backgroundColor: 'rgba(1,66,192,0.12)',
    borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: 'rgba(1,66,192,0.35)',
    marginBottom: Spacing.md,
  },
  baroCardStorm: {
    backgroundColor: 'rgba(229,57,53,0.1)',
    borderColor: 'rgba(229,57,53,0.35)',
  },
  baroCardAltitude: {
    backgroundColor: 'rgba(255,179,0,0.1)',
    borderColor: 'rgba(255,179,0,0.35)',
  },
  baroIcon: { fontSize: 28, marginTop: 2 },
  baroTitle: { color: Colors.text, fontWeight: '700', fontSize: 14, marginBottom: 3 },
  baroMessage: { color: Colors.mutedLight, fontSize: 12, lineHeight: 18 },
  baroPressure: { color: Colors.muted, fontSize: 10, marginTop: 4, fontWeight: '600' },
});
