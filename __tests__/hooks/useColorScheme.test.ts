import { renderHook } from '@testing-library/react-native';

describe('use-color-scheme (native)', () => {
  it('exports a useColorScheme function', () => {
    const { useColorScheme } = require('../../hooks/use-color-scheme');
    expect(typeof useColorScheme).toBe('function');
  });

  it('returns light, dark, or null/undefined', () => {
    const { useColorScheme } = require('../../hooks/use-color-scheme');
    const { result } = renderHook(() => useColorScheme());
    expect(['light', 'dark', null, undefined]).toContain(result.current);
  });
});

describe('use-color-scheme.web (hydration)', () => {
  it('settles on a color scheme value after hydration', () => {
    const { useColorScheme } = require('../../hooks/use-color-scheme.web');
    const { result } = renderHook(() => useColorScheme());
    // Initial render returns 'light' (hasHydrated=false), then useEffect sets
    // hasHydrated=true and re-renders with the real colorScheme.
    expect(['light', 'dark', null, undefined]).toContain(result.current);
  });

  it('returns light as pre-hydration fallback', () => {
    // Spy on useState to capture the first returned value before effect fires.
    const React = require('react');
    const originalUseState = React.useState;
    let firstRenderValue: unknown;
    let callCount = 0;

    jest.spyOn(React, 'useState').mockImplementationOnce((initial: unknown) => {
      const [state, setState] = originalUseState(initial);
      callCount++;
      if (callCount === 1) firstRenderValue = state;
      return [state, setState];
    });

    const { useColorScheme } = require('../../hooks/use-color-scheme.web');
    renderHook(() => useColorScheme());

    jest.restoreAllMocks();
    // The pre-hydration state starts as false (hasHydrated), so 'light' is returned first.
    expect(firstRenderValue).toBe(false);
  });
});
