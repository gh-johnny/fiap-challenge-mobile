import { Appointment, ServiceType } from '@/store/service';

export interface MonthBar {
  label: string;   // "Jan", "Feb", etc.
  month: string;   // "YYYY-MM"
  count: number;
}

export interface TypeCount {
  type: ServiceType;
  count: number;
}

export function groupByMonth(appointments: Appointment[]): MonthBar[] {
  const map = new Map<string, number>();

  for (const a of appointments) {
    const key = a.date.slice(0, 7); // "YYYY-MM"
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({
      label: new Date(`${month}-02`).toLocaleDateString('en-US', { month: 'short' }),
      month,
      count,
    }));
}

export function groupByType(appointments: Appointment[]): TypeCount[] {
  const map = new Map<ServiceType, number>();

  for (const a of appointments) {
    map.set(a.type, (map.get(a.type) ?? 0) + 1);
  }

  return Array.from(map.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([type, count]) => ({ type, count }));
}
