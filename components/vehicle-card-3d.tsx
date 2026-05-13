import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import type { Vehicle } from '@/store/auth';

const CAR_EMOJIS: Record<string, string> = {
  EcoSport: '🚙', Ka: '🚗', Territory: '🚙', Bronco: '🛻',
  Maverick: '🛻', Ranger: '🛻', 'F-150': '🛻', Mustang: '🏎️',
  Edge: '🚙', Explorer: '🚙',
};

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
      rotateX.value = withSpring(0, { damping: 15, stiffness: 200 });
      rotateY.value = withSpring(0, { damping: 15, stiffness: 200 });
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

  const emoji = CAR_EMOJIS[vehicle.model] ?? '🚗';

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
            <Text style={styles.emoji}>{emoji}</Text>
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
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginLeft: -80,
    marginTop: -80,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  modelLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  modelName: { color: Colors.white, fontSize: 26, fontWeight: '800', marginTop: 2 },
  emoji: { fontSize: 52 },
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
