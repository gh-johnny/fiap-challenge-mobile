import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FordLogo } from '@/components/ford-logo';
import { MeshGradient } from '@/components/mesh-gradient';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { sendMessage } from '@/services/chat';
import { useAuthStore } from '@/store/auth';

const { height: SCREEN_H } = Dimensions.get('window');
const AVATAR_SIZE = Math.min(230, SCREEN_H * 0.27);
type AiState = 'idle' | 'thinking' | 'speaking';
type Lang = 'en-US' | 'pt-BR';

const SUGGESTIONS = [
  'Check my warranty',
  'Next oil change?',
  'Find nearest dealer',
  'Schedule a service',
];

// ─── Equalizer bars (replaces SVG waveform) ──────────────────────────────────

const BAR_HEIGHTS = [0.4, 0.7, 1.0, 0.6, 0.85, 0.5, 0.75, 0.35, 0.9, 0.55];

function SiriWaveform({ active }: { active: boolean }) {
  const bars = BAR_HEIGHTS.map((target, i) => {
    const h = useSharedValue(4);
    useEffect(() => {
      if (active) {
        h.value = withRepeat(
          withSequence(
            withTiming(target * 36, { duration: 300 + i * 40, easing: Easing.inOut(Easing.sin) }),
            withTiming(4, { duration: 300 + i * 40, easing: Easing.inOut(Easing.sin) }),
          ),
          -1, false,
        );
      } else {
        h.value = withTiming(4, { duration: 250 });
      }
    }, [active]);
    return useAnimatedStyle(() => ({ height: h.value }));
  });

  return (
    <View style={styles.equalizerRow}>
      {bars.map((style, i) => (
        <Animated.View
          key={i}
          style={[styles.equalizerBar, style, { opacity: active ? 0.6 + (i % 3) * 0.15 : 0.25 }]}
        />
      ))}
    </View>
  );
}

// ─── Thinking dots ────────────────────────────────────────────────────────────

function ThinkingDots() {
  const d1 = useSharedValue(0.3);
  const d2 = useSharedValue(0.3);
  const d3 = useSharedValue(0.3);

  useEffect(() => {
    const pulse = (sv: typeof d1, delay: number) => {
      sv.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) }),
          withTiming(0.3, { duration: 300 }),
        ), -1,
      );
      setTimeout(() => {}, delay); // stagger via initial delay hack
    };
    d1.value = withRepeat(withSequence(withTiming(1, { duration: 300 }), withTiming(0.3, { duration: 300 })), -1);
    setTimeout(() => {
      d2.value = withRepeat(withSequence(withTiming(1, { duration: 300 }), withTiming(0.3, { duration: 300 })), -1);
    }, 150);
    setTimeout(() => {
      d3.value = withRepeat(withSequence(withTiming(1, { duration: 300 }), withTiming(0.3, { duration: 300 })), -1);
    }, 300);
  }, []);

  const s1 = useAnimatedStyle(() => ({ opacity: d1.value }));
  const s2 = useAnimatedStyle(() => ({ opacity: d2.value }));
  const s3 = useAnimatedStyle(() => ({ opacity: d3.value }));

  return (
    <View style={styles.dotsRow}>
      <Animated.View style={[styles.dot, s1]} />
      <Animated.View style={[styles.dot, s2]} />
      <Animated.View style={[styles.dot, s3]} />
    </View>
  );
}

// ─── Avatar circle ────────────────────────────────────────────────────────────

