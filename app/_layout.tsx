import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { registerBackgroundReminder } from '@/services/backgroundReminder';
import { useAuthStore } from '@/store/auth';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [locked, setLocked] = useState(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    Notifications.requestPermissionsAsync().then(() => {
      registerBackgroundReminder();
    });
  }, []);

  // Re-lock when app comes back from background (only if user is logged in)
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (next) => {
      const wasBackground = appState.current.match(/inactive|background/);
      appState.current = next;

      if (wasBackground && next === 'active' && isAuthenticated) {
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (!enrolled) return;
        setLocked(true);
      }
    });
    return () => sub.remove();
  }, [isAuthenticated]);

  async function handleUnlock() {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Confirme sua identidade',
      fallbackLabel: 'Usar senha',
    });
    if (result.success) setLocked(false);
  }

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: Colors.surface }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="dark" />

      {locked && (
        <View style={lock.overlay}>
          <View style={lock.card}>
            <Text style={lock.icon}>🔒</Text>
            <Text style={lock.title}>App bloqueado</Text>
            <Text style={lock.sub}>Confirme sua identidade para continuar</Text>
            <Pressable
              style={({ pressed }) => [lock.btn, pressed && { opacity: 0.8 }]}
              onPress={handleUnlock}
            >
              <Text style={lock.btnText}>Desbloquear</Text>
            </Pressable>
          </View>
        </View>
      )}
    </GestureHandlerRootView>
  );
}

const lock = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  card: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  icon: { fontSize: 64 },
  title: { color: Colors.text, fontSize: 24, fontWeight: '800' },
  sub: { color: Colors.mutedLight, fontSize: 14, textAlign: 'center' },
  btn: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.blue,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.pill,
  },
  btnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
});
