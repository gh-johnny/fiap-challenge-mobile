import { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { Colors } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

// Light-mode blobs: soft blue/indigo tints, three opacity layers each
const BLOBS = [
  { id: 'b1', hue: [1, 66, 192],   w: 340, h: 300, cx: width * 0.15, cy: height * 0.18, toCx: width * 0.55,  toCy: height * 0.32, duration: 14000, delay: 0,    depth: 1.6 },
  { id: 'b2', hue: [0, 52, 200],   w: 320, h: 320, cx: width * 0.85, cy: height * 0.65, toCx: width * 0.50,  toCy: height * 0.45, duration: 17000, delay: 2000, depth: 2.4 },
  { id: 'b3', hue: [100, 50, 230], w: 300, h: 340, cx: width * 0.72, cy: height * 0.12, toCx: width * 0.28,  toCy: height * 0.40, duration: 15000, delay: 3500, depth: 0.8 },
  { id: 'b4', hue: [21, 88, 232],  w: 330, h: 290, cx: width * 0.20, cy: height * 0.75, toCx: width * 0.60,  toCy: height * 0.55, duration: 18000, delay: 800,  depth: 1.2 },
];

const MAX_PARALLAX = 18;

function rgba(hue: number[], opacity: number) {
  return `rgba(${hue[0]},${hue[1]},${hue[2]},${opacity})`;
}

function Blob({ blob, gyroTiltX, gyroTiltY }: {
  blob: typeof BLOBS[0];
  gyroTiltX?: SharedValue<number>;
  gyroTiltY?: SharedValue<number>;
}) {
  const cx = useSharedValue(blob.cx);
  const cy = useSharedValue(blob.cy);

  useEffect(() => {
    const e = Easing.inOut(Easing.sin);
    cx.value = withDelay(blob.delay, withRepeat(withSequence(
      withTiming(blob.toCx, { duration: blob.duration, easing: e }),
      withTiming(blob.cx,   { duration: blob.duration, easing: e }),
    ), -1));
    cy.value = withDelay(blob.delay, withRepeat(withSequence(
      withTiming(blob.toCy, { duration: blob.duration * 1.3, easing: e }),
      withTiming(blob.cy,   { duration: blob.duration * 1.3, easing: e }),
    ), -1));
  }, []);

  const style = useAnimatedStyle(() => {
    const px = (gyroTiltY?.value ?? 0) * MAX_PARALLAX * blob.depth;
    const py = (gyroTiltX?.value ?? 0) * MAX_PARALLAX * blob.depth;
    return {
      transform: [
        { translateX: cx.value - blob.w / 2 + px },
        { translateY: cy.value - blob.h / 2 + py },
      ],
    };
  });

  const { w, h, hue } = blob;

  return (
    <Animated.View style={[styles.blob, style, { width: w, height: h }]}>
      {/* Outer ring — very faint */}
      <View style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        borderRadius: h / 2,
        backgroundColor: rgba(hue, 0.07),
      }} />
      {/* Middle ring */}
      <View style={{
        position: 'absolute',
        top: h * 0.18, left: w * 0.18, right: w * 0.18, bottom: h * 0.18,
        borderRadius: h * 0.32,
        backgroundColor: rgba(hue, 0.12),
      }} />
      {/* Core — most opaque */}
      <View style={{
        position: 'absolute',
        top: h * 0.36, left: w * 0.36, right: w * 0.36, bottom: h * 0.36,
        borderRadius: h * 0.14,
        backgroundColor: rgba(hue, 0.18),
      }} />
    </Animated.View>
  );
}

interface MeshGradientProps {
  style?: object;
  gyroTiltX?: SharedValue<number>;
  gyroTiltY?: SharedValue<number>;
}

export function MeshGradient({ style, gyroTiltX, gyroTiltY }: MeshGradientProps) {
  return (
    <View style={[styles.root, style]} pointerEvents="none">
      {BLOBS.map((blob) => (
        <Blob key={blob.id} blob={blob} gyroTiltX={gyroTiltX} gyroTiltY={gyroTiltY} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
  },
});
