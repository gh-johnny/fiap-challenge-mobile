import { renderHook } from '@testing-library/react-native';
import { Accelerometer } from 'expo-sensors';
import { useCrashDetector } from '../../hooks/useCrashDetector';

const mockAccel = Accelerometer as jest.Mocked<typeof Accelerometer>;
type AccelListener = (data: { x: number; y: number; z: number }) => void;

function getListener(): AccelListener {
  const calls = (mockAccel.addListener as jest.Mock).mock.calls;
  expect(calls.length).toBeGreaterThan(0);
  return calls[calls.length - 1][0];
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  (mockAccel.addListener as jest.Mock).mockReturnValue({ remove: jest.fn() });
});

afterEach(() => jest.useRealTimers());

describe('useCrashDetector — lifecycle', () => {
  it('subscribes when enabled=true', () => {
    renderHook(() => useCrashDetector(jest.fn(), true));
    expect(mockAccel.addListener).toHaveBeenCalledTimes(1);
  });

  it('does NOT subscribe when enabled=false', () => {
    renderHook(() => useCrashDetector(jest.fn(), false));
    expect(mockAccel.addListener).not.toHaveBeenCalled();
  });

  it('sets update interval to 50ms', () => {
    renderHook(() => useCrashDetector(jest.fn(), true));
    expect(mockAccel.setUpdateInterval).toHaveBeenCalledWith(50);
  });

  it('removes subscription on unmount', () => {
    const remove = jest.fn();
    (mockAccel.addListener as jest.Mock).mockReturnValue({ remove });
    const { unmount } = renderHook(() => useCrashDetector(jest.fn(), true));
    unmount();
    expect(remove).toHaveBeenCalled();
  });
});

describe('useCrashDetector — spike detection', () => {
  it('fires onCrash for net force > 4g', () => {
    const onCrash = jest.fn();
    renderHook(() => useCrashDetector(onCrash, true));
    const listener = getListener();
    // net = sqrt(5^2) = 5 > 4
    listener({ x: 5, y: 0, z: 0 });
    expect(onCrash).toHaveBeenCalledTimes(1);
  });

  it('does NOT fire for net force <= 4g', () => {
    const onCrash = jest.fn();
    renderHook(() => useCrashDetector(onCrash, true));
    const listener = getListener();
    // net = sqrt(1+1+1) ≈ 1.73 < 4
    listener({ x: 1, y: 1, z: 1 });
    expect(onCrash).not.toHaveBeenCalled();
  });

  it('does NOT fire again within cooldown (10s)', () => {
    const onCrash = jest.fn();
    renderHook(() => useCrashDetector(onCrash, true));
    const listener = getListener();
    listener({ x: 5, y: 0, z: 0 });
    listener({ x: 5, y: 0, z: 0 });
    expect(onCrash).toHaveBeenCalledTimes(1);
  });

  it('fires again after 10s cooldown', () => {
    const onCrash = jest.fn();
    renderHook(() => useCrashDetector(onCrash, true));
    const listener = getListener();
    listener({ x: 5, y: 0, z: 0 });
    jest.advanceTimersByTime(10_001);
    listener({ x: 5, y: 0, z: 0 });
    expect(onCrash).toHaveBeenCalledTimes(2);
  });

  it('does NOT fire at exactly threshold boundary (≤ 4g)', () => {
    const onCrash = jest.fn();
    renderHook(() => useCrashDetector(onCrash, true));
    const listener = getListener();
    listener({ x: 4, y: 0, z: 0 }); // exactly 4 — not > 4
    expect(onCrash).not.toHaveBeenCalled();
  });

  it('detects diagonal crash vector', () => {
    const onCrash = jest.fn();
    renderHook(() => useCrashDetector(onCrash, true));
    const listener = getListener();
    // net = sqrt(3^2+3^2+3^2) ≈ 5.19 > 4
    listener({ x: 3, y: 3, z: 3 });
    expect(onCrash).toHaveBeenCalledTimes(1);
  });
});
