import { useEffect, useRef, useState } from 'react';

export interface TelemetryData {
  rpm: number;
  tempC: number;
  fuelPct: number;
  tires: { fl: number; fr: number; rl: number; rr: number };
}

const INITIAL: TelemetryData = {
  rpm: 820,
  tempC: 84,
  fuelPct: 68,
  tires: { fl: 33, fr: 32, rl: 31, rr: 32 },
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function jitter(v: number, range: number, min: number, max: number) {
  return clamp(v + (Math.random() - 0.48) * range, min, max);
}

export function useLiveTelemetry(active = true): TelemetryData {
  const [data, setData] = useState<TelemetryData>(INITIAL);
  const ref = useRef(data);
  ref.current = data;

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      const prev = ref.current;
      setData({
        rpm:     jitter(prev.rpm, 350, 650, 6200),
        tempC:   jitter(prev.tempC, 1.5, 78, 104),
        fuelPct: clamp(prev.fuelPct - 0.03, 5, 100),
        tires: {
          fl: jitter(prev.tires.fl, 0.4, 28, 37),
          fr: jitter(prev.tires.fr, 0.4, 28, 37),
          rl: jitter(prev.tires.rl, 0.4, 28, 37),
          rr: jitter(prev.tires.rr, 0.4, 28, 37),
        },
      });
    }, 1100);
    return () => clearInterval(id);
  }, [active]);

  return data;
}
