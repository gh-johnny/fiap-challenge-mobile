// VIN position 10 → model year (30-year cycle, post-1980)
export const VIN_YEAR: Record<string, number> = {
  A: 2010, B: 2011, C: 2012, D: 2013, E: 2014, F: 2015, G: 2016,
  H: 2017, J: 2018, K: 2019, L: 2020, M: 2021, N: 2022, P: 2023,
  R: 2024, S: 2025, T: 2026,
  '1': 2001, '2': 2002, '3': 2003, '4': 2004, '5': 2005,
  '6': 2006, '7': 2007, '8': 2008, '9': 2009,
};

// WMI (chars 1–3) → Ford market
export const FORD_WMI: Record<string, string> = {
  '9BF': 'Ford Brazil', '9BB': 'Ford Brazil',
  '1FA': 'Ford USA',   '1FB': 'Ford USA', '1FC': 'Ford USA',
  '1FD': 'Ford USA',   '1FT': 'Ford USA',
  '3FA': 'Ford Mexico',
  'WF0': 'Ford Germany',
  'SFA': 'Ford UK',
};

export interface VinDecoded {
  year: string;
  isFord: boolean;
  market: string | null;
}

/**
 * Decodes a 17-character VIN.
 * Returns null for invalid VINs (wrong length or illegal chars I, O, Q).
 */
export function decodeVin(vin: string): VinDecoded | null {
  if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) return null;

  const upper = vin.toUpperCase();
  const yearChar = upper[9];
  const wmi = upper.slice(0, 3);

  return {
    year:   VIN_YEAR[yearChar] ? String(VIN_YEAR[yearChar]) : '',
    isFord: wmi in FORD_WMI,
    market: FORD_WMI[wmi] ?? null,
  };
}
