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
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { Colors } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

// depth: parallax multiplier — higher = further back = more shift
const BLOBS = [
  { id: 'b1', color: '#1A6BFF', w: 320, h: 280, cx: width * 0.15, cy: height * 0.18, toCx: width * 0.5,  toCy: height * 0.32, duration: 14000, delay: 0,    depth: 1.6 },
  { id: 'b2', color: '#0038C8', w: 300, h: 300, cx: width * 0.85, cy: height * 0.65, toCx: width * 0.55, toCy: height * 0.45, duration: 17000, delay: 2000, depth: 2.4 },
  { id: 'b3', color: '#6B35F0', w: 280, h: 320, cx: width * 0.72, cy: height * 0.12, toCx: width * 0.28, toCy: height * 0.38, duration: 15000, delay: 3500, depth: 0.8 },
  { id: 'b4', color: '#1558E8', w: 310, h: 270, cx: width * 0.2,  cy: height * 0.75, toCx: width * 0.6,  toCy: height * 0.55, duration: 18000, delay: 800,  depth: 1.2 },
];

const MAX_PARALLAX = 18; // px at depth=1

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

  return (
    <Animated.View style={[styles.blob, style, { width: blob.w, height: blob.h }]}>
      <Svg width={blob.w} height={blob.h} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id={`grad-${blob.id}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%"   stopColor={blob.color} stopOpacity="0.82" />
            <Stop offset="60%"  stopColor={blob.color} stopOpacity="0.35" />
            <Stop offset="100%" stopColor={blob.color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Ellipse
          cx={blob.w / 2}
          cy={blob.h / 2}
          rx={blob.w / 2}
          ry={blob.h / 2}
          fill={`url(#grad-${blob.id})`}
        />
      </Svg>
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
