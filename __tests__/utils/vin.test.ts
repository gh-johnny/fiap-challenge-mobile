import { decodeVin, VIN_YEAR, FORD_WMI } from '../../utils/vin';

// ── VIN_YEAR map ─────────────────────────────────────────────────────────────

describe('VIN_YEAR map', () => {
  it('covers all letter codes A–T (skipping I, O, Q)', () => {
    const expectedLetters = ['A','B','C','D','E','F','G','H','J','K','L','M','N','P','R','S','T'];
    expectedLetters.forEach((ch) => expect(VIN_YEAR[ch]).toBeDefined());
  });

  it('covers digit codes 1–9', () => {
    for (let d = 1; d <= 9; d++) {
      expect(VIN_YEAR[String(d)]).toBeDefined();
    }
  });

  it('maps A→2010 correctly', () => expect(VIN_YEAR['A']).toBe(2010));
  it('maps T→2026 correctly', () => expect(VIN_YEAR['T']).toBe(2026));
  it('maps 1→2001 correctly', () => expect(VIN_YEAR['1']).toBe(2001));
  it('maps 9→2009 correctly', () => expect(VIN_YEAR['9']).toBe(2009));
  it('maps S→2025 correctly', () => expect(VIN_YEAR['S']).toBe(2025));
  it('maps K→2019 correctly', () => expect(VIN_YEAR['K']).toBe(2019));
  it('does not include I (reserved)', () => expect(VIN_YEAR['I']).toBeUndefined());
  it('does not include O (reserved)', () => expect(VIN_YEAR['O']).toBeUndefined());
  it('does not include Q (reserved)', () => expect(VIN_YEAR['Q']).toBeUndefined());
});

// ── FORD_WMI map ──────────────────────────────────────────────────────────────

describe('FORD_WMI map', () => {
  it('9BF is Ford Brazil', () => expect(FORD_WMI['9BF']).toBe('Ford Brazil'));
  it('9BB is Ford Brazil', () => expect(FORD_WMI['9BB']).toBe('Ford Brazil'));
  it('1FA is Ford USA',    () => expect(FORD_WMI['1FA']).toBe('Ford USA'));
  it('1FT is Ford USA',    () => expect(FORD_WMI['1FT']).toBe('Ford USA'));
  it('3FA is Ford Mexico', () => expect(FORD_WMI['3FA']).toBe('Ford Mexico'));
  it('WF0 is Ford Germany',() => expect(FORD_WMI['WF0']).toBe('Ford Germany'));
  it('SFA is Ford UK',     () => expect(FORD_WMI['SFA']).toBe('Ford UK'));
  it('XYZ is not in map',  () => expect(FORD_WMI['XYZ']).toBeUndefined());
});

// ── decodeVin ─────────────────────────────────────────────────────────────────

// Valid Ford Brazil VIN: 9BF + 6 chars + year char + 7 chars
// Position 10 (index 9) = year char
const makeFordBrVin = (yearChar: string) =>
  `9BF000000${yearChar}0000000`.slice(0, 17);

describe('decodeVin — valid VINs', () => {
  it('returns null for empty string', () => {
    expect(decodeVin('')).toBeNull();
  });

  it('returns null for 16-char VIN (too short)', () => {
    expect(decodeVin('9BF0000001234567')).toBeNull(); // 16 chars
  });

  it('returns null for 18-char VIN (too long)', () => {
    expect(decodeVin('9BF000000A00000001')).toBeNull(); // 18 chars
  });

  it('returns null when VIN contains illegal char I', () => {
    expect(decodeVin('9BF000000I0000000')).toBeNull();
  });

  it('returns null when VIN contains illegal char O', () => {
    expect(decodeVin('9BF000000O0000000')).toBeNull();
  });

  it('returns null when VIN contains illegal char Q', () => {
    expect(decodeVin('9BF000000Q0000000')).toBeNull();
  });

  it('returns null for VIN with spaces', () => {
    expect(decodeVin('9BF000000 A000000')).toBeNull();
  });

  it('handles lowercase input (normalizes to upper)', () => {
    const result = decodeVin('9bf000000a0000000');
    expect(result).not.toBeNull();
    expect(result?.isFord).toBe(true);
    expect(result?.year).toBe('2010');
  });

  it('detects Ford Brazil VIN correctly', () => {
    const result = decodeVin(makeFordBrVin('A'));
    expect(result).not.toBeNull();
    expect(result?.isFord).toBe(true);
    expect(result?.market).toBe('Ford Brazil');
  });

  it('returns isFord=false for non-Ford WMI', () => {
    const result = decodeVin('XYZ000000A0000000');
    expect(result).not.toBeNull();
    expect(result?.isFord).toBe(false);
    expect(result?.market).toBeNull();
  });

  it('returns empty year for unknown year char (Z)', () => {
    const result = decodeVin('9BF000000Z0000000');
    expect(result?.year).toBe('');
  });

  it('returns empty year for digit 0', () => {
    const result = decodeVin('9BF000000000000000'.slice(0,17));
    expect(result?.year).toBe('');
  });
});

describe('decodeVin — year decoding per model year char', () => {
  const cases: [string, number][] = [
    ['A', 2010], ['B', 2011], ['C', 2012], ['D', 2013], ['E', 2014],
    ['F', 2015], ['G', 2016], ['H', 2017], ['J', 2018], ['K', 2019],
    ['L', 2020], ['M', 2021], ['N', 2022], ['P', 2023], ['R', 2024],
    ['S', 2025], ['T', 2026],
    ['1', 2001], ['2', 2002], ['3', 2003], ['4', 2004], ['5', 2005],
    ['6', 2006], ['7', 2007], ['8', 2008], ['9', 2009],
  ];

  test.each(cases)('year char %s → %i', (ch, expected) => {
    const result = decodeVin(makeFordBrVin(ch));
    expect(result?.year).toBe(String(expected));
  });
});

describe('decodeVin — Ford WMI detection', () => {
  const fordWmis = ['9BF', '9BB', '1FA', '1FB', '1FC', '1FD', '1FT', '3FA', 'WF0', 'SFA'];

  test.each(fordWmis)('WMI %s → isFord=true', (wmi) => {
    const vin = `${wmi}000000A0000000`;
    const result = decodeVin(vin);
    expect(result?.isFord).toBe(true);
  });

  const nonFordWmis = ['ABC', 'XYZ', '123', 'BMW', 'VWV'];

  test.each(nonFordWmis)('WMI %s → isFord=false', (wmi) => {
    const vin = `${wmi}000000A0000000`;
    const result = decodeVin(vin);
    expect(result?.isFord).toBe(false);
  });
});
