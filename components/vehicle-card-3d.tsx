import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

import { Colors, Radius, Spacing, Springs, Typography } from '@/constants/theme';
import type { Vehicle } from '@/store/auth';

function CarSvgStatic() {
  return (
    <Svg width={140} height={73} viewBox="0 0 300 156">
      <Path
        d="M18 100 L18 78 Q20 62 40 56 L90 44 Q112 36 144 34 L184 34 Q214 36 236 46 L266 58 Q284 64 286 80 L286 100 Z"
        stroke="rgba(51,133,255,0.9)" strokeWidth="3.5" fill="rgba(1,66,192,0.28)"
      />
      <Path d="M76 56 Q98 32 142 28 L184 28 Q220 30 246 56"
        stroke="rgba(51,133,255,0.9)" strokeWidth="3.5" fill="none" />
      <Path d="M98 56 L110 32 L166 32 L166 56 Z"
        stroke="rgba(51,133,255,0.7)" strokeWidth="2.5" fill="rgba(51,133,255,0.18)" />
      <Path d="M168 56 L178 32 L224 32 L240 56 Z"
        stroke="rgba(51,133,255,0.7)" strokeWidth="2.5" fill="rgba(51,133,255,0.18)" />
      <Line x1="167" y1="34" x2="167" y2="100" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
      <Line x1="182" y1="72" x2="200" y2="72" stroke="rgba(255,255,255,0.9)" strokeWidth="3.5" strokeLinecap="round" />
      <Circle cx="78" cy="106" r="24" stroke="rgba(51,133,255,0.9)" strokeWidth="3.5" fill="rgba(2,8,18,0.92)" />
      <Circle cx="78" cy="106" r="11" stroke="rgba(255,255,255,0.35)" strokeWidth="2" fill="none" />
      <Circle cx="78" cy="106" r="4" fill={Colors.blue} />
      <Circle cx="224" cy="106" r="24" stroke="rgba(51,133,255,0.9)" strokeWidth="3.5" fill="rgba(2,8,18,0.92)" />
      <Circle cx="224" cy="106" r="11" stroke="rgba(255,255,255,0.35)" strokeWidth="2" fill="none" />
      <Circle cx="224" cy="106" r="4" fill={Colors.blue} />
      <Path d="M284 68 L294 62 M284 76 L295 76 M284 84 L294 90"
        stroke="rgba(51,133,255,0.9)" strokeWidth="3" strokeLinecap="round" />
      <Path d="M16 70 L6 70 M16 80 L5 80"
        stroke="rgba(229,57,53,0.7)" strokeWidth="3" strokeLinecap="round" />
    </Svg>
  );
}

interface Props {
  vehicle: Vehicle;
  gyroTiltX?: SharedValue<number>;
  gyroTiltY?: SharedValue<number>;
}

export function VehicleCard3D({ vehicle, gyroTiltX, gyroTiltY }: Props) {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const glossX = useSharedValue(0.5);
  const glossY = useSharedValue(0.5);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      rotateY.value = (e.translationX / 150) * 12;
      rotateX.value = -(e.translationY / 100) * 8;
      glossX.value = 0.5 + e.translationX / 300;
      glossY.value = 0.5 + e.translationY / 200;
    })
    .onEnd(() => {
      rotateX.value = withSpring(0, Springs.soft);
      rotateY.value = withSpring(0, Springs.soft);
      glossX.value = withSpring(0.5);
      glossY.value = withSpring(0.5);
    });

  const cardStyle = useAnimatedStyle(() => {
    const gx = (gyroTiltX?.value ?? 0) * 7;   // gyro adds ±7°
    const gy = (gyroTiltY?.value ?? 0) * 10;  // gyro adds ±10°
    return {
      transform: [
        { perspective: 800 },
        { rotateX: `${rotateX.value + gx}deg` },
        { rotateY: `${rotateY.value + gy}deg` },
      ],
    };
  });

  const glossStyle = useAnimatedStyle(() => {
    const gx = gyroTiltX?.value ?? 0;
    const gy = gyroTiltY?.value ?? 0;
    return {
      left: `${(glossX.value + gy * 0.18) * 100}%`,
      top: `${(glossY.value - gx * 0.18) * 100}%`,
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, cardStyle]}>
        <LinearGradient
          colors={['#0A2A6E', '#003478', '#001F50']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Gloss highlight */}
          <Animated.View style={[styles.gloss, glossStyle]} />

          {/* Card content */}
          <View style={styles.topRow}>
            <View>
              <Text style={styles.modelLabel}>FORD</Text>
              <Text style={styles.modelName}>{vehicle.model}</Text>
            </View>
            <CarSvgStatic />
          </View>

          <View style={styles.bottomRow}>
            <View>
              <Text style={styles.fieldLabel}>YEAR</Text>
              <Text style={styles.fieldValue}>{vehicle.year}</Text>
            </View>
            <View style={styles.plateBadge}>
              <Text style={styles.plateLabel}>PLATE</Text>
              <Text style={styles.plateValue}>{vehicle.plate}</Text>
            </View>
          </View>

          {/* Decorative arc */}
          <View style={styles.arc} />
        </LinearGradient>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  gradient: { padding: Spacing.lg, minHeight: 180, justifyContent: 'space-between', overflow: 'hidden' },
  gloss: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.14)',
    marginLeft: -80,
    marginTop: -80,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  modelLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  modelName: { color: Colors.white, fontSize: 26, fontWeight: '800', marginTop: 2 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  fieldLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  fieldValue: { color: Colors.white, fontSize: 18, fontWeight: '600', marginTop: 2 },
  plateBadge: { alignItems: 'flex-end' },
  plateLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  plateValue: { color: Colors.white, fontSize: 20, fontWeight: '800', letterSpacing: 3, marginTop: 2 },
  arc: {
    position: 'absolute',
    right: -60,
    top: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 30,
    borderColor: 'rgba(255,255,255,0.05)',
  },
});
