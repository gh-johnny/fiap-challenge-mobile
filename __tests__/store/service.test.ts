import { act } from 'react';
import { useServiceStore } from '../../store/service';
import type { Appointment } from '../../store/service';

const SEED_COUNT = 3; // SEED array in service.ts has 3 appointments

const newAppt = (overrides: Partial<Omit<Appointment, 'id'>> = {}): Omit<Appointment, 'id'> => ({
  type: 'Oil Change',
  date: '2026-08-01',
  time: '10:00',
  dealer: 'Ford Test',
  status: 'upcoming',
  ...overrides,
});

beforeEach(() => {
  // Reset to seed data
  useServiceStore.setState({
    appointments: [
      { id: '1', type: 'General Check', date: '2026-06-15', time: '09:00', dealer: 'Ford Morumbi', status: 'upcoming' },
      { id: '2', type: 'Oil Change', date: '2026-03-20', time: '11:30', dealer: 'Ford Morumbi', status: 'completed', notes: 'Synthetic 5W-30, filter replaced.' },
      { id: '3', type: 'Tire Rotation', date: '2025-11-08', time: '14:00', dealer: 'Ford Santo André', status: 'completed' },
    ],
  });
});

describe('service store — initial state', () => {
  it(`has ${SEED_COUNT} seed appointments`, () => {
    expect(useServiceStore.getState().appointments).toHaveLength(SEED_COUNT);
  });

  it('first appointment is upcoming', () => {
    expect(useServiceStore.getState().appointments[0].status).toBe('upcoming');
  });

  it('seed appointment 2 has notes', () => {
    expect(useServiceStore.getState().appointments[1].notes).toBeTruthy();
  });
});

describe('service store — addAppointment()', () => {
  it('increases total count by 1', () => {
    act(() => useServiceStore.getState().addAppointment(newAppt()));
    expect(useServiceStore.getState().appointments).toHaveLength(SEED_COUNT + 1);
  });

  it('prepends new appointment (first in list)', () => {
    act(() => useServiceStore.getState().addAppointment(newAppt({ type: 'Battery Check' })));
    expect(useServiceStore.getState().appointments[0].type).toBe('Battery Check');
  });

  it('generates a non-empty id', () => {
    act(() => useServiceStore.getState().addAppointment(newAppt()));
    const id = useServiceStore.getState().appointments[0].id;
    expect(id).toBeTruthy();
    expect(typeof id).toBe('string');
  });

  it('generates unique ids for rapid additions', () => {
    act(() => {
      useServiceStore.getState().addAppointment(newAppt({ type: 'Oil Change' }));
      useServiceStore.getState().addAppointment(newAppt({ type: 'Brake Inspection' }));
    });
    const [a, b] = useServiceStore.getState().appointments;
    expect(a.id).not.toBe(b.id);
  });

  it('preserves all provided fields', () => {
    const appt = newAppt({ type: 'AC Service', date: '2026-09-15', time: '14:00', dealer: 'Ford ABC', notes: 'AC gas refill' });
    act(() => useServiceStore.getState().addAppointment(appt));
    const added = useServiceStore.getState().appointments[0];
    expect(added.type).toBe('AC Service');
    expect(added.date).toBe('2026-09-15');
    expect(added.time).toBe('14:00');
    expect(added.dealer).toBe('Ford ABC');
    expect(added.notes).toBe('AC gas refill');
  });

  it('sets status to provided value', () => {
    act(() => useServiceStore.getState().addAppointment(newAppt({ status: 'upcoming' })));
    expect(useServiceStore.getState().appointments[0].status).toBe('upcoming');
  });

  it('does not mutate seed appointments', () => {
    act(() => useServiceStore.getState().addAppointment(newAppt()));
    const ids = useServiceStore.getState().appointments.map((a) => a.id);
    expect(ids).toContain('1');
    expect(ids).toContain('2');
    expect(ids).toContain('3');
  });
});

describe('service store — cancelAppointment()', () => {
  it('changes status to cancelled', () => {
    act(() => useServiceStore.getState().cancelAppointment('1'));
    const appt = useServiceStore.getState().appointments.find((a) => a.id === '1');
    expect(appt?.status).toBe('cancelled');
  });

  it('does not affect other appointments', () => {
    act(() => useServiceStore.getState().cancelAppointment('1'));
    const appt2 = useServiceStore.getState().appointments.find((a) => a.id === '2');
    const appt3 = useServiceStore.getState().appointments.find((a) => a.id === '3');
    expect(appt2?.status).toBe('completed');
    expect(appt3?.status).toBe('completed');
  });

  it('total count stays the same after cancel', () => {
    act(() => useServiceStore.getState().cancelAppointment('1'));
    expect(useServiceStore.getState().appointments).toHaveLength(SEED_COUNT);
  });

  it('cancelling non-existent id is a no-op', () => {
    act(() => useServiceStore.getState().cancelAppointment('9999'));
    expect(useServiceStore.getState().appointments).toHaveLength(SEED_COUNT);
    useServiceStore.getState().appointments.forEach((a) => {
      expect(a.status).not.toBe('cancelled');
    });
  });

  it('can cancel a completed appointment too', () => {
    act(() => useServiceStore.getState().cancelAppointment('2'));
    const appt = useServiceStore.getState().appointments.find((a) => a.id === '2');
    expect(appt?.status).toBe('cancelled');
  });
});

describe('service store — filtering helpers (derived logic)', () => {
  it('upcoming filter returns only upcoming appointments', () => {
    const upcoming = useServiceStore.getState().appointments.filter((a) => a.status === 'upcoming');
    expect(upcoming.every((a) => a.status === 'upcoming')).toBe(true);
  });

  it('after cancel, upcoming count decreases', () => {
    const before = useServiceStore.getState().appointments.filter((a) => a.status === 'upcoming').length;
    act(() => useServiceStore.getState().cancelAppointment('1'));
    const after = useServiceStore.getState().appointments.filter((a) => a.status === 'upcoming').length;
    expect(after).toBe(before - 1);
  });
});
