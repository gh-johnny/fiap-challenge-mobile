import { act, renderHook } from '@testing-library/react-native';
import { useLiveTelemetry } from '../../hooks/useLiveTelemetry';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('useLiveTelemetry — initial state', () => {
  it('returns initial rpm within realistic idle range', () => {
    const { result } = renderHook(() => useLiveTelemetry());
    expect(result.current.rpm).toBeGreaterThanOrEqual(600);
    expect(result.current.rpm).toBeLessThanOrEqual(6500);
  });

  it('returns initial tempC within engine operating range', () => {
    const { result } = renderHook(() => useLiveTelemetry());
    expect(result.current.tempC).toBeGreaterThanOrEqual(70);
    expect(result.current.tempC).toBeLessThanOrEqual(110);
  });

  it('returns initial fuelPct between 0 and 100', () => {
    const { result } = renderHook(() => useLiveTelemetry());
    expect(result.current.fuelPct).toBeGreaterThanOrEqual(0);
    expect(result.current.fuelPct).toBeLessThanOrEqual(100);
  });

  it('returns all four tire pressure readings', () => {
    const { result } = renderHook(() => useLiveTelemetry());
    expect(result.current.tires).toHaveProperty('fl');
    expect(result.current.tires).toHaveProperty('fr');
    expect(result.current.tires).toHaveProperty('rl');
    expect(result.current.tires).toHaveProperty('rr');
  });

  it('tire pressures are within realistic PSI range', () => {
    const { result } = renderHook(() => useLiveTelemetry());
    const { fl, fr, rl, rr } = result.current.tires;
    [fl, fr, rl, rr].forEach((psi) => {
      expect(psi).toBeGreaterThanOrEqual(28);
      expect(psi).toBeLessThanOrEqual(37);
    });
  });
});

describe('useLiveTelemetry — live updates', () => {
  it('updates data after interval fires', () => {
    const { result } = renderHook(() => useLiveTelemetry());
    const before = { ...result.current };

    // Run enough ticks that at least one value changes
    let changed = false;
    for (let i = 0; i < 20; i++) {
      act(() => { jest.advanceTimersByTime(1100); });
      if (result.current.rpm !== before.rpm) { changed = true; break; }
    }
    expect(changed).toBe(true);
  });

  it('fuel decreases over time', () => {
    const { result } = renderHook(() => useLiveTelemetry());
    const initial = result.current.fuelPct;
    act(() => { jest.advanceTimersByTime(1100 * 5); });
    expect(result.current.fuelPct).toBeLessThan(initial);
  });

  it('rpm stays within bounds after many ticks', () => {
    const { result } = renderHook(() => useLiveTelemetry());
    act(() => { jest.advanceTimersByTime(1100 * 50); });
    expect(result.current.rpm).toBeGreaterThanOrEqual(650);
    expect(result.current.rpm).toBeLessThanOrEqual(6200);
  });

  it('tempC stays within bounds after many ticks', () => {
    const { result } = renderHook(() => useLiveTelemetry());
    act(() => { jest.advanceTimersByTime(1100 * 50); });
    expect(result.current.tempC).toBeGreaterThanOrEqual(78);
    expect(result.current.tempC).toBeLessThanOrEqual(104);
  });

  it('fuelPct never goes below 5', () => {
    const { result } = renderHook(() => useLiveTelemetry());
    act(() => { jest.advanceTimersByTime(1100 * 5000); });
    expect(result.current.fuelPct).toBeGreaterThanOrEqual(5);
  });
});

describe('useLiveTelemetry — active flag', () => {
  it('does NOT update when active=false', () => {
    const { result } = renderHook(() => useLiveTelemetry(false));
    const before = result.current.rpm;
    act(() => { jest.advanceTimersByTime(1100 * 10); });
    expect(result.current.rpm).toBe(before);
  });

  it('updates when active=true (default)', () => {
    const { result } = renderHook(() => useLiveTelemetry(true));
    const before = result.current.fuelPct;
    act(() => { jest.advanceTimersByTime(1100 * 5); });
    expect(result.current.fuelPct).toBeLessThan(before);
  });
});
