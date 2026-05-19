import * as Calendar from 'expo-calendar';
import { addServiceToCalendar } from '../../services/calendarService';


const mockCalendar = Calendar as jest.Mocked<typeof Calendar>;

beforeEach(() => {
  jest.resetAllMocks();
  (mockCalendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
  (mockCalendar.getCalendarsAsync as jest.Mock).mockResolvedValue([
    { id: 'cal-1', allowsModifications: true, isPrimary: true, type: 'local' },
  ]);
  (mockCalendar.createEventAsync as jest.Mock).mockResolvedValue('event-id-123');
  (mockCalendar.EntityTypes as any) = { EVENT: 'event' };
  (mockCalendar.CalendarType as any) = { LOCAL: 'local' };
});

describe('addServiceToCalendar', () => {
  const validEvent = {
    type: 'Oil Change' as const,
    date: '2026-07-15',
    time: '10:00',
    dealer: 'Ford Morumbi',
  };

  it('returns true when event is created successfully', async () => {
    const result = await addServiceToCalendar(validEvent);
    expect(result).toBe(true);
  });

  it('returns false when calendar permission is denied', async () => {
    (mockCalendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });
    const result = await addServiceToCalendar(validEvent);
    expect(result).toBe(false);
  });

  it('returns false when no modifiable calendar found', async () => {
    (mockCalendar.getCalendarsAsync as jest.Mock).mockResolvedValueOnce([]);
    const result = await addServiceToCalendar(validEvent);
    expect(result).toBe(false);
  });

  it('requests calendar permissions before creating event', async () => {
    await addServiceToCalendar(validEvent);
    expect(mockCalendar.requestCalendarPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('creates event with correct title including service type', async () => {
    await addServiceToCalendar(validEvent);
    const callArg = (mockCalendar.createEventAsync as jest.Mock).mock.calls[0][1];
    expect(callArg.title).toContain('Oil Change');
  });

  it('creates event with dealer as location', async () => {
    await addServiceToCalendar(validEvent);
    const callArg = (mockCalendar.createEventAsync as jest.Mock).mock.calls[0][1];
    expect(callArg.location).toBe('Ford Morumbi');
  });

  it('event duration is 1 hour', async () => {
    await addServiceToCalendar(validEvent);
    const callArg = (mockCalendar.createEventAsync as jest.Mock).mock.calls[0][1];
    const durationMs = callArg.endDate.getTime() - callArg.startDate.getTime();
    expect(durationMs).toBe(60 * 60 * 1000);
  });

  it('sets a 1-hour reminder alarm', async () => {
    await addServiceToCalendar(validEvent);
    const callArg = (mockCalendar.createEventAsync as jest.Mock).mock.calls[0][1];
    expect(callArg.alarms).toEqual(expect.arrayContaining([{ relativeOffset: -60 }]));
  });

  it('passes correct calendar id to createEventAsync', async () => {
    await addServiceToCalendar(validEvent);
    expect(mockCalendar.createEventAsync).toHaveBeenCalledWith('cal-1', expect.any(Object));
  });

  it('works for all service types', async () => {
    const types = ['Oil Change', 'Tire Rotation', 'Brake Inspection', 'General Check', 'Battery Check', 'AC Service'] as const;
    for (const type of types) {
      (mockCalendar.createEventAsync as jest.Mock).mockResolvedValueOnce('id');
      const result = await addServiceToCalendar({ ...validEvent, type });
      expect(result).toBe(true);
    }
  });
});
