export const Colors = {
  navy: '#003478',
  blue: '#0142C0',
  white: '#FFFFFF',
  surface: '#0A0F1E',
  card: '#0D1526',
  cardAlt: '#111B33',
  muted: '#6B7A9A',
  mutedLight: '#A0AECF',
  border: '#1A2A4A',
  danger: '#E53935',
  success: '#00C853',
};

export const Typography = {
  heading: { fontSize: 28, fontWeight: '700' as const, color: Colors.white },
  subheading: { fontSize: 18, fontWeight: '600' as const, color: Colors.white },
  body: { fontSize: 15, fontWeight: '400' as const, color: Colors.mutedLight },
  caption: { fontSize: 12, fontWeight: '400' as const, color: Colors.muted },
  label: { fontSize: 13, fontWeight: '600' as const, color: Colors.muted },
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
