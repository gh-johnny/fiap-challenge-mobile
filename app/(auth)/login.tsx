import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
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
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedButton } from '@/components/animated-button';
import { FordLogo } from '@/components/ford-logo';
import { GlassInput } from '@/components/glass-input';
import { MeshGradient } from '@/components/mesh-gradient';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useAuthStore } from '@/store/auth';

type BiometricType = 'faceid' | 'fingerprint' | null;

function getBiometricLabel(type: BiometricType) {
  if (type === 'faceid') return 'Face ID';
  if (type === 'fingerprint') return 'Impressão Digital';
  return null;
}

function getBiometricIcon(type: BiometricType) {
  if (type === 'faceid') return '🪪';
  if (type === 'fingerprint') return '👆';
  return null;
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [biometricType, setBiometricType] = useState<BiometricType>(null);
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(40);
  const biometricScale = useSharedValue(0.8);
  const biometricOpacity = useSharedValue(0);

  useEffect(() => {
    const cfg = { duration: 700, easing: Easing.out(Easing.cubic) };
    opacity.value = withDelay(150, withTiming(1, cfg));
    translateY.value = withDelay(150, withTiming(0, cfg));
  }, []);

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!compatible || !enrolled) return;

      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const hasFace = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
      setBiometricType(hasFace ? 'faceid' : 'fingerprint');

      biometricScale.value = withDelay(600, withTiming(1, { duration: 400, easing: Easing.out(Easing.back(1.5)) }));
      biometricOpacity.value = withDelay(600, withTiming(1, { duration: 400 }));
    })();
  }, []);

  const biometricStyle = useAnimatedStyle(() => ({
    opacity: biometricOpacity.value,
    transform: [{ scale: biometricScale.value }],
  }));

  async function handleBiometric() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Entrar na sua conta Ford',
      fallbackLabel: 'Usar senha',
      disableDeviceFallback: false,
    });
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      login({ name: 'Ford Driver', email: 'driver@ford.com' });
      router.replace('/(onboarding)/slides');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  function handleLogin() {
    if (!email || !password) {
      setError('Fill all fields.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setError('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    login({ name: email.split('@')[0], email });
    router.replace('/(onboarding)/slides');
  }

  return (
    <View style={styles.root}>
      <MeshGradient />
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={[styles.inner, animStyle]}>
              <View style={styles.logoRow}>
                <FordLogo width={280} height={118} />
              </View>

              {/* Glass card */}
              <BlurView
                intensity={Platform.OS === 'android' ? 30 : 60}
                tint="dark"
                style={styles.card}
              >
                <View style={styles.cardInner}>
                  <Text style={styles.title}>Welcome Back</Text>
                  <Text style={styles.subtitle}>Sign in to your Ford account</Text>

                  <GlassInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.fieldGap}
                  />
                  <GlassInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    secureTextEntry
                    style={styles.fieldGap}
                  />

                  {error ? <Text style={styles.error}>{error}</Text> : null}

                  <AnimatedButton label="Sign In" onPress={handleLogin} style={styles.btn} />

                  <Pressable onPress={() => router.push('/(auth)/signup')} style={styles.link}>
                    <Text style={styles.linkText}>
                      No account? <Text style={styles.linkAccent}>Create one</Text>
                    </Text>
                  </Pressable>

                  {biometricType && (
                    <>
                      <View style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>ou</Text>
                        <View style={styles.dividerLine} />
                      </View>

                      <Animated.View style={biometricStyle}>
                        <Pressable
                          style={({ pressed }) => [styles.biometricBtn, pressed && styles.biometricBtnPressed]}
                          onPress={handleBiometric}
                        >
                          <Text style={styles.biometricIcon}>{getBiometricIcon(biometricType)}</Text>
                          <Text style={styles.biometricLabel}>
                            Entrar com {getBiometricLabel(biometricType)}
                          </Text>
                        </Pressable>
                      </Animated.View>
                    </>
                  )}
                </View>
              </BlurView>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xl },
  inner: { gap: Spacing.xl },
  logoRow: { alignItems: 'center' },
  card: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
    backgroundColor: Platform.OS === 'android' ? 'rgba(8,12,28,0.88)' : 'transparent',
  },
  cardInner: { padding: Spacing.lg, gap: 0 },
  title: { ...Typography.heading, fontSize: 26, marginBottom: 4 },
  subtitle: { ...Typography.body, marginBottom: Spacing.lg },
  fieldGap: { marginBottom: Spacing.md },
  error: { color: Colors.danger, fontSize: 13, marginBottom: Spacing.sm },
  btn: { marginTop: Spacing.sm, marginBottom: Spacing.md },
  link: { alignItems: 'center', paddingVertical: Spacing.xs },
  linkText: { color: Colors.muted, fontSize: 14 },
  linkAccent: { color: '#3385FF', fontWeight: '600' },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { color: Colors.muted, fontSize: 12, fontWeight: '500' },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  biometricBtnPressed: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    transform: [{ scale: 0.97 }],
  },
  biometricIcon: { fontSize: 20 },
  biometricLabel: { color: Colors.mutedLight, fontSize: 14, fontWeight: '600' },
});
