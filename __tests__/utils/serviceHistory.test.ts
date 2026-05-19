import { groupByMonth, groupByType } from '../../utils/serviceHistory';
import { Appointment } from '../../store/service';

function appt(overrides: Partial<Appointment>): Appointment {
  return {
    id: Math.random().toString(),
    type: 'Oil Change',
    date: '2026-03-15',
    time: '10:00',
    dealer: 'Ford Morumbi',
    status: 'completed',
    ...overrides,
  };
}

const FIXTURES: Appointment[] = [
  appt({ date: '2026-01-10', type: 'Oil Change' }),
  appt({ date: '2026-01-22', type: 'Tire Rotation' }),
  appt({ date: '2026-03-05', type: 'Oil Change' }),
  appt({ date: '2026-03-20', type: 'Brake Inspection' }),
  appt({ date: '2026-03-28', type: 'General Check' }),
  appt({ date: '2026-05-01', type: 'Battery Check' }),
];

// ─── groupByMonth ─────────────────────────────────────────────────────────────

describe('groupByMonth', () => {
  it('returns empty array for no appointments', () => {
    expect(groupByMonth([])).toEqual([]);
  });

  it('counts appointments per month', () => {
    const result = groupByMonth(FIXTURES);
    const jan = result.find((r) => r.month === '2026-01');
    const mar = result.find((r) => r.month === '2026-03');
    expect(jan?.count).toBe(2);
    expect(mar?.count).toBe(3);
  });

  it('sorts months chronologically', () => {
    const result = groupByMonth(FIXTURES);
    const months = result.map((r) => r.month);
    expect(months).toEqual([...months].sort());
  });

  it('generates short month labels (Jan, Feb, etc.)', () => {
    const result = groupByMonth(FIXTURES);
    expect(result[0].label).toMatch(/^[A-Z][a-z]{2}$/);
  });

  it('handles single appointment', () => {
    const result = groupByMonth([appt({ date: '2026-06-15' })]);
    expect(result).toHaveLength(1);
    expect(result[0].count).toBe(1);
    expect(result[0].month).toBe('2026-06');
  });

  it('handles all appointments in the same month', () => {
    const same = [
      appt({ date: '2026-04-01' }),
      appt({ date: '2026-04-15' }),
      appt({ date: '2026-04-30' }),
    ];
    const result = groupByMonth(same);
    expect(result).toHaveLength(1);
    expect(result[0].count).toBe(3);
  });

  it('returns correct number of distinct months', () => {
    const result = groupByMonth(FIXTURES);
    expect(result).toHaveLength(3); // Jan, Mar, May
  });
});

// ─── groupByType ──────────────────────────────────────────────────────────────

describe('groupByType', () => {
  it('returns empty array for no appointments', () => {
    expect(groupByType([])).toEqual([]);
  });

  it('counts appointments per type', () => {
    const result = groupByType(FIXTURES);
    const oil = result.find((r) => r.type === 'Oil Change');
    expect(oil?.count).toBe(2);
  });

  it('sorts by count descending', () => {
    const result = groupByType(FIXTURES);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].count).toBeGreaterThanOrEqual(result[i].count);
    }
  });

  it('returns one entry per unique service type', () => {
    const result = groupByType(FIXTURES);
    const types = result.map((r) => r.type);
    expect(new Set(types).size).toBe(types.length);
  });

  it('handles single appointment type', () => {
    const result = groupByType([appt({ type: 'AC Service' })]);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('AC Service');
    expect(result[0].count).toBe(1);
  });

  it('places most frequent type first', () => {
    const result = groupByType(FIXTURES);
    expect(result[0].type).toBe('Oil Change'); // 2 occurrences, highest
  });
});
