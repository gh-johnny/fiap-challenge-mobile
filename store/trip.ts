import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type FuelType = 'Gasoline' | 'Ethanol' | 'Flex';

export interface Trip {
  id: string;
  date: string;         // ISO date "YYYY-MM-DD"
  kmStart: number;
  kmEnd: number;
  fuelType: FuelType;
  distanceKm: number;
  consumptionL100km: number;
  voiceNoteUri?: string;
}

interface UpdateTripVoiceNote {
  setVoiceNote: (id: string, uri: string | undefined) => void;
}

// Estimated consumption per fuel type (l/100km)
export const CONSUMPTION_ESTIMATES: Record<FuelType, number> = {
  Gasoline: 11.5,
  Ethanol:  13.2,
  Flex:     12.0,
};

export function buildTrip(
  kmStart: number,
  kmEnd: number,
  fuelType: FuelType,
): Omit<Trip, 'id' | 'date'> {
  const distanceKm = Math.max(0, kmEnd - kmStart);
  return {
    kmStart,
    kmEnd,
    fuelType,
    distanceKm,
    consumptionL100km: CONSUMPTION_ESTIMATES[fuelType],
  };
}

interface TripState extends UpdateTripVoiceNote {
  trips: Trip[];
  addTrip: (data: Omit<Trip, 'id' | 'date'>) => void;
  deleteTrip: (id: string) => void;
  clearTrips: () => void;
}

export const useTripStore = create<TripState>()(
  persist(
    (set) => ({
      trips: [],
      addTrip: (data) =>
        set((s) => ({
          trips: [
            {
              ...data,
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              date: new Date().toISOString().split('T')[0],
            },
            ...s.trips,
          ],
        })),
      deleteTrip: (id) =>
        set((s) => ({ trips: s.trips.filter((t) => t.id !== id) })),
      clearTrips: () => set({ trips: [] }),
      setVoiceNote: (id, uri) =>
        set((s) => ({
          trips: s.trips.map((t) => t.id === id ? { ...t, voiceNoteUri: uri } : t),
        })),
    }),
    {
      name: 'ford-trips',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ trips: s.trips }),
    },
  ),
);
