// Global mock setup for all tests

// ── Reanimated ───────────────────────────────────────────────────────────────
jest.mock('react-native-reanimated', () => {
  const sv = (v: unknown) => ({ value: v });
  const pass = (v: unknown) => v;
  return {
    __esModule: true,
    default: { Value: sv, event: jest.fn(), add: jest.fn() },
    useSharedValue: sv,
    useAnimatedStyle: (fn: () => unknown) => fn(),
    useAnimatedProps: (fn: () => unknown) => fn(),
    useAnimatedScrollHandler: jest.fn(() => jest.fn()),
    useDerivedValue: (fn: () => unknown) => sv(fn()),
    withTiming: pass,
    withSpring: pass,
    withRepeat: pass,
    withSequence: (...args: unknown[]) => args[0],
    withDelay: (_d: unknown, v: unknown) => v,
    cancelAnimation: jest.fn(),
    runOnJS: (fn: (...a: unknown[]) => unknown) => fn,
    runOnUI: (fn: (...a: unknown[]) => unknown) => fn,
    Easing: {
      linear: jest.fn((t: number) => t),
      inOut: jest.fn((f: unknown) => f),
      out: jest.fn((f: unknown) => f),
      in: jest.fn((f: unknown) => f),
      sin: jest.fn(),
      quad: jest.fn(),
      ease: jest.fn(),
    },
    createAnimatedComponent: (c: unknown) => c,
    Animated: { View: 'View', Text: 'Text', ScrollView: 'ScrollView', Image: 'Image' },
    FadeIn: { duration: jest.fn() },
    FadeOut: { duration: jest.fn() },
    SlideInDown: { duration: jest.fn() },
  };
});

// ── Expo modules ─────────────────────────────────────────────────────────────
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  getPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('notif-id-123'),
  dismissNotificationAsync: jest.fn().mockResolvedValue(undefined),
  setNotificationHandler: jest.fn(),
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn().mockResolvedValue(true),
  isEnrolledAsync: jest.fn().mockResolvedValue(true),
  supportedAuthenticationTypesAsync: jest.fn().mockResolvedValue([2]),
  authenticateAsync: jest.fn().mockResolvedValue({ success: true }),
  AuthenticationType: { FINGERPRINT: 1, FACIAL_RECOGNITION: 2, IRIS: 3 },
}));

jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  isSpeakingAsync: jest.fn().mockResolvedValue(false),
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: -23.5505, longitude: -46.6333 },
  }),
  Accuracy: { High: 6 },
}));

jest.mock('expo-sensors', () => ({
  Accelerometer: {
    setUpdateInterval: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  DeviceMotion: {
    setUpdateInterval: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  Barometer: {
    setUpdateInterval: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

jest.mock('expo-calendar', () => ({
  requestCalendarPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCalendarsAsync: jest.fn().mockResolvedValue([
    { id: 'cal-1', allowsModifications: true, isPrimary: true, type: 'local' },
  ]),
  createEventAsync: jest.fn().mockResolvedValue('event-id-123'),
  EntityTypes: { EVENT: 'event' },
  CalendarType: { LOCAL: 'local' },
}));

jest.mock('expo-camera', () => ({
  CameraView: 'CameraView',
  useCameraPermissions: jest.fn(() => [{ granted: true }, jest.fn()]),
}));

jest.mock('expo-linking', () => ({
  openURL: jest.fn().mockResolvedValue(undefined),
}));

// ── expo-audio ────────────────────────────────────────────────────────────────
jest.mock('expo-audio', () => ({
  requestRecordingPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
  RecordingPresets: { HIGH_QUALITY: {}, LOW_QUALITY: {} },
  useAudioRecorder: jest.fn(() => ({
    prepareToRecordAsync: jest.fn().mockResolvedValue(undefined),
    record: jest.fn(),
    stop: jest.fn().mockResolvedValue(undefined),
    uri: 'file://voice-note-test.m4a',
    isRecording: false,
  })),
  createAudioPlayer: jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    remove: jest.fn(),
    addListener: jest.fn(),
  })),
}));

// ── React Navigation / Expo Router ───────────────────────────────────────────
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
  Link: 'Link',
  Stack: { Screen: 'Screen' },
}));

// ── Background task ──────────────────────────────────────────────────────────
jest.mock('expo-background-task', () => ({
  BackgroundTaskResult: { Success: 1, Failed: 2 },
  BackgroundTaskStatus: { Restricted: 1, Available: 2 },
  getStatusAsync: jest.fn().mockResolvedValue(2), // Available
  registerTaskAsync: jest.fn().mockResolvedValue(undefined),
  unregisterTaskAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-task-manager', () => ({
  defineTask: jest.fn(),
  isTaskRegisteredAsync: jest.fn().mockResolvedValue(false),
  unregisterAllTasksAsync: jest.fn().mockResolvedValue(undefined),
  getRegisteredTasksAsync: jest.fn().mockResolvedValue([]),
}));

// ── SecureStore ───────────────────────────────────────────────────────────────
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

// ── AsyncStorage ──────────────────────────────────────────────────────────────
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn().mockResolvedValue(undefined),
  getAllKeys: jest.fn().mockResolvedValue([]),
  multiGet: jest.fn().mockResolvedValue([]),
  multiSet: jest.fn().mockResolvedValue(undefined),
}));

// ── React Native modules ─────────────────────────────────────────────────────
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: (obj: Record<string, unknown>) => obj.ios,
}));

// ── Skia ──────────────────────────────────────────────────────────────────────
jest.mock('@shopify/react-native-skia', () => {
  const React = require('react');
  const noop = () => null;
  const passthrough = ({ children }: { children?: React.ReactNode }) => children ?? null;
  return {
    Canvas: passthrough,
    Circle: noop,
    Group: passthrough,
    Line: noop,
    LinearGradient: noop,
    RadialGradient: noop,
    RoundedRect: noop,
    Fill: noop,
    Path: noop,
    Paint: passthrough,
    BlurMask: noop,
    Skia: { Path: { Make: () => ({}) } },
    vec: (x: number, y: number) => ({ x, y }),
  };
});
