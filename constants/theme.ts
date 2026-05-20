export const Colors = {
  navy:       '#003478',   // Ford brand dark — heavy CTAs, logo
  blue:       '#0142C0',   // Primary accent
  blueLight:  '#3385FF',   // Secondary accent / highlights

  // Light mode surfaces
  surface:    '#EEF2FF',   // App background
  card:       '#FFFFFF',   // Card surface
  cardAlt:    '#F4F7FF',   // Alt card / section background

  // Text
  white:      '#FFFFFF',   // Text ON colored (blue/dark) surfaces
  text:       '#0B1735',   // Primary text on light surfaces
  muted:      '#7A8BAD',   // Tertiary text / labels
  mutedLight: '#4A5E82',   // Secondary text (readable on light bg)

  // Chrome
  border:     '#C8D5ED',   // Subtle border
  danger:     '#E53935',
  success:    '#00C853',
};

export const Typography = {
  heading:    { fontSize: 28, fontWeight: '700' as const, color: Colors.text,       letterSpacing: -0.5, lineHeight: 34 },
  subheading: { fontSize: 18, fontWeight: '600' as const, color: Colors.text,       letterSpacing: -0.3, lineHeight: 24 },
  body:       { fontSize: 15, fontWeight: '400' as const, color: Colors.mutedLight,  letterSpacing: 0,   lineHeight: 22 },
  caption:    { fontSize: 12, fontWeight: '400' as const, color: Colors.muted,       letterSpacing: 0.2, lineHeight: 16 },
  label:      { fontSize: 13, fontWeight: '600' as const, color: Colors.muted,       letterSpacing: 0.5, lineHeight: 18 },
  micro:      { fontSize: 10, fontWeight: '700' as const, color: Colors.muted,       letterSpacing: 1.5, lineHeight: 14 },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 32,
  pill: 100,
};

export const Springs = {
  snap:   { damping: 15, stiffness: 300 },
  bounce: { damping: 12, stiffness: 180 },
  soft:   { damping: 18, stiffness: 160 },
  rigid:  { damping: 20, stiffness: 220 },
} as const;

export const BlurIntensity = {
  light:  { ios: 20, android: 'rgba(238,242,255,0.80)' as const },
  medium: { ios: 40, android: 'rgba(238,242,255,0.90)' as const },
  heavy:  { ios: 60, android: 'rgba(238,242,255,0.95)' as const },
  opaque: { ios: 80, android: 'rgba(238,242,255,0.98)' as const },
};
