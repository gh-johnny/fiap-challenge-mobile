import { DeviceMotion } from 'expo-sensors';
import { useEffect } from 'react';
import { useSharedValue, withSpring } from 'react-native-reanimated';

const SPRING = { damping: 18, stiffness: 120, mass: 0.8 };
const RANGE = Math.PI / 5; // ~36° = full swing

export function useGyroTilt(enabled = true) {
  const tiltX = useSharedValue(0); // pitch: forward/back  (-1 → +1)
  const tiltY = useSharedValue(0); // roll:  left/right    (-1 → +1)

  useEffect(() => {
    if (!enabled) return;

    DeviceMotion.setUpdateInterval(50);

    const sub = DeviceMotion.addListener(({ rotation }) => {
      if (!rotation) return;
      const { beta, gamma } = rotation;
      tiltX.value = withSpring(Math.max(-1, Math.min(1, beta / RANGE)), SPRING);
      tiltY.value = withSpring(Math.max(-1, Math.min(1, gamma / RANGE)), SPRING);
    });

    return () => {
      sub.remove();
      tiltX.value = withSpring(0, SPRING);
      tiltY.value = withSpring(0, SPRING);
    };
  }, [enabled]);

  return { tiltX, tiltY };
}
