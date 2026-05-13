import { renderHook } from '@testing-library/react-native';
import { DeviceMotion } from 'expo-sensors';
import { useGyroTilt } from '../../hooks/useGyroTilt';

const mockDeviceMotion = DeviceMotion as jest.Mocked<typeof DeviceMotion>;

type MotionListener = (data: { rotation?: { beta: number; gamma: number } }) => void;

function getListener(): MotionListener {
  const calls = (mockDeviceMotion.addListener as jest.Mock).mock.calls;
  expect(calls.length).toBeGreaterThan(0);
  return calls[calls.length - 1][0];
}

beforeEach(() => {
  jest.clearAllMocks();
  (mockDeviceMotion.addListener as jest.Mock).mockReturnValue({ remove: jest.fn() });
});

describe('useGyroTilt — lifecycle', () => {
  it('subscribes when enabled=true', () => {
    renderHook(() => useGyroTilt(true));
    expect(mockDeviceMotion.addListener).toHaveBeenCalledTimes(1);
  });

  it('does NOT subscribe when enabled=false', () => {
    renderHook(() => useGyroTilt(false));
    expect(mockDeviceMotion.addListener).not.toHaveBeenCalled();
  });

  it('sets update interval to 50ms', () => {
    renderHook(() => useGyroTilt(true));
    expect(mockDeviceMotion.setUpdateInterval).toHaveBeenCalledWith(50);
  });

  it('removes subscription on unmount', () => {
    const remove = jest.fn();
    (mockDeviceMotion.addListener as jest.Mock).mockReturnValue({ remove });
    const { unmount } = renderHook(() => useGyroTilt(true));
    unmount();
    expect(remove).toHaveBeenCalled();
  });

  it('defaults enabled to true when arg omitted', () => {
    renderHook(() => useGyroTilt());
    expect(mockDeviceMotion.addListener).toHaveBeenCalledTimes(1);
  });
});

describe('useGyroTilt — rotation handling', () => {
  it('returns tiltX and tiltY shared values', () => {
    const { result } = renderHook(() => useGyroTilt(true));
    expect(result.current).toHaveProperty('tiltX');
    expect(result.current).toHaveProperty('tiltY');
  });

  it('does not throw when rotation is undefined', () => {
    renderHook(() => useGyroTilt(true));
    const listener = getListener();
    expect(() => listener({})).not.toThrow();
  });

  it('does not throw when rotation is null-ish', () => {
    renderHook(() => useGyroTilt(true));
    const listener = getListener();
    expect(() => listener({ rotation: undefined as any })).not.toThrow();
  });

  it('shared values start at 0', () => {
    const { result } = renderHook(() => useGyroTilt(true));
    expect(result.current.tiltX.value).toBe(0);
    expect(result.current.tiltY.value).toBe(0);
  });
});
