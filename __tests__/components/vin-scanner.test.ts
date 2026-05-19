// Tests for VIN scanner logic — exercising the decodeVin integration
// (UI rendering tests require a full RN environment; logic is covered via utils/vin.test.ts)

import { decodeVin } from '../../utils/vin';

// ─── Barcode-to-VIN parsing (the core scanner logic) ─────────────────────────

describe('VinScanner — barcode data handling', () => {
  it('accepts a valid Ford Brazil VIN from barcode', () => {
    const raw = '9BFZZZ33ZPA123456'; // 17 chars, starts with 9BF
    const result = decodeVin(raw.trim());
    expect(result).not.toBeNull();
    expect(result!.isFord).toBe(true);
    expect(result!.market).toBe('Ford Brazil');
  });

  it('trims whitespace from barcode data before decoding', () => {
    const raw = '  9BFZZZ33ZPA123456  ';
    const result = decodeVin(raw.trim());
    expect(result).not.toBeNull();
  });

  it('handles uppercase conversion from barcode', () => {
    const raw = '9bfzzz33zpa123456';
    const result = decodeVin(raw.trim().toUpperCase());
    expect(result).not.toBeNull();
    expect(result!.isFord).toBe(true);
  });

  it('rejects non-VIN barcode data (short string)', () => {
    const result = decodeVin('NOT-A-VIN');
    expect(result).toBeNull();
  });

  it('rejects barcode data with illegal VIN chars (O, I, Q)', () => {
    const result = decodeVin('9BFZZZ33ZOA123456'); // O is illegal
    expect(result).toBeNull();
  });

  it('rejects empty barcode data', () => {
    const result = decodeVin('');
    expect(result).toBeNull();
  });

  it('extracts correct year from scanned VIN', () => {
    // Position 10 = 'S' → 2025
    const vin = '9BFZZZ33ZSA123456';
    const result = decodeVin(vin);
    expect(result!.year).toBe('2025');
  });

  it('marks non-Ford VIN as isFord=false', () => {
    // WMI 'JTD' = Toyota
    const vin = 'JTDZZZ33ZSA123456';
    const result = decodeVin(vin);
    expect(result).not.toBeNull();
    expect(result!.isFord).toBe(false);
    expect(result!.market).toBeNull();
  });

  it('scanner should ignore QR code data that is not a valid VIN', () => {
    const qrContent = 'https://ford.com/some-link';
    const result = decodeVin(qrContent.trim());
    expect(result).toBeNull();
  });

  it('scanner accepts Code-128 barcode with valid VIN', () => {
    const barcode = '1FADP3F24EL123456'; // Ford USA, year E=2014
    const result = decodeVin(barcode.trim());
    expect(result).not.toBeNull();
    expect(result!.isFord).toBe(true);
    expect(result!.year).toBe('2014');
    expect(result!.market).toBe('Ford USA');
  });
});
