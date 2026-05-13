import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  Animated,
} from 'react-native';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

interface Props extends TextInputProps {
  label: string;
}

export function GlassInput({ label, style, ...props }: Props) {
  const glowOpacity = useSharedValue(0);
  const borderColor = useSharedValue('rgba(255,255,255,0.12)');

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  function handleFocus() {
    glowOpacity.value = withTiming(1, { duration: 250 });
    Haptics.selectionAsync();
  }

  function handleBlur() {
    glowOpacity.value = withTiming(0, { duration: 250 });
  }

  return (
    <View style={[styles.wrapper, style]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        {/* Glow ring */}
        <Reanimated.View style={[styles.glowRing, glowStyle]} pointerEvents="none" />

        <BlurView
          intensity={Platform.OS === 'android' ? 20 : 40}
          tint="dark"
          style={styles.blur}
        >
          <TextInput
            style={styles.input}
            placeholderTextColor="rgba(160,174,207,0.5)"
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.xs },
  label: { ...Typography.label, fontSize: 12, letterSpacing: 0.8 },
  inputWrapper: { position: 'relative' },
  glowRing: {
    position: 'absolute',
    inset: -2,
    borderRadius: Radius.md + 2,
    borderWidth: 1.5,
    borderColor: Colors.blue,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1,
  },
  blur: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: Platform.OS === 'android' ? 'rgba(13,21,38,0.9)' : 'transparent',
  },
  input: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    color: Colors.white,
    fontSize: 15,
  },
});
