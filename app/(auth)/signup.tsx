import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
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
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedButton } from '@/components/animated-button';
import { FordLogo } from '@/components/ford-logo';
import { GlassInput } from '@/components/glass-input';
import { MeshGradient } from '@/components/mesh-gradient';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useAuthStore } from '@/store/auth';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const signup = useAuthStore((s) => s.signup);
  const router = useRouter();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(40);

  useEffect(() => {
    const cfg = { duration: 600, easing: Easing.out(Easing.cubic) };
    opacity.value = withTiming(1, cfg);
    translateY.value = withTiming(0, cfg);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  function handleSignup() {
    if (!name || !email || !password) {
      setError('Fill all fields.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (password.length < 6) {
      setError('Password min 6 chars.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setError('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    signup({ name, email });
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
                <FordLogo width={240} height={100} />
              </View>

              <BlurView
                intensity={Platform.OS === 'android' ? 30 : 60}
                tint="light"
                style={styles.card}
              >
                <View style={styles.cardInner}>
                  <Text style={styles.title}>Join Ford</Text>
                  <Text style={styles.subtitle}>Create your owner account</Text>

                  <GlassInput
                    label="Full Name"
                    value={name}
                    onChangeText={setName}
                    placeholder="John Doe"
                    autoCapitalize="words"
                    style={styles.fieldGap}
                  />
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
                    placeholder="Min 6 characters"
                    secureTextEntry
                    style={styles.fieldGap}
                  />

                  {error ? <Text style={styles.error}>{error}</Text> : null}

                  <AnimatedButton label="Create Account" onPress={handleSignup} style={styles.btn} />

                  <Pressable onPress={() => router.back()} style={styles.link}>
                    <Text style={styles.linkText}>
                      Have an account? <Text style={styles.linkAccent}>Sign in</Text>
                    </Text>
                  </Pressable>
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
    borderColor: 'rgba(1,66,192,0.20)',
    backgroundColor: Platform.OS === 'android' ? 'rgba(238,242,255,0.95)' : 'transparent',
  },
  cardInner: { padding: Spacing.lg },
  title: { ...Typography.heading, fontSize: 26, marginBottom: 4 },
  subtitle: { ...Typography.body, marginBottom: Spacing.lg },
  fieldGap: { marginBottom: Spacing.md },
  error: { color: Colors.danger, fontSize: 13, marginBottom: Spacing.sm },
  btn: { marginTop: Spacing.sm, marginBottom: Spacing.md },
  link: { alignItems: 'center', paddingVertical: Spacing.xs },
  linkText: { color: Colors.muted, fontSize: 14 },
  linkAccent: { color: '#3385FF', fontWeight: '600' },
});
