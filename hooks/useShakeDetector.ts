import { Accelerometer } from 'expo-sensors';
import { useEffect, useRef } from 'react';

const THRESHOLD = 1.6;   // g-force above gravity
const PEAKS_NEEDED = 3;
const WINDOW_MS = 1000;  // 3 peaks must happen within 1s
const COOLDOWN_MS = 3000;

export function useShakeDetector(onShake: () => void, enabled: boolean) {
  const onShakeRef = useRef(onShake);
  useEffect(() => { onShakeRef.current = onShake; }, [onShake]);

  const peaks = useRef<number[]>([]);
  const aboveThreshold = useRef(false);
  const lastFired = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    Accelerometer.setUpdateInterval(50);

    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const net = Math.abs(Math.sqrt(x * x + y * y + z * z) - 1);
      const now = Date.now();

      if (net > THRESHOLD && !aboveThreshold.current) {
        aboveThreshold.current = true;
        peaks.current = peaks.current.filter((t) => now - t < WINDOW_MS);
        peaks.current.push(now);

        if (peaks.current.length >= PEAKS_NEEDED && now - lastFired.current > COOLDOWN_MS) {
          lastFired.current = now;
          peaks.current = [];
          onShakeRef.current();
        }
      } else if (net <= THRESHOLD) {
        aboveThreshold.current = false;
      }
    });

    return () => {
      sub.remove();
      peaks.current = [];
      aboveThreshold.current = false;
    };
  }, [enabled]);
}
