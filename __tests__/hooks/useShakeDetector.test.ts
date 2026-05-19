import { renderHook } from '@testing-library/react-native';
import { Accelerometer } from 'expo-sensors';
import { useShakeDetector } from '../../hooks/useShakeDetector';

const mockAccelerometer = Accelerometer as jest.Mocked<typeof Accelerometer>;

type AccelListener = (data: { x: number; y: number; z: number }) => void;

function getListener(): AccelListener {
  const calls = (mockAccelerometer.addListener as jest.Mock).mock.calls;
  expect(calls.length).toBeGreaterThan(0);
  return calls[calls.length - 1][0];
}

function simulateShake(listener: AccelListener, count = 3) {
  // Simulate count acceleration peaks above threshold (1.6g net)
  for (let i = 0; i < count; i++) {
    listener({ x: 3, y: 0, z: 0 }); // magnitude ~3, net ~2 (above 1.6 threshold)
    listener({ x: 0, y: 0, z: 1 }); // back to near-gravity (net ~0, below threshold)
  }
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  (mockAccelerometer.addListener as jest.Mock).mockReturnValue({ remove: jest.fn() });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useShakeDetector — lifecycle', () => {
  it('subscribes to Accelerometer when enabled=true', () => {
    renderHook(() => useShakeDetector(jest.fn(), true));
    expect(mockAccelerometer.addListener).toHaveBeenCalledTimes(1);
  });

  it('does NOT subscribe when enabled=false', () => {
    renderHook(() => useShakeDetector(jest.fn(), false));
    expect(mockAccelerometer.addListener).not.toHaveBeenCalled();
  });

  it('sets update interval to 50ms', () => {
    renderHook(() => useShakeDetector(jest.fn(), true));
    expect(mockAccelerometer.setUpdateInterval).toHaveBeenCalledWith(50);
  });

  it('removes subscription on unmount', () => {
    const remove = jest.fn();
    (mockAccelerometer.addListener as jest.Mock).mockReturnValue({ remove });
    const { unmount } = renderHook(() => useShakeDetector(jest.fn(), true));
    unmount();
    expect(remove).toHaveBeenCalled();
  });

  it('does not subscribe when enabled toggles false', () => {
    const { rerender } = renderHook(
      ({ enabled }) => useShakeDetector(jest.fn(), enabled),
      { initialProps: { enabled: true } },
    );
    jest.clearAllMocks();
    rerender({ enabled: false });
    expect(mockAccelerometer.addListener).not.toHaveBeenCalled();
  });
});

describe('useShakeDetector — shake detection', () => {
  it('calls onShake after 3 rapid peaks', () => {
    const onShake = jest.fn();
    renderHook(() => useShakeDetector(onShake, true));
    const listener = getListener();
    simulateShake(listener, 3);
    expect(onShake).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onShake for only 2 peaks', () => {
    const onShake = jest.fn();
    renderHook(() => useShakeDetector(onShake, true));
    const listener = getListener();
    simulateShake(listener, 2);
    expect(onShake).not.toHaveBeenCalled();
  });

  it('does NOT fire again within cooldown (3s)', () => {
    const onShake = jest.fn();
    renderHook(() => useShakeDetector(onShake, true));
    const listener = getListener();
    simulateShake(listener, 3); // first shake → fires
    simulateShake(listener, 3); // second shake within cooldown → no fire
    expect(onShake).toHaveBeenCalledTimes(1);
  });

  it('fires again after cooldown (3s)', () => {
    const onShake = jest.fn();
    renderHook(() => useShakeDetector(onShake, true));
    const listener = getListener();
    simulateShake(listener, 3);
    jest.advanceTimersByTime(3001);
    simulateShake(listener, 3);
    expect(onShake).toHaveBeenCalledTimes(2);
  });

  it('ignores low-magnitude readings (below threshold)', () => {
    const onShake = jest.fn();
    renderHook(() => useShakeDetector(onShake, true));
    const listener = getListener();
    // net magnitude ≈ 0.1 (just gravity, below 1.6 threshold)
    listener({ x: 0, y: 0, z: 1.1 });
    listener({ x: 0, y: 0, z: 1.1 });
    listener({ x: 0, y: 0, z: 1.1 });
    expect(onShake).not.toHaveBeenCalled();
  });

  it('ignores duplicate above-threshold readings (aboveThreshold already true)', () => {
    const onShake = jest.fn();
    renderHook(() => useShakeDetector(onShake, true));
    const listener = getListener();
    // Two consecutive high readings without returning below threshold
    listener({ x: 3, y: 0, z: 0 }); // peak detected, aboveThreshold → true
    listener({ x: 3, y: 0, z: 0 }); // still above + aboveThreshold===true → neither branch
    expect(onShake).not.toHaveBeenCalled();
  });
});
