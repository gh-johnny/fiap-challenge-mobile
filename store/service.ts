import { create } from 'zustand';

export type ServiceStatus = 'upcoming' | 'completed' | 'cancelled';
export type ServiceType = 'Oil Change' | 'Tire Rotation' | 'Brake Inspection' | 'General Check' | 'Battery Check' | 'AC Service';

export interface Appointment {
  id: string;
  type: ServiceType;
  date: string;
  time: string;
  dealer: string;
  status: ServiceStatus;
  notes?: string;
}

interface ServiceState {
  appointments: Appointment[];
  addAppointment: (appt: Omit<Appointment, 'id'>) => void;
  cancelAppointment: (id: string) => void;
}

const SEED: Appointment[] = [
  {
    id: '1',
    type: 'General Check',
    date: '2026-06-15',
    time: '09:00',
    dealer: 'Ford Morumbi',
    status: 'upcoming',
  },
  {
    id: '2',
    type: 'Oil Change',
    date: '2026-03-20',
    time: '11:30',
    dealer: 'Ford Morumbi',
    status: 'completed',
    notes: 'Synthetic 5W-30, filter replaced.',
  },
  {
    id: '3',
    type: 'Tire Rotation',
    date: '2025-11-08',
    time: '14:00',
    dealer: 'Ford Santo André',
    status: 'completed',
  },
];

export const useServiceStore = create<ServiceState>((set) => ({
  appointments: SEED,
  addAppointment: (appt) =>
    set((s) => ({
      appointments: [
        { ...appt, id: Date.now().toString() },
        ...s.appointments,
      ],
    })),
  cancelAppointment: (id) =>
    set((s) => ({
      appointments: s.appointments.map((a) =>
        a.id === id ? { ...a, status: 'cancelled' } : a
      ),
    })),
}));
