import { Barometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';

export type BarometerAlert =
  | { type: 'rain';     message: string }
  | { type: 'altitude'; message: string }
  | { type: 'storm';    message: string }
  | null;

export interface BarometerAdvisorData {
  pressure: number | null;
  alert: BarometerAlert;
}

// Thresholds
const HIGH_ALTITUDE_HPA = 900;   // below → altitude warning
const STORM_HPA         = 980;   // below → storm/bad weather
const RAIN_DROP_HPA     = 3;     // drop ≥ 3 hPa in window → rain coming
const HISTORY_SIZE      = 5;     // readings to track for trend

function classify(pressure: number, history: number[]): BarometerAlert {
  if (pressure < HIGH_ALTITUDE_HPA) {
    return { type: 'altitude', message: 'High altitude detected — adjust fuel mixture and check tire pressure.' };
  }
  if (pressure < STORM_HPA) {
    return { type: 'storm', message: 'Low pressure system — storm likely. Avoid long trips, check wipers.' };
  }
  if (history.length >= 2) {
    const drop = history[0] - pressure;
    if (drop >= RAIN_DROP_HPA) {
      return { type: 'rain', message: 'Pressure dropping fast — rain is coming. Check wipers and tread depth.' };
    }
  }
  return null;
}

export function useBarometerAdvisor(active = true): BarometerAdvisorData {
  const [pressure, setPressure] = useState<number | null>(null);
  const [alert, setAlert] = useState<BarometerAlert>(null);
  const history = useRef<number[]>([]);

  useEffect(() => {
    if (!active) return;

    Barometer.setUpdateInterval(5000);

    const sub = Barometer.addListener(({ pressure: p }) => {
      if (p == null) return;

      history.current = [...history.current.slice(-(HISTORY_SIZE - 1)), p];
      setPressure(p);
      setAlert(classify(p, history.current));
    });

    return () => sub.remove();
  }, [active]);

  return { pressure, alert };
}
