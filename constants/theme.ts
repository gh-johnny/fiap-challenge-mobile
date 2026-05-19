export const Colors = {
  navy: '#003478',
  blue: '#0142C0',
  blueLight: '#3385FF',
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
  heading:    { fontSize: 28, fontWeight: '700' as const, color: Colors.white,     letterSpacing: -0.5, lineHeight: 34 },
  subheading: { fontSize: 18, fontWeight: '600' as const, color: Colors.white,     letterSpacing: -0.3, lineHeight: 24 },
  body:       { fontSize: 15, fontWeight: '400' as const, color: Colors.mutedLight, letterSpacing: 0,   lineHeight: 22 },
  caption:    { fontSize: 12, fontWeight: '400' as const, color: Colors.muted,      letterSpacing: 0.2, lineHeight: 16 },
  label:      { fontSize: 13, fontWeight: '600' as const, color: Colors.muted,      letterSpacing: 0.5, lineHeight: 18 },
  micro:      { fontSize: 10, fontWeight: '700' as const, color: Colors.muted,      letterSpacing: 1.5, lineHeight: 14 },
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
  snap:   { damping: 15, stiffness: 300 }, // botões, press feedback
  bounce: { damping: 12, stiffness: 180 }, // elementos entrando na tela
  soft:   { damping: 18, stiffness: 160 }, // retorno a posição neutra
  rigid:  { damping: 20, stiffness: 220 }, // cards 3D, objetos pesados
} as const;

export const BlurIntensity = {
  light:  { ios: 20, android: 'rgba(13,21,38,0.75)'  as const },
  medium: { ios: 40, android: 'rgba(13,21,38,0.85)'  as const },
  heavy:  { ios: 60, android: 'rgba(10,15,30,0.92)'  as const },
  opaque: { ios: 80, android: 'rgba(10,15,30,0.97)'  as const },
};
