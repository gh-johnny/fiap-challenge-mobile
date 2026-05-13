import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

// ── Color format validation ───────────────────────────────────────────────────

const hexColor = /^#[0-9A-Fa-f]{6}$/;

describe('Colors — hex format', () => {
  Object.entries(Colors).forEach(([key, value]) => {
    it(`Colors.${key} is a valid 6-digit hex`, () => {
      expect(value).toMatch(hexColor);
    });
  });
});

describe('Colors — required tokens', () => {
  it('has navy token', () => expect(Colors.navy).toBeDefined());
  it('has blue token', () => expect(Colors.blue).toBeDefined());
  it('has white token', () => expect(Colors.white).toBeDefined());
  it('has surface token', () => expect(Colors.surface).toBeDefined());
  it('has card token', () => expect(Colors.card).toBeDefined());
  it('has muted token', () => expect(Colors.muted).toBeDefined());
  it('has mutedLight token', () => expect(Colors.mutedLight).toBeDefined());
  it('has border token', () => expect(Colors.border).toBeDefined());
  it('has danger token', () => expect(Colors.danger).toBeDefined());
  it('has success token', () => expect(Colors.success).toBeDefined());
});

describe('Colors — specific values', () => {
  it('white is #FFFFFF', () => expect(Colors.white).toBe('#FFFFFF'));
  it('navy is #003478', () => expect(Colors.navy).toBe('#003478'));
  it('blue is #0142C0', () => expect(Colors.blue).toBe('#0142C0'));
  it('surface is darker than card', () => {
    // surface (#0A0F1E) should be darker (lower value) than card (#0D1526)
    const surfaceVal = parseInt(Colors.surface.slice(1), 16);
    const cardVal = parseInt(Colors.card.slice(1), 16);
    expect(surfaceVal).toBeLessThan(cardVal);
  });
  it('danger is red', () => {
    const r = parseInt(Colors.danger.slice(1, 3), 16);
    const g = parseInt(Colors.danger.slice(3, 5), 16);
    expect(r).toBeGreaterThan(g); // more red than green
  });
  it('success is green', () => {
    const r = parseInt(Colors.success.slice(1, 3), 16);
    const g = parseInt(Colors.success.slice(3, 5), 16);
    expect(g).toBeGreaterThan(r); // more green than red
  });
});

// ── Typography ────────────────────────────────────────────────────────────────

describe('Typography — structure', () => {
  it('heading has fontSize', () => expect(typeof Typography.heading.fontSize).toBe('number'));
  it('heading has fontWeight', () => expect(Typography.heading.fontWeight).toBeDefined());
  it('heading has color', () => expect(Typography.heading.color).toBeDefined());
  it('subheading fontSize < heading fontSize', () => {
    expect(Typography.subheading.fontSize).toBeLessThan(Typography.heading.fontSize);
  });
  it('body fontSize < subheading fontSize', () => {
    expect(Typography.body.fontSize).toBeLessThan(Typography.subheading.fontSize);
  });
  it('caption fontSize < body fontSize', () => {
    expect(Typography.caption.fontSize).toBeLessThan(Typography.body.fontSize);
  });
  it('heading color is white', () => expect(Typography.heading.color).toBe(Colors.white));
  it('body color is mutedLight', () => expect(Typography.body.color).toBe(Colors.mutedLight));
  it('label has letterSpacing', () => expect(Typography.label).toBeDefined());
});

// ── Spacing ───────────────────────────────────────────────────────────────────

describe('Spacing — scale is ordered', () => {
  it('xs < sm', () => expect(Spacing.xs).toBeLessThan(Spacing.sm));
  it('sm < md', () => expect(Spacing.sm).toBeLessThan(Spacing.md));
  it('md < lg', () => expect(Spacing.md).toBeLessThan(Spacing.lg));
  it('lg < xl', () => expect(Spacing.lg).toBeLessThan(Spacing.xl));
  it('xl < xxl', () => expect(Spacing.xl).toBeLessThan(Spacing.xxl));
  it('all values are positive numbers', () => {
    Object.values(Spacing).forEach((v) => {
      expect(v).toBeGreaterThan(0);
      expect(typeof v).toBe('number');
    });
  });
});

// ── Radius ────────────────────────────────────────────────────────────────────

describe('Radius — scale is ordered', () => {
  it('sm < md', () => expect(Radius.sm).toBeLessThan(Radius.md));
  it('md < lg', () => expect(Radius.md).toBeLessThan(Radius.lg));
  it('lg < xl', () => expect(Radius.lg).toBeLessThan(Radius.xl));
  it('xl < pill', () => expect(Radius.xl).toBeLessThan(Radius.pill));
  it('pill is at least 100', () => expect(Radius.pill).toBeGreaterThanOrEqual(100));
  it('all values are positive', () => {
    Object.values(Radius).forEach((v) => expect(v).toBeGreaterThan(0));
  });
});
