import { Accelerometer } from 'expo-sensors';
import { useEffect, useRef } from 'react';

const CRASH_THRESHOLD = 4.0;  // g-force net (> 4g = hard impact)
const COOLDOWN_MS = 10_000;

export function useCrashDetector(onCrash: () => void, enabled: boolean) {
  const onCrashRef = useRef(onCrash);
  useEffect(() => { onCrashRef.current = onCrash; }, [onCrash]);

  const lastFired = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    Accelerometer.setUpdateInterval(50);

    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const net = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();

      if (net > CRASH_THRESHOLD && now - lastFired.current > COOLDOWN_MS) {
        lastFired.current = now;
        onCrashRef.current();
      }
    });

    return () => sub.remove();
  }, [enabled]);
}
