import { act, renderHook } from '@testing-library/react-native';
import { Barometer } from 'expo-sensors';
import { useBarometerAdvisor } from '../../hooks/useBarometerAdvisor';

const mockBarometer = Barometer as jest.Mocked<typeof Barometer>;
type BaroListener = (data: { pressure: number }) => void;

function getListener(): BaroListener {
  const calls = (mockBarometer.addListener as jest.Mock).mock.calls;
  expect(calls.length).toBeGreaterThan(0);
  return calls[calls.length - 1][0];
}

beforeEach(() => {
  jest.clearAllMocks();
  (mockBarometer.addListener as jest.Mock).mockReturnValue({ remove: jest.fn() });
});

describe('useBarometerAdvisor — lifecycle', () => {
  it('subscribes to Barometer when active=true', () => {
    renderHook(() => useBarometerAdvisor(true));
    expect(mockBarometer.addListener).toHaveBeenCalledTimes(1);
  });

  it('does NOT subscribe when active=false', () => {
    renderHook(() => useBarometerAdvisor(false));
    expect(mockBarometer.addListener).not.toHaveBeenCalled();
  });

  it('sets update interval to 5000ms', () => {
    renderHook(() => useBarometerAdvisor(true));
    expect(mockBarometer.setUpdateInterval).toHaveBeenCalledWith(5000);
  });

  it('removes subscription on unmount', () => {
    const remove = jest.fn();
    (mockBarometer.addListener as jest.Mock).mockReturnValue({ remove });
    const { unmount } = renderHook(() => useBarometerAdvisor(true));
    unmount();
    expect(remove).toHaveBeenCalled();
  });

  it('starts with null pressure and no alert', () => {
    const { result } = renderHook(() => useBarometerAdvisor(true));
    expect(result.current.pressure).toBeNull();
    expect(result.current.alert).toBeNull();
  });
});

describe('useBarometerAdvisor — alert classification', () => {
  it('returns rain alert when pressure drops rapidly', () => {
    const { result } = renderHook(() => useBarometerAdvisor(true));
    const listener = getListener();

    // First reading high, then drops 4+ hPa → rain alert
    act(() => { listener({ pressure: 1015 }); });
    act(() => { listener({ pressure: 1011 }); });

    expect(result.current.alert?.type).toBe('rain');
    expect(result.current.alert?.message).toMatch(/rain/i);
  });

  it('returns storm alert for pressure below 980 hPa', () => {
    const { result } = renderHook(() => useBarometerAdvisor(true));
    const listener = getListener();
    act(() => { listener({ pressure: 975 }); });
    expect(result.current.alert?.type).toBe('storm');
    expect(result.current.alert?.message).toMatch(/storm|weather/i);
  });

  it('returns altitude alert for pressure below 900 hPa', () => {
    const { result } = renderHook(() => useBarometerAdvisor(true));
    const listener = getListener();
    act(() => { listener({ pressure: 850 }); });
    expect(result.current.alert?.type).toBe('altitude');
    expect(result.current.alert?.message).toMatch(/altitude/i);
  });

  it('returns null alert for normal pressure with no rapid drop', () => {
    const { result } = renderHook(() => useBarometerAdvisor(true));
    const listener = getListener();
    act(() => { listener({ pressure: 1013 }); });
    act(() => { listener({ pressure: 1013 }); });
    expect(result.current.alert).toBeNull();
  });

  it('updates pressure value from sensor reading', () => {
    const { result } = renderHook(() => useBarometerAdvisor(true));
    const listener = getListener();
    act(() => { listener({ pressure: 1008 }); });
    expect(result.current.pressure).toBe(1008);
  });

  it('ignores null pressure readings', () => {
    const { result } = renderHook(() => useBarometerAdvisor(true));
    const listener = getListener();
    act(() => { listener({ pressure: null as any }); });
    expect(result.current.pressure).toBeNull();
    expect(result.current.alert).toBeNull();
  });

  it('altitude alert takes priority over storm check', () => {
    const { result } = renderHook(() => useBarometerAdvisor(true));
    const listener = getListener();
    // Below 900 hPa is also below 980 hPa, but altitude takes priority
    act(() => { listener({ pressure: 850 }); });
    expect(result.current.alert?.type).toBe('altitude');
  });

  it('small pressure drop does not trigger rain alert', () => {
    const { result } = renderHook(() => useBarometerAdvisor(true));
    const listener = getListener();
    act(() => { listener({ pressure: 1013 }); });
    act(() => { listener({ pressure: 1012 }); }); // only 1 hPa drop
    expect(result.current.alert).toBeNull();
  });
});