function AvatarCircle({ state }: { state: AiState }) {
  const pulse = useSharedValue(1);
  const ringOpacity = useSharedValue(0.4);

  useEffect(() => {
    // Breathing pulse — always on
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.025, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.0, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
      ), -1,
    );
    // Ring glow when speaking
    ringOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.25, { duration: 1800 }),
      ), -1,
    );
  }, []);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: state === 'speaking' ? ringOpacity.value : 0.18,
    borderColor: state === 'speaking' ? Colors.blue : Colors.border,
  }));

  return (
    <View style={styles.avatarWrapper}>
      {/* Outer glow ring */}
      <Animated.View style={[styles.avatarRing, ringStyle]} />

      <Animated.View style={[styles.avatarCircle, circleStyle]}>
        <FordLogo width={AVATAR_SIZE * 0.52} height={AVATAR_SIZE * 0.22} />

        {/* Waveform overlay */}
        <SiriWaveform active={state === 'speaking'} />

        {/* Thinking dots overlay */}
        {state === 'thinking' && (
          <View style={styles.thinkingOverlay}>
            <ThinkingDots />
          </View>
        )}
      </Animated.View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function AIAssistantScreen() {
  const { user, vehicle } = useAuthStore();
  const [aiState, setAiState] = useState<AiState>('idle');
  const [lastResponse, setLastResponse] = useState(
    `Hi ${user?.name?.split(' ')[0] ?? 'there'}! I'm Ford AI. How can I help you today?`,
  );
  const [input, setInput] = useState('');
  const [voiceOn, setVoiceOn] = useState(false);
  const [lang, setLang] = useState<Lang>('en-US');
  const [hasTalked, setHasTalked] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const captionOpacity = useSharedValue(1);
  const captionY = useSharedValue(0);

  function showCaption(text: string) {
    captionOpacity.value = withTiming(0, { duration: 150 }, () => {
      captionOpacity.value = withTiming(1, { duration: 350 });
    });
    captionY.value = withSequence(
      withTiming(8, { duration: 120 }),
      withSpring(0, { damping: 14, stiffness: 180 }),
    );
    setLastResponse(text);
  }

  const captionStyle = useAnimatedStyle(() => ({
    opacity: captionOpacity.value,
    transform: [{ translateY: captionY.value }],
  }));

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || aiState !== 'idle') return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInput('');
    setHasTalked(true);
    setAiState('thinking');

    if (voiceOn) Speech.stop();

    try {
      const { text: reply } = await sendMessage(trimmed, {
        vehicleModel: vehicle?.model,
        vehicleYear: vehicle?.year,
      });

      showCaption(reply);
      setAiState('speaking');

      if (voiceOn) {
        Speech.speak(reply, {
          language: lang,
          rate: 0.92,
          onDone: () => setAiState('idle'),
          onError: () => setAiState('idle'),
        });
      } else {
        // Auto-return to idle after estimated read time
        const ms = Math.max(2500, reply.length * 42);
        setTimeout(() => setAiState('idle'), ms);
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      showCaption("Sorry, I couldn't connect right now. Please try again.");
      setAiState('idle');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  function toggleVoice() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (voiceOn) Speech.stop();
    setVoiceOn((v) => !v);
  }

  function toggleLang() {
    Haptics.selectionAsync();
    setLang((l) => (l === 'en-US' ? 'pt-BR' : 'en-US'));
  }

  function stopSpeaking() {
    if (aiState !== 'speaking') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Speech.stop();
    setAiState('idle');
  }

  return (
    <View style={styles.root}>
      <MeshGradient />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.statusDot, aiState !== 'idle' && styles.statusDotActive]} />
              <Text style={styles.headerTitle}>Ford AI</Text>
            </View>
            <View style={styles.headerRight}>
              <Pressable
                style={({ pressed }) => [styles.langChip, pressed && { opacity: 0.7 }]}
                onPress={toggleLang}
              >
                <Text style={styles.langChipText}>{lang === 'en-US' ? 'EN' : 'PT'}</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.voiceBtn, voiceOn && styles.voiceBtnOn, pressed && { opacity: 0.7 }]}
                onPress={toggleVoice}
              >
                <Text style={styles.voiceBtnIcon}>{voiceOn ? '🔊' : '🔇'}</Text>
              </Pressable>
            </View>
          </View>

          {/* Avatar area */}
          <Pressable style={styles.avatarArea} onPress={stopSpeaking}>
            <AvatarCircle state={aiState} />

            {/* State label */}
            <View style={styles.stateLabelRow}>
              <Text style={styles.stateLabel}>
                {aiState === 'thinking' ? 'Thinking…' : aiState === 'speaking' ? 'Speaking' : 'Ford AI'}
              </Text>
            </View>
          </Pressable>

          {/* Response caption */}
          <Animated.View style={[styles.captionWrap, captionStyle]}>
            <Text style={styles.caption} numberOfLines={4}>
              {lastResponse}
            </Text>
            {aiState === 'speaking' && (
              <Text style={styles.tapToStop}>Tap avatar to stop</Text>
            )}
          </Animated.View>

          {/* Suggestions */}
          {!hasTalked && (
            <View style={styles.suggestions}>
              {SUGGESTIONS.map((s) => (
                <Pressable
                  key={s}
                  style={({ pressed }) => [styles.chip, pressed && { opacity: 0.7 }]}
                  onPress={() => send(s)}
                >
                  <Text style={styles.chipText}>{s}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Input bar */}
          <BlurView
            intensity={Platform.OS === 'android' ? 40 : 60}
            tint="light"
            style={styles.inputBar}
          >
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder="Ask Ford AI anything…"
              placeholderTextColor="rgba(74,94,130,0.5)"
              returnKeyType="send"
              onSubmitEditing={() => send(input)}
              editable={aiState === 'idle'}
            />
            <Pressable
              style={({ pressed }) => [
                styles.sendBtn,
                aiState !== 'idle' && styles.sendBtnDisabled,
                pressed && { opacity: 0.75, transform: [{ scale: 0.93 }] },
              ]}
              onPress={() => send(input)}
              disabled={aiState !== 'idle'}
            >
              <Text style={styles.sendIcon}>↑</Text>
            </Pressable>
          </BlurView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  kav: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  statusDot: {
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: Colors.muted,
  },
  statusDotActive: {
    backgroundColor: Colors.blue,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  langChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'rgba(1,66,192,0.07)',
  },
  langChipText: { color: Colors.mutedLight, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  voiceBtn: {
    width: 34, height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(1,66,192,0.07)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  voiceBtnOn: {
    backgroundColor: 'rgba(1,66,192,0.2)',
    borderColor: 'rgba(1,66,192,0.5)',
  },
  voiceBtnIcon: { fontSize: 16 },

  // Avatar
  avatarArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  avatarWrapper: {
    width: AVATAR_SIZE + 20,
    height: AVATAR_SIZE + 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRing: {
    position: 'absolute',
    width: AVATAR_SIZE + 18,
    height: AVATAR_SIZE + 18,
    borderRadius: (AVATAR_SIZE + 18) / 2,
    borderWidth: 1.5,
  },
  avatarCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: 'rgba(1,66,192,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(1,66,192,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    overflow: 'hidden',
  },
  waveformSvg: { marginTop: -Spacing.xs },
  thinkingOverlay: {
    position: 'absolute',
    bottom: AVATAR_SIZE * 0.22,
    alignItems: 'center',
  },
  dotsRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.mutedLight },
  stateLabelRow: { alignItems: 'center' },
  stateLabel: { ...Typography.label, fontSize: 11, letterSpacing: 1.5 },

  // Caption
  captionWrap: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    alignItems: 'center',
    gap: 6,
    minHeight: 80,
    justifyContent: 'center',
  },
  caption: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '400',
  },
  tapToStop: {
    color: Colors.muted,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
  },

  // Suggestions
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    justifyContent: 'center',
  },
  chip: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderWidth: 1,
    borderColor: 'rgba(1,66,192,0.4)',
    backgroundColor: 'rgba(1,66,192,0.1)',
  },
  chipText: { color: Colors.mutedLight, fontSize: 12, fontWeight: '600' },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: 88,
    borderTopWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Platform.OS === 'android' ? 'rgba(238,242,255,0.97)' : 'transparent',
  },
  textInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    maxHeight: 90,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  sendBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendBtnDisabled: { backgroundColor: Colors.border },
  sendIcon: { color: Colors.white, fontSize: 18, fontWeight: '700', marginTop: -1 },
  equalizerRow: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 36 },
  equalizerBar: { width: 3, borderRadius: 2, backgroundColor: Colors.blue },
  waveformSvg: {},
});
