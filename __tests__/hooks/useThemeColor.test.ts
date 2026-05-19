import { renderHook } from '@testing-library/react-native';

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

jest.mock('@/constants/theme', () => ({
  Colors: {
    light: { tint: '#0142C0', background: '#ffffff', text: '#000000' },
    dark:  { tint: '#FFFFFF', background: '#000000', text: '#ffffff' },
  },
}));

import { useThemeColor } from '../../hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';

describe('useThemeColor', () => {
  beforeEach(() => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
  });

  it('returns the prop color for the current (light) theme', () => {
    const { result } = renderHook(() =>
      useThemeColor({ light: '#abc', dark: '#def' }, 'tint'),
    );
    expect(result.current).toBe('#abc');
  });

  it('falls back to Colors.light when no prop given for light theme', () => {
    const { result } = renderHook(() =>
      useThemeColor({}, 'tint'),
    );
    expect(result.current).toBe('#0142C0');
  });

  it('returns the prop color for dark theme', () => {
    (useColorScheme as jest.Mock).mockReturnValue('dark');
    const { result } = renderHook(() =>
      useThemeColor({ light: '#abc', dark: '#def' }, 'tint'),
    );
    expect(result.current).toBe('#def');
  });

  it('falls back to Colors.dark when no prop given for dark theme', () => {
    (useColorScheme as jest.Mock).mockReturnValue('dark');
    const { result } = renderHook(() =>
      useThemeColor({}, 'tint'),
    );
    expect(result.current).toBe('#FFFFFF');
  });

  it('defaults to light when colorScheme is null', () => {
    (useColorScheme as jest.Mock).mockReturnValue(null);
    const { result } = renderHook(() =>
      useThemeColor({ light: '#custom' }, 'tint'),
    );
    expect(result.current).toBe('#custom');
  });

  it('falls back to Colors when only the other-theme prop is provided', () => {
    const { result } = renderHook(() =>
      useThemeColor({ dark: '#def' }, 'background'),
    );
    expect(result.current).toBe('#ffffff');
  });
});
