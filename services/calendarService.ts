import * as Calendar from 'expo-calendar';

import { ServiceType } from '@/store/service';

export interface CalendarEventInput {
  type: ServiceType;
  date: string;   // "YYYY-MM-DD"
  time: string;   // "HH:MM"
  dealer: string;
}

async function getDefaultCalendarId(): Promise<string | null> {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  // Prefer primary modifiable calendar, fall back to first modifiable
  const primary = calendars.find((c) => c.isPrimary && c.allowsModifications);
  return primary?.id ?? calendars.find((c) => c.allowsModifications)?.id ?? null;
}

export async function addServiceToCalendar(event: CalendarEventInput): Promise<boolean> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') return false;

  const calendarId = await getDefaultCalendarId();
  if (!calendarId) return false;

  const [hour, minute] = event.time.split(':').map(Number);
  const startDate = new Date(`${event.date}T${event.time}:00`);
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 1);

  await Calendar.createEventAsync(calendarId, {
    title: `🔧 Ford ${event.type}`,
    location: event.dealer,
    startDate,
    endDate,
    notes: `Ford service appointment: ${event.type} at ${event.dealer}`,
    alarms: [{ relativeOffset: -60 }], // 1h before
  });

  return true;
}
