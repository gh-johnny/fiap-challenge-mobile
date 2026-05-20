import {
  createAudioPlayer,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Colors, Radius, Spacing } from '@/constants/theme';

type RecordState = 'idle' | 'recording' | 'playing';

interface Props {
  uri?: string;
  onSave: (uri: string) => void;
  onDelete: () => void;
}

export function VoiceNote({ uri, onSave, onDelete }: Props) {
  const [state, setState] = useState<RecordState>('idle');
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const playerRef = useRef<AudioPlayer | null>(null);

  const pulse = useSharedValue(1);

  useEffect(() => {
    if (state === 'recording') {
      pulse.value = withRepeat(withTiming(1.3, { duration: 600 }), -1, true);
    } else {
      pulse.value = withTiming(1, { duration: 200 });
    }
  }, [state]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  async function startRecording() {
    await requestRecordingPermissionsAsync();
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    setState('recording');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  async function stopRecording() {
    await recorder.stop();
    const savedUri = recorder.uri;
    setState('idle');
    if (savedUri) {
      onSave(savedUri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  async function playNote() {
    if (!uri) return;
    setState('playing');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
    const player = createAudioPlayer({ uri });
    playerRef.current = player;
    player.play();
    player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) {
        setState('idle');
        player.remove();
        playerRef.current = null;
      }
    });
  }

  async function stopPlayback() {
    if (playerRef.current) {
      playerRef.current.pause();
      playerRef.current.remove();
      playerRef.current = null;
    }
    setState('idle');
  }

  function handleDelete() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDelete();
  }

  if (uri) {
    return (
      <View style={styles.row}>
        <Pressable
          style={({ pressed }) => [styles.playBtn, state === 'playing' && styles.playBtnActive, pressed && { opacity: 0.7 }]}
          onPress={state === 'playing' ? stopPlayback : playNote}
        >
          <Text style={styles.playIcon}>{state === 'playing' ? '⏹' : '▶'}</Text>
          <Text style={styles.playLabel}>{state === 'playing' ? 'Stop' : 'Play note'}</Text>
        </Pressable>
        <Pressable onPress={handleDelete} style={({ pressed }) => [styles.delBtn, pressed && { opacity: 0.6 }]}>
          <Text style={styles.delIcon}>🗑️</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Pressable
        style={({ pressed }) => [styles.recBtn, state === 'recording' && styles.recBtnActive, pressed && { opacity: 0.8 }]}
        onPress={state === 'recording' ? stopRecording : startRecording}
      >
        <Animated.View style={[styles.recDot, state === 'recording' && styles.recDotActive, dotStyle]} />
        <Text style={styles.recLabel}>{state === 'recording' ? 'Tap to stop' : '🎙 Add voice note'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm },
  recBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderRadius: Radius.pill, borderWidth: 1,
    borderColor: Colors.border, backgroundColor: 'rgba(1,66,192,0.05)',
  },
  recBtnActive: { borderColor: Colors.danger, backgroundColor: 'rgba(229,57,53,0.1)' },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.muted },
  recDotActive: { backgroundColor: Colors.danger },
  recLabel: { color: Colors.mutedLight, fontSize: 12, fontWeight: '600' },
  playBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderRadius: Radius.pill, borderWidth: 1,
    borderColor: 'rgba(1,66,192,0.4)', backgroundColor: 'rgba(1,66,192,0.1)',
  },
  playBtnActive: { borderColor: Colors.danger, backgroundColor: 'rgba(229,57,53,0.1)' },
  playIcon: { fontSize: 12, color: Colors.text },
  playLabel: { color: Colors.mutedLight, fontSize: 12, fontWeight: '600' },
  delBtn: { padding: 6 },
  delIcon: { fontSize: 16 },
});
